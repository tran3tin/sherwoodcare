import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import socialSheetService from "../../services/socialSheetService";
import "../../assets/styles/list.css";
import "./TimeSheetForm.css";

const DRAFT_KEY = "socialSheetDraft:new";

const normalizeText = (value) => String(value ?? "").trim();

const parseDraftRows = (draft) => {
  if (!draft) return [];

  // Support either { rows: [...] } or a raw array
  if (Array.isArray(draft)) return draft;
  if (Array.isArray(draft.rows)) return draft.rows;

  return [];
};

const getSessionFromTime = (timeStr) => {
  if (!timeStr) return "";

  const normalized = normalizeText(timeStr).toLowerCase();
  const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return "";

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2] || "0", 10);
  const meridiem = match[3]?.toLowerCase();

  // Convert to 24-hour format
  if (meridiem === "pm" && hours !== 12) {
    hours += 12;
  } else if (meridiem === "am" && hours === 12) {
    hours = 0;
  }

  // Morning: 6am (6:00) to before 6pm (17:59)
  // Night: 6pm (18:00) to before 6am (5:59)
  if (hours >= 6 && hours < 18) {
    return "Morning";
  } else {
    return "Night";
  }
};

const calculatePayableHours = (actualHoursStr) => {
  const actual = parseFloat(actualHoursStr);
  if (!Number.isFinite(actual)) return "";

  const bonus = actual >= 2 ? 0.25 : 0.15;
  const payable = actual + bonus;
  return payable.toFixed(2);
};

const buildEmployeeGroups = (rows) => {
  const groups = new Map();

  for (const row of Array.isArray(rows) ? rows : []) {
    const employee = normalizeText(row?.worker_name);
    if (!employee) continue;

    const activity = {
      id: row?.id,
      date: normalizeText(row?.date),
      participant: normalizeText(row?.participant_1),
      number_of_participants: normalizeText(row?.number_of_participants),
      shift_starts: normalizeText(row?.shift_starts),
      shift_ends: normalizeText(row?.shift_ends),
      actual_hours: normalizeText(row?.actual_hours),
      total_mileage: normalizeText(row?.total_mileage),
      details_of_activity: normalizeText(row?.details_of_activity),
    };

    if (!groups.has(employee)) groups.set(employee, []);
    groups.get(employee).push(activity);
  }

  return groups;
};

