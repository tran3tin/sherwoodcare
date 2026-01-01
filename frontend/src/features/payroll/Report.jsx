import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Report.css";

const Report = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [dateHeaders, setDateHeaders] = useState([]);
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
    const storedData = localStorage.getItem("rosterData");
    const storedHeaders = localStorage.getItem("dateHeaders");

    if (storedData && storedHeaders) {
      const parsedData = JSON.parse(storedData);
      const parsedHeaders = JSON.parse(storedHeaders);
      setDateHeaders(parsedHeaders);
      processData(parsedData, parsedHeaders);
    } else {
      alert("No data found. Please go back to the Time Sheet.");
      navigate("/payroll/time-sheet");
    }
  }, [navigate]);

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
        jobs: jobKeys.map((key) => jobs[key]),
      };
    });

    setReportData(processed);
  };

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
                  const rowTotal = Object.keys(job.workedDays).reduce(
                    (acc, dayIndex) => {
                      return acc + (parseFloat(job.hrsValue) || 0);
                    },
                    0
                  );

                  return (
                    <tr key={jobIndex}>
                      {jobIndex === 0 && (
                        <td className="name-col" rowSpan={employee.jobs.length}>
                          <input
                            type="text"
                            defaultValue={employee.name}
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
                          defaultValue={job.note}
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
                          defaultValue={job.period}
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
                          defaultValue={job.hrsValue}
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
                            defaultValue={
                              job.workedDays[dayIndex] ? job.hrsValue : ""
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              textAlign: "center",
                              fontWeight: job.workedDays[dayIndex]
                                ? "bold"
                                : "normal",
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
