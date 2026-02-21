import React, { useState, useCallback } from "react";
import Layout from "../../components/Layout";
import "../../assets/styles/list.css";

const COLUMNS = [
  { key: "employee", label: "Employee", width: "240px", align: "left" },
  { key: "wages", label: "Wages", width: "130px", align: "right" },
  {
    key: "deduction",
    label: "Deduction",
    width: "130px",
    align: "right",
  },
  { key: "taxes", label: "Taxes", width: "130px", align: "right" },
  { key: "netPay", label: "Net Pay", width: "130px", align: "right" },
  {
    key: "expenses",
    label: "Expenses",
    width: "130px",
    align: "right",
  },
];

const COL_KEYS = COLUMNS.map((c) => c.key);
const DEFAULT_ROWS = 25;

const emptyRow = () => ({
  employee: "",
  wages: "",
  deduction: "",
  taxes: "",
  netPay: "",
  expenses: "",
});

const makeRows = (n) => Array.from({ length: n }, emptyRow);

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
  if (!raw) return NaN;

  const normalized = raw
    .replace(/\((.*)\)/, "-$1")
    .replace(/[^\d.-]/g, "")
    .replace(/(?!^)-/g, "");

  const number = Number(normalized);
  return Number.isFinite(number) ? number : NaN;
};

