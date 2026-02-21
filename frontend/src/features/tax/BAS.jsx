import React, { useMemo, useState } from "react";
import Layout from "../../components/Layout";
import "../../assets/styles/list.css";

const VALUE_KEYS = [
  "g1",
  "a1",
  "b1",
  "netGst",
  "w1",
  "w2",
  "a5",
  "totalPayable",
];

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

const formatValue = (value) => roundNoDecimal(value).toLocaleString("en-AU");

export default function BAS() {
  const [fromDate, setFromDate] = useState("2025-10-01");
  const [toDate, setToDate] = useState("2025-12-31");
  const [iasRow1, setIasRow1] = useState(() => emptyValues());
  const [iasRow2, setIasRow2] = useState(() => emptyValues());
  const [payrollSummaryRange, setPayrollSummaryRange] = useState(() =>
    emptyValues(),
  );
  const [gstSummaryCash, setGstSummaryCash] = useState(() => emptyValues());
  const [payrollSummaryLastMonth, setPayrollSummaryLastMonth] = useState(() =>
    emptyValues(),
  );

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

  const lastMonthRangeLabel = useMemo(() => {
    if (!toDate) return "";
    return `${formatDotDate(firstDayOfMonth(toDate))} - ${formatDotDate(toDate)}`;
  }, [toDate]);

  const totalValues = useMemo(() => {
    const next = emptyValues();
    VALUE_KEYS.forEach((key) => {
      next[key] = roundNoDecimal((iasRow1[key] || 0) + (iasRow2[key] || 0));
    });
    return next;
  }, [iasRow1, iasRow2]);

  const varianceValues = useMemo(() => {
    const next = emptyValues();
    VALUE_KEYS.forEach((key) => {
      next[key] = roundNoDecimal(
        (totalValues[key] || 0) - (payrollSummaryRange[key] || 0),
      );
    });
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
    return next;
  }, [varianceValues, gstSummaryCash, payrollSummaryLastMonth]);

  const setRowValue = (setter, key, value) => {
    setter((prev) => ({ ...prev, [key]: parseNumberInput(value) }));
  };

  const renderEditableCell = (row, setter, key) => (
    <td style={{ border: "1px solid #d1d5db", padding: "4px 6px" }}>
      <input
        value={row[key] === 0 ? "" : String(row[key])}
        onChange={(e) => setRowValue(setter, key, e.target.value)}
        style={{
          width: "100%",
          height: "28px",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          textAlign: "right",
          fontSize: "12px",
          padding: "0 6px",
          boxSizing: "border-box",
        }}
      />
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
                {renderEditableCell(iasRow1, setIasRow1, "netGst")}
                {renderEditableCell(iasRow1, setIasRow1, "w1")}
                {renderEditableCell(iasRow1, setIasRow1, "w2")}
                {renderEditableCell(iasRow1, setIasRow1, "a5")}
                {renderEditableCell(iasRow1, setIasRow1, "totalPayable")}

                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  <button
                    type="button"
                    className="btn-action"
                    style={{
                      background: "#0f766e",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    title="Sẽ thực hiện ở bước sau"
                  >
                    Reference
                  </button>
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
                {renderEditableCell(iasRow2, setIasRow2, "netGst")}
                {renderEditableCell(iasRow2, setIasRow2, "w1")}
                {renderEditableCell(iasRow2, setIasRow2, "w2")}
                {renderEditableCell(iasRow2, setIasRow2, "a5")}
                {renderEditableCell(iasRow2, setIasRow2, "totalPayable")}

                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  <button
                    type="button"
                    className="btn-action"
                    style={{
                      background: "#0f766e",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    title="Sẽ thực hiện ở bước sau"
                  >
                    Reference
                  </button>
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
                    fontSize: "22px",
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
                  <div style={{ fontSize: "30px", lineHeight: 1.3 }}>
                    Payroll Summary
                  </div>
                  <div style={{ fontSize: "30px", lineHeight: 1.3 }}>
                    {payrollRangeLabel}
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
                {renderEditableCell(
                  payrollSummaryRange,
                  setPayrollSummaryRange,
                  "netGst",
                )}
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
                {renderEditableCell(
                  payrollSummaryRange,
                  setPayrollSummaryRange,
                  "totalPayable",
                )}

                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  <button
                    type="button"
                    className="btn-action"
                    style={{
                      background: "#0f766e",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    title="Sẽ thực hiện ở bước sau"
                  >
                    Reference
                  </button>
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
                    fontSize: "36px",
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
                  <div style={{ fontSize: "30px", lineHeight: 1.3 }}>
                    GST Summary (Cash)
                  </div>
                  <div style={{ fontSize: "30px", lineHeight: 1.3 }}>
                    {payrollRangeLabel}
                  </div>
                </td>

                {renderEditableCell(gstSummaryCash, setGstSummaryCash, "g1")}
                {renderEditableCell(gstSummaryCash, setGstSummaryCash, "a1")}
                {renderEditableCell(gstSummaryCash, setGstSummaryCash, "b1")}
                {renderEditableCell(
                  gstSummaryCash,
                  setGstSummaryCash,
                  "netGst",
                )}
                {renderEditableCell(gstSummaryCash, setGstSummaryCash, "w1")}
                {renderEditableCell(gstSummaryCash, setGstSummaryCash, "w2")}
                {renderEditableCell(gstSummaryCash, setGstSummaryCash, "a5")}
                {renderEditableCell(
                  gstSummaryCash,
                  setGstSummaryCash,
                  "totalPayable",
                )}

                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  <button
                    type="button"
                    className="btn-action"
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    title="Sẽ thực hiện ở bước sau"
                  >
                    Reference
                  </button>
                </td>
              </tr>

              <tr>
                <td
                  style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}
                />
                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  <div style={{ fontSize: "30px", lineHeight: 1.3 }}>
                    Payroll Summary
                  </div>
                  <div style={{ fontSize: "30px", lineHeight: 1.3 }}>
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
                {renderEditableCell(
                  payrollSummaryLastMonth,
                  setPayrollSummaryLastMonth,
                  "netGst",
                )}
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
                {renderEditableCell(
                  payrollSummaryLastMonth,
                  setPayrollSummaryLastMonth,
                  "totalPayable",
                )}

                <td style={{ border: "1px solid #d1d5db", padding: "8px 6px" }}>
                  <button
                    type="button"
                    className="btn-action"
                    style={{
                      background: "#0f766e",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    title="Sẽ thực hiện ở bước sau"
                  >
                    Reference
                  </button>
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px 6px",
                    color: "#1d4ed8",
                    fontWeight: 700,
                    fontSize: "34px",
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
                    fontSize: "34px",
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
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    <button
                      type="button"
                      className="btn-action"
                      style={{
                        background: "#0f766e",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      title="Tạm thời chỉ hiển thị giao diện"
                    >
                      Payroll Summary
                    </button>
                    <button
                      type="button"
                      className="btn-action"
                      style={{
                        background: "#2563eb",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      title="Tạm thời chỉ hiển thị giao diện"
                    >
                      GST Summary
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
