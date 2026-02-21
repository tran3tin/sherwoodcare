import React, { useState, useCallback } from "react";
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

const autoResize = (el) => {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
};

// ── component ────────────────────────────────────────────────────────────────
export default function CustomerLedger() {
  const [rows, setRows] = useState(() => makeRows(DEFAULT_ROWS));
  const [showReconciliation, setShowReconciliation] = useState(false);

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

  const fmtAUD = (n) =>
    "$" +
    Math.abs(n).toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // ── reconciliation data ────────────────────────────────────────────────────
  const sjRows = rows.filter((r) => r.src.trim().toUpperCase() === "SJ");
  const crRows = rows.filter((r) => r.src.trim().toUpperCase() === "CR");
  const totalSales = sjRows.reduce((acc, r) => {
    const n = parseFloat(String(r.debit).replace(/,/g, ""));
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
  const totalPayment = crRows.reduce((acc, r) => {
    const n = parseFloat(String(r.credit).replace(/,/g, ""));
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
  const reconDiff = totalSales - totalPayment; // positive = under payment, negative = over payment

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
            className="btn-action"
            title="Reconciliation"
            onClick={() => setShowReconciliation(true)}
            style={{ background: "#2c3e7a", color: "#fff" }}
          >
            <i
              className="fas fa-balance-scale"
              style={{ marginRight: "6px" }}
            ></i>
            Reconciliation
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
                          <textarea
                            id={cellId(rowIdx, colIdx)}
                            value={row[key]}
                            rows={1}
                            onChange={(e) => {
                              updateCell(rowIdx, key, e.target.value);
                              autoResize(e.target);
                            }}
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
                              resize: "none",
                              overflow: "hidden",
                              lineHeight: "1.5",
                              minHeight: "26px",
                              fontFamily: "inherit",
                              display: "block",
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
      {/* ── Reconciliation Modal ─────────────────────────────────────────── */}
      {showReconciliation && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            overflowY: "auto",
            padding: "32px 16px",
          }}
          onClick={(e) =>
            e.target === e.currentTarget && setShowReconciliation(false)
          }
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              padding: "28px 28px 24px",
              minWidth: "720px",
              maxWidth: "960px",
              width: "100%",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "18px",
                gap: "12px",
              }}
            >
              <h3 style={{ margin: 0, flex: 1, color: "#2c3e7a" }}>
                Customer Reconciliation
              </h3>
              <button
                type="button"
                className="btn-action"
                title="Print"
                onClick={() => window.print()}
                style={{ background: "#555", color: "#fff" }}
              >
                <i className="fas fa-print"></i>
              </button>
              <button
                type="button"
                className="btn-action btn-delete"
                title="Close"
                onClick={() => setShowReconciliation(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Reconciliation table */}
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  fontSize: "13px",
                }}
              >
                {/* ── colgroup ── */}
                <colgroup>
                  <col style={{ width: "110px" }} />
                  <col style={{ width: "260px" }} />
                  <col style={{ width: "110px" }} />
                  <col style={{ width: "20px" }} />
                  <col style={{ width: "110px" }} />
                  <col style={{ width: "110px" }} />
                  <col style={{ width: "110px" }} />
                </colgroup>

                {/* ── section header ── */}
                <thead>
                  <tr>
                    <th
                      colSpan={3}
                      style={{
                        border: "1px solid #bbb",
                        background: "#fde9d3",
                        textAlign: "center",
                        padding: "5px 8px",
                        fontWeight: 700,
                        fontSize: "13px",
                      }}
                    >
                      Sales
                    </th>
                    <td style={{ border: "none", background: "transparent" }} />
                    <th
                      colSpan={2}
                      style={{
                        border: "1px solid #bbb",
                        background: "#fde9d3",
                        textAlign: "center",
                        padding: "5px 8px",
                        fontWeight: 700,
                        fontSize: "13px",
                      }}
                    >
                      Payment received
                    </th>
                    <td style={{ border: "none", background: "transparent" }} />
                  </tr>
                  <tr>
                    {["Invoice No.", "Period", "Amount"].map((h) => (
                      <th
                        key={h}
                        style={{
                          border: "1px solid #bbb",
                          background: "#fff2e6",
                          padding: "4px 8px",
                          textAlign: h === "Amount" ? "right" : "left",
                          fontWeight: 600,
                          fontSize: "12px",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                    <td style={{ border: "none", background: "transparent" }} />
                    {["Date", "Amount"].map((h) => (
                      <th
                        key={h}
                        style={{
                          border: "1px solid #bbb",
                          background: "#fff2e6",
                          padding: "4px 8px",
                          textAlign: h === "Amount" ? "right" : "left",
                          fontWeight: 600,
                          fontSize: "12px",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                    <td style={{ border: "none", background: "transparent" }} />
                  </tr>
                </thead>

                {/* ── data rows ── */}
                <tbody>
                  {Array.from({
                    length: Math.max(sjRows.length, crRows.length),
                  }).map((_, i) => {
                    const sj = sjRows[i];
                    const cr = crRows[i];
                    return (
                      <tr key={i}>
                        {/* Sales columns */}
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "4px 8px",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {sj ? sj.idno : ""}
                        </td>
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "4px 8px",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {sj ? sj.memo : ""}
                        </td>
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "4px 8px",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {sj && sj.debit.trim() !== ""
                            ? fmtAUD(
                                parseFloat(
                                  String(sj.debit).replace(/,/g, ""),
                                ) || 0,
                              )
                            : ""}
                        </td>
                        {/* spacer */}
                        <td
                          style={{ border: "none", background: "transparent" }}
                        />
                        {/* Payment columns */}
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "4px 8px",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {cr ? cr.date : ""}
                        </td>
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "4px 8px",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cr && cr.credit.trim() !== ""
                            ? fmtAUD(
                                parseFloat(
                                  String(cr.credit).replace(/,/g, ""),
                                ) || 0,
                              )
                            : ""}
                        </td>
                        <td
                          style={{ border: "none", background: "transparent" }}
                        />
                      </tr>
                    );
                  })}
                </tbody>

                {/* ── totals & result ── */}
                <tfoot>
                  {/* Total row */}
                  <tr>
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 8px",
                      }}
                    />
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 8px",
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      Total sales amount
                    </td>
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 8px",
                        textAlign: "right",
                        fontWeight: 700,
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {totalSales !== 0 ? fmtAUD(totalSales) : ""}
                    </td>
                    <td style={{ border: "none", background: "transparent" }} />
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 8px",
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      Total payment amount
                    </td>
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 8px",
                        textAlign: "right",
                        fontWeight: 700,
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {totalPayment !== 0 ? fmtAUD(totalPayment) : ""}
                    </td>
                    <td style={{ border: "none", background: "transparent" }} />
                  </tr>

                  {/* Under / Over payment row */}
                  {reconDiff !== 0 && (
                    <tr>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "4px 8px",
                        }}
                      />
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "4px 8px",
                        }}
                      />
                      <td
                        style={{
                          border: "none",
                          background: "transparent",
                        }}
                      />
                      <td
                        style={{
                          border: "none",
                          background: "transparent",
                        }}
                      />
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "4px 8px",
                          fontWeight: 700,
                          fontSize: "12px",
                          background: reconDiff > 0 ? "#fff2e6" : "#e6f4ea",
                        }}
                      >
                        {reconDiff > 0 ? "Under Payment" : "Over Payment"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "4px 8px",
                          textAlign: "right",
                          fontWeight: 700,
                          fontSize: "12px",
                          color: reconDiff > 0 ? "#c0392b" : "#27ae60",
                          whiteSpace: "nowrap",
                          background: reconDiff > 0 ? "#fff2e6" : "#e6f4ea",
                        }}
                      >
                        {reconDiff > 0
                          ? "-" + fmtAUD(reconDiff)
                          : "+" + fmtAUD(Math.abs(reconDiff))}
                      </td>
                      <td
                        style={{
                          border: "none",
                          padding: "4px 8px",
                          fontWeight: 700,
                          fontSize: "12px",
                          color: reconDiff > 0 ? "#c0392b" : "#27ae60",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {reconDiff > 0 ? "> Outstanding" : "> Refund"}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
