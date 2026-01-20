import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import socialSheetService from "../../services/socialSheetService";
import { employeeService } from "../../services/employeeService";
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

const splitName = (fullName) => {
  if (!fullName) return { firstName: "", lastName: "" };
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
};

const formatDateToDisplay = (dateStr) => {
  if (!dateStr) return "";

  // Clean string
  const dStr = String(dateStr).trim();

  // Check if in dd/mm/yy or dd/mm/yyyy
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dStr)) {
    const parts = dStr.split("/");
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    return `${parts[0]}/${parts[1]}/${year}`;
  }

  // Check if already in dd/mm/yyyy (legacy stricter check check)
  // if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) return dateStr;

  // Try yyyy-mm-dd
  const parts = dStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dStr;
};

const getPayrollCategory = (level, dateStr, timeStr) => {
  if (!level) return "";

  // Parse Date
  let dateObj = null;
  const dStr = String(dateStr || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
    // yyyy-mm-dd
    const [y, m, d] = dStr.split("-").map(Number);
    dateObj = new Date(y, m - 1, d);
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dStr)) {
    // dd/mm/yyyy
    const [d, m, y] = dStr.split("/").map(Number);
    dateObj = new Date(y, m - 1, d);
  }

  if (!dateObj || isNaN(dateObj.getTime())) return level;

  const day = dateObj.getDay(); // 0 = Sun, 6 = Sat

  if (day === 0) return `${level} - Sun`;
  if (day === 6) return `${level} - Sat`;

  // Weekday logic
  const normalizedTime = String(timeStr || "")
    .trim()
    .toLowerCase();
  const match = normalizedTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);

  // If time can't be parsed, default to level
  if (!match) return level;

  let hours = parseInt(match[1], 10);
  const meridiem = match[3]?.toLowerCase();

  // Convert to 24-hour format
  if (meridiem === "pm" && hours !== 12) {
    hours += 12;
  } else if (meridiem === "am" && hours === 12) {
    hours = 0;
  }

  // 12:00 to 18:00 -> Level - Afternoon
  if (hours >= 12 && hours <= 18) {
    return `${level} - Afternoon`;
  }

  // 6:00 to 11:59 (implicit else if morning) -> Level
  return level;
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
  const [employees, setEmployees] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manualMappings, setManualMappings] = useState({});

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const result = await employeeService.getAll();
        setEmployees(result.data || result || []);
      } catch (error) {
        console.error("Error loading employees:", error);
      }
    };
    loadEmployees();
  }, []);

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

  const getEffectiveEmployee = (groupName) => {
    // 1. Manual override
    if (manualMappings[groupName]) return manualMappings[groupName];

    // 2. Fuzzy match
    const normalized = groupName.trim().toLowerCase(); // groupName is from rawRows (Excel)
    const exact = employees.find((e) => {
      // Construct employee full name
      const n = `${e.first_name || ""} ${e.last_name || ""}`
        .trim()
        .toLowerCase();
      return n === normalized;
    });
    if (exact) return exact;

    // 3. Fallback split match
    const { firstName, lastName } = splitName(groupName);
    return employees.find(
      (e) =>
        (e.first_name || "").toLowerCase() === firstName.toLowerCase() &&
        (e.last_name || "").toLowerCase() === lastName.toLowerCase(),
    );
  };

  const handleEmployeeChange = (groupName, employeeId) => {
    const emp = employees.find(
      (e) => String(e.employee_id) === String(employeeId),
    );
    setManualMappings((prev) => ({
      ...prev,
      [groupName]: emp,
    }));
  };

  const handleExportExcel = () => {
    if (!employeeGroups || employeeGroups.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const exportData = [];

    // Flatten the grouped data
    employeeGroups.forEach((group) => {
      // Use effective employee for names if available, else fallback to group name
      const effEmp = getEffectiveEmployee(group.employee);

      let wFirst, wLast;
      if (effEmp) {
        wFirst = effEmp.first_name || "";
        wLast = effEmp.last_name || "";
      } else {
        const split = splitName(group.employee);
        wFirst = split.firstName;
        wLast = split.lastName;
      }

      group.activities.forEach((activity) => {
        const { firstName: pFirst, lastName: pLast } = splitName(
          activity.participant,
        );

        let details = activity.details_of_activity || "";
        if (details.length > 50) {
          details = details.substring(0, 50) + "...";
        }

        exportData.push({
          "Worker's Last Name": wLast,
          "Worker's First Name": wFirst,
          Date: formatDateToDisplay(activity.date),
          "Participants's Last Name": pLast,
          "Participants's First Name": pFirst,
          "Shift Starts": activity.shift_starts,
          "Shift Ends": activity.shift_ends,
          "Actual Hours": activity.actual_hours,
          "Details of activity": details,
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

  const handleExportTxt = () => {
    if (!employeeGroups || employeeGroups.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const headers = [
      "Employee Co./Last Name",
      "Employee First Name",
      "Payroll Category",
      "Job",
      "Customer Co./Last Name",
      "Customer First Name",
      "Notes",
      "Date",
      "Units",
      "Employee Card ID",
      "Employee Record ID",
      "Start/Stop Time",
      "Customer Card ID",
      "Customer Record ID",
    ];

    const lines = [headers.join("\t")];

    employeeGroups.forEach((group) => {
      const effEmp = getEffectiveEmployee(group.employee);

      let wFirst, wLast;
      if (effEmp) {
        wFirst = effEmp.first_name || "";
        wLast = effEmp.last_name || "";
      } else {
        const split = splitName(group.employee);
        wFirst = split.firstName;
        wLast = split.lastName;
      }

      const socialLevel = effEmp?.social_level || "";

      group.activities.forEach((activity) => {
        const { firstName: pFirst, lastName: pLast } = splitName(
          activity.participant,
        );

        const category = getPayrollCategory(
          socialLevel,
          activity.date,
          activity.shift_starts,
        );
        const displayDate = formatDateToDisplay(activity.date);

        let details = activity.details_of_activity || "";
        if (details.length > 50) {
          details = details.substring(0, 50) + "...";
        }

        const row = [
          wLast, // Employee Co./Last Name
          wFirst, // Employee First Name
          category, // Payroll Category
          activity.participant, // Job
          pLast, // Customer Co./Last Name
          pFirst, // Customer First Name
          details, // Notes
          displayDate, // Date
          activity.actual_hours, // Units
          "", // Employee Card ID
          "", // Employee Record ID
          "", // Start/Stop Time
          "", // Customer Card ID
          "", // Customer Record ID
        ];
        lines.push(row.join("\t"));
      });
    });

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Social_Export_${new Date().toISOString().slice(0, 10)}.txt`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              className="btn-action btn-view"
              onClick={handleExportTxt}
              title="Export TXT"
              aria-label="Export TXT"
              disabled={deleting || saving}
            >
              <i className="fas fa-file-alt"></i>
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
                  <th style={{ width: "200px" }}>Worker&apos;s Fullname</th>
                  <th style={{ width: "120px" }}>Worker&apos;s Last Name</th>
                  <th style={{ width: "120px" }}>Worker&apos;s First Name</th>
                  <th style={{ width: "160px" }}>Payroll Category</th>
                  <th style={{ width: "100px" }}>Date</th>
                  <th style={{ width: "120px" }}>
                    Participants&apos;s Last Name
                  </th>
                  <th style={{ width: "120px" }}>
                    Participants&apos;s First Name
                  </th>
                  <th style={{ width: "100px" }}>Shift Starts</th>
                  <th style={{ width: "100px" }}>Shift Ends</th>
                  <th style={{ width: "100px" }}>Actual Hours</th>
                  <th style={{ width: "260px" }}>Details of activity</th>
                </tr>
              </thead>
              <tbody>
                {employeeGroups.map((group) => {
                  /* 
                     We use the effective employee (from selection or auto-match) 
                     to drive the name columns and payroll category
                  */
                  const effEmp = getEffectiveEmployee(group.employee);

                  let wFirst, wLast, socialLevel;
                  if (effEmp) {
                    wFirst = effEmp.first_name || "";
                    wLast = effEmp.last_name || "";
                    socialLevel = effEmp.social_level || "";
                  } else {
                    const split = splitName(group.employee);
                    wFirst = split.firstName;
                    wLast = split.lastName;
                    socialLevel = "";
                  }

                  return group.activities.map((a, idx) => {
                    const { firstName: pFirst, lastName: pLast } = splitName(
                      a.participant,
                    );

                    const category = getPayrollCategory(
                      socialLevel,
                      a.date,
                      a.shift_starts,
                    );
                    const displayDate = formatDateToDisplay(a.date);

                    return (
                      <tr key={`${group.employee}-${a.id ?? idx}-${idx}`}>
                        {idx === 0 && (
                          <>
                            <td rowSpan={group.activities.length}>
                              <select
                                className="table-select"
                                value={effEmp?.employee_id || ""}
                                onChange={(e) =>
                                  handleEmployeeChange(
                                    group.employee,
                                    e.target.value,
                                  )
                                }
                                style={{ width: "100%" }}
                              >
                                <option value="">-- Match Employee --</option>
                                {employees.map((emp) => (
                                  <option
                                    key={emp.employee_id}
                                    value={emp.employee_id}
                                  >
                                    {emp.first_name} {emp.last_name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td rowSpan={group.activities.length}>{wLast}</td>
                            <td rowSpan={group.activities.length}>{wFirst}</td>
                          </>
                        )}
                        <td>{category}</td>
                        <td>{displayDate}</td>
                        <td>{pLast}</td>
                        <td>{pFirst}</td>
                        <td>{a.shift_starts}</td>
                        <td>{a.shift_ends}</td>
                        <td>{a.actual_hours}</td>
                        <td>{a.details_of_activity}</td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
