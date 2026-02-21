import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import Layout from "../../components/Layout";
import "../../assets/styles/list.css";

const VALUE_KEYS = ["g1", "a1", "b1", "w1", "w2", "a5"];

const emptyValues = () => ({
  g1: 0,
  a1: 0,
  b1: 0,
  netGst: 0,
  w1: 0,
  w2: 0,
  a5: 0,
  totalPayable: 0,
});

const POPUP_ROW_COUNT = 12;
const emptyPayrollPopupRow = () => ({
  employee: "",
  wages: "",
  deduction: "",
  taxes: "",
  netPay: "",
  expenses: "",
});

const makePayrollPopupRows = () =>
  Array.from({ length: POPUP_ROW_COUNT }, emptyPayrollPopupRow);

const GST_POPUP_ROW_COUNT = 12;
const gstDefaultRows = [
  {
    code: "FRE",
    description: "GST Free",
    rate: "",
    saleValue: "",
    purchaseValue: "",
    taxCollected: "",
    taxPaid: "",
  },
  {
    code: "GNR",
    description: "GST (Non-Registered)",
    rate: "",
    saleValue: "",
    purchaseValue: "",
    taxCollected: "",
    taxPaid: "",
  },
  {
    code: "GST",
    description: "Goods & Services Tax",
    rate: "",
    saleValue: "",
    purchaseValue: "",
    taxCollected: "",
    taxPaid: "",
  },
  {
    code: "N-T",
    description: "Not Reportable",
    rate: "",
    saleValue: "",
    purchaseValue: "",
    taxCollected: "",
    taxPaid: "",
  },
];

const emptyGstPopupRow = () => ({
  code: "",
  description: "",
  rate: "",
  saleValue: "",
  purchaseValue: "",
  taxCollected: "",
  taxPaid: "",
});

const makeGstPopupRows = () => {
  const rows = [...gstDefaultRows];
  while (rows.length < GST_POPUP_ROW_COUNT) {
    rows.push(emptyGstPopupRow());
  }
  return rows;
};

const formatDisplayDate = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
};

const monthShort = (value) => {
  if (!value) return "";
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString("en-AU", { month: "short" });
};

const yearShort = (value) => {
  if (!value) return "";
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return "";
  return String(dt.getFullYear()).slice(-2);
};

