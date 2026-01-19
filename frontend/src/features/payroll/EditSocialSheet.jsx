import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import socialSheetService from "../../services/socialSheetService";
import "../../assets/styles/list.css";
import "./TimeSheetForm.css";

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

  return rows;
};

export default function EditSocialSheet() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [sheetName, setSheetName] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadSheet(id);
    }
  }, [id]);

  const loadSheet = async (sheetId) => {
    try {
      setLoading(true);
      const response = await socialSheetService.fetchSheetById(sheetId);
      const sheet = response.data;
      setSheetName(sheet?.name || `Social Sheet #${sheetId}`);
      setRows(Array.isArray(sheet?.rows) ? sheet.rows : []);
    } catch (e) {
      console.error("Failed to load social sheet:", e);
      toast.error(e?.response?.data?.error || "Failed to load Social Sheet.", {
        position: "top-right",
        autoClose: 4000,
      });
      navigate("/payroll/social-participants");
    } finally {
      setLoading(false);
    }
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

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      await socialSheetService.updateSheet(id, {
        name: sheetName,
        rows,
      });

      toast.success("Social sheet updated successfully.", {
        position: "top-right",
        autoClose: 3000,
      });

      navigate("/payroll/social-participants");
    } catch (error) {
      console.error("Error updating social sheet:", error);
      toast.error(
        error?.response?.data?.error || "Failed to update social sheet.",
        {
          position: "top-right",
          autoClose: 5000,
        },
      );
    } finally {
      setSaving(false);
    }
  };

  const clearData = () => {
    if (!window.confirm("Clear all data?")) return;
    setRows((prev) => prev.map((r) => ({ ...createEmptyRow(r.id), id: r.id })));
    toast.success("Data cleared.", { position: "top-right", autoClose: 2000 });
  };

  if (loading) {
    return (
      <Layout
        title="Edit Social Sheet"
        breadcrumb={["Home", "Payroll", "Edit Social Sheet"]}
      >
        <div className="list-page-container">
          <div className="loading-state">
            <i className="fas fa-spinner"></i>
            <p>Loading social sheet...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`Edit: ${sheetName}`}
      breadcrumb={["Home", "Payroll", "Social Participant List", "Edit"]}
    >
      <div className="timesheet-container">
        <div className="table-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2 style={{ margin: 0 }}>Edit: {sheetName}</h2>

            <div className="action-buttons" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn-action btn-save"
                onClick={handleSave}
                disabled={saving}
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
                className="btn-action btn-cancel"
                onClick={() => navigate("/payroll/social-participants")}
                title="Cancel"
                aria-label="Cancel"
              >
                <i className="fas fa-times"></i>
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

          <table className="timesheet-table" id="editSocialSheetTable">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th style={{ width: "140px" }}>Date</th>
                <th style={{ width: "180px" }}>Worker&apos;s Name</th>
                <th style={{ width: "160px" }}># Participants</th>
                <th style={{ width: "160px" }}>Participant 1</th>
                <th style={{ width: "140px" }}>Shift Starts</th>
                <th style={{ width: "140px" }}>Shift Ends</th>
                <th style={{ width: "120px" }}>Actual Hours</th>
                <th style={{ width: "170px" }}>Use own car?</th>
                <th style={{ width: "130px" }}>Total Mileage</th>
                <th style={{ width: "260px" }}>Details of activity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}>
                  <td className="num-col">
                    <input
                      type="text"
                      value={row.id || rowIndex + 1}
                      readOnly
                    />
                  </td>

                  <td>
                    <textarea
                      id={`cell-${rowIndex}-date`}
                      value={row.date || ""}
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
                      value={row.worker_name || ""}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "worker_name",
                          e.target.value,
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
                      value={row.number_of_participants || ""}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "number_of_participants",
                          e.target.value,
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
                      value={row.participant_1 || ""}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "participant_1",
                          e.target.value,
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
                      value={row.shift_starts || ""}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "shift_starts",
                          e.target.value,
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
                      value={row.shift_ends || ""}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "shift_ends",
                          e.target.value,
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
                      value={row.actual_hours || ""}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "actual_hours",
                          e.target.value,
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
                      value={row.use_own_car || ""}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "use_own_car",
                          e.target.value,
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
                      value={row.total_mileage || ""}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "total_mileage",
                          e.target.value,
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
                      value={row.details_of_activity || ""}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex,
                          "details_of_activity",
                          e.target.value,
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
