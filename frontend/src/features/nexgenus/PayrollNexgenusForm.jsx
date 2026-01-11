import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import "../../assets/styles/list.css";
import "../payroll/TimeSheetReport.css";
import { API_BASE_WITH_API_PREFIX } from "../../config/api";

const PayrollNexgenusForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Configuration state
  const [startDate, setStartDate] = useState(
    localStorage.getItem("payrollStartDate") || ""
  );
  const [numRows, setNumRows] = useState(
    parseInt(localStorage.getItem("payrollNumRows") || "20", 10)
  );

  // Data state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [payrollId, setPayrollId] = useState(id || null);

  // Draft management
  const getDraftKey = () => (payrollId ? String(payrollId) : "new");

  const saveDraft = (draftKey) => {
    const key = `payroll_draft_${draftKey}`;
    const payload = {
      startDate,
      numRows,
      rows,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
  };

  const tryRestoreDraft = (draftKey) => {
    const key = `payroll_draft_${draftKey}`;
    const saved = localStorage.getItem(key);
    if (!saved) return false;

    try {
      const data = JSON.parse(saved);
      setStartDate(data.startDate || "");
      setNumRows(data.numRows || 20);
      setRows(data.rows || []);
      return true;
    } catch (error) {
      console.error("Failed to restore draft:", error);
      return false;
    }
  };

  const clearDraft = (draftKey) => {
    const key = `payroll_draft_${draftKey}`;
    localStorage.removeItem(key);
  };

  // Auto-save draft
  useEffect(() => {
    if (rows.length === 0) return;
    const draftKey = getDraftKey();
    const timer = setTimeout(() => saveDraft(draftKey), 2000);
    return () => clearTimeout(timer);
  }, [rows, startDate, numRows]);

  // Load data on mount
  useEffect(() => {
    if (payrollId) {
      loadPayroll(payrollId);
    } else {
      const draftKey = getDraftKey();
      const restored = tryRestoreDraft(draftKey);
      if (!restored) {
        generateTable();
      }
    }
  }, []);

  const loadPayroll = async (id) => {
    try {
      setLoading(true);
      setIsEditMode(true);

      const response = await fetch(
        `${API_BASE_WITH_API_PREFIX}/payroll-nexgenus/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to load payroll");
      }

      const data = await response.json();

      // Set payroll data
      setStartDate(data.payroll.start_date);

      // Transform entries to match frontend structure
      if (data.entries && data.entries.length > 0) {
        const transformedRows = data.entries.map((entry) => ({
          id: entry.row_number,
          code: entry.code || "",
          totalIncome: entry.total_income || "",
          employee: {
            bhxh: entry.employee_bhxh || "",
            bhyt: entry.employee_bhyt || "",
            bhtn: entry.employee_bhtn || "",
          },
          employer: {
            bhxh: entry.employer_bhxh || "",
            tnld: entry.employer_tnld || "",
            bhyt: entry.employer_bhyt || "",
            bhtn: entry.employer_bhtn || "",
            kpcd: entry.employer_kpcd || "",
          },
          pit: entry.pit || "",
        }));
        setRows(transformedRows);
        setNumRows(transformedRows.length);
      }

      toast.success("Payroll loaded successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error loading payroll:", error);
      toast.error("Failed to load payroll data.", {
        position: "top-right",
        autoClose: 5000,
      });
      navigate("/nexgenus/payroll");
    } finally {
      setLoading(false);
    }
  };

  const generateTable = (rowCount = numRows) => {
    localStorage.setItem("payrollStartDate", startDate);
    localStorage.setItem("payrollNumRows", rowCount);

    const newRows = [];
    for (let r = 1; r <= rowCount; r++) {
      newRows.push({
        id: r,
        code: "",
        totalIncome: "",
        employee: {
          bhxh: "",
          bhyt: "",
          bhtn: "",
        },
        employer: {
          bhxh: "",
          tnld: "",
          bhyt: "",
          bhtn: "",
          kpcd: "",
        },
        pit: "",
      });
    }
    setRows(newRows);
  };

  const handleInputChange = (rowIndex, field, value, subField = null) => {
    const newRows = [...rows];
    if (subField) {
      newRows[rowIndex][field][subField] = value;
    } else {
      newRows[rowIndex][field] = value;
    }
    setRows(newRows);
  };

  const handlePaste = (e, rowIndex, type, subField = null) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData("text");
    const pastedRows = clipboardData
      .split(/\r\n|\n|\r/)
      .filter((row) => row.length > 0);

    const newRows = [...rows];

    pastedRows.forEach((rowData, rIndex) => {
      const targetRowIndex = rowIndex + rIndex;
      if (targetRowIndex >= newRows.length) return;

      const cols = rowData.split("\t");

      cols.forEach((cellData, cIndex) => {
        // Determine starting column based on type
        let startAbsCol = 0;
        if (type === "code") startAbsCol = 0;
        else if (type === "totalIncome") startAbsCol = 1;
        else if (type === "employee") {
          if (subField === "bhxh") startAbsCol = 2;
          else if (subField === "bhyt") startAbsCol = 3;
          else if (subField === "bhtn") startAbsCol = 4;
        } else if (type === "employer") {
          if (subField === "bhxh") startAbsCol = 5;
          else if (subField === "tnld") startAbsCol = 6;
          else if (subField === "bhyt") startAbsCol = 7;
          else if (subField === "bhtn") startAbsCol = 8;
          else if (subField === "kpcd") startAbsCol = 9;
        } else if (type === "pit") startAbsCol = 10;

        const targetAbsCol = startAbsCol + cIndex;

        // Map absolute column to field
        if (targetAbsCol === 0) {
          newRows[targetRowIndex].code = cellData.trim();
        } else if (targetAbsCol === 1) {
          newRows[targetRowIndex].totalIncome = cellData.trim();
        } else if (targetAbsCol === 2) {
          newRows[targetRowIndex].employee.bhxh = cellData.trim();
        } else if (targetAbsCol === 3) {
          newRows[targetRowIndex].employee.bhyt = cellData.trim();
        } else if (targetAbsCol === 4) {
          newRows[targetRowIndex].employee.bhtn = cellData.trim();
        } else if (targetAbsCol === 5) {
          newRows[targetRowIndex].employer.bhxh = cellData.trim();
        } else if (targetAbsCol === 6) {
          newRows[targetRowIndex].employer.tnld = cellData.trim();
        } else if (targetAbsCol === 7) {
          newRows[targetRowIndex].employer.bhyt = cellData.trim();
        } else if (targetAbsCol === 8) {
          newRows[targetRowIndex].employer.bhtn = cellData.trim();
        } else if (targetAbsCol === 9) {
          newRows[targetRowIndex].employer.kpcd = cellData.trim();
        } else if (targetAbsCol === 10) {
          newRows[targetRowIndex].pit = cellData.trim();
        }
      });
    });
    setRows(newRows);
  };

  const handleKeyDown = (e, rowIndex, type, subField = null) => {
    const getCellId = (r, t, sub = null) =>
      sub ? `cell-${r}-${t}-${sub}` : `cell-${r}-${t}`;

    let nextId = null;
    const maxRows = rows.length;

    if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      if (rowIndex < maxRows - 1) {
        nextId = getCellId(rowIndex + 1, type, subField);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (rowIndex > 0) {
        nextId = getCellId(rowIndex - 1, type, subField);
      }
    }

    if (nextId) {
      const el = document.getElementById(nextId);
      if (el) el.focus();
    }
  };

  const clearData = () => {
    if (!window.confirm("Clear all data?")) return;

    const newRows = rows.map((row) => ({
      ...row,
      code: "",
      totalIncome: "",
      employee: {
        bhxh: "",
        bhyt: "",
        bhtn: "",
      },
      employer: {
        bhxh: "",
        tnld: "",
        bhyt: "",
        bhtn: "",
        kpcd: "",
      },
      pit: "",
    }));
    setRows(newRows);
    toast.success("Data cleared.", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleSave = async () => {
    if (!startDate) {
      toast.warning("Please select a start date!", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    // Helper function to remove commas from number strings
    const cleanNumber = (val) => {
      if (!val) return val;
      return String(val).replace(/,/g, "");
    };

    const entries = rows
      .filter(
        (row) =>
          row.code ||
          row.totalIncome ||
          Object.values(row.employee).some((v) => v) ||
          Object.values(row.employer).some((v) => v) ||
          row.pit
      )
      .map((row) => ({
        row_number: row.id,
        code: row.code,
        totalIncome: cleanNumber(row.totalIncome),
        employee: {
          bhxh: cleanNumber(row.employee.bhxh),
          bhyt: cleanNumber(row.employee.bhyt),
          bhtn: cleanNumber(row.employee.bhtn),
        },
        employer: {
          bhxh: cleanNumber(row.employer.bhxh),
          tnld: cleanNumber(row.employer.tnld),
          bhyt: cleanNumber(row.employer.bhyt),
          bhtn: cleanNumber(row.employer.bhtn),
          kpcd: cleanNumber(row.employer.kpcd),
        },
        pit: cleanNumber(row.pit),
      }));

    try {
      setSaving(true);

      const payload = {
        start_date: startDate,
        entries: entries,
      };

      let response;
      if (isEditMode && payrollId) {
        // Update existing payroll
        response = await fetch(
          `${API_BASE_WITH_API_PREFIX}/payroll-nexgenus/${payrollId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        // Create new payroll
        response = await fetch(`${API_BASE_WITH_API_PREFIX}/payroll-nexgenus`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save payroll");
      }

      const result = await response.json();

      toast.success(
        isEditMode
          ? "Payroll updated successfully!"
          : "Payroll saved successfully!",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );

      const draftKey = getDraftKey();
      clearDraft(draftKey);

      // Navigate to list or stay in edit mode
      if (!isEditMode) {
        setTimeout(() => {
          navigate("/nexgenus/payroll");
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving payroll:", error);
      toast.error(
        error.message || "Failed to save payroll. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    navigate("/nexgenus/payroll");
  };

  const handleExportExcel = () => {
    try {
      const ws_data = [
        // Header row 1
        [
          "#",
          "Code",
          "Total Income",
          "Employee BHXH",
          "Employee BHYT",
          "Employee BHTN",
          "Employer BHXH",
          "Employer TNLD",
          "Employer BHYT",
          "Employer BHTN",
          "Employer KPCD",
          "PIT",
        ],
      ];

      // Data rows
      rows.forEach((row, index) => {
        ws_data.push([
          index + 1,
          row.code,
          row.totalIncome,
          row.employee.bhxh,
          row.employee.bhyt,
          row.employee.bhtn,
          row.employer.bhxh,
          row.employer.tnld,
          row.employer.bhyt,
          row.employer.bhtn,
          row.employer.kpcd,
          row.pit,
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Payroll");
      XLSX.writeFile(wb, `Payroll_NexGenus_${Date.now()}.xlsx`);

      toast.success("Excel file exported successfully.", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Failed to export Excel file.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const pageTitle = isEditMode
    ? "Edit Payroll NexGenus"
    : "New Payroll NexGenus";
  const breadcrumb = isEditMode
    ? ["Home", "Payroll", "NexGenus", "Edit"]
    : ["Home", "Payroll", "NexGenus"];

  return (
    <Layout title={pageTitle} breadcrumb={breadcrumb}>
      <div className="timesheet-container">
        {loading ? (
          <div className="loading-spinner">Loading payroll...</div>
        ) : (
          <>
            <div className="date-config">
              <h3>
                ⚙️ Payroll Configuration{" "}
                {isEditMode && <span className="edit-badge">(Editing)</span>}
              </h3>
              <div className="input-group">
                <div className="input-field">
                  <label htmlFor="startDate">Start Date:</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label htmlFor="numRows">Rows:</label>
                  <input
                    type="number"
                    id="numRows"
                    min="1"
                    max="200"
                    value={numRows}
                    onChange={(e) => setNumRows(parseInt(e.target.value))}
                    disabled={isEditMode}
                  />
                </div>
                {!isEditMode && (
                  <button
                    type="button"
                    className="ts-btn ts-btn-generate"
                    onClick={() => generateTable()}
                  >
                    Generate Table
                  </button>
                )}
              </div>
            </div>

            <div className="table-container">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h2 style={{ margin: 0 }}>Payroll NexGenus</h2>

                <div className="action-buttons" style={{ marginTop: 0 }}>
                  <button
                    type="button"
                    className="btn-action btn-save"
                    onClick={handleSave}
                    disabled={saving}
                    title={isEditMode ? "Update" : "Save"}
                    aria-label={isEditMode ? "Update" : "Save"}
                  >
                    <i className="fas fa-save"></i>
                  </button>

                  {isEditMode && (
                    <button
                      type="button"
                      className="btn-action btn-cancel"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      title="Cancel"
                      aria-label="Cancel"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-action btn-clear"
                    onClick={clearData}
                    title="Clear Data"
                    aria-label="Clear Data"
                  >
                    <i className="fas fa-eraser"></i>
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
                    className="btn-action btn-back"
                    onClick={handleBack}
                    title="Back"
                    aria-label="Back"
                  >
                    <i className="fas fa-arrow-left"></i>
                  </button>
                </div>
              </div>

              <div className="info-box">
                <strong>💡 Instructions:</strong>
                <ul>
                  <li>
                    <strong>Configuration:</strong> Set start date and number of
                    rows, then click Generate Table
                  </li>
                  <li>
                    <strong>Employee Data:</strong> Fill in Code and Total
                    Income for each employee
                  </li>
                  <li>
                    <strong>Insurance:</strong> Fill in BHXH, BHYT, BHTN for
                    both employee and employer contributions
                  </li>
                  <li>
                    <strong>Tax:</strong> Enter PIT (Personal Income Tax) amount
                  </li>
                </ul>
              </div>

              <div
                style={{
                  overflowX: "auto",
                  maxHeight: "70vh",
                  overflowY: "auto",
                }}
              >
                <table className="timesheet-table" id="payrollTable">
                  <thead>
                    <tr style={{ position: "sticky", top: 0, zIndex: 100 }}>
                      <th
                        rowSpan="2"
                        style={{
                          backgroundColor: "#ff9999",
                          position: "sticky",
                          top: 0,
                          zIndex: 101,
                        }}
                      >
                        #
                      </th>
                      <th
                        rowSpan="2"
                        style={{
                          backgroundColor: "#ff9999",
                          position: "sticky",
                          top: 0,
                          zIndex: 101,
                        }}
                      >
                        Code
                      </th>
                      <th
                        rowSpan="2"
                        style={{
                          backgroundColor: "#ff9999",
                          position: "sticky",
                          top: 0,
                          zIndex: 101,
                        }}
                      >
                        Total Income
                      </th>
                      <th
                        colSpan="3"
                        style={{
                          backgroundColor: "#99ff99",
                          position: "sticky",
                          top: 0,
                          zIndex: 101,
                          borderBottom: "2px solid #333",
                        }}
                      >
                        Employee
                      </th>
                      <th
                        colSpan="5"
                        style={{
                          backgroundColor: "#99ccff",
                          position: "sticky",
                          top: 0,
                          zIndex: 101,
                          borderBottom: "2px solid #333",
                        }}
                      >
                        Employer
                      </th>
                      <th
                        rowSpan="2"
                        style={{
                          backgroundColor: "#ff99cc",
                          position: "sticky",
                          top: 0,
                          zIndex: 101,
                        }}
                      >
                        PIT
                      </th>
                    </tr>
                    <tr style={{ position: "sticky", top: "40px", zIndex: 99 }}>
                      <th
                        style={{
                          backgroundColor: "#99ff99",
                          position: "sticky",
                          top: "40px",
                          zIndex: 99,
                        }}
                      >
                        BHXH
                      </th>
                      <th
                        style={{
                          backgroundColor: "#99ff99",
                          position: "sticky",
                          top: "40px",
                          zIndex: 99,
                        }}
                      >
                        BHYT
                      </th>
                      <th
                        style={{
                          backgroundColor: "#99ff99",
                          position: "sticky",
                          top: "40px",
                          zIndex: 99,
                        }}
                      >
                        BHTN
                      </th>
                      <th
                        style={{
                          backgroundColor: "#99ccff",
                          position: "sticky",
                          top: "40px",
                          zIndex: 99,
                        }}
                      >
                        BHXH
                      </th>
                      <th
                        style={{
                          backgroundColor: "#99ccff",
                          position: "sticky",
                          top: "40px",
                          zIndex: 99,
                        }}
                      >
                        TNLD
                      </th>
                      <th
                        style={{
                          backgroundColor: "#99ccff",
                          position: "sticky",
                          top: "40px",
                          zIndex: 99,
                        }}
                      >
                        BHYT
                      </th>
                      <th
                        style={{
                          backgroundColor: "#99ccff",
                          position: "sticky",
                          top: "40px",
                          zIndex: 99,
                        }}
                      >
                        BHTN
                      </th>
                      <th
                        style={{
                          backgroundColor: "#99ccff",
                          position: "sticky",
                          top: "40px",
                          zIndex: 99,
                        }}
                      >
                        KPCD
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={row.id}>
                        <td className="num-col">
                          <input type="text" value={row.id} readOnly />
                        </td>
                        <td>
                          <input
                            id={`cell-${rowIndex}-code`}
                            type="text"
                            value={row.code}
                            onChange={(e) =>
                              handleInputChange(
                                rowIndex,
                                "code",
                                e.target.value
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, rowIndex, "code")
                            }
                            onPaste={(e) => handlePaste(e, rowIndex, "code")}
                          />
                        </td>
                        <td>
                          <input
                            id={`cell-${rowIndex}-totalIncome`}
                            type="text"
                            value={row.totalIncome}
                            onChange={(e) =>
                              handleInputChange(
                                rowIndex,
                                "totalIncome",
                                e.target.value
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, rowIndex, "totalIncome")
                            }
                            onPaste={(e) =>
                              handlePaste(e, rowIndex, "totalIncome")
                            }
                          />
                        </td>
                        <td>
                          <input
                            id={`cell-${rowIndex}-employee-bhxh`}
                            type="text"
                            value={row.employee.bhxh}
                            onChange={(e) =>
                              handleInputChange(
                                rowIndex,
                                "employee",
                                e.target.value,
                                "bhxh"
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, rowIndex, "employee", "bhxh")
                            }
                            onPaste={(e) =>
                              handlePaste(e, rowIndex, "employee", "bhxh")
                            }
                          />
                        </td>
                        <td>
                          <input
                            id={`cell-${rowIndex}-employee-bhyt`}
                            type="text"
                            value={row.employee.bhyt}
                            onChange={(e) =>
                              handleInputChange(
                                rowIndex,
                                "employee",
                                e.target.value,
                                "bhyt"
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, rowIndex, "employee", "bhyt")
                            }
                            onPaste={(e) =>
                              handlePaste(e, rowIndex, "employee", "bhyt")
                            }
                          />
                        </td>
                        <td>
                          <input
                            id={`cell-${rowIndex}-employee-bhtn`}
                            type="text"
                            value={row.employee.bhtn}
                            onChange={(e) =>
                              handleInputChange(
                                rowIndex,
                                "employee",
                                e.target.value,
                                "bhtn"
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, rowIndex, "employee", "bhtn")
                            }
                            onPaste={(e) =>
                              handlePaste(e, rowIndex, "employee", "bhtn")
                            }
                          />
                        </td>
                        <td>
                          <input
                            id={`cell-${rowIndex}-employer-bhxh`}
                            type="text"
                            value={row.employer.bhxh}
                            onChange={(e) =>
                              handleInputChange(
                                rowIndex,
                                "employer",
                                e.target.value,
                                "bhxh"
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, rowIndex, "employer", "bhxh")
                            }
                            onPaste={(e) =>
                              handlePaste(e, rowIndex, "employer", "bhxh")
                            }
                          />
                        </td>
                        <td>
                          <input
                            id={`cell-${rowIndex}-employer-tnld`}
                            type="text"
                            value={row.employer.tnld}
                            onChange={(e) =>
                              handleInputChange(
                                rowIndex,
                                "employer",
                                e.target.value,
                                "tnld"
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, rowIndex, "employer", "tnld")
                            }
                            onPaste={(e) =>
                              handlePaste(e, rowIndex, "employer", "tnld")
                            }
                          />
                        </td>
                        <td>
                          <input
                            id={`cell-${rowIndex}-employer-bhyt`}
                            type="text"
                            value={row.employer.bhyt}
                            onChange={(e) =>
                              handleInputChange(
                                rowIndex,
                                "employer",
                                e.target.value,
                                "bhyt"
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, rowIndex, "employer", "bhyt")
                            }
                            onPaste={(e) =>
                              handlePaste(e, rowIndex, "employer", "bhyt")
                            }
                          />
                        </td>
                        <td>
                          <input
                            id={`cell-${rowIndex}-employer-bhtn`}
                            type="text"
                            value={row.employer.bhtn}
                            onChange={(e) =>
                              handleInputChange(
                                rowIndex,
                                "employer",
                                e.target.value,
                                "bhtn"
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, rowIndex, "employer", "bhtn")
                            }
                            onPaste={(e) =>
                              handlePaste(e, rowIndex, "employer", "bhtn")
                            }
                          />
                        </td>
                        <td>
                          <input
                            id={`cell-${rowIndex}-employer-kpcd`}
                            type="text"
                            value={row.employer.kpcd}
                            onChange={(e) =>
                              handleInputChange(
                                rowIndex,
                                "employer",
                                e.target.value,
                                "kpcd"
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, rowIndex, "employer", "kpcd")
                            }
                            onPaste={(e) =>
                              handlePaste(e, rowIndex, "employer", "kpcd")
                            }
                          />
                        </td>
                        <td>
                          <input
                            id={`cell-${rowIndex}-pit`}
                            type="text"
                            value={row.pit}
                            onChange={(e) =>
                              handleInputChange(rowIndex, "pit", e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, rowIndex, "pit")}
                            onPaste={(e) => handlePaste(e, rowIndex, "pit")}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default PayrollNexgenusForm;
