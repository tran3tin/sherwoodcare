import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import timesheetService from "../../services/timesheetService";
import timesheetReportService from "../../services/timesheetReportService";
import { toast } from "react-toastify";
import {
  addDaysYMD,
  formatDMFromYMD,
  normalizeYMD,
  weekdayIndexFromYMD,
} from "../../utils/dateVN";
import "../../assets/styles/list.css";
import "./TimeSheetForm.css";

const TimeSheetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get timesheet ID from URL for edit mode
  const [startDate, setStartDate] = useState("");
  const [numDays, setNumDays] = useState(14);
  const [numRows, setNumRows] = useState(40);
  const [rows, setRows] = useState([]);
  const [dateHeaders, setDateHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [periodId, setPeriodId] = useState(null);

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const buildDateHeaders = (startYmd, days) => {
    const s = normalizeYMD(startYmd);
    const count = parseInt(days, 10);
    if (!s || !Number.isFinite(count) || count <= 0) return [];

    const headers = [];
    for (let i = 0; i < count; i++) {
      const ymd = addDaysYMD(s, i);
      const dow = weekdayIndexFromYMD(ymd);
      headers.push({
        ymd,
        display: formatDMFromYMD(ymd),
        dayName: Number.isFinite(dow) ? dayNames[dow] : "",
        isWeekend: dow === 0 || dow === 6,
      });
    }
    return headers;
  };

  const getDraftKey = () => {
    const key = periodId || id;
    return key ? String(key) : "new";
  };

  const getLinkedReportId = (key = getDraftKey()) => {
    try {
      const raw = localStorage.getItem(`timesheetReportId:${key}`);
      return raw ? String(raw) : null;
    } catch {
      return null;
    }
  };

  const setLinkedReportId = (reportId, key = getDraftKey()) => {
    try {
      if (!reportId) return;
      localStorage.setItem(`timesheetReportId:${key}`, String(reportId));
    } catch {
      // ignore
    }
  };

  const saveDraft = (key = getDraftKey()) => {
    try {
      const payload = {
        periodId: periodId || id || null,
        startDate: normalizeYMD(startDate),
        numDays,
        numRows,
        rows,
        savedAt: Date.now(),
      };
      localStorage.setItem(`timesheetDraft:${key}`, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  };

  const clearDraft = (key = getDraftKey()) => {
    try {
      localStorage.removeItem(`timesheetDraft:${key}`);
    } catch (e) {
      // ignore
    }
  };

  const tryRestoreDraft = (key) => {
    try {
      const raw = localStorage.getItem(`timesheetDraft:${key}`);
      if (!raw) return false;
      const draft = JSON.parse(raw);
      if (!draft) return false;

      const s = normalizeYMD(draft.startDate);
      const d = parseInt(draft.numDays, 10);
      const r = parseInt(draft.numRows, 10);
      if (
        !s ||
        !Number.isFinite(d) ||
        !Number.isFinite(r) ||
        !Array.isArray(draft.rows)
      ) {
        return false;
      }

      setIsEditMode(Boolean(id || draft.periodId));
      setPeriodId(draft.periodId || id || null);
      setStartDate(s);
      setNumDays(d);
      setNumRows(r);
      setRows(draft.rows);
      setDateHeaders(buildDateHeaders(s, d));
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (id) {
      // Edit mode: restore draft if available (e.g., returning from Report), otherwise load from API
      const restored = tryRestoreDraft(String(id));
      if (!restored) loadTimesheet(id);
    } else {
      // New mode: restore draft if available, otherwise initialize with defaults
      const restored = tryRestoreDraft("new");
      if (!restored) {
        const today = new Date();
        const formattedDate = formatDateInput(today);

        const savedDate = localStorage.getItem("startDate");
        const savedDays = localStorage.getItem("numDays");
        const savedRows = localStorage.getItem("numRows");

        setStartDate(savedDate || formattedDate);
        if (savedDays) setNumDays(parseInt(savedDays));
        if (savedRows) setNumRows(parseInt(savedRows));

        generateTable(
          savedDate || formattedDate,
          parseInt(savedDays) || 14,
          parseInt(savedRows) || 40
        );
      }
    }
  }, [id]);

  const loadTimesheet = async (timesheetId) => {
    try {
      setLoading(true);
      const response = await timesheetService.fetchTimesheetById(timesheetId);
      const { period, entries } = response.data;

      setPeriodId(period.period_id);
      setIsEditMode(true);
      const startDateOnly = normalizeYMD(period.start_date);

      setStartDate(startDateOnly);
      setNumDays(parseInt(period.num_days));
      setNumRows(parseInt(period.num_rows));

      // Generate date headers
      setDateHeaders(buildDateHeaders(startDateOnly, period.num_days));

      // Reconstruct rows from entries
      const newRows = [];
      for (let r = 1; r <= parseInt(period.num_rows); r++) {
        const entry = entries.find((e) => e.row_number === r);
        const dayArray = Array(parseInt(period.num_days)).fill("");

        if (entry && entry.days) {
          entry.days.forEach((day) => {
            if (
              day.day_index >= 0 &&
              day.day_index < parseInt(period.num_days)
            ) {
              dayArray[day.day_index] = day.staff_name || "";
            }
          });
        }

        newRows.push({
          id: r,
          note: entry?.note || "",
          period: entry?.period || "",
          hrs: entry?.hrs || "",
          days: dayArray,
        });
      }
      setRows(newRows);
    } catch (error) {
      console.error("Error loading timesheet:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to load timesheet. Redirecting to list.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      navigate("/payroll/timesheets");
    } finally {
      setLoading(false);
    }
  };

  const formatDateInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const generateTable = (
    start = startDate,
    days = numDays,
    rowCount = numRows
  ) => {
    if (!start) {
      toast.warning("Please select a start date!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    localStorage.setItem("startDate", start);
    localStorage.setItem("numDays", days);
    localStorage.setItem("numRows", rowCount);

    setDateHeaders(buildDateHeaders(start, days));

    const newRows = [];
    for (let r = 1; r <= rowCount; r++) {
      newRows.push({
        id: r,
        note: "",
        period: "",
        hrs: "",
        days: Array(days).fill(""),
      });
    }
    setRows(newRows);
  };

  const handleInputChange = (rowIndex, field, value, dayIndex = null) => {
    const newRows = [...rows];
    if (dayIndex !== null) {
      newRows[rowIndex].days[dayIndex] = value;
    } else {
      newRows[rowIndex][field] = value;
    }
    setRows(newRows);
  };

  const handlePaste = (e, rowIndex, colIndex, type) => {
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
        let startAbsCol = 0;
        if (type === "note") startAbsCol = 1;
        else if (type === "period") startAbsCol = 2;
        else if (type === "hrs") startAbsCol = 3;
        else if (type === "day") startAbsCol = 4 + colIndex;

        const targetAbsCol = startAbsCol + cIndex;

        if (targetAbsCol === 1) {
          newRows[targetRowIndex].note = cellData.trim();
        } else if (targetAbsCol === 2) {
          newRows[targetRowIndex].period = cellData.trim();
        } else if (targetAbsCol === 3) {
          newRows[targetRowIndex].hrs = cellData.trim();
        } else if (targetAbsCol >= 4) {
          const dIndex = targetAbsCol - 4;
          if (dIndex < newRows[targetRowIndex].days.length) {
            newRows[targetRowIndex].days[dIndex] = cellData.trim();
          }
        }
      });
    });
    setRows(newRows);
  };

  const handleKeyDown = (e, rowIndex, colIndex, type) => {
    const getCellId = (r, t, c = 0) => `cell-${r}-${t}-${c}`;

    let nextId = null;
    const maxRows = rows.length;
    const maxDays = numDays;

    const getOrder = (t, c) => {
      if (t === "note") return 0;
      if (t === "period") return 1;
      if (t === "hrs") return 2;
      if (t === "day") return 3 + c;
      return 0;
    };

    const getTypeFromOrder = (order) => {
      if (order === 0) return ["note", 0];
      if (order === 1) return ["period", 0];
      if (order === 2) return ["hrs", 0];
      if (order >= 3) return ["day", order - 3];
      return null;
    };

    const currentOrder = getOrder(type, colIndex);

    if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      if (rowIndex < maxRows - 1) {
        nextId = getCellId(rowIndex + 1, type, colIndex);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (rowIndex > 0) {
        nextId = getCellId(rowIndex - 1, type, colIndex);
      }
    } else if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      const [nextType, nextColIndex] = getTypeFromOrder(currentOrder + 1) || [];
      if (nextType) {
        if (nextType === "day" && nextColIndex >= maxDays) return;
        nextId = getCellId(rowIndex, nextType, nextColIndex);
      }
    } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      if (currentOrder > 0) {
        const [prevType, prevColIndex] =
          getTypeFromOrder(currentOrder - 1) || [];
        nextId = getCellId(rowIndex, prevType, prevColIndex);
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
      note: "",
      period: "",
      hrs: "",
      days: Array(numDays).fill(""),
    }));
    setRows(newRows);
    toast.success("Data cleared.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleViewReport = async () => {
    if (!dateHeaders.length) {
      toast.warning("Please generate the table first.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (!startDate) {
      toast.warning("Please select a start date!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const rosterData = rows.map((row) => ({
      num: row.id,
      note: row.note,
      period: row.period,
      hrs: row.hrs,
      days: row.days,
    }));

    localStorage.setItem("rosterData", JSON.stringify(rosterData));
    localStorage.setItem("dateHeaders", JSON.stringify(dateHeaders));

    const draftKey = getDraftKey();
    saveDraft(draftKey);

    const from =
      periodId || id
        ? `/payroll/time-sheet/${periodId || id}`
        : "/payroll/time-sheet";

    // Process data like TimeSheetReport does - group by employee name
    const processedData = processDataForReport(rosterData, dateHeaders);

    const startYmd = normalizeYMD(startDate);
    const endYmd = addDaysYMD(startYmd, parseInt(numDays, 10) - 1);
    const reportName = `TimeSheet ${formatDMFromYMD(
      startYmd
    )} - ${formatDMFromYMD(endYmd)}`;

    const payload = {
      start_date: startYmd,
      num_days: numDays,
      num_rows: numRows,
      name: reportName,
      processed_data: processedData,
      date_headers: dateHeaders,
    };

    const linkedId = getLinkedReportId(draftKey);

    try {
      setSaving(true);

      let reportId = linkedId;
      if (linkedId) {
        await timesheetReportService.updateReport(linkedId, payload);
      } else {
        const created = await timesheetReportService.createReport(payload);
        reportId = created.report_id;
        setLinkedReportId(reportId, draftKey);
      }

      navigate(`/payroll/report/${reportId}`, { state: { from, draftKey } });
    } catch (err) {
      console.error("Error saving report:", err);
      toast.error(err?.response?.data?.error || "Failed to save report", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // fallback to legacy report page (localStorage)
      navigate("/payroll/report", { state: { from, draftKey } });
    } finally {
      setSaving(false);
    }
  };

  // Process roster data into employee-grouped format for report
  const processDataForReport = (data, headers) => {
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
        jobs: jobKeys.map((key) => {
          const job = jobs[key];
          const dayValues = headers.map((_, dayIndex) =>
            job.workedDays[dayIndex] ? String(job.hrsValue ?? "") : ""
          );

          return {
            ...job,
            dayValues,
          };
        }),
      };
    });

    return processed;
  };

  const handleSave = async () => {
    if (!startDate) {
      toast.warning("Please select a start date!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (!dateHeaders.length) {
      toast.warning("Please generate the table first!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const entries = rows
      .filter(
        (row) => row.note || row.period || row.hrs || row.days.some((d) => d)
      )
      .map((row) => ({
        row_number: row.id,
        note: row.note,
        period: row.period,
        hrs: row.hrs,
        days: row.days
          .map((staff_name, day_index) => ({
            day_index,
            staff_name: staff_name || "",
          }))
          .filter((day) => day.staff_name.trim()),
      }));

    const startYmd = normalizeYMD(startDate);
    const endYmd = addDaysYMD(startYmd, parseInt(numDays, 10) - 1);
    const timesheetName = `TimeSheet ${formatDMFromYMD(
      startYmd
    )} - ${formatDMFromYMD(endYmd)}`;

    try {
      setSaving(true);

      if (isEditMode && periodId) {
        await timesheetService.updateTimesheet(periodId, {
          start_date: startYmd,
          num_days: numDays,
          num_rows: numRows,
          name: timesheetName,
          entries,
        });
        clearDraft(String(periodId));
        toast.success("Timesheet updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        const response = await timesheetService.createTimesheet({
          start_date: startYmd,
          num_days: numDays,
          num_rows: numRows,
          name: timesheetName,
          entries,
        });
        clearDraft("new");
        setPeriodId(response.period_id);
        setIsEditMode(true);
        toast.success("Timesheet saved successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate(`/payroll/time-sheet/${response.period_id}`, {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Error saving timesheet:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to save timesheet. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    navigate("/payroll/timesheets");
  };

  useEffect(() => {
    if (!isEditMode) return;
    const s = normalizeYMD(startDate);
    if (!s) return;
    setDateHeaders(buildDateHeaders(s, numDays));
  }, [isEditMode, startDate, numDays]);

  const pageTitle = isEditMode ? "Edit Time Sheet" : "New Time Sheet";
  const breadcrumb = isEditMode
    ? ["Home", "Payroll", "Timesheets", "Edit"]
    : ["Home", "Payroll", "New Time Sheet"];

  return (
    <Layout title={pageTitle} breadcrumb={breadcrumb}>
      <div className="timesheet-container">
        {loading ? (
          <div className="loading-spinner">Loading timesheet...</div>
        ) : (
          <>
            <div className="date-config">
              <h3>
                ⚙️ Timesheet Configuration{" "}
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
                  <label htmlFor="numDays">Days:</label>
                  <select
                    id="numDays"
                    value={numDays}
                    onChange={(e) => setNumDays(parseInt(e.target.value))}
                    disabled={isEditMode}
                  >
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="21">21 days</option>
                    <option value="30">30 days</option>
                  </select>
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
                <h2 style={{ margin: 0 }}>Staff Timesheet</h2>

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
                    className="btn-action btn-report"
                    onClick={handleViewReport}
                    title="View Report"
                    aria-label="View Report"
                  >
                    <i className="fas fa-chart-bar"></i>
                  </button>
                </div>
              </div>

              <div className="info-box">
                <strong>💡 Instructions:</strong>
                <ul>
                  <li>
                    <strong>Copy/Paste from Excel:</strong> Select data in Excel
                    (multiple cells) → Ctrl+C → Click first cell in table →
                    Ctrl+V
                  </li>
                  <li>
                    <strong>Navigation:</strong> Use Arrow keys ↑ ↓ ← → to move
                    between cells
                  </li>
                  <li>
                    <strong>Tab/Enter:</strong> Tab to move right, Enter to move
                    down
                  </li>
                </ul>
              </div>

              <table className="timesheet-table" id="excelTable">
                <thead>
                  <tr>
                    <th colSpan="4" style={{ backgroundColor: "#ff9999" }}>
                      Date
                    </th>
                    {dateHeaders.map((header, index) => (
                      <th
                        key={index}
                        style={{ backgroundColor: "#ff9999" }}
                        className={header.isWeekend ? "weekend" : ""}
                      >
                        {header.display}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th style={{ width: "120px" }}>Note</th>
                    <th style={{ width: "120px" }}>Period</th>
                    <th className="hrs-header">Hrs</th>
                    {dateHeaders.map((header, index) => (
                      <th
                        key={index}
                        className={header.isWeekend ? "weekend" : ""}
                      >
                        {header.dayName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={row.id}>
                      <td className="num-col">
                        <input type="text" value={row.id} readOnly />
                      </td>
                      <td className="note-col">
                        <input
                          id={`cell-${rowIndex}-note-0`}
                          type="text"
                          value={row.note}
                          onChange={(e) =>
                            handleInputChange(rowIndex, "note", e.target.value)
                          }
                          onPaste={(e) => handlePaste(e, rowIndex, 0, "note")}
                          onKeyDown={(e) =>
                            handleKeyDown(e, rowIndex, 0, "note")
                          }
                        />
                      </td>
                      <td>
                        <input
                          id={`cell-${rowIndex}-period-0`}
                          type="text"
                          value={row.period}
                          onChange={(e) =>
                            handleInputChange(
                              rowIndex,
                              "period",
                              e.target.value
                            )
                          }
                          onPaste={(e) => handlePaste(e, rowIndex, 0, "period")}
                          onKeyDown={(e) =>
                            handleKeyDown(e, rowIndex, 0, "period")
                          }
                        />
                      </td>
                      <td className="hrs-col">
                        <input
                          id={`cell-${rowIndex}-hrs-0`}
                          type="text"
                          value={row.hrs}
                          onChange={(e) =>
                            handleInputChange(rowIndex, "hrs", e.target.value)
                          }
                          onPaste={(e) => handlePaste(e, rowIndex, 0, "hrs")}
                          onKeyDown={(e) =>
                            handleKeyDown(e, rowIndex, 0, "hrs")
                          }
                        />
                      </td>
                      {row.days.map((dayValue, dayIndex) => (
                        <td
                          key={dayIndex}
                          className={
                            dateHeaders[dayIndex]?.isWeekend ? "weekend" : ""
                          }
                        >
                          <input
                            id={`cell-${rowIndex}-day-${dayIndex}`}
                            type="text"
                            value={dayValue}
                            onChange={(e) =>
                              handleInputChange(
                                rowIndex,
                                "days",
                                e.target.value,
                                dayIndex
                              )
                            }
                            onPaste={(e) =>
                              handlePaste(e, rowIndex, dayIndex, "day")
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, rowIndex, dayIndex, "day")
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default TimeSheetForm;
