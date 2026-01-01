import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import timesheetService from "../../services/timesheetService";
import "./TimeSheet.css";

const TimeSheet = () => {
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

  useEffect(() => {
    if (id) {
      // Edit mode: load existing timesheet
      loadTimesheet(id);
    } else {
      // New mode: initialize with defaults
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
  }, [id]);

  const loadTimesheet = async (timesheetId) => {
    try {
      setLoading(true);
      const response = await timesheetService.fetchTimesheetById(timesheetId);
      const { period, entries } = response.data;

      setPeriodId(period.period_id);
      setIsEditMode(true);
      setStartDate(period.start_date);
      setNumDays(period.num_days);
      setNumRows(period.num_rows);

      // Generate date headers
      const startObj = new Date(period.start_date + "T00:00:00");
      const newDateHeaders = [];

      for (let i = 0; i < period.num_days; i++) {
        const currentDate = new Date(startObj);
        currentDate.setDate(startObj.getDate() + i);
        const dayOfWeek = currentDate.getDay();
        newDateHeaders.push({
          date: currentDate,
          display: formatDateDisplay(currentDate),
          dayName: dayNames[dayOfWeek],
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        });
      }
      setDateHeaders(newDateHeaders);

      // Reconstruct rows from entries
      const newRows = [];
      for (let r = 1; r <= period.num_rows; r++) {
        const entry = entries.find((e) => e.row_number === r);
        const dayArray = Array(period.num_days).fill("");

        if (entry && entry.days) {
          entry.days.forEach((day) => {
            if (day.day_index >= 0 && day.day_index < period.num_days) {
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
      alert(
        error.response?.data?.error ||
          "Failed to load timesheet. Redirecting to list."
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

  const formatDateDisplay = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  const generateTable = (
    start = startDate,
    days = numDays,
    rowCount = numRows
  ) => {
    if (!start) {
      alert("Please select a start date!");
      return;
    }

    localStorage.setItem("startDate", start);
    localStorage.setItem("numDays", days);
    localStorage.setItem("numRows", rowCount);

    const startObj = new Date(start + "T00:00:00");
    const newDateHeaders = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startObj);
      currentDate.setDate(startObj.getDate() + i);
      const dayOfWeek = currentDate.getDay();
      newDateHeaders.push({
        date: currentDate,
        display: formatDateDisplay(currentDate),
        dayName: dayNames[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
    setDateHeaders(newDateHeaders);

    // Initialize rows if empty or resize
    // We want to preserve data if possible, but the HTML version regenerates.
    // Let's regenerate for now to keep it simple as per the HTML logic.
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
        // Determine target column based on starting column
        // Columns: 0:num(skip), 1:note, 2:period, 3:hrs, 4+:days
        // type: 'note', 'period', 'hrs', 'day'
        // We need to map the linear column index to our data structure

        let currentType = type;
        let currentDayIndex = -1;

        // Calculate absolute column index of start
        let startAbsCol = 0;
        if (type === "note") startAbsCol = 1;
        else if (type === "period") startAbsCol = 2;
        else if (type === "hrs") startAbsCol = 3;
        else if (type === "day") startAbsCol = 4 + colIndex; // colIndex passed for days is the index in days array

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
    // Simple navigation logic using IDs
    // ID format: cell-{rowIndex}-{colType}-{colIndex}
    // colType: 'note', 'period', 'hrs', 'day'
    // colIndex: only for 'day', otherwise 0

    const getCellId = (r, t, c = 0) => `cell-${r}-${t}-${c}`;

    let nextId = null;
    const maxRows = rows.length;
    const maxDays = numDays;

    // Map column types to an order index for easier left/right nav
    // note(0) -> period(1) -> hrs(2) -> day(0...N)

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
        if (nextType === "day" && nextColIndex >= maxDays) return; // End of row
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
    if (window.confirm("Are you sure you want to clear all data?")) {
      const newRows = rows.map((row) => ({
        ...row,
        note: "",
        period: "",
        hrs: "",
        days: Array(numDays).fill(""),
      }));
      setRows(newRows);
    }
  };

  const handleViewReport = () => {
    if (!dateHeaders.length) {
      alert("Please generate the table first.");
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

    if (periodId) {
      navigate(`/payroll/report/${periodId}`);
    } else {
      navigate("/payroll/report");
    }
  };

  const handleSave = async () => {
    if (!startDate) {
      alert("Please select a start date!");
      return;
    }

    if (!dateHeaders.length) {
      alert("Please generate the table first!");
      return;
    }

    // Prepare entries data
    const entries = rows
      .filter((row) => row.note || row.period || row.hrs || row.days.some((d) => d))
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

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + numDays - 1);
    const timesheetName = `TimeSheet ${formatDateDisplay(
      new Date(startDate)
    )} - ${formatDateDisplay(endDate)}`;

    try {
      setSaving(true);

      if (isEditMode && periodId) {
        // Update existing timesheet
        await timesheetService.updateTimesheet(periodId, {
          start_date: startDate,
          num_days: numDays,
          num_rows: numRows,
          name: timesheetName,
          entries,
        });
        alert("Timesheet updated successfully!");
      } else {
        // Create new timesheet
        const response = await timesheetService.createTimesheet({
          start_date: startDate,
          num_days: numDays,
          num_rows: numRows,
          name: timesheetName,
          entries,
        });
        setPeriodId(response.period_id);
        setIsEditMode(true);
        alert("Timesheet saved successfully!");
        // Update URL to edit mode
        navigate(`/payroll/time-sheet/${response.period_id}`, { replace: true });
      }
    } catch (error) {
      console.error("Error saving timesheet:", error);
      alert(
        error.response?.data?.error || "Failed to save timesheet. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
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
                  disabled={isEditMode}
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
                  className="btn-action btn-generate"
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
              <div className="btn-group" style={{ marginTop: 0 }}>
                <button
                  type="button"
                  className="btn-action btn-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : isEditMode
                    ? "💾 Update"
                    : "💾 Save"}
                </button>
                <button
                  type="button"
                  className="btn-action btn-clear"
                  onClick={clearData}
                >
                  Clear Data
                </button>
                <button
                  type="button"
                  className="btn-action btn-transform"
                  onClick={handleViewReport}
                >
                  View Report
                </button>
              </div>
            </div>

        <div className="info-box">
          <strong>💡 Instructions:</strong>
          <ul>
            <li>
              <strong>Copy/Paste from Excel:</strong> Select data in Excel
              (multiple cells) → Ctrl+C → Click first cell in table → Ctrl+V
            </li>
            <li>
              <strong>Navigation:</strong> Use Arrow keys ↑ ↓ ← → to move
              between cells
            </li>
            <li>
              <strong>Tab/Enter:</strong> Tab to move right, Enter to move down
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
                <th key={index} className={header.isWeekend ? "weekend" : ""}>
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
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, 0, "note")}
                  />
                </td>
                <td>
                  <input
                    id={`cell-${rowIndex}-period-0`}
                    type="text"
                    value={row.period}
                    onChange={(e) =>
                      handleInputChange(rowIndex, "period", e.target.value)
                    }
                    onPaste={(e) => handlePaste(e, rowIndex, 0, "period")}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, 0, "period")}
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
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, 0, "hrs")}
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
                      onPaste={(e) => handlePaste(e, rowIndex, dayIndex, "day")}
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

export default TimeSheet;
