import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import socialSheetService from "../../services/socialSheetService";
import "../../assets/styles/list.css";
import "./TimeSheetForm.css";

const DEFAULT_ROWS = 100;

const createEmptyRow = (id) => ({
  id,
  date: "",
  worker_name: "",
  number_of_participants: "",
  participant_1: "",
  shift_starts: "",
  shift_ends: "",
  actual_hours: "",
  use_own_car: "",
  total_mileage: "",
  details_of_activity: "",
});

// Convert yyyy-mm-dd to dd/mm/yyyy
const formatDateToDisplay = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// Convert dd/mm/yyyy to yyyy-mm-dd
const formatDateToISO = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return null;
};

// Validate dd/mm/yyyy format
const isValidDateFormat = (dateStr) => {
  if (!dateStr) return true;
  const regex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;
  return regex.test(dateStr);
};

// Parse Excel clipboard data handling quotes and newlines
const parseClipboardData = (str) => {
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
    } else {
      if (c === '"') {
        inQuote = true;
      } else if (c === '\t') {
        row.push(cell);
        cell = "";
      } else if (c === '\n' || (c === '\r' && next === '\n')) {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
        if (c === '\r') i++;
      } else if (c === '\r') {
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

  return rows;
};

export default function SocialSheetForm() {
  const navigate = useNavigate();

  const [numRows, setNumRows] = useState(DEFAULT_ROWS);
  const [rows, setRows] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const DRAFT_KEY = "socialSheetDraft:new";

  const saveDraft = (nextRows, nextNumRows, nextStartDate, nextEndDate) => {
    try {
      const payload = {
        numRows: nextNumRows,
        rows: nextRows,
        startDate: nextStartDate,
        endDate: nextEndDate,
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  };

  const tryRestoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return false;
      const draft = JSON.parse(raw);
      if (!draft || !Array.isArray(draft.rows)) return false;

      const restoredNumRows = Number.isFinite(Number(draft.numRows))
        ? parseInt(draft.numRows, 10)
        : DEFAULT_ROWS;

      setNumRows(restoredNumRows);
      setRows(draft.rows);
      setStartDate(draft.startDate || "");
      setEndDate(draft.endDate || "");
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const restored = tryRestoreDraft();
    if (!restored) generateTable(DEFAULT_ROWS);
  }, []);

  useEffect(() => {
    if (!Array.isArray(rows) || rows.length === 0) return;
    const handle = window.setTimeout(() => {
      saveDraft(rows, numRows, startDate, endDate);
    }, 200);
    return () => window.clearTimeout(handle);
  }, [rows, numRows, startDate, endDate]);

  const generateTable = (rowCount = numRows) => {
    const count = Number.isFinite(Number(rowCount))
      ? parseInt(rowCount, 10)
      : 0;
    if (!Number.isFinite(count) || count <= 0) {
      toast.warning("Rows must be greater than 0", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const newRows = [];
    for (let r = 1; r <= count; r++) {
      newRows.push(createEmptyRow(r));
    }
    setRows(newRows);
  };

  const handleInputChange = (rowIndex, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [field]: value };
      return next;
    });
  };

  const handlePaste = (e, rowIndex, colIndex, field) => {
    e.preventDefault();

    const clipboardText = e.clipboardData.getData("text");
    let pastedRows = parseClipboardData(clipboardText);

    // Remove trailing empty row if exists (common from Excel copy)
    if (
      pastedRows.length > 0 &&
      pastedRows[pastedRows.length - 1].length === 1 &&
      pastedRows[pastedRows.length - 1][0] === ""
    ) {
      pastedRows.pop();
    }

    const columns = [
      "date",
      "worker_name",
      "number_of_participants",
      "participant_1",
      "shift_starts",
      "shift_ends",
      "actual_hours",
      "use_own_car",
      "total_mileage",
      "details_of_activity",
    ];

    const startAbsCol = columns.indexOf(field);
    if (startAbsCol < 0) return;

    setRows((prev) => {
      const next = [...prev];

      pastedRows.forEach((rowData, rOffset) => {
        const targetRowIndex = rowIndex + rOffset;
        if (targetRowIndex >= next.length) return;

        rowData.forEach((cellData, cOffset) => {
          const targetAbsCol = startAbsCol + cOffset;
          if (targetAbsCol >= columns.length) return;

          const targetField = columns[targetAbsCol];
          // We don't trim internal newlines, but we might want to trim surrounding spaces
          // However, for strict fidelity, maybe just use cellData as is.
          // The previous code did .trim(), I'll keep it but it might remove desired leading/trailing whitespace.
          // Actually, let's just trim for now to be safe with stray spaces.
          const raw = (cellData ?? "").trim();

          next[targetRowIndex] = {
            ...next[targetRowIndex],
            [targetField]: raw,
          };
        });
      });

      return next;
    });
  };

  const handleKeyDown = (e, rowIndex, colIndex, field) => {
    const columns = [
      "date",
      "worker_name",
      "number_of_participants",
      "participant_1",
      "shift_starts",
      "shift_ends",
      "actual_hours",
      "use_own_car",
      "total_mileage",
      "details_of_activity",
    ];

    const getCellId = (r, cField) => `cell-${r}-${cField}`;

    const currentCol = columns.indexOf(field);
    if (currentCol < 0) return;

    let nextId = null;

    if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      if (rowIndex < rows.length - 1) nextId = getCellId(rowIndex + 1, field);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (rowIndex > 0) nextId = getCellId(rowIndex - 1, field);
    } else if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      const nextCol = currentCol + 1;
      if (nextCol < columns.length)
        nextId = getCellId(rowIndex, columns[nextCol]);
    } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      const prevCol = currentCol - 1;
      if (prevCol >= 0) nextId = getCellId(rowIndex, columns[prevCol]);
    }

    if (nextId) {
      const el = document.getElementById(nextId);
      if (el) el.focus();
    }
  };

  const clearData = () => {
    if (!window.confirm("Clear all data?")) return;
    setRows((prev) => {
      const cleared = prev.map((r) => ({ ...createEmptyRow(r.id), id: r.id }));
      saveDraft(cleared, numRows, startDate, endDate);
      return cleared;
    });
    toast.success("Data cleared.", { position: "top-right", autoClose: 2000 });
  };

  const handleSave = async () => {
    try {
      const payloadRows = Array.isArray(rows) ? rows : [];
      if (payloadRows.length === 0) {
        toast.warning("No data to save.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Validate date formats
      if (startDate && !isValidDateFormat(startDate)) {
        toast.error("Invalid Start Date format. Use dd/mm/yyyy", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (endDate && !isValidDateFormat(endDate)) {
        toast.error("Invalid End Date format. Use dd/mm/yyyy", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const name = `Social Sheet ${new Date().toLocaleDateString()}`;
      const response = await socialSheetService.createSheet({
        name,
        start_date: formatDateToISO(startDate),
        end_date: formatDateToISO(endDate),
        rows: payloadRows,
      });

      toast.success("Social sheet saved to database.", {
        position: "top-right",
        autoClose: 3000,
      });

      // Keep draft (for View Report draft mode), but navigate to list page.
      if (response?.sheet_id) {
        try {
          localStorage.setItem(
            "socialSheetLastSavedId",
            String(response.sheet_id)
          );
        } catch {
          // ignore
        }
      }

      navigate("/payroll/social-participants");
    } catch (error) {
      console.error("Error saving social sheet:", error);
      toast.error(
        error?.response?.data?.error || "Failed to save social sheet.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
    }
  };

  const handleViewReport = () => {
    navigate("/payroll/social-participant-report");
  };

  return (
    <Layout
      title="Social Sheet"
      breadcrumb={["Home", "Payroll", "Social Sheet"]}
    >
      <div className="timesheet-container">
        <div className="date-config">
          <h3>⚙️ Social Sheet Configuration</h3>
          <div className="input-group">
            <div className="input-field">
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="text"
                id="startDate"
                placeholder="dd/mm/yyyy"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="input-field">
              <label htmlFor="endDate">End Date:</label>
              <input
                type="text"
                id="endDate"
                placeholder="dd/mm/yyyy"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="input-field">
              <label htmlFor="numRows">Rows:</label>
              <input
                type="number"
                id="numRows"
                min="1"
                max="500"
                value={numRows}
                onChange={(e) =>
                  setNumRows(parseInt(e.target.value || "0", 10))
                }
              />
            </div>

            <button
              type="button"
              className="ts-btn ts-btn-generate"
              onClick={() => generateTable(numRows)}
            >
              Generate Table
            </button>
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
            <h2 style={{ margin: 0 }}>Social Sheet</h2>

            <div className="action-buttons" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn-action btn-save"
                onClick={handleSave}
                title="Save"
                aria-label="Save"
              >
                <i className="fas fa-save"></i>
              </button>

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
                (multiple cells) → Ctrl+C → Click first cell in table → Ctrl+V
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

          <table className="timesheet-table" id="socialSheetTable">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th style={{ width: "140px" }}>Date</th>
                <th style={{ width: "180px" }}>Worker&apos;s Name</th>
                <th style={{ width: "160px" }}>Number of Participants</th>
                <th style={{ width: "160px" }}>Participants 1</th>
                <th style={{ width: "140px" }}>Shift Starts</th>
                <th style={{ width: "140px" }}>Shift Ends</th>
                <th style={{ width: "120px" }}>Actual Hours</th>
                <th style={{ width: "170px" }}>Does worker use own car?</th>
                <th style={{ width: "130px" }}>Total Mileage</th>
                <th style={{ width: "260px" }}>Details of activity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.id}>
                  <td className="num-col">
                    <input type="text" value={row.id} readOnly />
                  </td>

                  <td>
                    <textarea
                      id={`cell-${rowIndex}-date`}
                      value={row.date}
                      onChange={(e) =>
                        handleInputChange(rowIndex, "date", e.target.value)
                      }
                      onPaste={(e) => handlePaste(e, rowIndex, 0, "date")}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 0, "date")}
                    />
                  </td>

                  <td>
                    <textarea
                      id={`cell-${rowIndex}-worker_name`}
                      value={row.worker_name}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "worker_name",
                          e.target.value
                        )
                      }
                      onPaste={(e) =>
                        handlePaste(e, rowIndex, 0, "worker_name")
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, rowIndex, 0, "worker_name")
                      }
                    />
                  </td>

                  <td>
                    <textarea
                      id={`cell-${rowIndex}-number_of_participants`}
                      value={row.number_of_participants}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "number_of_participants",
                          e.target.value
                        )
                      }
                      onPaste={(e) =>
                        handlePaste(e, rowIndex, 0, "number_of_participants")
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, rowIndex, 0, "number_of_participants")
                      }
                    />
                  </td>

                  <td>
                    <textarea
                      id={`cell-${rowIndex}-participant_1`}
                      value={row.participant_1}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "participant_1",
                          e.target.value
                        )
                      }
                      onPaste={(e) =>
                        handlePaste(e, rowIndex, 0, "participant_1")
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, rowIndex, 0, "participant_1")
                      }
                    />
                  </td>

                  <td>
                    <textarea
                      id={`cell-${rowIndex}-shift_starts`}
                      value={row.shift_starts}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "shift_starts",
                          e.target.value
                        )
                      }
                      onPaste={(e) =>
                        handlePaste(e, rowIndex, 0, "shift_starts")
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, rowIndex, 0, "shift_starts")
                      }
                    />
                  </td>

                  <td>
                    <textarea
                      id={`cell-${rowIndex}-shift_ends`}
                      value={row.shift_ends}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "shift_ends",
                          e.target.value
                        )
                      }
                      onPaste={(e) => handlePaste(e, rowIndex, 0, "shift_ends")}
                      onKeyDown={(e) =>
                        handleKeyDown(e, rowIndex, 0, "shift_ends")
                      }
                    />
                  </td>

                  <td>
                    <textarea
                      id={`cell-${rowIndex}-actual_hours`}
                      value={row.actual_hours}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "actual_hours",
                          e.target.value
                        )
                      }
                      onPaste={(e) =>
                        handlePaste(e, rowIndex, 0, "actual_hours")
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, rowIndex, 0, "actual_hours")
                      }
                    />
                  </td>

                  <td>
                    <textarea
                      id={`cell-${rowIndex}-use_own_car`}
                      value={row.use_own_car}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "use_own_car",
                          e.target.value
                        )
                      }
                      onPaste={(e) =>
                        handlePaste(e, rowIndex, 0, "use_own_car")
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, rowIndex, 0, "use_own_car")
                      }
                    />
                  </td>

                  <td>
                    <textarea
                      id={`cell-${rowIndex}-total_mileage`}
                      value={row.total_mileage}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "total_mileage",
                          e.target.value
                        )
                      }
                      onPaste={(e) =>
                        handlePaste(e, rowIndex, 0, "total_mileage")
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, rowIndex, 0, "total_mileage")
                      }
                    />
                  </td>

                  <td>
                    <textarea
                      id={`cell-${rowIndex}-details_of_activity`}
                      value={row.details_of_activity}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "details_of_activity",
                          e.target.value
                        )
                      }
                      onPaste={(e) =>
                        handlePaste(e, rowIndex, 0, "details_of_activity")
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, rowIndex, 0, "details_of_activity")
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