export default function SocialEmployeeReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [rawRows, setRawRows] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    if (id) {
      navigate("/payroll/social-participants");
    } else {
      navigate("/payroll/social-sheet");
    }
  };

  const handleDelete = async () => {
    if (deleting) return;

    const confirmed = window.confirm(
      "Delete this social sheet? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      setDeleting(true);

      if (id) {
        await socialSheetService.deleteSheet(id);
        toast.success("Social sheet deleted.", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/payroll/social-participants");
      } else {
        localStorage.removeItem(DRAFT_KEY);
        toast.success("Draft data cleared.", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/payroll/social-sheet");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(error?.response?.data?.error || "Failed to delete.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleExportExcel = () => {
    if (!employeeGroups || employeeGroups.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const exportData = [];

    // Flatten the grouped data
    employeeGroups.forEach((group) => {
      group.activities.forEach((activity) => {
        exportData.push({
          "Worker's Name": group.employee,
          Date: activity.date,
          Participant: activity.participant,
          "# Participants": activity.number_of_participants,
          "Shift Starts": activity.shift_starts,
          "Shift Ends": activity.shift_ends,
          Session: getSessionFromTime(activity.shift_starts),
          "Actual Hours": activity.actual_hours,
          "Total Mileage": activity.total_mileage,
          "Details of activity": activity.details_of_activity,
        });
      });
    });

    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-width columns
      const colWidths = Object.keys(exportData[0]).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Social Employee Report");

      const fileName = id
        ? `Social_Employee_Report_${id}.xlsx`
        : `Social_Employee_Report_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;

      XLSX.writeFile(wb, fileName);
      toast.success("Export successful");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export Excel");
    }
  };

  const handleSave = async () => {
    if (saving || deleting) return;
    if (!rawRows || rawRows.length === 0) {
      toast.warning("No data to save.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      if (id) {
        toast.info("Report is already saved in database.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const defaultName = `Social Sheet ${new Date()
        .toLocaleDateString()
        .replace(/\//g, "-")}`;
      const name = window.prompt(
        "Enter name for this Social Sheet:",
        defaultName,
      );

      if (!name) return; // User cancelled

      setSaving(true);

      await socialSheetService.createSheet({
        name,
        rows: rawRows,
      });

      localStorage.removeItem(DRAFT_KEY);

      toast.success("Social sheet saved successfully.", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/payroll/social-participants");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error(error?.response?.data?.error || "Failed to save.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    // Priority: navigation state -> localStorage draft
    const stateRows = location.state?.rows;
    if (Array.isArray(stateRows)) {
      setRawRows(stateRows);
      return;
    }

    async function load() {
      if (id) {
        try {
          const response = await socialSheetService.fetchSheetById(id);
          const sheet = response.data;
          setRawRows(Array.isArray(sheet?.rows) ? sheet.rows : []);
          return;
        } catch (e) {
          console.error("Failed to load social sheet:", e);
          toast.error(
            e?.response?.data?.error ||
              "Failed to load Social Sheet from database.",
            {
              position: "top-right",
              autoClose: 4000,
            },
          );
          setRawRows([]);
          return;
        }
      }

      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) {
          toast.warning(
            "No Social Sheet data found. Please fill Social Sheet first.",
            {
              position: "top-right",
              autoClose: 3500,
            },
          );
          setRawRows([]);
          return;
        }

        const parsed = JSON.parse(raw);
        setRawRows(parseDraftRows(parsed));
      } catch (e) {
        console.error("Failed to load social sheet draft:", e);
        toast.error("Failed to load Social Sheet data.", {
          position: "top-right",
          autoClose: 4000,
        });
        setRawRows([]);
      }
    }

    load();
  }, [location.state, id]);

  const employeeGroups = useMemo(() => {
    const groups = buildEmployeeGroups(rawRows);
    const term = normalizeText(employeeFilter).toLowerCase();

    let employees = Array.from(groups.keys());

    if (term) {
      employees = employees.filter((e) => e.toLowerCase().includes(term));
    }

    employees.sort((a, b) => {
      const cmp = a.localeCompare(b);
      return sortDir === "desc" ? -cmp : cmp;
    });

    const ordered = employees.map((e) => ({
      employee: e,
      activities: (groups.get(e) || []).slice().sort((x, y) => {
        // Best-effort sort: date then participant
        const d = x.date.localeCompare(y.date);
        if (d !== 0) return d;
        return x.participant.localeCompare(y.participant);
      }),
    }));

    return ordered;
  }, [rawRows, employeeFilter, sortDir]);

  const totalActivities = useMemo(() => {
    return employeeGroups.reduce((sum, g) => sum + g.activities.length, 0);
  }, [employeeGroups]);

  return (
    <Layout
      title="Social Employee Report"
      breadcrumb={["Home", "Payroll", "Social Employee Report"]}
    >
      <div className="timesheet-container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h2 style={{ margin: 0 }}>Social Employee Report</h2>
          <div className="action-buttons">
            <button
              type="button"
              className="btn-action btn-save"
              onClick={handleSave}
              title="Save"
              aria-label="Save"
              disabled={deleting || saving}
            >
              <i className="fas fa-save"></i>
            </button>

            <button
              type="button"
              className="btn-action btn-view"
              onClick={handleExportExcel}
              title="Export Excel"
              aria-label="Export Excel"
              disabled={deleting || saving}
            >
              <i className="fas fa-file-excel"></i>
            </button>

            <button
              type="button"
              className="btn-action btn-cancel"
              onClick={handleBack}
              title="Back"
              aria-label="Back"
              disabled={deleting || saving}
            >
              <i className="fas fa-arrow-left"></i>
            </button>

            <button
              type="button"
              className="btn-action btn-delete"
              onClick={handleDelete}
              title={id ? "Delete Social Sheet" : "Clear Draft Data"}
              aria-label={id ? "Delete Social Sheet" : "Clear Draft Data"}
              disabled={deleting || saving}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div className="date-config">
          <h3>📋 Social Employee Report</h3>
          <div className="input-group">
            <div className="input-field" style={{ minWidth: 260 }}>
              <label htmlFor="employeeFilter">Worker&apos;s Name:</label>
              <input
                id="employeeFilter"
                type="text"
                placeholder="Type worker name..."
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="ts-btn ts-btn-generate"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              title="Toggle sort"
            >
              Sort: {sortDir === "asc" ? "A→Z" : "Z→A"}
            </button>

            <button
              type="button"
              className="ts-btn ts-btn-generate"
              onClick={() => navigate("/payroll/social-sheet")}
            >
              Back to Social Sheet
            </button>
          </div>

          <div style={{ marginTop: 10, opacity: 0.9 }}>
            Employees: <strong>{employeeGroups.length}</strong> — Activities:{" "}
            <strong>{totalActivities}</strong>
          </div>
        </div>

        <div className="table-container">
          {employeeGroups.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              <h3>No Data</h3>
              <p>No rows with Worker&apos;s Name found.</p>
              <button
                type="button"
                className="btn-create-first"
                onClick={() => navigate("/payroll/social-sheet")}
              >
                <i className="fas fa-arrow-left"></i>
                Go to Social Sheet
              </button>
            </div>
          ) : (
            <table className="timesheet-table" id="socialEmployeeReportTable">
              <thead>
                <tr>
                  <th style={{ width: "220px" }}>Worker&apos;s Name</th>
                  <th style={{ width: "140px" }}>Date</th>
                  <th style={{ width: "180px" }}>Participant</th>
                  <th style={{ width: "160px" }}># Participants</th>
                  <th style={{ width: "140px" }}>Shift Starts</th>
                  <th style={{ width: "140px" }}>Shift Ends</th>
                  <th style={{ width: "120px" }}>Session</th>
                  <th style={{ width: "120px" }}>Actual Hours</th>
                  <th style={{ width: "130px" }}>Total Mileage</th>
                  <th style={{ width: "260px" }}>Details of activity</th>
                </tr>
              </thead>
              <tbody>
                {employeeGroups.map((group) => {
                  return group.activities.map((a, idx) => (
                    <tr key={`${group.employee}-${a.id ?? idx}-${idx}`}>
                      {idx === 0 && (
                        <td rowSpan={group.activities.length}>
                          {group.employee}
                        </td>
                      )}
                      <td>{a.date}</td>
                      <td>{a.participant}</td>
                      <td>{a.number_of_participants}</td>
                      <td>{a.shift_starts}</td>
                      <td>{a.shift_ends}</td>
                      <td>{getSessionFromTime(a.shift_starts)}</td>
                      <td>{a.actual_hours}</td>
                      <td>{a.total_mileage}</td>
                      <td>{a.details_of_activity}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
