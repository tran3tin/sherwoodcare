import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import Layout from "../../components/Layout";
import "../../assets/styles/list.css";

const PAYROLL_ACTIVITY_COLS = [
  { key: "employee", label: "Employee", align: "left", width: "220px" },
  { key: "wages", label: "Wages", align: "right", width: "120px" },
  { key: "deductions", label: "Deductions", align: "right", width: "120px" },
  { key: "taxes", label: "Taxes", align: "right", width: "120px" },
  { key: "netPay", label: "Net Pay", align: "right", width: "120px" },
  { key: "expenses", label: "Expenses", align: "right", width: "120px" },
];

const PAYROLL_SUMMARY_COLS = [
  { key: "title", label: "Title", align: "left", width: "340px" },
  { key: "category", label: "Category", align: "left", width: "200px" },
  { key: "amount", label: "Amount", align: "right", width: "150px" },
];

const POPUP_DEFAULT_ROWS = 12;

const emptyPayrollActivityRow = () => ({
  employee: "",
  wages: "",
  deductions: "",
  taxes: "",
  netPay: "",
  expenses: "",
});

const emptyPayrollSummaryRow = () => ({
  title: "",
  category: "",
  amount: "",
});

const makeRows = (count, factory) => Array.from({ length: count }, factory);

const parseClipboard = (str) => {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuote = false;

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    const next = str[i + 1];

    if (inQuote) {
      if (c === '"') {
        if (next === '"') {
          cell += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuote = true;
    } else if (c === "\t") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || (c === "\r" && next === "\n")) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      if (c === "\r") i++;
    } else if (c === "\r") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += c;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  if (rows.length && rows[rows.length - 1].every((v) => v === "")) {
    rows.pop();
  }

  return rows;
};

const parseAmount = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const normalized = raw
    .replace(/\((.*)\)/, "-$1")
    .replace(/[^\d.-]/g, "")
    .replace(/(?!^)-/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
};

const formatCurrency = (value, emphasize = false) => {
  const safe = Number(value) || 0;
  const abs = Math.abs(safe).toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = safe < 0 ? "($" : "$";
  const suffix = safe < 0 ? ")" : "";
  return emphasize ? `${prefix}${abs}${suffix}` : `${prefix} ${abs}${suffix}`;
};

const includesText = (value, keyword) =>
  String(value || "")
    .toLowerCase()
    .includes(keyword.toLowerCase());

