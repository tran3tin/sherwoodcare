import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import socialSheetService from "../../services/socialSheetService";
import "../../assets/styles/list.css";
import "./TimeSheetForm.css";

const normalizeText = (value) => String(value ?? "").trim();

export default function ViewSocialSheet() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [sheetName, setSheetName] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Layout
        title="View Social Sheet"
        breadcrumb={["Home", "Payroll", "View Social Sheet"]}
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
      title={sheetName}
      breadcrumb={["Home", "Payroll", "Social Participant List", "View"]}
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
            <h2 style={{ margin: 0 }}>{sheetName}</h2>

            <div className="action-buttons" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn-action btn-edit"
                onClick={() => navigate(`/payroll/social-sheet/edit/${id}`)}
                title="Edit"
                aria-label="Edit"
              >
                <i className="fas fa-edit"></i>
              </button>

              <button
                type="button"
                className="btn-action btn-report"
                onClick={() =>
                  navigate(`/payroll/social-participant-report/${id}`)
                }
                title="Participant Report"
                aria-label="Participant Report"
              >
                <i className="fas fa-users"></i>
              </button>

              <button
                type="button"
                className="btn-action btn-view"
                onClick={() =>
                  navigate(`/payroll/social-employee-report/${id}`)
                }
                title="Employee Report"
                aria-label="Employee Report"
              >
                <i className="fas fa-user-tie"></i>
              </button>

              <button
                type="button"
                className="btn-action btn-cancel"
                onClick={() => navigate("/payroll/social-participants")}
                title="Back"
                aria-label="Back"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              <h3>No Data</h3>
              <p>This social sheet is empty.</p>
            </div>
          ) : (
            <table className="timesheet-table" id="viewSocialSheetTable">
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
                    <td className="num-col">{row.id || rowIndex + 1}</td>
                    <td>{normalizeText(row.date)}</td>
                    <td>{normalizeText(row.worker_name)}</td>
                    <td>{normalizeText(row.number_of_participants)}</td>
                    <td>{normalizeText(row.participant_1)}</td>
                    <td>{normalizeText(row.shift_starts)}</td>
                    <td>{normalizeText(row.shift_ends)}</td>
                    <td>{normalizeText(row.actual_hours)}</td>
                    <td>{normalizeText(row.use_own_car)}</td>
                    <td>{normalizeText(row.total_mileage)}</td>
                    <td>{normalizeText(row.details_of_activity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