const formatAmount = (value) => {
  if (!Number.isFinite(value) || value === 0) return "";
  return value.toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const cellId = (row, col) => `ias-${row}-${col}`;

const focusCell = (row, col) => {
  const el = document.getElementById(cellId(row, col));
  if (el) {
    el.focus();
    el.select?.();
  }
};

export default function IAS() {
  const [rows, setRows] = useState(() => makeRows(DEFAULT_ROWS));
  const [showStatementSummary, setShowStatementSummary] = useState(false);

  const updateCell = useCallback((rowIdx, key, value) => {
    setRows((prev) =>
      prev.map((row, idx) => (idx === rowIdx ? { ...row, [key]: value } : row)),
    );
  }, []);

  const addRows = (n = 10) => {
    setRows((prev) => [...prev, ...makeRows(n)]);
  };

  const handlePaste = (e, startRow, startCol) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text");
    const pastedRows = parseClipboard(raw);
    if (!pastedRows.length) return;

    setRows((prev) => {
      const next = prev.map((r) => ({ ...r }));
      const need = startRow + pastedRows.length;
      while (next.length < need) next.push(emptyRow());

      pastedRows.forEach((cells, ri) => {
        cells.forEach((val, ci) => {
          const colIdx = startCol + ci;
          if (colIdx >= COL_KEYS.length) return;
          next[startRow + ri][COL_KEYS[colIdx]] = (val ?? "").trim();
        });
      });

      return next;
    });
  };

  const handleKeyDown = (e, rowIdx, colIdx) => {
    const maxRow = rows.length - 1;
    const maxCol = COL_KEYS.length - 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (rowIdx < maxRow) focusCell(rowIdx + 1, colIdx);
      else {
        addRows(10);
        setTimeout(() => focusCell(rowIdx + 1, colIdx), 30);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (rowIdx > 0) focusCell(rowIdx - 1, colIdx);
    } else if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      if (colIdx < maxCol) focusCell(rowIdx, colIdx + 1);
      else if (rowIdx < maxRow) focusCell(rowIdx + 1, 0);
    } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      if (colIdx > 0) focusCell(rowIdx, colIdx - 1);
      else if (rowIdx > 0) focusCell(rowIdx - 1, maxCol);
    }
  };

  const sum = (key) =>
    rows.reduce((acc, row) => {
      const n = parseAmount(row[key]);
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);

  const totals = {
    wages: sum("wages"),
    deduction: sum("deduction"),
    taxes: sum("taxes"),
    netPay: sum("netPay"),
    expenses: sum("expenses"),
  };

  const formatCurrency = (value) => {
    const safe = Number.isFinite(value) ? value : 0;
    return `$${safe.toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const w1Value = totals.wages;
  const w2Value = totals.taxes;

  return (
    <Layout
      title="Payroll Activity (Summary)"
      breadcrumb={["Home", "Tax", "IAS"]}
    >
      <div style={{ padding: "0 4px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <h2 style={{ margin: 0, flex: 1 }}>Payroll Activity (Summary)</h2>
          <button
            type="button"
            className="btn-action btn-save"
            title="Add 10 rows"
            onClick={() => addRows(10)}
          >
            <i className="fas fa-plus"></i>
          </button>
          <button
            type="button"
            className="btn-action"
            title="Lodge"
            onClick={() => setShowStatementSummary((prev) => !prev)}
            style={{ background: "#0f766e", color: "#fff" }}
          >
            <i className="fas fa-file-signature"></i>
          </button>
        </div>

        <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
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
              {COLUMNS.map((col) => (
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
                    fontWeight: 600,
                  }}
                >
                  #
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      border: "1px solid #ccc",
                      background: "#2c3e7a",
                      color: "#fff",
                      padding: "6px 4px",
                      textAlign: col.align,
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  style={{ background: rowIdx % 2 ? "#f7f9ff" : "#fff" }}
                >
                  <td
                    style={{
                      border: "1px solid #ddd",
                      textAlign: "center",
                      color: "#aaa",
                      fontSize: "11px",
                      padding: "1px 2px",
                      userSelect: "none",
                    }}
                  >
                    {rowIdx + 1}
                  </td>

                  {COL_KEYS.map((key, colIdx) => {
                    const col = COLUMNS[colIdx];
                    return (
                      <td
                        key={key}
                        style={{ border: "1px solid #ddd", padding: "1px" }}
                      >
                        <input
                          id={cellId(rowIdx, colIdx)}
                          value={row[key]}
                          onChange={(e) =>
                            updateCell(rowIdx, key, e.target.value)
                          }
                          onPaste={(e) => handlePaste(e, rowIdx, colIdx)}
                          onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                          style={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            textAlign: col.align,
                            padding: "5px",
                            fontSize: "13px",
                            boxSizing: "border-box",
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td
                  style={{
                    border: "1px solid #ccc",
                    background: "#e8ecf7",
                    padding: "5px 8px",
                  }}
                />
                <td
                  style={{
                    border: "1px solid #ccc",
                    background: "#e8ecf7",
                    padding: "5px 8px",
                    fontWeight: 700,
                    textAlign: "left",
                    fontSize: "12px",
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    background: "#e8ecf7",
                    padding: "5px 8px",
                    fontWeight: 700,
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                >
                  {formatAmount(totals.wages)}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    background: "#e8ecf7",
                    padding: "5px 8px",
                    fontWeight: 700,
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                >
                  {formatAmount(totals.deduction)}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    background: "#e8ecf7",
                    padding: "5px 8px",
                    fontWeight: 700,
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                >
                  {formatAmount(totals.taxes)}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    background: "#e8ecf7",
                    padding: "5px 8px",
                    fontWeight: 700,
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                >
                  {formatAmount(totals.netPay)}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    background: "#e8ecf7",
                    padding: "5px 8px",
                    fontWeight: 700,
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                >
                  {formatAmount(totals.expenses)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {showStatementSummary && (
          <div
            style={{
              marginTop: "18px",
              background: "#f7f7f7",
              border: "1px solid #d7d7d7",
              padding: "14px 14px 18px",
            }}
          >
            <h3
              style={{ margin: "0 0 10px", color: "#0f5c66", fontSize: "40px" }}
            >
              Statement summary
            </h3>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "34px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "2px solid #8f8f8f",
                      padding: "8px 6px",
                    }}
                    colSpan={2}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      borderBottom: "2px solid #8f8f8f",
                      padding: "8px 6px",
                    }}
                  >
                    Reported Value
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      borderBottom: "2px solid #8f8f8f",
                      padding: "8px 6px",
                    }}
                  >
                    Owed to ATO
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      borderBottom: "2px solid #8f8f8f",
                      padding: "8px 6px",
                    }}
                  >
                    Owed by ATO
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      borderBottom: "2px solid #333",
                      padding: "8px 6px",
                      fontStyle: "italic",
                      fontWeight: 700,
                    }}
                  >
                    PAYG tax withheld
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                    }}
                  >
                    4
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                    }}
                  >
                    Income tax withheld amount
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  />
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(w2Value)}
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  />
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                    }}
                  >
                    W1
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                    }}
                  >
                    Total salary, wages and other payments
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(w1Value)}
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  />
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  />
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                    }}
                  >
                    W2
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                    }}
                  >
                    Amount withheld from total salary, wages and other payments
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(w2Value)}
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  />
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  />
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                    }}
                  >
                    W3
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                    }}
                  >
                    Other amounts withheld
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(0)}
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  />
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  />
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                    }}
                  >
                    W4
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                    }}
                  >
                    Amount withheld where ABN not quoted
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(0)}
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  />
                  <td
                    style={{
                      padding: "8px 6px",
                      borderBottom: "1px solid #bcbcbc",
                      textAlign: "right",
                    }}
                  />
                </tr>
              </tbody>
            </table>

            <h4 style={{ margin: "22px 0 8px", fontSize: "48px" }}>
              Total amount to pay
            </h4>
            <div style={{ fontSize: "42px", fontWeight: 500 }}>
              {formatCurrency(w2Value)} DR
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
