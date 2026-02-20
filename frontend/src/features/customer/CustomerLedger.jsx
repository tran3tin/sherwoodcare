import React, { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import "../../assets/styles/list.css";

// ── columns definition ──────────────────────────────────────────────────────
const COLUMNS = [
  { key: "date", label: "Date", width: "110px", align: "center" },
  { key: "src", label: "Src", width: "80px", align: "center" },
  { key: "idno", label: "ID No.", width: "100px", align: "center" },
  { key: "memo", label: "Memo", width: "260px", align: "left" },
  { key: "debit", label: "Debit", width: "100px", align: "right" },
  { key: "credit", label: "Credit", width: "100px", align: "right" },
];
const COL_KEYS = COLUMNS.map((c) => c.key);
const DEFAULT_ROWS = 30;

// ── parse Excel / clipboard tab-delimited data ──────────────────────────────
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
        } else inQuote = false;
      } else {
        cell += c;
      }
    } else {
      if (c === '"') {
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
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  // strip trailing empty row (Excel artefact)
  if (rows.length && rows[rows.length - 1].every((v) => v === "")) rows.pop();
  return rows;
};

const emptyRow = () => ({
  date: "",
  src: "",
  idno: "",
  memo: "",
  debit: "",
  credit: "",
});
const makeRows = (n) => Array.from({ length: n }, emptyRow);

const cellId = (r, c) => `ledger-${r}-${c}`;

const focusCell = (r, c) => {
  const el = document.getElementById(cellId(r, c));
  if (el) {
    el.focus();
    el.select?.();
  }
};

// ── component ────────────────────────────────────────────────────────────────
export default function CustomerLedger() {
  const [rows, setRows] = useState(() => makeRows(DEFAULT_ROWS));

  // ── helpers ────────────────────────────────────────────────────────────────
  const updateCell = useCallback((rowIdx, key, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === rowIdx ? { ...row, [key]: value } : row)),
    );
  }, []);

  const addRows = (n = 10) => setRows((prev) => [...prev, ...makeRows(n)]);

  const clearAll = () => {
    if (!window.confirm("Clear all data?")) return;
    setRows(makeRows(DEFAULT_ROWS));
    toast.success("Cleared.", { position: "top-right", autoClose: 2000 });
  };

  // ── paste handler ──────────────────────────────────────────────────────────
  const handlePaste = (e, startRow, startCol) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text");
    const pastedRows = parseClipboard(raw);
    if (!pastedRows.length) return;

    setRows((prev) => {
      const next = prev.map((r) => ({ ...r }));
      // grow if needed
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

  // ── keyboard navigation ────────────────────────────────────────────────────
  const handleKeyDown = (e, rowIdx, colIdx) => {
    const maxRow = rows.length - 1;
    const maxCol = COL_KEYS.length - 1;

    if (e.key === "ArrowDown" || e.key === "Enter") {
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

  // ── totals ─────────────────────────────────────────────────────────────────
  const sum = (key) =>
    rows.reduce((acc, r) => {
      const n = parseFloat(String(r[key]).replace(/,/g, ""));
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);

  const totalDebit = sum("debit");
  const totalCredit = sum("credit");
  const balance = totalDebit - totalCredit;

  const fmt = (n) =>
    n === 0
      ? ""
      : n.toLocaleString("en-AU", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  // ── export Excel ───────────────────────────────────────────────────────────
  const handleExport = () => {
    const filled = rows.filter((r) => COL_KEYS.some((k) => r[k].trim() !== ""));
    if (!filled.length) {
      toast.warning("No data to export.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    const header = COLUMNS.map((c) => c.label);
    const aoa = [
      header,
      ...filled.map((r) => COL_KEYS.map((k) => r[k])),
      ["", "", "", "TOTAL", fmt(totalDebit), fmt(totalCredit)],
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customer Ledger");
    XLSX.writeFile(
      wb,
      `CustomerLedger_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Layout title="Customer Ledger" breadcrumb={["Home", "Customer", "Ledger"]}>
      <div style={{ padding: "0 4px" }}>
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ margin: 0, flex: 1 }}>Customer Ledger</h2>
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
            className="btn-action btn-view"
            title="Export Excel"
            onClick={handleExport}
          >
            <i className="fas fa-file-excel"></i>
          </button>
          <button
            type="button"
            className="btn-action btn-delete"
            title="Clear all"
            onClick={clearAll}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>

        {/* Hint */}
        <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
          Tip: Copy cells from Excel and paste directly into any cell. Arrow
          keys and Tab navigate between cells.
        </p>

        {/* Table */}
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
              {COLUMNS.map((c) => (
                <col key={c.key} style={{ width: c.width }} />
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
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    style={{
                      border: "1px solid #ccc",
                      background: "#2c3e7a",
                      color: "#fff",
                      padding: "6px 4px",
                      textAlign: c.align,
                      fontSize: "12px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => {
                const isEven = rowIdx % 2 === 0;
                return (
                  <tr
                    key={rowIdx}
                    style={{ background: isEven ? "#fff" : "#f7f9ff" }}
                  >
                    {/* row number */}
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
                          style={{
                            border: "1px solid #ddd",
                            padding: "1px",
                          }}
                        >
                          <input
                            id={cellId(rowIdx, colIdx)}
                            type="text"
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
                              padding: "3px 5px",
                              fontSize: "13px",
                              boxSizing: "border-box",
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={4 + 1}
                  style={{
                    border: "1px solid #ccc",
                    background: "#e8ecf7",
                    padding: "5px 8px",
                    fontWeight: 700,
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                >
                  TOTAL
                </td>
                {/* Debit total */}
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
                  {fmt(totalDebit)}
                </td>
                {/* Credit total */}
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
                  {fmt(totalCredit)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={4 + 1}
                  style={{
                    border: "1px solid #ccc",
                    background: "#dde2f5",
                    padding: "5px 8px",
                    fontWeight: 700,
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                >
                  BALANCE (Debit − Credit)
                </td>
                <td
                  colSpan={2}
                  style={{
                    border: "1px solid #ccc",
                    background: "#dde2f5",
                    padding: "5px 8px",
                    fontWeight: 700,
                    textAlign: "right",
                    fontSize: "12px",
                    color:
                      balance < 0
                        ? "#c0392b"
                        : balance > 0
                          ? "#27ae60"
                          : "#555",
                  }}
                >
                  {fmt(Math.abs(balance))}
                  {balance < 0 ? " CR" : balance > 0 ? " DR" : ""}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer add-row button */}
        <div style={{ marginTop: "10px" }}>
          <button
            type="button"
            className="btn-action btn-save"
            onClick={() => addRows(10)}
            style={{ fontSize: "12px" }}
          >
            <i className="fas fa-plus" style={{ marginRight: "6px" }}></i>
            Add 10 rows
          </button>
        </div>
      </div>
    </Layout>
  );
}
