import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import { employeeService } from "../../services/employeeService";
import "../../assets/styles/list.css";
import "./TimeSheetReport.css";

export default function PayrollMyOBUpload() {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

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
    if (totalMinutes >= 780 && totalMinutes < 1080) {
      return "Afternoon";
    }
    // Night: 6:00pm onwards or before 7am
    return "Night";
  };

  useEffect(() => {
    loadEmployees();
    loadTimesheetData();
  }, []);

  const loadTimesheetData = () => {
    try {
      const storedData = localStorage.getItem("myobTimesheetData");
      if (storedData) {
        const { reportData, dateHeaders } = JSON.parse(storedData);
        processTimesheetData(reportData, dateHeaders);
      }
    } catch (error) {
      console.error("Error loading timesheet data:", error);
      toast.error("Failed to load timesheet data", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const processTimesheetData = (reportData, dateHeaders) => {
    if (!reportData || !dateHeaders) return;

    const processedRows = [];
    let rowId = 1;

    reportData.forEach((employee) => {
      const jobs = Array.isArray(employee?.jobs) ? employee.jobs : [];

      jobs.forEach((job) => {
        const dayValues = Array.isArray(job?.dayValues) ? job.dayValues : [];

        // Split full name into first and last name
        const fullName = job.full_name || "";
        const nameParts = fullName.trim().split(" ");
        const firstName = nameParts.length > 0 ? nameParts[0] : "";
        const lastName =
          nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        // Base values for Payroll Category; final value is decided per-day (Sat/Sun rules)
        const level = String(job?.level ?? "").trim();
        const baseSession = String(
          job?.session || getSessionFromPeriod(job?.period) || "",
        ).trim();

        // For each day that has a value, create a row
        dayValues.forEach((value, dayIndex) => {
          if (value && value.trim() !== "") {
            const ymd = dateHeaders[dayIndex]?.ymd || "";

            // Decide Payroll Category based on weekday:
            // - Saturday: Level - Afternoon (ignore session)
            // - Sunday: Level - Sunday (ignore session)
            let dayOfWeek = null;
            if (ymd) {
              const [y, m, d] = ymd.split("-").map((p) => parseInt(p, 10));
              if (
                Number.isFinite(y) &&
                Number.isFinite(m) &&
                Number.isFinite(d)
              ) {
                dayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
              }
            }

            let payrollCategory = "";
            if (dayOfWeek === 6) {
              // Saturday
              payrollCategory = level ? `${level} - Afternoon` : "Afternoon";
            } else if (dayOfWeek === 0) {
              // Sunday
              payrollCategory = level ? `${level} - Sunday` : "Sunday";
            } else {
              const sessionLower = String(baseSession || "").toLowerCase();

              // If session is Morning, MYOB Payroll Category should be Level only
              if (sessionLower === "morning") {
                payrollCategory = level;
              } else {
                payrollCategory =
                  level && baseSession
                    ? `${level} - ${baseSession}`
                    : level || baseSession;
              }
            }

            // Convert YYYY-MM-DD to dd/mm/yyyy
            let formattedDate = "";
            if (ymd) {
              const [year, month, day] = ymd.split("-");
              formattedDate = `${day}/${month}/${year}`;
            }

            processedRows.push({
              id: rowId++,
              employee: employee.name || "", // Prefer Name
              lastName: lastName,
              firstName: firstName,
              payrollCategory: payrollCategory,
              nameJob: job.note || "",
              date: formattedDate,
              units: value,
            });
          }
        });
      });
    });

    setPayrollData(processedRows);

    if (processedRows.length > 0) {
      toast.success(`Loaded ${processedRows.length} rows from timesheet`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getAll();
      if (response.data) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Failed to load employees", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleAddRow = () => {
    setPayrollData([
      ...payrollData,
      {
        id: Date.now(),
        employee: "",
        lastName: "",
        firstName: "",
        payrollCategory: "",
        nameJob: "",
        date: "",
        units: "",
      },
    ]);
  };

  const handleRemoveRow = (id) => {
    setPayrollData(payrollData.filter((row) => row.id !== id));
  };

  const handleFieldChange = (id, field, value) => {
    setPayrollData(
      payrollData.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleEmployeeSelect = (id, fullName) => {
    const selectedEmployee = employees.find(
      (emp) => `${emp.first_name} ${emp.last_name}` === fullName,
    );

    if (selectedEmployee) {
      setPayrollData(
        payrollData.map((row) =>
          row.id === id
            ? {
                ...row,
                firstName: selectedEmployee.first_name,
                lastName: selectedEmployee.last_name,
              }
            : row,
        ),
      );
    }
  };

  const handleExportExcel = () => {
    if (!payrollData || payrollData.length === 0) {
      toast.warning("No data to export.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const headerRow = [
      "Last Name",
      "First Name",
      "Payroll Category",
      "Name Job",
      "Date",
      "Units",
    ];

    const aoa = [
      headerRow,
      ...payrollData.map((row) => [
        row.lastName,
        row.firstName,
        row.payrollCategory,
        row.nameJob,
        row.date,
        row.units,
      ]),
    ];

    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "MYOB Payroll");

    const fileName = `MYOB_Payroll_Upload_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast.success("Excel file exported successfully", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleExportTxt = () => {
    if (!payrollData || payrollData.length === 0) {
      toast.warning("No data to export.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const headers = [
      "Employee Co./Last Name",
      "Employee First Name",
      "Payroll Category",
      "Job",
      "Customer Co./Last Name",
      "Customer First Name",
      "Notes",
      "Date",
      "Units",
      "Employee Card ID",
      "Employee Record ID",
      "Start/Stop Time",
      "Customer Card ID",
      "Customer Record ID",
    ];

    // Helper to escape TSV values (Tab Separated)
    const escape = (val) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      // Standard TSV: if value contains tab, newline, or quote, wrap in quotes
      if (str.includes("\t") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lines = [];
    // Add header
    lines.push(headers.join("\t"));

    // Add rows
    payrollData.forEach((row) => {
      const line = [
        escape(row.lastName),
        escape(row.firstName),
        escape(row.payrollCategory),
        "", // Job
        "", // Customer Co./Last Name
        "", // Customer First Name
        escape(row.nameJob), // Notes
        escape(row.date),
        escape(row.units),
        "", // Employee Card ID
        "", // Employee Record ID
        "", // Start/Stop Time
        "", // Customer Card ID
        "", // Customer Record ID
      ].join("\t");
      lines.push(line);
    });

    const blob = new Blob([lines.join("\r\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `MYOB_Import_${new Date().toISOString().split("T")[0]}.txt`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Text file exported successfully", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleClear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This cannot be undone.",
      )
    ) {
      setPayrollData([]);
      toast.success("All data cleared", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <Layout
      title="MYOB Payroll Upload"
      breadcrumb={["Home", "Payroll", "MYOB Upload"]}
    >
      <div className="report-container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h2 style={{ margin: 0 }}>MYOB Payroll Upload</h2>
          <div className="action-buttons">
            <button
              type="button"
              className="btn-action btn-save"
              onClick={handleAddRow}
              title="Add Row"
              aria-label="Add Row"
            >
              <i className="fas fa-plus"></i>
            </button>

            <button
              type="button"
              className="btn-action btn-view"
              onClick={handleExportExcel}
              title="Export Excel"
              aria-label="Export Excel"
            >
              <i className="fas fa-file-excel"></i>
            </button>

            <button
              type="button"
              className="btn-action btn-view"
              onClick={handleExportTxt}
              title="Export TXT"
              aria-label="Export TXT"
              style={{ backgroundColor: "#17a2b8" }}
            >
              <i className="fas fa-file-alt"></i>
            </button>

            <button
              type="button"
              className="btn-action btn-delete"
              onClick={handleClear}
              title="Clear All Data"
              aria-label="Clear All Data"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div className="report-table-container">
          <table className="report-table" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th style={{ width: "10ch" }}>Employee</th>
                <th style={{ width: "10ch" }}>Last Name</th>
                <th style={{ width: "10ch" }}>First Name</th>
                <th style={{ width: "40ch" }}>Payroll Category</th>
                <th style={{ width: "10ch" }}>Name Job</th>
                <th style={{ width: "120px" }}>Date</th>
                <th style={{ width: "100px" }}>Units</th>
                <th style={{ width: "60px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    No data. Click the <strong>+</strong> button to add rows.
                  </td>
                </tr>
              ) : (
                payrollData.map((row, index) => (
                  <tr key={row.id}>
                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                    <td>
                      <input
                        type="text"
                        value={row.employee || ""}
                        onChange={(e) =>
                          handleFieldChange(row.id, "employee", e.target.value)
                        }
                        placeholder="Employee"
                        style={{
                          width: "100%",
                          border: "1px solid #ddd",
                          padding: "5px",
                          borderRadius: "4px",
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.lastName}
                        onChange={(e) =>
                          handleFieldChange(row.id, "lastName", e.target.value)
                        }
                        placeholder="Last Name"
                        style={{
                          width: "100%",
                          border: "1px solid #ddd",
                          padding: "5px",
                          borderRadius: "4px",
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.firstName}
                        onChange={(e) =>
                          handleFieldChange(row.id, "firstName", e.target.value)
                        }
                        placeholder="First Name"
                        style={{
                          width: "100%",
                          border: "1px solid #ddd",
                          padding: "5px",
                          borderRadius: "4px",
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.payrollCategory}
                        onChange={(e) =>
                          handleFieldChange(
                            row.id,
                            "payrollCategory",
                            e.target.value,
                          )
                        }
                        placeholder="Payroll Category"
                        style={{
                          width: "100%",
                          border: "1px solid #ddd",
                          padding: "5px",
                          borderRadius: "4px",
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.nameJob}
                        onChange={(e) =>
                          handleFieldChange(row.id, "nameJob", e.target.value)
                        }
                        placeholder="Name Job"
                        style={{
                          width: "100%",
                          border: "1px solid #ddd",
                          padding: "5px",
                          borderRadius: "4px",
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.date}
                        onChange={(e) =>
                          handleFieldChange(row.id, "date", e.target.value)
                        }
                        placeholder="dd/mm/yyyy"
                        style={{
                          width: "100%",
                          border: "1px solid #ddd",
                          padding: "5px",
                          borderRadius: "4px",
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.units}
                        onChange={(e) =>
                          handleFieldChange(row.id, "units", e.target.value)
                        }
                        placeholder="Units"
                        style={{
                          width: "100%",
                          border: "1px solid #ddd",
                          padding: "5px",
                          borderRadius: "4px",
                          textAlign: "center",
                        }}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        title="Remove Row"
                        style={{
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
