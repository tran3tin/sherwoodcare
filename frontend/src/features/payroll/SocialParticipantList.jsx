import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import socialSheetService from "../../services/socialSheetService";
import "../../assets/styles/list.css";

// Format yyyy-mm-dd to dd/mm/yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const datePart = String(dateStr).split("T")[0];
  const parts = datePart.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const SocialParticipantList = () => {
  const navigate = useNavigate();

  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await socialSheetService.fetchSheets();
      setSheets(response.data || []);
    } catch (err) {
      console.error("Error loading social sheets:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to load social sheets",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sheetId, sheetName) => {
    const confirmMsg = sheetName
      ? `Are you sure you want to delete "${sheetName}"?`
      : "Are you sure you want to delete this social sheet?";

    if (!window.confirm(confirmMsg)) return;

    try {
      await socialSheetService.deleteSheet(sheetId);
      setSheets((prev) => prev.filter((s) => s.sheet_id !== sheetId));
      toast.success("Social sheet deleted.", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Error deleting social sheet:", err);
      toast.error(
        err.response?.data?.error || "Failed to delete social sheet",
        {
          position: "top-right",
          autoClose: 5000,
        },
      );
    }
  };

  const filteredSheets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sheets;

    return sheets.filter((s) => {
      const name = String(s.name || "").toLowerCase();
      const id = String(s.sheet_id || "").toLowerCase();
      return name.includes(term) || id.includes(term);
    });
  }, [sheets, searchTerm]);

  if (loading) {
    return (
      <Layout
        title="Social List"
        breadcrumb={["Home", "Payroll", "Social List"]}
      >
        <div className="list-page-container">
          <div className="loading-state">
            <i className="fas fa-spinner"></i>
            <p>Loading social sheets...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Social List"
        breadcrumb={["Home", "Payroll", "Social List"]}
      >
        <div className="list-page-container">
          <div className="empty-state">
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <button
              type="button"
              className="btn-create-first"
              onClick={loadSheets}
            >
              <i className="fas fa-redo"></i>
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Social List" breadcrumb={["Home", "Payroll", "Social List"]}>
      <div className="list-page-container">
        <div className="list-page-header">
          <div className="list-filters">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>&nbsp;</label>
              <button
                type="button"
                className="btn-create-new"
                onClick={() => navigate("/payroll/social-sheet")}
              >
                <i className="fas fa-plus"></i>
                Create
              </button>
            </div>
          </div>
        </div>

        {sheets.length === 0 ? (
          <div className="empty-state">
            <h3>No Data</h3>
            <p>No saved social sheets yet.</p>
            <button
              type="button"
              className="btn-create-first"
              onClick={() => navigate("/payroll/social-sheet")}
            >
              <i className="fas fa-plus"></i>
              Create Your First Social Sheet
            </button>
          </div>
        ) : filteredSheets.length === 0 ? (
          <div className="empty-state">
            <h3>No Results Found</h3>
            <p>No social sheets match your search criteria.</p>
            <button
              type="button"
              className="btn-clear-filter"
              onClick={() => setSearchTerm("")}
            >
              <i className="fas fa-redo"></i>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="list-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sheet</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Participants</th>
                  <th>Activities</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSheets.map((s, index) => (
                  <tr key={s.sheet_id}>
                    <td>{index + 1}</td>
                    <td>{s.name || `Social Sheet #${s.sheet_id}`}</td>
                    <td>{formatDate(s.start_date)}</td>
                    <td>{formatDate(s.end_date)}</td>
                    <td>{s.participant_count || 0}</td>
                    <td>{s.activity_count || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() =>
                            navigate(`/payroll/social-sheet/${s.sheet_id}`)
                          }
                          title="View"
                          aria-label="View"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() =>
                            navigate(`/payroll/social-sheet/edit/${s.sheet_id}`)
                          }
                          title="Edit"
                          aria-label="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() =>
                            handleDelete(
                              s.sheet_id,
                              s.name || `Social Sheet #${s.sheet_id}`,
                            )
                          }
                          title="Delete"
                          aria-label="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SocialParticipantList;