export default function PayrollTax() {
  const [showPayrollSummaryPopup, setShowPayrollSummaryPopup] = useState(false);
  const [showPayrollActivityPopup, setShowPayrollActivityPopup] =
    useState(false);

  const [payrollSummaryRows, setPayrollSummaryRows] = useState(() =>
    makeRows(POPUP_DEFAULT_ROWS, emptyPayrollSummaryRow),
  );
  const [payrollActivityRows, setPayrollActivityRows] = useState(() =>
    makeRows(POPUP_DEFAULT_ROWS, emptyPayrollActivityRow),
  );

  const updatePayrollSummaryCell = (rowIdx, key, value) => {
    setPayrollSummaryRows((prev) =>
      prev.map((row, idx) => (idx === rowIdx ? { ...row, [key]: value } : row)),
    );
  };

  const updatePayrollActivityCell = (rowIdx, key, value) => {
    setPayrollActivityRows((prev) =>
      prev.map((row, idx) => (idx === rowIdx ? { ...row, [key]: value } : row)),
    );
  };

  const addPayrollSummaryRows = () => {
    setPayrollSummaryRows((prev) => [
      ...prev,
      ...makeRows(10, emptyPayrollSummaryRow),
    ]);
  };

  const addPayrollActivityRows = () => {
    setPayrollActivityRows((prev) => [
      ...prev,
      ...makeRows(10, emptyPayrollActivityRow),
    ]);
  };

  const handlePopupPaste = (
    e,
    startRow,
    startCol,
    colKeys,
    setRows,
    emptyRow,
  ) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text");
    const pastedRows = parseClipboard(raw);
    if (!pastedRows.length) return;

    setRows((prev) => {
      const next = prev.map((row) => ({ ...row }));
      const need = startRow + pastedRows.length;
      while (next.length < need) next.push(emptyRow());

      pastedRows.forEach((cells, ri) => {
        cells.forEach((val, ci) => {
          const colIdx = startCol + ci;
          if (colIdx >= colKeys.length) return;
          next[startRow + ri][colKeys[colIdx]] = (val ?? "").trim();
        });
      });

      return next;
    });
  };

  const handlePopupKeyDown = (
    e,
    rowIdx,
    colIdx,
    rowsLength,
    colsLength,
    focusPrefix,
    addRows,
  ) => {
    const maxRow = rowsLength - 1;
    const maxCol = colsLength - 1;
    const focus = (r, c) => {
      const el = document.getElementById(`${focusPrefix}-${r}-${c}`);
      if (el) {
        el.focus();
        el.select?.();
      }
    };

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (rowIdx < maxRow) focus(rowIdx + 1, colIdx);
      else {
        addRows();
        setTimeout(() => focus(rowIdx + 1, colIdx), 30);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (rowIdx > 0) focus(rowIdx - 1, colIdx);
    } else if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      if (colIdx < maxCol) focus(rowIdx, colIdx + 1);
      else if (rowIdx < maxRow) focus(rowIdx + 1, 0);
      else {
        addRows();
        setTimeout(() => focus(rowIdx + 1, 0), 30);
      }
    } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      if (colIdx > 0) focus(rowIdx, colIdx - 1);
      else if (rowIdx > 0) focus(rowIdx - 1, maxCol);
    }
  };

  const payrollActivityTotals = useMemo(
    () => ({
      wages: payrollActivityRows.reduce(
        (sum, row) => sum + parseAmount(row.wages),
        0,
      ),
      deductions: payrollActivityRows.reduce(
        (sum, row) => sum + parseAmount(row.deductions),
        0,
      ),
      taxes: payrollActivityRows.reduce(
        (sum, row) => sum + parseAmount(row.taxes),
        0,
      ),
      netPay: payrollActivityRows.reduce(
        (sum, row) => sum + parseAmount(row.netPay),
        0,
      ),
      expenses: payrollActivityRows.reduce(
        (sum, row) => sum + parseAmount(row.expenses),
        0,
      ),
    }),
    [payrollActivityRows],
  );

  const payrollSummaryMapped = useMemo(() => {
    const rows = payrollSummaryRows;

    const byKeywords = (...keywords) =>
      rows.reduce((sum, row) => {
        const text = `${row.title} ${row.category}`.toLowerCase();
        return keywords.some((k) => text.includes(k.toLowerCase()))
          ? sum + parseAmount(row.amount)
          : sum;
      }, 0);

    const byCategory = (categoryName) =>
      rows.reduce(
        (sum, row) =>
          includesText(row.category, categoryName)
            ? sum + parseAmount(row.amount)
            : sum,
        0,
      );

    const byAllowanceTitles = (titles) =>
      rows.reduce((sum, row) => {
        const text = `${row.title} ${row.category}`.toLowerCase();
        return titles.some((title) => text.includes(title.toLowerCase()))
          ? sum + parseAmount(row.amount)
          : sum;
      }, 0);

    const vehicleAllowance = byKeywords("vehicle allowance");
    const allowances = byAllowanceTitles([
      "Call-out Allowance",
      "Sleepover Allowance",
      "OnCall Duty - Allowance",
    ]);

    return {
      vehicleAllowance,
      allowances,
      bonus: byCategory("bonus"),
      superannuation: byCategory("super") + byKeywords("superannuation"),
    };
  }, [payrollSummaryRows]);

  const payrollTaxData = useMemo(() => {
    const totalWagesFromActivity = payrollActivityTotals.wages;
    const vehicleAllowance = payrollSummaryMapped.vehicleAllowance;
    const vehicleAllowanceAt088 = vehicleAllowance * 0.88;
    const vehicleAllowanceTaxable = vehicleAllowance * 0.12;
    const grossWagesCalculableForPtx =
      totalWagesFromActivity - vehicleAllowanceAt088;

    const allowances = payrollSummaryMapped.allowances;
    const bonus = payrollSummaryMapped.bonus;

    const grossWages =
      grossWagesCalculableForPtx + vehicleAllowanceTaxable + allowances + bonus;
    const totalWages = grossWages;

    const superannuation = payrollSummaryMapped.superannuation;
    const totalTaxableWages = totalWages + superannuation;

    const payrollTax = totalTaxableWages * 0.012125;
    const mentalHealthSurcharge = totalTaxableWages * 0.005;
    const covidDebtSurcharge = totalTaxableWages * 0.005;

    const netPayrollTaxAndSurchargesPayable =
      payrollTax + mentalHealthSurcharge + covidDebtSurcharge;

    return {
      totalWagesFromActivity,
      vehicleAllowance,
      vehicleAllowanceAt088,
      grossWagesCalculableForPtx,
      vehicleAllowanceTaxable,
      allowances,
      bonus,
      grossWages,
      totalWages,
      superannuation,
      totalTaxableWages,
      payrollTax,
      mentalHealthSurcharge,
      covidDebtSurcharge,
      netPayrollTaxAndSurchargesPayable,
    };
  }, [payrollActivityTotals, payrollSummaryMapped]);

  const exportExcel = () => {
    const summaryRows = [
      {
        Item: "Total Wages",
        Amount: payrollTaxData.totalWagesFromActivity,
      },
      {
        Item: "(-) Vehicle Allowance (Total km x $0.88)",
        Amount: -payrollTaxData.vehicleAllowanceAt088,
      },
      {
        Item: "Gross wages calculable for PTX",
        Amount: payrollTaxData.grossWagesCalculableForPtx,
      },
      {
        Item: "Vehicle Allowance Taxable (Total km x $0.12)",
        Amount: payrollTaxData.vehicleAllowanceTaxable,
      },
      {
        Item: "Allowances",
        Amount: payrollTaxData.allowances,
      },
      {
        Item: "Bonus",
        Amount: payrollTaxData.bonus,
      },
      {
        Item: "Gross Wages",
        Amount: payrollTaxData.grossWages,
      },
      {
        Item: "Total Wages",
        Amount: payrollTaxData.totalWages,
      },
      {
        Item: "Superannuation",
        Amount: payrollTaxData.superannuation,
      },
      {
        Item: "Total Taxable Wages",
        Amount: payrollTaxData.totalTaxableWages,
      },
      {
        Item: "Payroll Tax @ 1.2125%",
        Amount: payrollTaxData.payrollTax,
      },
      {
        Item: "Mental Health & Wellbeing Surcharge @ 0.50%",
        Amount: payrollTaxData.mentalHealthSurcharge,
      },
      {
        Item: "Covid-19 Debt Temporary Payroll Tax Surcharge",
        Amount: payrollTaxData.covidDebtSurcharge,
      },
      {
        Item: "Net Payroll Tax and Surcharges Payable",
        Amount: payrollTaxData.netPayrollTaxAndSurchargesPayable,
      },
    ];

    const payrollSummaryRowsForExport = payrollSummaryRows.map((row) => ({
      Title: row.title,
      Category: row.category,
      Amount: parseAmount(row.amount),
    }));

    const payrollActivityRowsForExport = payrollActivityRows.map((row) => ({
      Employee: row.employee,
      Wages: parseAmount(row.wages),
      Deductions: parseAmount(row.deductions),
      Taxes: parseAmount(row.taxes),
      "Net Pay": parseAmount(row.netPay),
      Expenses: parseAmount(row.expenses),
    }));

    const wb = XLSX.utils.book_new();

    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Payroll Tax");

    const wsPayrollSummary = XLSX.utils.json_to_sheet(
      payrollSummaryRowsForExport,
    );
    XLSX.utils.book_append_sheet(wb, wsPayrollSummary, "Payroll Summary");

    const wsPayrollActivity = XLSX.utils.json_to_sheet(
      payrollActivityRowsForExport,
    );
    XLSX.utils.book_append_sheet(wb, wsPayrollActivity, "Payroll Activity");

    XLSX.writeFile(wb, "Payroll-Tax.xlsx");
  };

  return (
    <Layout title="Payroll Tax" breadcrumb={["Home", "Tax", "Payroll Tax"]}>
      <div style={{ padding: "0 4px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <h2 style={{ margin: 0, flex: 1 }}>PTX Calculation</h2>
          <button
            type="button"
            className="btn-action"
            title="Payroll Summary"
            onClick={() => setShowPayrollSummaryPopup(true)}
            style={{ background: "#0f766e", color: "#fff" }}
          >
            <i className="fas fa-file-invoice-dollar"></i>
          </button>
          <button
            type="button"
            className="btn-action"
            title="Export Excel"
            onClick={exportExcel}
            style={{ background: "#1f7a3f", color: "#fff" }}
          >
            <i className="fas fa-file-excel"></i>
          </button>
          <button
            type="button"
            className="btn-action"
            title="Payroll Activity Summary"
            onClick={() => setShowPayrollActivityPopup(true)}
            style={{ background: "#2563eb", color: "#fff" }}
          >
            <i className="fas fa-users"></i>
          </button>
        </div>

        <div
          style={{
            background: "#f3f4f6",
            borderRadius: "8px",
            padding: "14px",
            border: "1px solid #d1d5db",
            maxWidth: "860px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "3px 4px", fontWeight: 600 }}>
                  Total Wages
                </td>
                <td
                  style={{
                    padding: "3px 4px",
                    textAlign: "right",
                    color: "#1d4ed8",
                  }}
                >
                  {formatCurrency(payrollTaxData.totalWagesFromActivity)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 4px", fontWeight: 600 }}>
                  (-) Vehicle Allowance (Total km x $0.88)
                </td>
                <td style={{ padding: "3px 4px", textAlign: "right" }}>
                  {formatCurrency(-payrollTaxData.vehicleAllowanceAt088)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 4px", fontWeight: 700 }}>
                  Gross wages calculable for PTX
                </td>
                <td
                  style={{
                    padding: "3px 4px",
                    textAlign: "right",
                    fontWeight: 700,
                    borderTop: "1px solid #111",
                    borderBottom: "1px solid #111",
                  }}
                >
                  {formatCurrency(payrollTaxData.grossWagesCalculableForPtx)}
                </td>
              </tr>

              <tr>
                <td style={{ height: "12px" }} colSpan={2} />
              </tr>

              <tr>
                <td style={{ padding: "3px 4px", fontWeight: 600 }}>
                  Vehicle Allowance Taxable (Total km x $0.12)
                </td>
                <td style={{ padding: "3px 4px", textAlign: "right" }}>
                  {formatCurrency(payrollTaxData.vehicleAllowanceTaxable)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 4px", fontWeight: 600 }}>
                  Allowances
                </td>
                <td style={{ padding: "3px 4px", textAlign: "right" }}>
                  {formatCurrency(payrollTaxData.allowances)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 4px", fontWeight: 600 }}>Bonus</td>
                <td
                  style={{
                    padding: "3px 4px",
                    textAlign: "right",
                    color: "#1d4ed8",
                  }}
                >
                  {formatCurrency(payrollTaxData.bonus)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 4px", fontWeight: 600 }}>
                  Gross Wages
                </td>
                <td style={{ padding: "3px 4px", textAlign: "right" }}>
                  {formatCurrency(payrollTaxData.grossWages)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 4px", fontWeight: 700 }}>
                  Total Wages
                </td>
                <td
                  style={{
                    padding: "3px 4px",
                    textAlign: "right",
                    fontWeight: 700,
                    borderTop: "1px solid #111",
                  }}
                >
                  {formatCurrency(payrollTaxData.totalWages)}
                </td>
              </tr>

              <tr>
                <td style={{ height: "12px" }} colSpan={2} />
              </tr>

              <tr>
                <td style={{ padding: "3px 4px", fontWeight: 700 }}>
                  Superannuation
                </td>
                <td
                  style={{
                    padding: "3px 4px",
                    textAlign: "right",
                    color: "#1d4ed8",
                  }}
                >
                  {formatCurrency(payrollTaxData.superannuation)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "3px 4px",
                    fontWeight: 700,
                    color: "#0369a1",
                  }}
                >
                  Total Taxable Wages
                </td>
                <td
                  style={{
                    padding: "3px 4px",
                    textAlign: "right",
                    color: "#0369a1",
                    fontWeight: 700,
                    borderTop: "1px solid #111",
                  }}
                >
                  {formatCurrency(payrollTaxData.totalTaxableWages)}
                </td>
              </tr>

              <tr>
                <td style={{ height: "12px" }} colSpan={2} />
              </tr>

              <tr>
                <td style={{ padding: "3px 4px", fontWeight: 600 }}>
                  Payroll Tax @ 1.2125%
                </td>
                <td style={{ padding: "3px 4px", textAlign: "right" }}>
                  {formatCurrency(payrollTaxData.payrollTax)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 4px", fontWeight: 600 }}>
                  Mental Health &amp; Wellbeing Surcharge @ 0.50%
                </td>
                <td style={{ padding: "3px 4px", textAlign: "right" }}>
                  {formatCurrency(payrollTaxData.mentalHealthSurcharge)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 4px", fontWeight: 600 }}>
                  Covid-19 Debt Temporary Payroll Tax Surcharge
                </td>
                <td style={{ padding: "3px 4px", textAlign: "right" }}>
                  {formatCurrency(payrollTaxData.covidDebtSurcharge)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "3px 4px",
                    fontWeight: 700,
                    color: "#b45309",
                  }}
                >
                  Net Payroll Tax and Surcharges Payable
                </td>
                <td
                  style={{
                    padding: "3px 4px",
                    textAlign: "right",
                    fontWeight: 700,
                    color: "#b45309",
                    borderTop: "1px solid #111",
                  }}
                >
                  {formatCurrency(
                    payrollTaxData.netPayrollTaxAndSurchargesPayable,
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {showPayrollSummaryPopup && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.45)",
              zIndex: 1200,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              overflowY: "auto",
              padding: "28px 14px",
            }}
            onClick={(e) =>
              e.target === e.currentTarget && setShowPayrollSummaryPopup(false)
            }
          >
            <div
              style={{
                width: "100%",
                maxWidth: "920px",
                background: "#fff",
                borderRadius: "8px",
                boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
                padding: "20px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <h3 style={{ margin: 0, flex: 1, color: "#2c3e7a" }}>
                  Payroll Summary
                </h3>
                <button
                  type="button"
                  className="btn-action"
                  title="Add 10 rows"
                  onClick={addPayrollSummaryRows}
                  style={{ background: "#2563eb", color: "#fff" }}
                >
                  <i className="fas fa-plus"></i>
                </button>
                <button
                  type="button"
                  className="btn-action btn-delete"
                  title="Close"
                  onClick={() => setShowPayrollSummaryPopup(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <p
                style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}
              >
                Tip: Copy dữ liệu từ Excel và paste trực tiếp vào bất kỳ ô nào.
              </p>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    tableLayout: "fixed",
                    fontSize: "13px",
                  }}
                >
                  <colgroup>
                    <col style={{ width: "46px" }} />
                    {PAYROLL_SUMMARY_COLS.map((col) => (
                      <col key={col.key} style={{ width: col.width }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: "1px solid #ccc",
                          background: "#2c3e7a",
                          color: "#fff",
                          padding: "6px 4px",
                          textAlign: "center",
                          fontSize: "12px",
                        }}
                      >
                        #
                      </th>
                      {PAYROLL_SUMMARY_COLS.map((col) => (
                        <th
                          key={col.key}
                          style={{
                            border: "1px solid #ccc",
                            background: "#2c3e7a",
                            color: "#fff",
                            padding: "6px 4px",
                            textAlign: col.align,
                            fontSize: "12px",
                          }}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payrollSummaryRows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        style={{ background: rowIdx % 2 ? "#f7f9ff" : "#fff" }}
                      >
                        <td
                          style={{
                            border: "1px solid #ddd",
                            textAlign: "center",
                            color: "#9ca3af",
                            fontSize: "11px",
                            padding: "4px",
                          }}
                        >
                          {rowIdx + 1}
                        </td>
                        {PAYROLL_SUMMARY_COLS.map((col, colIdx) => (
                          <td
                            key={col.key}
                            style={{ border: "1px solid #ddd", padding: "4px" }}
                          >
                            <input
                              id={`payroll-summary-${rowIdx}-${colIdx}`}
                              value={row[col.key]}
                              onChange={(e) =>
                                updatePayrollSummaryCell(
                                  rowIdx,
                                  col.key,
                                  e.target.value,
                                )
                              }
                              onPaste={(e) =>
                                handlePopupPaste(
                                  e,
                                  rowIdx,
                                  colIdx,
                                  PAYROLL_SUMMARY_COLS.map((c) => c.key),
                                  setPayrollSummaryRows,
                                  emptyPayrollSummaryRow,
                                )
                              }
                              onKeyDown={(e) =>
                                handlePopupKeyDown(
                                  e,
                                  rowIdx,
                                  colIdx,
                                  payrollSummaryRows.length,
                                  PAYROLL_SUMMARY_COLS.length,
                                  "payroll-summary",
                                  addPayrollSummaryRows,
                                )
                              }
                              style={{
                                width: "100%",
                                border: "none",
                                outline: "none",
                                background: "transparent",
                                textAlign: col.align,
                                fontSize: "13px",
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {showPayrollActivityPopup && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.45)",
              zIndex: 1200,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              overflowY: "auto",
              padding: "28px 14px",
            }}
            onClick={(e) =>
              e.target === e.currentTarget && setShowPayrollActivityPopup(false)
            }
          >
            <div
              style={{
                width: "100%",
                maxWidth: "980px",
                background: "#fff",
                borderRadius: "8px",
                boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
                padding: "20px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <h3 style={{ margin: 0, flex: 1, color: "#2c3e7a" }}>
                  Payroll Activity [Summary]
                </h3>
                <button
                  type="button"
                  className="btn-action"
                  title="Add 10 rows"
                  onClick={addPayrollActivityRows}
                  style={{ background: "#2563eb", color: "#fff" }}
                >
                  <i className="fas fa-plus"></i>
                </button>
                <button
                  type="button"
                  className="btn-action btn-delete"
                  title="Close"
                  onClick={() => setShowPayrollActivityPopup(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <p
                style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}
              >
                Tip: Copy dữ liệu từ Excel và paste trực tiếp vào bất kỳ ô nào.
              </p>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    tableLayout: "fixed",
                    fontSize: "13px",
                  }}
                >
                  <colgroup>
                    <col style={{ width: "46px" }} />
                    {PAYROLL_ACTIVITY_COLS.map((col) => (
                      <col key={col.key} style={{ width: col.width }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: "1px solid #ccc",
                          background: "#2c3e7a",
                          color: "#fff",
                          padding: "6px 4px",
                          textAlign: "center",
                          fontSize: "12px",
                        }}
                      >
                        #
                      </th>
                      {PAYROLL_ACTIVITY_COLS.map((col) => (
                        <th
                          key={col.key}
                          style={{
                            border: "1px solid #ccc",
                            background: "#2c3e7a",
                            color: "#fff",
                            padding: "6px 4px",
                            textAlign: col.align,
                            fontSize: "12px",
                          }}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payrollActivityRows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        style={{ background: rowIdx % 2 ? "#f7f9ff" : "#fff" }}
                      >
                        <td
                          style={{
                            border: "1px solid #ddd",
                            textAlign: "center",
                            color: "#9ca3af",
                            fontSize: "11px",
                            padding: "4px",
                          }}
                        >
                          {rowIdx + 1}
                        </td>
                        {PAYROLL_ACTIVITY_COLS.map((col, colIdx) => (
                          <td
                            key={col.key}
                            style={{ border: "1px solid #ddd", padding: "4px" }}
                          >
                            <input
                              id={`payroll-activity-${rowIdx}-${colIdx}`}
                              value={row[col.key]}
                              onChange={(e) =>
                                updatePayrollActivityCell(
                                  rowIdx,
                                  col.key,
                                  e.target.value,
                                )
                              }
                              onPaste={(e) =>
                                handlePopupPaste(
                                  e,
                                  rowIdx,
                                  colIdx,
                                  PAYROLL_ACTIVITY_COLS.map((c) => c.key),
                                  setPayrollActivityRows,
                                  emptyPayrollActivityRow,
                                )
                              }
                              onKeyDown={(e) =>
                                handlePopupKeyDown(
                                  e,
                                  rowIdx,
                                  colIdx,
                                  payrollActivityRows.length,
                                  PAYROLL_ACTIVITY_COLS.length,
                                  "payroll-activity",
                                  addPayrollActivityRows,
                                )
                              }
                              style={{
                                width: "100%",
                                border: "none",
                                outline: "none",
                                background: "transparent",
                                textAlign: col.align,
                                fontSize: "13px",
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
