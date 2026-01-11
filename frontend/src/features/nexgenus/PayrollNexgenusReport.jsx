import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import "../../assets/styles/list.css";
import "../payroll/TimeSheetReport.css";
import { API_BASE_WITH_API_PREFIX } from "../../config/api";

const PayrollNexgenusReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payrollInfo, setPayrollInfo] = useState(null);

  const handleBack = () => {
    navigate("/nexgenus/payroll");
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/nexgenus/payroll/edit/${id}`);
    }
  };

  useEffect(() => {
    if (id) {
      loadPayrollReport(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadPayrollReport = async (payrollId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_WITH_API_PREFIX}/payroll-nexgenus/${payrollId}`
      );
      if (!response.ok) {
        throw new Error("Failed to load payroll report");
      }

      const data = await response.json();
      setPayrollInfo(data.payroll);

      // Group entries by code
      const grouped = groupEntriesByCode(data.entries || []);
      setReportData(grouped);
    } catch (error) {
      console.error("Error loading payroll report:", error);
      toast.error("Failed to load payroll report.", {
        position: "top-right",
        autoClose: 5000,
      });
      navigate("/nexgenus/payroll");
    } finally {
      setLoading(false);
    }
  };

  const groupEntriesByCode = (entries) => {
    // Sort by code first
    const sorted = [...entries].sort((a, b) => {
      const codeA = String(a.code || "").trim();
      const codeB = String(b.code || "").trim();
      return codeA.localeCompare(codeB);
    });

    // Group by code
    const grouped = {};
    sorted.forEach((entry) => {
      const code = String(entry.code || "").trim();
      if (!code) return;

      if (!grouped[code]) {
        grouped[code] = {
          code: code,
          rows: [],
          totalIncome: 0,
          employee: {
            bhxh: 0,
            bhyt: 0,
            bhtn: 0,
          },
          employer: {
            bhxh: 0,
            tnld: 0,
            bhyt: 0,
            bhtn: 0,
            kpcd: 0,
          },
          pit: 0,
        };
      }

      // Add row to group
      grouped[code].rows.push(entry);

      // Sum up values - parse string values from database
      const parseSafe = (val) => {
        if (!val) return 0;
        const str = String(val).trim();
        if (!str) return 0;
        // Remove commas from number strings like "20,800,000"
        const cleaned = str.replace(/,/g, "");
        const num = parseFloat(cleaned);
        return Number.isFinite(num) ? num : 0;
      };

      grouped[code].totalIncome += parseSafe(entry.total_income);
      grouped[code].employee.bhxh += parseSafe(entry.employee_bhxh);
      grouped[code].employee.bhyt += parseSafe(entry.employee_bhyt);
      grouped[code].employee.bhtn += parseSafe(entry.employee_bhtn);
      grouped[code].employer.bhxh += parseSafe(entry.employer_bhxh);
      grouped[code].employer.tnld += parseSafe(entry.employer_tnld);
      grouped[code].employer.bhyt += parseSafe(entry.employer_bhyt);
      grouped[code].employer.bhtn += parseSafe(entry.employer_bhtn);
      grouped[code].employer.kpcd += parseSafe(entry.employer_kpcd);
      grouped[code].pit += parseSafe(entry.pit);
    });

    return Object.values(grouped);
  };

  const handleExportExcel = () => {
    if (!reportData || reportData.length === 0) {
      toast.warning("No data to export.", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    const ws_data = [
      // Header row
      [
        "Code",
        "Row Count",
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
        "Total",
        "Net Employee Receive",
      ],
    ];

    // Data rows
    reportData.forEach((group) => {
      ws_data.push([
        group.code,
        group.rows.length,
        formatNumber(group.totalIncome),
        formatNumber(group.employee.bhxh),
        formatNumber(group.employee.bhyt),
        formatNumber(group.employee.bhtn),
        formatNumber(group.employer.bhxh),
        formatNumber(group.employer.tnld),
        formatNumber(group.employer.bhyt),
        formatNumber(group.employer.bhtn),
        formatNumber(group.employer.kpcd),
        formatNumber(group.pit),
        formatNumber(calculateRowTotal(group)),
        formatNumber(calculateNetEmployeeReceive(group)),
      ]);
    });

    // Add total row
    const totals = calculateTotals();
    ws_data.push([
      "TOTAL",
      totals.totalRows,
      formatNumber(totals.totalIncome),
      formatNumber(totals.employee.bhxh),
      formatNumber(totals.employee.bhyt),
      formatNumber(totals.employee.bhtn),
      formatNumber(totals.employer.bhxh),
      formatNumber(totals.employer.tnld),
      formatNumber(totals.employer.bhyt),
      formatNumber(totals.employer.bhtn),
      formatNumber(totals.employer.kpcd),
      formatNumber(totals.pit),
      formatNumber(
        totals.totalIncome +
          totals.employee.bhxh +
          totals.employee.bhyt +
          totals.employee.bhtn +
          totals.employer.bhxh +
          totals.employer.tnld +
          totals.employer.bhyt +
          totals.employer.bhtn +
          totals.employer.kpcd +
          totals.pit
      ),
      formatNumber(
        totals.totalIncome -
          totals.employee.bhxh -
          totals.employee.bhyt -
          totals.employee.bhtn -
          totals.pit
      ),
    ]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll Report");

    const startDate = payrollInfo?.start_date || "draft";
    const fileName = `PayrollNexgenus_Report_${
      id || startDate
    }_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast.success("Excel file exported successfully.", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const calculateRowTotal = (group) => {
    return (
      group.totalIncome +
      group.employee.bhxh +
      group.employee.bhyt +
      group.employee.bhtn +
      group.employer.bhxh +
      group.employer.tnld +
      group.employer.bhyt +
      group.employer.bhtn +
      group.employer.kpcd +
      group.pit
    );
  };

  const calculateNetEmployeeReceive = (group) => {
    return (
      group.totalIncome -
      group.employee.bhxh -
      group.employee.bhyt -
      group.employee.bhtn -
      group.pit
    );
  };

  const formatNumber = (value) => {
    const num = parseFloat(value);
    if (!Number.isFinite(num)) return "0";
    // Format with commas for thousands separator
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const calculateTotals = () => {
    return reportData.reduce(
      (acc, group) => {
        acc.totalRows += group.rows.length;
        acc.totalIncome += group.totalIncome;
        acc.employee.bhxh += group.employee.bhxh;
        acc.employee.bhyt += group.employee.bhyt;
        acc.employee.bhtn += group.employee.bhtn;
        acc.employer.bhxh += group.employer.bhxh;
        acc.employer.tnld += group.employer.tnld;
        acc.employer.bhyt += group.employer.bhyt;
        acc.employer.bhtn += group.employer.bhtn;
        acc.employer.kpcd += group.employer.kpcd;
        acc.pit += group.pit;
        return acc;
      },
      {
        totalRows: 0,
        totalIncome: 0,
        employee: { bhxh: 0, bhyt: 0, bhtn: 0 },
        employer: { bhxh: 0, tnld: 0, bhyt: 0, bhtn: 0, kpcd: 0 },
        pit: 0,
      }
    );
  };

  if (loading) {
    return (
      <Layout
        title="Payroll NexGenus Report"
        breadcrumb={["Home", "NexGenus", "Payroll Report"]}
      >
        <div className="timesheet-report-container">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading report...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const totals = calculateTotals();

  return (
    <Layout
      title="Payroll NexGenus Report"
      breadcrumb={["Home", "NexGenus", "Payroll Report"]}
    >
      <div className="timesheet-report-container">
        <div
          className="report-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2>Payroll NexGenus Report</h2>
            <div className="report-meta">
              {payrollInfo && (
                <>
                  <div className="meta-item">
                    <strong>Start Date:</strong>{" "}
                    {formatDate(payrollInfo.start_date)}
                  </div>
                  <div className="meta-item">
                    <strong>Created:</strong>{" "}
                    {new Date(payrollInfo.created_at).toLocaleString()}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="action-buttons">
            <button
              type="button"
              className="btn-action btn-edit"
              onClick={handleEdit}
              title="Edit"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              type="button"
              className="btn-action btn-view"
              onClick={handleExportExcel}
              title="Export Excel"
            >
              <i className="fas fa-file-excel"></i>
            </button>
            <button
              type="button"
              className="btn-action btn-back"
              onClick={handleBack}
              title="Back"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
          </div>
        </div>

        {reportData.length === 0 ? (
          <div className="empty-state">
            <h3>No Data</h3>
            <p>No entries found in this payroll.</p>
            <button
              type="button"
              className="btn-create-first"
              onClick={handleBack}
            >
              <i className="fas fa-arrow-left"></i>
              Back to List
            </button>
          </div>
        ) : (
          <div className="report-table-wrapper">
            <table
              className="timesheet-table report-table"
              id="payrollReportTable"
            >
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
                    Rows
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
                  <th
                    rowSpan="2"
                    style={{
                      backgroundColor: "#ffcc99",
                      position: "sticky",
                      top: 0,
                      zIndex: 101,
                    }}
                  >
                    Total
                  </th>
                  <th
                    rowSpan="2"
                    style={{
                      backgroundColor: "#99ccff",
                      position: "sticky",
                      top: 0,
                      zIndex: 101,
                    }}
                  >
                    Net Employee Receive
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
                {reportData.map((group, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{group.code}</strong>
                    </td>
                    <td>{group.rows.length}</td>
                    <td>{formatNumber(group.totalIncome)}</td>
                    <td>{formatNumber(group.employee.bhxh)}</td>
                    <td>{formatNumber(group.employee.bhyt)}</td>
                    <td>{formatNumber(group.employee.bhtn)}</td>
                    <td>{formatNumber(group.employer.bhxh)}</td>
                    <td>{formatNumber(group.employer.tnld)}</td>
                    <td>{formatNumber(group.employer.bhyt)}</td>
                    <td>{formatNumber(group.employer.bhtn)}</td>
                    <td>{formatNumber(group.employer.kpcd)}</td>
                    <td>{formatNumber(group.pit)}</td>
                    <td style={{ fontWeight: "bold" }}>
                      {formatNumber(calculateRowTotal(group))}
                    </td>
                    <td style={{ fontWeight: "bold" }}>
                      {formatNumber(calculateNetEmployeeReceive(group))}
                    </td>
                  </tr>
                ))}
                <tr
                  className="total-row"
                  style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}
                >
                  <td>TOTAL</td>
                  <td>{totals.totalRows}</td>
                  <td>{formatNumber(totals.totalIncome)}</td>
                  <td>{formatNumber(totals.employee.bhxh)}</td>
                  <td>{formatNumber(totals.employee.bhyt)}</td>
                  <td>{formatNumber(totals.employee.bhtn)}</td>
                  <td>{formatNumber(totals.employer.bhxh)}</td>
                  <td>{formatNumber(totals.employer.tnld)}</td>
                  <td>{formatNumber(totals.employer.bhyt)}</td>
                  <td>{formatNumber(totals.employer.bhtn)}</td>
                  <td>{formatNumber(totals.employer.kpcd)}</td>
                  <td>{formatNumber(totals.pit)}</td>
                  <td style={{ fontWeight: "bold" }}>
                    {formatNumber(
                      totals.totalIncome +
                        totals.employee.bhxh +
                        totals.employee.bhyt +
                        totals.employee.bhtn +
                        totals.employer.bhxh +
                        totals.employer.tnld +
                        totals.employer.bhyt +
                        totals.employer.bhtn +
                        totals.employer.kpcd +
                        totals.pit
                    )}
                  </td>
                  <td style={{ fontWeight: "bold" }}>
                    {formatNumber(
                      totals.totalIncome -
                        totals.employee.bhxh -
                        totals.employee.bhyt -
                        totals.employee.bhtn -
                        totals.pit
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PayrollNexgenusReport;
