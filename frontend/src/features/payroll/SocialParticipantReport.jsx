import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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

const buildParticipantGroups = (rows) => {
  const groups = new Map();

  for (const row of Array.isArray(rows) ? rows : []) {
    const participant = normalizeText(row?.participant_1);
    if (!participant) continue;

    const activity = {
      id: row?.id,
      date: normalizeText(row?.date),
      worker_name: normalizeText(row?.worker_name),
      number_of_participants: normalizeText(row?.number_of_participants),
      shift_starts: normalizeText(row?.shift_starts),
      shift_ends: normalizeText(row?.shift_ends),
      actual_hours: normalizeText(row?.actual_hours),
      use_own_car: normalizeText(row?.use_own_car),
      total_mileage: normalizeText(row?.total_mileage),
      details_of_activity: normalizeText(row?.details_of_activity),
    };

    if (!groups.has(participant)) groups.set(participant, []);
    groups.get(participant).push(activity);
  }

  return groups;
};

export default function SocialParticipantReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [rawRows, setRawRows] = useState([]);
  const [participantFilter, setParticipantFilter] = useState("");
  const [sortDir, setSortDir] = useState("asc");

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
            }
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
            }
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

  const participantGroups = useMemo(() => {
    const groups = buildParticipantGroups(rawRows);
    const term = normalizeText(participantFilter).toLowerCase();

    let participants = Array.from(groups.keys());

    if (term) {
      participants = participants.filter((p) => p.toLowerCase().includes(term));
    }

    participants.sort((a, b) => {
      const cmp = a.localeCompare(b);
      return sortDir === "desc" ? -cmp : cmp;
    });

    const ordered = participants.map((p) => ({
      participant: p,
      activities: (groups.get(p) || []).slice().sort((x, y) => {
        // Best-effort sort: date then worker_name
        const d = x.date.localeCompare(y.date);
        if (d !== 0) return d;
        return x.worker_name.localeCompare(y.worker_name);
      }),
    }));

    return ordered;
  }, [rawRows, participantFilter, sortDir]);

  const totalActivities = useMemo(() => {
    return participantGroups.reduce((sum, g) => sum + g.activities.length, 0);
  }, [participantGroups]);

  return (
    <Layout
      title="Social Participant Report"
      breadcrumb={["Home", "Payroll", "Social Participant Report"]}
    >
      <div className="timesheet-container">
        <div className="date-config">
          <h3>📋 Social Participant Report</h3>
          <div className="input-group">
            <div className="input-field" style={{ minWidth: 260 }}>
              <label htmlFor="participantFilter">Participant:</label>
              <input
                id="participantFilter"
                type="text"
                placeholder="Type participant name..."
                value={participantFilter}
                onChange={(e) => setParticipantFilter(e.target.value)}
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
            Participants: <strong>{participantGroups.length}</strong> —
            Activities: <strong>{totalActivities}</strong>
          </div>
        </div>

        <div className="table-container">
          {participantGroups.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              <h3>No Data</h3>
              <p>No rows with Participant found.</p>
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
            <table
              className="timesheet-table"
              id="socialParticipantReportTable"
            >
              <thead>
                <tr>
                  <th style={{ width: "220px" }}>Participant</th>
                  <th style={{ width: "140px" }}>Date</th>
                  <th style={{ width: "180px" }}>Worker&apos;s Name</th>
                  <th style={{ width: "160px" }}># Participants</th>
                  <th style={{ width: "140px" }}>Shift Starts</th>
                  <th style={{ width: "140px" }}>Shift Ends</th>
                  <th style={{ width: "120px" }}>Actual Hours</th>
                  <th style={{ width: "170px" }}>Use own car?</th>
                  <th style={{ width: "130px" }}>Total Mileage</th>
                  <th style={{ width: "260px" }}>Details of activity</th>
                </tr>
              </thead>
              <tbody>
                {participantGroups.map((group) => {
                  return group.activities.map((a, idx) => (
                    <tr key={`${group.participant}-${a.id ?? idx}-${idx}`}>
                      <td>{idx === 0 ? group.participant : ""}</td>
                      <td>{a.date}</td>
                      <td>{a.worker_name}</td>
                      <td>{a.number_of_participants}</td>
                      <td>{a.shift_starts}</td>
                      <td>{a.shift_ends}</td>
                      <td>{a.actual_hours}</td>
                      <td>{a.use_own_car}</td>
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