const addMonths = (dateStr, months) => {
  if (!dateStr) return "";
  const dt = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return "";
  dt.setMonth(dt.getMonth() + months);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatPeriodMonth = (value) => {
  if (!value) return "";
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return "";
  return (
    dt.toLocaleString("en-AU", { month: "short" }) +
    "-" +
    String(dt.getFullYear()).slice(-2)
  );
};

const firstDayOfMonth = (value) => {
  if (!value) return "";
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return "";
  dt.setDate(1);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDotDate = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${day}.${month}.${year}`;
};

const parseNumberInput = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const normalized = raw.replace(/[^\d.-]/g, "").replace(/(?!^)-/g, "");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
};

const roundNoDecimal = (value) => Math.round(Number(value) || 0);
const calculateNetGst = (row) =>
  roundNoDecimal((row?.a1 || 0) - (row?.b1 || 0));
const calculateTotalPayable = (row) =>
  roundNoDecimal(calculateNetGst(row) + (row?.w2 || 0) + (row?.a5 || 0));

const formatValue = (value) => roundNoDecimal(value).toLocaleString("en-AU");

export default function BAS() {
  const [fromDate, setFromDate] = useState("2025-10-01");
  const [toDate, setToDate] = useState("2025-12-31");
  const [showPayrollPopup, setShowPayrollPopup] = useState(false);
  const [payrollPopupPeriod, setPayrollPopupPeriod] = useState("");
  const [payrollPopupTarget, setPayrollPopupTarget] = useState("");
  const [payrollPopupRows, setPayrollPopupRows] = useState(() =>
    makePayrollPopupRows(),
  );
  const [showGstPopup, setShowGstPopup] = useState(false);
  const [gstPopupPeriod, setGstPopupPeriod] = useState("");
  const [gstPopupRows, setGstPopupRows] = useState(() => makeGstPopupRows());
  const [iasRow1, setIasRow1] = useState(() => emptyValues());
  const [iasRow2, setIasRow2] = useState(() => emptyValues());
  const [payrollSummaryRange, setPayrollSummaryRange] = useState(() =>
    emptyValues(),
  );
  const [gstSummaryCash, setGstSummaryCash] = useState(() => emptyValues());
  const [payrollSummaryLastMonth, setPayrollSummaryLastMonth] = useState(() =>
    emptyValues(),
  );

  const lastDayOfMonth = (value) => {
    if (!value) return "";
    const dt = new Date(`${value}T00:00:00`);
    if (Number.isNaN(dt.getTime())) return "";
    dt.setMonth(dt.getMonth() + 1, 0);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const periodLabel = useMemo(() => {
    if (!fromDate || !toDate) return "BAS";

    const fromMonth = monthShort(fromDate);
    const toMonth = monthShort(toDate);
    const fromYear = yearShort(fromDate);
    const toYear = yearShort(toDate);

    if (!fromMonth || !toMonth || !fromYear || !toYear) return "BAS";

    if (fromYear === toYear) {
      return `BAS ${fromMonth} - ${toMonth} ${toYear}`;
    }

    return `BAS ${fromMonth} ${fromYear} - ${toMonth} ${toYear}`;
  }, [fromDate, toDate]);

  const iasPeriod1 = useMemo(() => formatPeriodMonth(fromDate), [fromDate]);
  const iasPeriod2 = useMemo(
    () => formatPeriodMonth(addMonths(fromDate, 1)),
    [fromDate],
  );

  const payrollRangeLabel = useMemo(() => {
    if (!fromDate || !toDate) return "";
    return `${formatDotDate(fromDate)} - ${formatDotDate(toDate)}`;
  }, [fromDate, toDate]);

  const payrollCompareEndDate = useMemo(() => {
    if (!fromDate) return "";
    const secondMonth = addMonths(fromDate, 1);
    return lastDayOfMonth(secondMonth);
  }, [fromDate]);

  const payrollCompareRangeLabel = useMemo(() => {
    if (!fromDate || !payrollCompareEndDate) return "";
    return `${formatDotDate(fromDate)} - ${formatDotDate(payrollCompareEndDate)}`;
  }, [fromDate, payrollCompareEndDate]);

  const lastMonthRangeLabel = useMemo(() => {
    if (!toDate) return "";
    return `${formatDotDate(firstDayOfMonth(toDate))} - ${formatDotDate(toDate)}`;
  }, [toDate]);

  const totalValues = useMemo(() => {
    const next = emptyValues();
    VALUE_KEYS.forEach((key) => {
      next[key] = roundNoDecimal((iasRow1[key] || 0) + (iasRow2[key] || 0));
    });
    next.netGst = calculateNetGst(next);
    next.totalPayable = calculateTotalPayable(next);
    return next;
  }, [iasRow1, iasRow2]);

  const varianceValues = useMemo(() => {
    const next = emptyValues();
    VALUE_KEYS.forEach((key) => {
      next[key] = roundNoDecimal(
        (totalValues[key] || 0) - (payrollSummaryRange[key] || 0),
      );
    });
    next.netGst = calculateNetGst(next);
    next.totalPayable = calculateTotalPayable(next);
    return next;
  }, [totalValues, payrollSummaryRange]);

  const basValues = useMemo(() => {
    const next = emptyValues();
    VALUE_KEYS.forEach((key) => {
      next[key] = roundNoDecimal(
        (varianceValues[key] || 0) +
          (gstSummaryCash[key] || 0) +
          (payrollSummaryLastMonth[key] || 0),
      );
    });
    next.netGst = calculateNetGst(next);
    next.totalPayable = calculateTotalPayable(next);
    return next;
  }, [varianceValues, gstSummaryCash, payrollSummaryLastMonth]);

  const setRowValue = (setter, key, value) => {
    setter((prev) => ({ ...prev, [key]: parseNumberInput(value) }));
  };

  const buildPayrollRef = (start, end) =>
    `Payroll Activity [Summary] ${formatDotDate(start)}-${formatDotDate(end)}.pdf`;

  const buildGstRef = (start, end) =>
    `GST [Summary - Cash] ${formatDotDate(start)}-${formatDotDate(end)}.pdf`;

  const ias1Ref = buildPayrollRef(
    firstDayOfMonth(fromDate),
    lastDayOfMonth(fromDate),
  );
  const ias2Month = addMonths(fromDate, 1);
  const ias2Ref = buildPayrollRef(
    firstDayOfMonth(ias2Month),
    lastDayOfMonth(ias2Month),
  );
  const payrollRangeRef = buildPayrollRef(fromDate, payrollCompareEndDate);
  const gstRangeRef = buildGstRef(fromDate, toDate);
  const payrollLastMonthRef = buildPayrollRef(firstDayOfMonth(toDate), toDate);

  const openPayrollPopup = (periodText, target) => {
    setPayrollPopupPeriod(periodText || "");
    setPayrollPopupTarget(target || "");
    setPayrollPopupRows(makePayrollPopupRows());
    setShowPayrollPopup(true);
  };

  const updatePayrollPopupCell = (rowIdx, key, value) => {
    setPayrollPopupRows((prev) =>
      prev.map((row, idx) => (idx === rowIdx ? { ...row, [key]: value } : row)),
    );
  };

  const openGstPopup = (periodText) => {
    setGstPopupPeriod(periodText || "");
    setGstPopupRows(makeGstPopupRows());
    setShowGstPopup(true);
  };

  const updateGstPopupCell = (rowIdx, key, value) => {
    setGstPopupRows((prev) =>
      prev.map((row, idx) => (idx === rowIdx ? { ...row, [key]: value } : row)),
    );
  };

  const gstPopupTotals = useMemo(
    () =>
      gstPopupRows.reduce(
        (acc, row) => {
          acc.rate += parseNumberInput(row.rate);
          acc.saleValue += parseNumberInput(row.saleValue);
          acc.purchaseValue += parseNumberInput(row.purchaseValue);
          acc.taxCollected += parseNumberInput(row.taxCollected);
          acc.taxPaid += parseNumberInput(row.taxPaid);
          return acc;
        },
        {
          rate: 0,
          saleValue: 0,
          purchaseValue: 0,
          taxCollected: 0,
          taxPaid: 0,
        },
      ),
    [gstPopupRows],
  );

  const gstCodeMappedTotals = useMemo(() => {
    const targetCodes = new Set(["FRE", "GNR", "GST"]);
    return gstPopupRows.reduce(
      (acc, row) => {
        const code = String(row.code || "")
          .trim()
          .toUpperCase();
        if (!targetCodes.has(code)) return acc;
        acc.saleValue += parseNumberInput(row.saleValue);
        acc.taxPaid += parseNumberInput(row.taxPaid);
        return acc;
      },
      { saleValue: 0, taxPaid: 0 },
    );
  }, [gstPopupRows]);

  useEffect(() => {
    const nextG1 = roundNoDecimal(gstCodeMappedTotals.saleValue);
    const next1B = roundNoDecimal(gstCodeMappedTotals.taxPaid);

    setGstSummaryCash((prev) => {
      if (prev.g1 === nextG1 && prev.b1 === next1B) return prev;
      return { ...prev, g1: nextG1, b1: next1B };
    });
  }, [gstCodeMappedTotals]);

  const payrollPopupTotals = useMemo(
    () =>
      payrollPopupRows.reduce(
        (acc, row) => {
          acc.wages += parseNumberInput(row.wages);
          acc.taxes += parseNumberInput(row.taxes);
          return acc;
        },
        { wages: 0, taxes: 0 },
      ),
    [payrollPopupRows],
  );

  const applyPopupTotalsToTarget = () => {
    const wagesTotal = roundNoDecimal(payrollPopupTotals.wages);
    const taxesTotal = roundNoDecimal(payrollPopupTotals.taxes);

    if (payrollPopupTarget === "ias1") {
      setIasRow1((prev) => ({ ...prev, w1: wagesTotal, w2: taxesTotal }));
    } else if (payrollPopupTarget === "ias2") {
      setIasRow2((prev) => ({ ...prev, w1: wagesTotal, w2: taxesTotal }));
    } else if (payrollPopupTarget === "payroll-range") {
      setPayrollSummaryRange((prev) => ({
        ...prev,
        w1: wagesTotal,
        w2: taxesTotal,
      }));
    } else if (payrollPopupTarget === "payroll-last-month") {
      setPayrollSummaryLastMonth((prev) => ({
        ...prev,
        w1: wagesTotal,
        w2: taxesTotal,
      }));
    }

    setShowPayrollPopup(false);
  };

  const renderReferenceIcon = (title, color = "#0f766e", onClick) => (
    <button
      type="button"
      className="btn-action"
      style={{ background: color, color: "#fff", fontSize: "12px" }}
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      <i className="fas fa-file-pdf"></i>
    </button>
  );

  const renderEditableCell = (row, _setter, key) => (
    <td
      style={{
        border: "1px solid #d1d5db",
        padding: "8px 6px",
        textAlign: "right",
        fontWeight: 500,
      }}
    >
      {row[key] === 0 ? "-" : formatValue(row[key])}
    </td>
  );

  const renderComputedCell = (value, strong = false) => (
    <td
      style={{
        border: "1px solid #d1d5db",
        padding: "8px 6px",
        textAlign: "right",
        fontWeight: strong ? 700 : 500,
      }}
    >
      {value === 0 ? "-" : formatValue(value)}
    </td>
  );

  const clearData = () => {
    if (!window.confirm("Clear all BAS data?")) return;
    setIasRow1(emptyValues());
    setIasRow2(emptyValues());
    setPayrollSummaryRange(emptyValues());
    setGstSummaryCash(emptyValues());
    setPayrollSummaryLastMonth(emptyValues());
  };

  const exportExcel = () => {
    const rowsForExport = [
      {
        Type: "IAS",
        Period: iasPeriod1,
        G1: formatValue(iasRow1.g1),
        "1A": formatValue(iasRow1.a1),
        "1B": formatValue(iasRow1.b1),
        "Net GST payable /(refundable)": formatValue(calculateNetGst(iasRow1)),
        W1: formatValue(iasRow1.w1),
        W2: formatValue(iasRow1.w2),
        "5A": formatValue(iasRow1.a5),
        "Total payable /(refundable)": formatValue(
          calculateTotalPayable(iasRow1),
        ),
        Reference: ias1Ref,
      },
      {
        Type: "IAS",
        Period: iasPeriod2,
        G1: formatValue(iasRow2.g1),
        "1A": formatValue(iasRow2.a1),
        "1B": formatValue(iasRow2.b1),
        "Net GST payable /(refundable)": formatValue(calculateNetGst(iasRow2)),
        W1: formatValue(iasRow2.w1),
        W2: formatValue(iasRow2.w2),
        "5A": formatValue(iasRow2.a5),
        "Total payable /(refundable)": formatValue(
          calculateTotalPayable(iasRow2),
        ),
        Reference: ias2Ref,
      },
      {
        Type: "",
        Period: "Total",
        G1: formatValue(totalValues.g1),
        "1A": formatValue(totalValues.a1),
        "1B": formatValue(totalValues.b1),
        "Net GST payable /(refundable)": formatValue(totalValues.netGst),
        W1: formatValue(totalValues.w1),
        W2: formatValue(totalValues.w2),
        "5A": formatValue(totalValues.a5),
        "Total payable /(refundable)": formatValue(totalValues.totalPayable),
        Reference: "",
      },
      {
        Type: "",
        Period: `Payroll Summary ${payrollRangeLabel}`,
        G1: formatValue(payrollSummaryRange.g1),
        "1A": formatValue(payrollSummaryRange.a1),
        "1B": formatValue(payrollSummaryRange.b1),
        "Net GST payable /(refundable)": formatValue(
          calculateNetGst(payrollSummaryRange),
        ),
        W1: formatValue(payrollSummaryRange.w1),
        W2: formatValue(payrollSummaryRange.w2),
        "5A": formatValue(payrollSummaryRange.a5),
        "Total payable /(refundable)": formatValue(
          calculateTotalPayable(payrollSummaryRange),
        ),
        Reference: payrollRangeRef,
      },
      {
        Type: "",
        Period: "Variance between lodged BASes & MYOB",
        G1: formatValue(varianceValues.g1),
        "1A": formatValue(varianceValues.a1),
        "1B": formatValue(varianceValues.b1),
        "Net GST payable /(refundable)": formatValue(varianceValues.netGst),
        W1: formatValue(varianceValues.w1),
        W2: formatValue(varianceValues.w2),
        "5A": formatValue(varianceValues.a5),
        "Total payable /(refundable)": formatValue(varianceValues.totalPayable),
        Reference: "",
      },
      {
        Type: "",
        Period: `GST Summary (Cash) ${payrollRangeLabel}`,
        G1: formatValue(gstSummaryCash.g1),
        "1A": formatValue(gstSummaryCash.a1),
        "1B": formatValue(gstSummaryCash.b1),
        "Net GST payable /(refundable)": formatValue(
          calculateNetGst(gstSummaryCash),
        ),
        W1: formatValue(gstSummaryCash.w1),
        W2: formatValue(gstSummaryCash.w2),
        "5A": formatValue(gstSummaryCash.a5),
        "Total payable /(refundable)": formatValue(
          calculateTotalPayable(gstSummaryCash),
        ),
        Reference: gstRangeRef,
      },
      {
        Type: "",
        Period: `Payroll Summary ${lastMonthRangeLabel}`,
        G1: formatValue(payrollSummaryLastMonth.g1),
        "1A": formatValue(payrollSummaryLastMonth.a1),
        "1B": formatValue(payrollSummaryLastMonth.b1),
        "Net GST payable /(refundable)": formatValue(
          calculateNetGst(payrollSummaryLastMonth),
        ),
        W1: formatValue(payrollSummaryLastMonth.w1),
        W2: formatValue(payrollSummaryLastMonth.w2),
        "5A": formatValue(payrollSummaryLastMonth.a5),
        "Total payable /(refundable)": formatValue(
          calculateTotalPayable(payrollSummaryLastMonth),
        ),
        Reference: payrollLastMonthRef,
      },
      {
        Type: "BAS",
        Period: periodLabel,
        G1: formatValue(basValues.g1),
        "1A": formatValue(basValues.a1),
        "1B": formatValue(basValues.b1),
        "Net GST payable /(refundable)": formatValue(basValues.netGst),
        W1: formatValue(basValues.w1),
        W2: formatValue(basValues.w2),
        "5A": formatValue(basValues.a5),
        "Total payable /(refundable)": formatValue(basValues.totalPayable),
        Reference: `${payrollRangeRef} | ${gstRangeRef}`,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(rowsForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BAS");
    XLSX.writeFile(wb, `BAS-${fromDate}-to-${toDate}.xlsx`);
  };

  return (
    <Layout title="BAS" breadcrumb={["Home", "Tax", "BAS"]}>
      <div style={{ padding: "0 4px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "12px",
          }}
        >
          <h2 style={{ margin: 0, flex: 1 }}>BAS</h2>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600 }}>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                height: "32px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                padding: "0 8px",
                fontSize: "13px",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600 }}>To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                height: "32px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                padding: "0 8px",
                fontSize: "13px",
              }}
            />
          </div>

          <button
            type="button"
            className="btn-action"
            onClick={exportExcel}
            title="Export Excel"
            style={{ background: "#1f7a3f", color: "#fff" }}
          >
            <i className="fas fa-file-excel"></i>
          </button>

          <button
            type="button"
            className="btn-action btn-delete"
            onClick={clearData}
            title="Clear data"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>

        <p style={{ fontSize: "12px", color: "#777", marginBottom: "10px" }}>
          Range: {formatDisplayDate(fromDate)} - {formatDisplayDate(toDate)}
        </p>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              minWidth: "1280px",
              fontSize: "13px",
            }}
          >
            <colgroup>
              <col style={{ width: "80px" }} />
              <col style={{ width: "260px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "70px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "270px" }} />
            </colgroup>

            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #4b5563",
                    background: "#3f3f46",
                    color: "#fff",
                    padding: "8px 6px",
                    textAlign: "left",
                  }}
                >
                  Type
                </th>
                <th
                  style={{
                    border: "1px solid #4b5563",
                    background: "#3f3f46",
                    color: "#fff",
                    padding: "8px 6px",
                    textAlign: "left",
                  }}
                >
                  Period
                </th>
                {[
                  "G1",
                  "1A",
                  "1B",
                  "Net GST payable /(refundable)",
                  "W1",
                  "W2",
                  "5A",
                  "Total payable /(refundable)",
                  "Reference",
                ].map((head) => (
                  <th
                    key={head}
                    style={{
                      border: "1px solid #4b5563",
                      background: "#3f3f46",
                      color: "#fff",
                      padding: "8px 6px",
                      textAlign: head === "Reference" ? "left" : "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px 6px",
                    color: "#0f172a",
                    fontWeight: 700,
                  }}
                >
                  IAS
                </td>
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px 6px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {iasPeriod1}
                </td>

                {renderEditableCell(iasRow1, setIasRow1, "g1")}
                {renderEditableCell(iasRow1, setIasRow1, "a1")}
                {renderEditableCell(iasRow1, setIasRow1, "b1")}
                {renderComputedCell(calculateNetGst(iasRow1))}
                {renderEditableCell(iasRow1, setIasRow1, "w1")}
                {renderEditableCell(iasRow1, setIasRow1, "w2")}
                {renderEditableCell(iasRow1, setIasRow1, "a5")}
                {renderComputedCell(calculateTotalPayable(iasRow1))}

                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  {renderReferenceIcon(ias1Ref, "#0f766e", () =>
                    openPayrollPopup(iasPeriod1, "ias1"),
                  )}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px 6px",
                    fontWeight: 700,
                  }}
                >
                  IAS
                </td>
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px 6px",
                    fontWeight: 700,
                  }}
                >
                  {iasPeriod2}
                </td>

                {renderEditableCell(iasRow2, setIasRow2, "g1")}
                {renderEditableCell(iasRow2, setIasRow2, "a1")}
                {renderEditableCell(iasRow2, setIasRow2, "b1")}
                {renderComputedCell(calculateNetGst(iasRow2))}
                {renderEditableCell(iasRow2, setIasRow2, "w1")}
                {renderEditableCell(iasRow2, setIasRow2, "w2")}
                {renderEditableCell(iasRow2, setIasRow2, "a5")}
                {renderComputedCell(calculateTotalPayable(iasRow2))}

                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  {renderReferenceIcon(ias2Ref, "#0f766e", () =>
                    openPayrollPopup(iasPeriod2, "ias2"),
                  )}
                </td>
              </tr>

              <tr>
                <td
                  style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}
                />
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px 6px",
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  Total
                </td>

                {renderComputedCell(totalValues.g1, true)}
                {renderComputedCell(totalValues.a1, true)}
                {renderComputedCell(totalValues.b1, true)}
                {renderComputedCell(totalValues.netGst, true)}
                {renderComputedCell(totalValues.w1, true)}
                {renderComputedCell(totalValues.w2, true)}
                {renderComputedCell(totalValues.a5, true)}
                {renderComputedCell(totalValues.totalPayable, true)}

                <td
                  style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}
                />
              </tr>

              <tr>
                <td
                  style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}
                />
                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  <div style={{ fontSize: "14px", lineHeight: 1.35 }}>
                    Payroll Summary
                  </div>
                  <div style={{ fontSize: "14px", lineHeight: 1.35 }}>
                    {payrollCompareRangeLabel}
                  </div>
                </td>

                {renderEditableCell(
                  payrollSummaryRange,
                  setPayrollSummaryRange,
                  "g1",
                )}
                {renderEditableCell(
                  payrollSummaryRange,
                  setPayrollSummaryRange,
                  "a1",
                )}
                {renderEditableCell(
                  payrollSummaryRange,
                  setPayrollSummaryRange,
                  "b1",
                )}
                {renderComputedCell(calculateNetGst(payrollSummaryRange))}
                {renderEditableCell(
                  payrollSummaryRange,
                  setPayrollSummaryRange,
                  "w1",
                )}
                {renderEditableCell(
                  payrollSummaryRange,
                  setPayrollSummaryRange,
                  "w2",
                )}
                {renderEditableCell(
                  payrollSummaryRange,
                  setPayrollSummaryRange,
                  "a5",
                )}
                {renderComputedCell(calculateTotalPayable(payrollSummaryRange))}

                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  {renderReferenceIcon(payrollRangeRef, "#0f766e", () =>
                    openPayrollPopup(payrollCompareRangeLabel, "payroll-range"),
                  )}
                </td>
              </tr>

              <tr>
                <td
                  style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}
                />
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px 6px",
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  Variance between lodged BASes &amp; MYOB
                </td>

                {renderComputedCell(varianceValues.g1, true)}
                {renderComputedCell(varianceValues.a1, true)}
                {renderComputedCell(varianceValues.b1, true)}
                {renderComputedCell(varianceValues.netGst, true)}
                {renderComputedCell(varianceValues.w1, true)}
                {renderComputedCell(varianceValues.w2, true)}
                {renderComputedCell(varianceValues.a5, true)}
                {renderComputedCell(varianceValues.totalPayable, true)}

                <td
                  style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}
                />
              </tr>

              <tr>
                <td
                  style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}
                />
                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  <div style={{ fontSize: "14px", lineHeight: 1.35 }}>
                    GST Summary (Cash)
                  </div>
                  <div style={{ fontSize: "14px", lineHeight: 1.35 }}>
                    {payrollRangeLabel}
                  </div>
                </td>

                {renderEditableCell(gstSummaryCash, setGstSummaryCash, "g1")}
                {renderEditableCell(gstSummaryCash, setGstSummaryCash, "a1")}
                {renderEditableCell(gstSummaryCash, setGstSummaryCash, "b1")}
                {renderComputedCell(calculateNetGst(gstSummaryCash))}
                {renderEditableCell(gstSummaryCash, setGstSummaryCash, "w1")}
                {renderEditableCell(gstSummaryCash, setGstSummaryCash, "w2")}
                {renderEditableCell(gstSummaryCash, setGstSummaryCash, "a5")}
                {renderComputedCell(calculateTotalPayable(gstSummaryCash))}

                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  {renderReferenceIcon(gstRangeRef, "#0f766e", () =>
                    openGstPopup(payrollRangeLabel),
                  )}
                </td>
              </tr>

              <tr>
                <td
                  style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}
                />
                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  <div style={{ fontSize: "14px", lineHeight: 1.35 }}>
                    Payroll Summary
                  </div>
                  <div style={{ fontSize: "14px", lineHeight: 1.35 }}>
                    {lastMonthRangeLabel}
                  </div>
                </td>

                {renderEditableCell(
                  payrollSummaryLastMonth,
                  setPayrollSummaryLastMonth,
                  "g1",
                )}
                {renderEditableCell(
                  payrollSummaryLastMonth,
                  setPayrollSummaryLastMonth,
                  "a1",
                )}
                {renderEditableCell(
                  payrollSummaryLastMonth,
                  setPayrollSummaryLastMonth,
                  "b1",
                )}
                {renderComputedCell(calculateNetGst(payrollSummaryLastMonth))}
                {renderEditableCell(
                  payrollSummaryLastMonth,
                  setPayrollSummaryLastMonth,
                  "w1",
                )}
                {renderEditableCell(
                  payrollSummaryLastMonth,
                  setPayrollSummaryLastMonth,
                  "w2",
                )}
                {renderEditableCell(
                  payrollSummaryLastMonth,
                  setPayrollSummaryLastMonth,
                  "a5",
                )}
                {renderComputedCell(
                  calculateTotalPayable(payrollSummaryLastMonth),
                )}

                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  {renderReferenceIcon(payrollLastMonthRef, "#0f766e", () =>
                    openPayrollPopup(lastMonthRangeLabel, "payroll-last-month"),
                  )}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px 6px",
                    color: "#1d4ed8",
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  BAS
                </td>
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px 6px",
                    fontWeight: 700,
                    color: "#1d4ed8",
                    fontSize: "14px",
                  }}
                >
                  {periodLabel}
                </td>

                {renderComputedCell(basValues.g1, true)}
                {renderComputedCell(basValues.a1, true)}
                {renderComputedCell(basValues.b1, true)}
                {renderComputedCell(basValues.netGst, true)}
                {renderComputedCell(basValues.w1, true)}
                {renderComputedCell(basValues.w2, true)}
                {renderComputedCell(basValues.a5, true)}
                {renderComputedCell(basValues.totalPayable, true)}

                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  <span style={{ color: "#475569", fontSize: "12px" }}>
                    Auto calculated (no manual reference input)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {showPayrollPopup && (
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
              e.target === e.currentTarget && setShowPayrollPopup(false)
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
                  Payroll Activity (Summary)
                </h3>
                {payrollPopupPeriod ? (
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Period: {payrollPopupPeriod}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="btn-action"
                  title="Fill W1/W2"
                  onClick={applyPopupTotalsToTarget}
                  style={{ background: "#0f766e", color: "#fff" }}
                >
                  Fill W1/W2
                </button>
                <button
                  type="button"
                  className="btn-action btn-delete"
                  title="Close"
                  onClick={() => setShowPayrollPopup(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

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
                    <col style={{ width: "240px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "120px" }} />
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
                      {[
                        "Employee",
                        "Wages",
                        "Deduction",
                        "Taxes",
                        "Net Pay",
                        "Expenses",
                      ].map((head) => (
                        <th
                          key={head}
                          style={{
                            border: "1px solid #ccc",
                            background: "#2c3e7a",
                            color: "#fff",
                            padding: "6px 4px",
                            textAlign: head === "Employee" ? "left" : "right",
                            fontSize: "12px",
                          }}
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payrollPopupRows.map((row, idx) => (
                      <tr
                        key={idx}
                        style={{ background: idx % 2 ? "#f7f9ff" : "#fff" }}
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
                          {idx + 1}
                        </td>
                        <td
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          <input
                            value={row.employee}
                            onChange={(e) =>
                              updatePayrollPopupCell(
                                idx,
                                "employee",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              fontSize: "13px",
                            }}
                          />
                        </td>
                        <td
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          <input
                            value={row.wages}
                            onChange={(e) =>
                              updatePayrollPopupCell(
                                idx,
                                "wages",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              textAlign: "right",
                              fontSize: "13px",
                            }}
                          />
                        </td>
                        <td
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          <input
                            value={row.deduction}
                            onChange={(e) =>
                              updatePayrollPopupCell(
                                idx,
                                "deduction",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              textAlign: "right",
                              fontSize: "13px",
                            }}
                          />
                        </td>
                        <td
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          <input
                            value={row.taxes}
                            onChange={(e) =>
                              updatePayrollPopupCell(
                                idx,
                                "taxes",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              textAlign: "right",
                              fontSize: "13px",
                            }}
                          />
                        </td>
                        <td
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          <input
                            value={row.netPay}
                            onChange={(e) =>
                              updatePayrollPopupCell(
                                idx,
                                "netPay",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              textAlign: "right",
                              fontSize: "13px",
                            }}
                          />
                        </td>
                        <td
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          <input
                            value={row.expenses}
                            onChange={(e) =>
                              updatePayrollPopupCell(
                                idx,
                                "expenses",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              textAlign: "right",
                              fontSize: "13px",
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 4px",
                        }}
                      />
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 8px",
                          fontWeight: 700,
                        }}
                      >
                        Total
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 8px",
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        {formatValue(payrollPopupTotals.wages)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 8px",
                        }}
                      />
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 8px",
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        {formatValue(payrollPopupTotals.taxes)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 8px",
                        }}
                      />
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 8px",
                        }}
                      />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {showGstPopup && (
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
              e.target === e.currentTarget && setShowGstPopup(false)
            }
          >
            <div
              style={{
                width: "100%",
                maxWidth: "1080px",
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
                  GST [Summary - Cash]
                </h3>
                {gstPopupPeriod ? (
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Period: {gstPopupPeriod}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="btn-action btn-delete"
                  title="Close"
                  onClick={() => setShowGstPopup(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

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
                    <col style={{ width: "90px" }} />
                    <col style={{ width: "240px" }} />
                    <col style={{ width: "100px" }} />
                    <col style={{ width: "130px" }} />
                    <col style={{ width: "130px" }} />
                    <col style={{ width: "130px" }} />
                    <col style={{ width: "130px" }} />
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
                      {[
                        "Code",
                        "Description",
                        "Rate",
                        "Sale Value",
                        "Purchase Value",
                        "Tax Collected",
                        "Tax Paid",
                      ].map((head) => (
                        <th
                          key={head}
                          style={{
                            border: "1px solid #ccc",
                            background: "#2c3e7a",
                            color: "#fff",
                            padding: "6px 4px",
                            textAlign:
                              head === "Description"
                                ? "left"
                                : head === "Code"
                                  ? "center"
                                  : "right",
                            fontSize: "12px",
                          }}
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gstPopupRows.map((row, idx) => (
                      <tr
                        key={idx}
                        style={{ background: idx % 2 ? "#f7f9ff" : "#fff" }}
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
                          {idx + 1}
                        </td>
                        <td
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          <input
                            value={row.code}
                            onChange={(e) =>
                              updateGstPopupCell(idx, "code", e.target.value)
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              textAlign: "center",
                              fontSize: "13px",
                            }}
                          />
                        </td>
                        <td
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          <input
                            value={row.description}
                            onChange={(e) =>
                              updateGstPopupCell(
                                idx,
                                "description",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              fontSize: "13px",
                            }}
                          />
                        </td>
                        <td
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          <input
                            value={row.rate}
                            onChange={(e) =>
                              updateGstPopupCell(idx, "rate", e.target.value)
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              textAlign: "right",
                              fontSize: "13px",
                            }}
                          />
                        </td>
                        <td
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          <input
                            value={row.saleValue}
                            onChange={(e) =>
                              updateGstPopupCell(
                                idx,
                                "saleValue",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              textAlign: "right",
                              fontSize: "13px",
                            }}
                          />
                        </td>
                        <td
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          <input
                            value={row.purchaseValue}
                            onChange={(e) =>
                              updateGstPopupCell(
                                idx,
                                "purchaseValue",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              textAlign: "right",
                              fontSize: "13px",
                            }}
                          />
                        </td>
                        <td
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          <input
                            value={row.taxCollected}
                            onChange={(e) =>
                              updateGstPopupCell(
                                idx,
                                "taxCollected",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              textAlign: "right",
                              fontSize: "13px",
                            }}
                          />
                        </td>
                        <td
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          <input
                            value={row.taxPaid}
                            onChange={(e) =>
                              updateGstPopupCell(idx, "taxPaid", e.target.value)
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              textAlign: "right",
                              fontSize: "13px",
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 4px",
                        }}
                      />
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 8px",
                        }}
                      />
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 8px",
                          fontWeight: 700,
                        }}
                      >
                        Total
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 8px",
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        {formatValue(gstPopupTotals.rate)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 8px",
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        {formatValue(gstPopupTotals.saleValue)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 8px",
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        {formatValue(gstPopupTotals.purchaseValue)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 8px",
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        {formatValue(gstPopupTotals.taxCollected)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          background: "#e8ecf7",
                          padding: "6px 8px",
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        {formatValue(gstPopupTotals.taxPaid)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
