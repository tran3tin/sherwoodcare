import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import timesheetService from "../../services/timesheetService";
import { useToast } from "../../components/ToastProvider";
import {
  addDaysYMD,
  formatDMFromYMD,
  normalizeYMD,
  weekdayIndexFromYMD,
} from "../../utils/dateVN";
import "./Report.css";

const Report = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // Get period ID from URL if navigated from saved timesheet
  const toast = useToast();
  const [reportData, setReportData] = useState(null);
  const [dateHeaders, setDateHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dayNames] = useState([
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]);

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
    if (id) {
      // Load from API
      loadTimesheetReport(id);
    } else {
      // Load from localStorage (legacy mode)
      loadFromLocalStorage();
    }
  }, [id]);

  const loadTimesheetReport = async (periodId) => {
    try {
      setLoading(true);
      const response = await timesheetService.fetchTimesheetById(periodId);
      const { period, entries } = response.data;

      // Generate date headers
      const startYmd = normalizeYMD(period.start_date);
      const headers = buildDateHeaders(startYmd, period.num_days);
      setDateHeaders(headers);

      // Convert entries to rosterData format
      const rosterData = entries.map((entry) => {
        const daysArray = Array(parseInt(period.num_days)).fill("");
        entry.days.forEach((day) => {
          if (day.day_index >= 0 && day.day_index < parseInt(period.num_days)) {
            daysArray[day.day_index] = day.staff_name || "";
          }
        });

        return {
          num: entry.row_number,
          note: entry.note || "",
          period: entry.period || "",
          hrs: entry.hrs || "",
          days: daysArray,
        };
      });

      processData(rosterData, headers);
    } catch (error) {
      console.error("Error loading timesheet report:", error);
      toast.error("Failed to load report. Redirecting...");
      navigate("/payroll/timesheets");
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
      processData(parsedData, normalizedHeaders);
      setLoading(false);
    } else {
      toast.warning("No data found. Please go back to the Time Sheet.");
      navigate("/payroll/time-sheet");
    }
  };

  const formatDateDisplay = (dateString) => {
    // dateString can be ISO or YYYY-MM-DD; normalize then format.
    return formatDMFromYMD(normalizeYMD(dateString));
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

            return { ...job, [field]: value };
          }),
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

  if (loading) return <div className="loading-spinner">Loading report...</div>;
  if (!reportData) return <div>Loading...</div>;

  return (
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
        <button
          type="button"
          className="btn-back"
          onClick={() => {
            const from = location.state?.from;
            if (typeof from === "string" && from.length > 0) {
              navigate(from);
              return;
            }

            if (id) {
              navigate(`/payroll/time-sheet/${id}`);
              return;
            }

            navigate("/payroll/time-sheet");
          }}
        >
          ← Back to Time Sheet
        </button>
      </div>

      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th colSpan="4">Date</th>
              {dateHeaders.map((header, index) => (
                <th key={index} className={header.isWeekend ? "weekend" : ""}>
                  {header.display ||
                    formatDateDisplay(header.ymd || header.date)}
                </th>
              ))}
              <th className="total-col">TOTAL</th>
            </tr>
            <tr>
              <th className="name-header">Name People</th>
              <th className="job-header">Name Job</th>
              <th className="period-header">Period</th>
              <th className="hrs-header">Hrs</th>
              {dateHeaders.map((header, index) => (
                <th key={index} className={header.isWeekend ? "weekend" : ""}>
                  {header.dayName || ""}
                </th>
              ))}
              <th className="total-col">TOTAL</th>
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
                        <td className="name-col" rowSpan={employee.jobs.length}>
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
                      )}
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
                          className={header.isWeekend ? "weekend" : ""}
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
  );
};

export default Report;
