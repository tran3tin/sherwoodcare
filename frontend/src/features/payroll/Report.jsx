import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import timesheetService from "../../services/timesheetService";
import "./Report.css";

const Report = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get period ID from URL if navigated from saved timesheet
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
      const startObj = new Date(period.start_date + "T00:00:00");
      const headers = [];

      for (let i = 0; i < period.num_days; i++) {
        const currentDate = new Date(startObj);
        currentDate.setDate(startObj.getDate() + i);
        const dayOfWeek = currentDate.getDay();
        headers.push({
          date: currentDate.toISOString(),
          display: formatDateDisplay(currentDate.toISOString()),
          dayName: dayNames[dayOfWeek],
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        });
      }
      setDateHeaders(headers);

      // Convert entries to rosterData format
      const rosterData = entries.map((entry) => {
        const daysArray = Array(period.num_days).fill("");
        entry.days.forEach((day) => {
          if (day.day_index >= 0 && day.day_index < period.num_days) {
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
      alert("Failed to load report. Redirecting...");
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
      setDateHeaders(parsedHeaders);
      processData(parsedData, parsedHeaders);
      setLoading(false);
    } else {
      alert("No data found. Please go back to the Time Sheet.");
      navigate("/payroll/time-sheet");
    }
  };

  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
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
          onClick={() => navigate("/payroll/time-sheet")}
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
                  {formatDateDisplay(header.date)}
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
                  {dayNames[new Date(header.date).getDay()]}
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
