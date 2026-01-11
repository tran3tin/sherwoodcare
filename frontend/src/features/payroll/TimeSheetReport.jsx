import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import timesheetReportService from "../../services/timesheetReportService";
import { employeeService } from "../../services/employeeService";
import {
  addDaysYMD,
  formatDMFromYMD,
  normalizeYMD,
  weekdayIndexFromYMD,
} from "../../utils/dateVN";
import "../../assets/styles/list.css";
import "./TimeSheetReport.css";

const TimeSheetReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // Get period ID from URL if navigated from saved timesheet
  const [reportData, setReportData] = useState(null);
  const [dateHeaders, setDateHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [periodInfo, setPeriodInfo] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [dayNames] = useState([
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    // Navigate back to timesheet form (not to report edit since report is read-only)
    navigate("/payroll/time-sheet");
  };

  const handleDelete = () => {
    if (deleting) return;

    const confirmed = window.confirm(
      "Delete this report/timesheet? This action cannot be undone."
    );
    if (!confirmed) return;

    async function performDelete() {
      try {
        setDeleting(true);

        // Clear local report cache
        localStorage.removeItem("rosterData");
        localStorage.removeItem("dateHeaders");

        if (id) {
          await timesheetReportService.deleteReport(id);
          localStorage.removeItem(`timesheetDraft:${id}`);
          toast.success("Report deleted.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          navigate("/payroll/reports");
        } else {
          localStorage.removeItem("timesheetDraft:new");
          toast.success("Report data cleared.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          navigate("/payroll/time-sheet");
        }
      } catch (error) {
        console.error("Error deleting timesheet:", error);
        toast.error(
          error?.response?.data?.error || "Failed to delete. Please try again.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      } finally {
        setDeleting(false);
      }
    }

    performDelete();
  };

  const buildEntriesFromReport = (data, headers) => {
    const employees = Array.isArray(data) ? data : [];
    const safeHeaders = Array.isArray(headers) ? headers : [];

    const entries = [];
    const usedRowNumbers = new Set();
    let nextRowNumber = 1;

    const reserveRowNumber = (candidate) => {
      const parsed = parseInt(candidate, 10);
      if (
        Number.isFinite(parsed) &&
        parsed > 0 &&
        !usedRowNumbers.has(parsed)
      ) {
        usedRowNumbers.add(parsed);
        nextRowNumber = Math.max(nextRowNumber, parsed + 1);
        return parsed;
      }

      while (usedRowNumbers.has(nextRowNumber)) nextRowNumber += 1;
      usedRowNumbers.add(nextRowNumber);
      const reserved = nextRowNumber;
      nextRowNumber += 1;
      return reserved;
    };

    for (const employee of employees) {
      const jobs = Array.isArray(employee?.jobs) ? employee.jobs : [];
      for (const job of jobs) {
        const row_number = reserveRowNumber(job?.num);
        const dayValues = Array.isArray(job?.dayValues) ? job.dayValues : [];
        const days = [];

        for (let dayIndex = 0; dayIndex < safeHeaders.length; dayIndex += 1) {
          const raw = String(dayValues?.[dayIndex] ?? "");
          const staff_name = raw.trim();
          if (staff_name) {
            days.push({ day_index: dayIndex, staff_name });
          }
        }

        entries.push({
          row_number,
          note: String(job?.note ?? ""),
          period: String(job?.period ?? ""),
          hrs: String(job?.hrsValue ?? ""),
          days,
        });
      }
    }

    return {
      entries,
      maxRowNumber: usedRowNumbers.size ? Math.max(...usedRowNumbers) : 0,
    };
  };

  const inferPeriodMeta = (headers, data) => {
    const safeHeaders = Array.isArray(headers) ? headers : [];
    const { maxRowNumber } = buildEntriesFromReport(data, headers);

    const startYmd = normalizeYMD(
      safeHeaders?.[0]?.ymd || safeHeaders?.[0]?.date
    );
    const numDays = safeHeaders.length || 0;
    const numRows = Math.max(maxRowNumber || 0, 1);

    if (!startYmd || !numDays) return null;

    const endYmd = addDaysYMD(startYmd, numDays - 1);
    const name = `TimeSheet ${formatDMFromYMD(startYmd)} - ${formatDMFromYMD(
      endYmd
    )}`;

    return { start_date: startYmd, num_days: numDays, num_rows: numRows, name };
  };

  const handleSave = async () => {
    if (saving || deleting) return;
    if (!reportData || !dateHeaders.length) {
      toast.warning("No data to save.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const meta =
      periodInfo?.start_date && periodInfo?.num_days && periodInfo?.num_rows
        ? {
            start_date: normalizeYMD(periodInfo.start_date),
            num_days: parseInt(periodInfo.num_days, 10),
            num_rows: parseInt(periodInfo.num_rows, 10),
            name: periodInfo.name || undefined,
          }
        : inferPeriodMeta(dateHeaders, reportData);

    if (!meta) {
      toast.warning("Missing period information (start date / days).", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Save processed_data and date_headers directly
    const payload = {
      start_date: meta.start_date,
      num_days: meta.num_days,
      num_rows: meta.num_rows,
      name: meta.name,
      processed_data: reportData,
      date_headers: dateHeaders,
    };

    try {
      setSaving(true);
      if (id) {
        await timesheetReportService.updateReport(id, payload);
        toast.success("Report saved to database.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        const created = await timesheetReportService.createReport(payload);
        toast.success("Report created and saved.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate(`/payroll/report/${created.report_id}`);
      }
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error(
        error?.response?.data?.error || "Failed to save. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    if (!reportData || !dateHeaders.length) {
      toast.warning("No data to export.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const headerRow = [
      "Name People",
      "Full Name",
      "Level",
      "Session",
      "Name Job",
      "Period",
      "Hrs",
      ...dateHeaders.map(
        (h) => h.display || formatDateDisplay(h.ymd || h.date)
      ),
      "TOTAL",
    ];

    const aoa = [headerRow];
    for (const employee of reportData) {
      const jobs = Array.isArray(employee?.jobs) ? employee.jobs : [];
      for (const job of jobs) {
        const dayValues = Array.isArray(job?.dayValues) ? job.dayValues : [];
        const rowTotal = calcRowTotal(dayValues);
        aoa.push([
          String(employee?.name ?? ""),
          String(job?.full_name ?? ""),
          String(job?.level ?? ""),
          String(job?.session || getSessionFromPeriod(job?.period) || ""),
          String(job?.note ?? ""),
          String(job?.period ?? ""),
          String(job?.hrsValue ?? ""),
          ...dateHeaders.map((_, idx) => String(dayValues?.[idx] ?? "")),
          rowTotal,
        ]);
      }
    }

    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Timesheet Report");

    const startYmd = normalizeYMD(
      dateHeaders?.[0]?.ymd || dateHeaders?.[0]?.date
    );
    const safeStart = startYmd ? startYmd.replaceAll(":", "-") : "";
    const fileName = `TimesheetReport_${id || "draft"}${
      safeStart ? `_${safeStart}` : ""
    }.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleNavigateToMYOB = () => {
    // Save timesheet data to localStorage for MYOB upload
    const myobData = {
      reportData,
      dateHeaders,
      timestamp: Date.now(),
    };
    localStorage.setItem("myobTimesheetData", JSON.stringify(myobData));
    navigate("/payroll/myob-upload");
  };

  const buildDateHeaders = (startYmd, days) => {
    const s = normalizeYMD(startYmd);
    const count = parseInt(days, 10);
    if (!s || !Number.isFinite(count) || count <= 0) return [];

    const headers = [];
    for (let i = 0; i < count; i++) {
      const ymd = addDaysYMD(s, i);
      const dow = weekdayIndexFromYMD(ymd);
      headers.push({
        ymd,
        display: formatDMFromYMD(ymd),
        dayName: Number.isFinite(dow) ? dayNames[dow] : "",
        isWeekend: dow === 0 || dow === 6,
      });
    }
    return headers;
  };

  const normalizeHeaders = (headers) => {
    if (!Array.isArray(headers)) return [];
    return headers
      .map((h) => {
        const ymd = normalizeYMD(h?.ymd || h?.date || h);
        if (!ymd) return null;
        const dow = weekdayIndexFromYMD(ymd);
        return {
          ymd,
          display: h?.display || formatDMFromYMD(ymd),
          dayName: h?.dayName || (Number.isFinite(dow) ? dayNames[dow] : ""),
          isWeekend:
            typeof h?.isWeekend === "boolean"
              ? h.isWeekend
              : dow === 0 || dow === 6,
        };
      })
      .filter(Boolean);
  };

  useEffect(() => {
    // Load employees first
    loadEmployees();

    if (id) {
      // Load from API
      loadTimesheetReport(id);
    } else {
      // Load from localStorage (legacy mode)
      loadFromLocalStorage();
    }
  }, [id]);

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getAll();
      console.log("Employees loaded:", response);
      if (response.data) {
        setEmployees(response.data);
        console.log("Employees set to state:", response.data);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
      // Don't show error toast, just continue with empty list
    }
  };

  const loadTimesheetReport = async (periodId) => {
    try {
      setLoading(true);
      const response = await timesheetReportService.fetchReportById(periodId);
      const { period, processed_data, date_headers } = response.data;
      setPeriodInfo(period);

      // Use date_headers from DB if available, otherwise generate
      let headers;
      if (date_headers && date_headers.length > 0) {
        headers = normalizeHeaders(date_headers);
      } else {
        const startYmd = normalizeYMD(period.start_date);
        headers = buildDateHeaders(startYmd, period.num_days);
      }
      setDateHeaders(headers);

      // Use processed_data directly if available
      if (processed_data && processed_data.length > 0) {
        setReportData(processed_data);
      } else {
        // Fallback: no processed data, show empty
        setReportData([]);
      }
    } catch (error) {
      console.error("Error loading timesheet report:", error);
      toast.error("Failed to load report. Redirecting...", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/payroll/reports");
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const storedData = localStorage.getItem("rosterData");
    const storedHeaders = localStorage.getItem("dateHeaders");

    if (storedData && storedHeaders) {
      const parsedData = JSON.parse(storedData);
      const parsedHeaders = JSON.parse(storedHeaders);
      const normalizedHeaders = normalizeHeaders(parsedHeaders);
      setDateHeaders(normalizedHeaders);
      const inferred = inferPeriodMeta(normalizedHeaders, parsedData);
      if (inferred) setPeriodInfo(inferred);
      processData(parsedData, normalizedHeaders);
      setLoading(false);
    } else {
      toast.warning("No data found. Please go back to the Time Sheet.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/payroll/time-sheet");
    }
  };

  const formatDateDisplay = (dateString) => {
    // dateString can be ISO or YYYY-MM-DD; normalize then format as dd/mm/yyyy
    const ymd = normalizeYMD(dateString);
    if (!ymd) return "";
    const [year, month, day] = ymd.split("-");
    return `${day}/${month}/${year}`;
  };

  const processData = (data, headers) => {
    let employeeMap = {};

    data.forEach((rowData) => {
      const { num, note, period, hrs, days } = rowData;

      if (!note) return;

      days.forEach((name, dayIndex) => {
        if (name && name.trim() !== "") {
          const trimmedName = name.trim();
          if (!employeeMap[trimmedName]) employeeMap[trimmedName] = {};

          // Create a unique key for the job
          let jobKey = `${num}|${note}|${period}`;

          if (!employeeMap[trimmedName][jobKey]) {
            employeeMap[trimmedName][jobKey] = {
              num: num,
              full_name: "",
              level: "",
              session: getSessionFromPeriod(period),
              note: note,
              period: period,
              hrsValue: hrs,
              workedDays: {},
            };
          }
          employeeMap[trimmedName][jobKey].workedDays[dayIndex] = true;
        }
      });
    });

    // Convert map to array for rendering
    const sortedNames = Object.keys(employeeMap).sort();
    const processed = sortedNames.map((name) => {
      const jobs = employeeMap[name];
      const jobKeys = Object.keys(jobs);
      return {
        name: name,
        jobs: jobKeys.map((key) => {
          const job = jobs[key];
          const dayValues = headers.map((_, dayIndex) =>
            job.workedDays[dayIndex] ? String(job.hrsValue ?? "") : ""
          );

          return {
            ...job,
            dayValues,
          };
        }),
      };
    });

    setReportData(processed);
  };

  const calcRowTotal = (dayValues) => {
    if (!Array.isArray(dayValues)) return 0;
    return dayValues.reduce((sum, value) => {
      const n = parseFloat(value);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  };

  const calcGrandTotal = () => {
    if (!reportData || !Array.isArray(reportData)) return 0;
    return reportData.reduce((total, employee) => {
      const jobs = Array.isArray(employee?.jobs) ? employee.jobs : [];
      return (
        total +
        jobs.reduce((jobTotal, job) => {
          return jobTotal + calcRowTotal(job.dayValues);
        }, 0)
      );
    }, 0);
  };

  const getSessionFromPeriod = (period) => {
    if (!period || typeof period !== "string") return "";

    // Extract start time from period (e.g., "7am-8am" -> "7am", "3:15pm-7:30pm" -> "3:15pm")
    const startTime = period.split("-")[0]?.trim();
    if (!startTime) return "";

    // Parse time to 24-hour format
    const timeMatch = startTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (!timeMatch) return "";

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2] || "0", 10);
    const meridiem = timeMatch[3].toLowerCase();

    // Convert to 24-hour format
    if (meridiem === "pm" && hours !== 12) {
      hours += 12;
    } else if (meridiem === "am" && hours === 12) {
      hours = 0;
    }

    // Calculate total minutes from midnight
    const totalMinutes = hours * 60 + minutes;

    // Morning: 7am (420 min) to 12:59pm (779 min)
    if (totalMinutes >= 420 && totalMinutes < 780) {
      return "Morning";
    }
    // Afternoon: 1:00pm (780 min) to 5:59pm (1079 min)
    else if (totalMinutes >= 780 && totalMinutes < 1080) {
      return "Afternoon";
    }
    // Night: 6:00pm onwards or before 7am
    else {
      return "Night";
    }
  };

  const updateEmployeeField = (empIndex, value) => {
    setReportData((prev) =>
      prev.map((employee, index) =>
        index === empIndex ? { ...employee, name: value } : employee
      )
    );
  };

  const updateJobField = (empIndex, jobIndex, field, value) => {
    setReportData((prev) =>
      prev.map((employee, eIndex) => {
        if (eIndex !== empIndex) return employee;

        return {
          ...employee,
          jobs: employee.jobs.map((job, jIndex) => {
            if (jIndex !== jobIndex) return job;

            if (field === "hrsValue") {
              const prevHrs = String(job.hrsValue ?? "");
              const nextHrs = String(value);
              const nextDayValues = (job.dayValues || []).map((v) =>
                String(v) === prevHrs ? nextHrs : v
              );

              return {
                ...job,
                hrsValue: nextHrs,
                dayValues: nextDayValues,
              };
            }

            // If updating period, also update session automatically
            if (field === "period") {
              const previousPeriod = String(job.period ?? "");
              const previousSession = String(job.session ?? "");
              const previousAutoSession = getSessionFromPeriod(previousPeriod);
              const nextAutoSession = getSessionFromPeriod(String(value));

              // Only auto-update session if it was blank or still on the auto-derived value.
              const shouldAutoUpdateSession =
                !previousSession || previousSession === previousAutoSession;

              return {
                ...job,
                period: value,
                session: shouldAutoUpdateSession
                  ? nextAutoSession
                  : job.session,
              };
            }

            return { ...job, [field]: value };
          }),
        };
      })
    );
  };

  const updateEmployeeFullName = (empIndex, fullName) => {
    setReportData((prev) =>
      prev.map((employee, eIndex) => {
        if (eIndex !== empIndex) return employee;

        // Find selected employee to get level
        const selectedEmployee = employees.find(
          (emp) => `${emp.first_name} ${emp.last_name}` === fullName
        );

        return {
          ...employee,
          jobs: employee.jobs.map((job) => ({
            ...job,
            full_name: fullName,
            level: selectedEmployee?.level || job.level || "",
          })),
        };
      })
    );
  };

  const updateJobDayValue = (empIndex, jobIndex, dayIndex, value) => {
    setReportData((prev) =>
      prev.map((employee, eIndex) => {
        if (eIndex !== empIndex) return employee;

        return {
          ...employee,
          jobs: employee.jobs.map((job, jIndex) => {
            if (jIndex !== jobIndex) return job;
            const nextDayValues = [...(job.dayValues || [])];
            nextDayValues[dayIndex] = value;
            return { ...job, dayValues: nextDayValues };
          }),
        };
      })
    );
  };

  if (loading) {
    return (
      <Layout
        title="Timesheet Report"
        breadcrumb={["Home", "Payroll", "Report"]}
      >
        <div className="loading-spinner">Loading report...</div>
      </Layout>
    );
  }

  if (!reportData) {
    return (
      <Layout
        title="Timesheet Report"
        breadcrumb={["Home", "Payroll", "Report"]}
      >
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Timesheet Report" breadcrumb={["Home", "Payroll", "Report"]}>
      <div className="report-container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h2 style={{ margin: 0 }}>Personal Summary Report</h2>
          <div className="action-buttons">
            <button
              type="button"
              className="btn-action btn-save"
              onClick={handleSave}
              title={id ? "Save" : "Save to Database"}
              aria-label={id ? "Save" : "Save to Database"}
              disabled={deleting || saving}
            >
              <i className="fas fa-save"></i>
            </button>

            <button
              type="button"
              className="btn-action btn-view"
              onClick={handleExportExcel}
              title="Export Excel"
              aria-label="Export Excel"
              disabled={deleting || saving}
            >
              <i className="fas fa-file-excel"></i>
            </button>

            <button
              type="button"
              className="btn-action btn-edit"
              onClick={handleNavigateToMYOB}
              title="MYOB Upload"
              aria-label="MYOB Upload"
              disabled={deleting || saving}
            >
              <i className="fas fa-upload"></i>
            </button>

            <button
              type="button"
              className="btn-action btn-cancel"
              onClick={handleBack}
              title="Back"
              aria-label="Back"
              disabled={deleting || saving}
            >
              <i className="fas fa-arrow-left"></i>
            </button>

            <button
              type="button"
              className="btn-action btn-delete"
              onClick={handleDelete}
              title={id ? "Delete Timesheet" : "Clear Report Data"}
              aria-label={id ? "Delete Timesheet" : "Clear Report Data"}
              disabled={deleting || saving}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th colSpan="7">Date</th>
                {dateHeaders.map((header, index) => (
                  <th key={index} className={header.isWeekend ? "weekend" : ""}>
                    {header.display ||
                      formatDateDisplay(header.ymd || header.date)}
                  </th>
                ))}
                <th className="total-col">TOTAL</th>
              </tr>
              <tr>
                <th className="name-header">Prefer Name</th>
                <th className="fullname-header">Full Name</th>
                <th className="level-header">Level</th>
                <th className="session-header">Session</th>
                <th className="job-header">Name Job</th>
                <th className="period-header">Period</th>
                <th className="hrs-header">Hrs</th>
                {dateHeaders.map((header, index) => (
                  <th key={index} className={header.isWeekend ? "weekend" : ""}>
                    {header.dayName || ""}
                  </th>
                ))}
                <th className="total-col">{calcGrandTotal()}</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((employee, empIndex) => (
                <React.Fragment key={empIndex}>
                  {employee.jobs.map((job, jobIndex) => {
                    const rowTotal = calcRowTotal(job.dayValues);

                    return (
                      <tr key={jobIndex}>
                        {jobIndex === 0 && (
                          <>
                            <td
                              className="name-col"
                              rowSpan={employee.jobs.length}
                            >
                              <input
                                type="text"
                                value={employee.name}
                                onChange={(e) =>
                                  updateEmployeeField(empIndex, e.target.value)
                                }
                                style={{
                                  width: "100%",
                                  border: "none",
                                  background: "transparent",
                                  textAlign: "left",
                                  paddingLeft: "15px",
                                  fontWeight: "bold",
                                }}
                              />
                            </td>
                            <td
                              className="fullname-col"
                              rowSpan={employee.jobs.length}
                            >
                              <select
                                value={job.full_name || ""}
                                onChange={(e) =>
                                  updateEmployeeFullName(
                                    empIndex,
                                    e.target.value
                                  )
                                }
                                style={{
                                  width: "100%",
                                  border: "none",
                                  background: "transparent",
                                  textAlign: "left",
                                  paddingLeft: "10px",
                                }}
                              >
                                <option value="">Select...</option>
                                {[...employees]
                                  .sort((a, b) =>
                                    (a.first_name || "").localeCompare(
                                      b.first_name || ""
                                    )
                                  )
                                  .map((emp) => (
                                    <option
                                      key={emp.employee_id}
                                      value={`${emp.first_name} ${emp.last_name}`}
                                    >
                                      {emp.first_name} {emp.last_name}
                                    </option>
                                  ))}
                              </select>
                            </td>
                          </>
                        )}
                        <td className="level-col">
                          <input
                            type="text"
                            value={job.level || ""}
                            onChange={(e) =>
                              updateJobField(
                                empIndex,
                                jobIndex,
                                "level",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              textAlign: "center",
                            }}
                          />
                        </td>
                        <td className="session-col">
                          <input
                            type="text"
                            value={
                              job.session || getSessionFromPeriod(job.period)
                            }
                            onChange={(e) =>
                              updateJobField(
                                empIndex,
                                jobIndex,
                                "session",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              textAlign: "center",
                            }}
                          />
                        </td>
                        <td className="job-col">
                          <input
                            type="text"
                            value={job.note}
                            onChange={(e) =>
                              updateJobField(
                                empIndex,
                                jobIndex,
                                "note",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              textAlign: "left",
                              paddingLeft: "10px",
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={job.period}
                            onChange={(e) =>
                              updateJobField(
                                empIndex,
                                jobIndex,
                                "period",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              textAlign: "center",
                            }}
                          />
                        </td>
                        <td className="hrs-col">
                          <input
                            type="text"
                            value={job.hrsValue}
                            onChange={(e) =>
                              updateJobField(
                                empIndex,
                                jobIndex,
                                "hrsValue",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              textAlign: "center",
                            }}
                          />
                        </td>

                        {dateHeaders.map((header, dayIndex) => (
                          <td
                            key={dayIndex}
                            className={`hours-val ${
                              header.isWeekend ? "weekend" : ""
                            }`}
                          >
                            <input
                              type="text"
                              value={job.dayValues?.[dayIndex] ?? ""}
                              onChange={(e) =>
                                updateJobDayValue(
                                  empIndex,
                                  jobIndex,
                                  dayIndex,
                                  e.target.value
                                )
                              }
                              style={{
                                width: "100%",
                                border: "none",
                                background: "transparent",
                                textAlign: "center",
                              }}
                            />
                          </td>
                        ))}

                        <td className="total-col">{rowTotal}</td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default TimeSheetReport;
