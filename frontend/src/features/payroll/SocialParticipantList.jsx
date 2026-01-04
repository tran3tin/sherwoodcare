import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import socialSheetService from "../../services/socialSheetService";
import "../../assets/styles/list.css";

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
          "Failed to load social sheets"
      );
    } finally {
      setLoading(false);
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
        title="Social Participant List"
        breadcrumb={["Home", "Payroll", "Social Participant List"]}
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
        title="Social Participant List"
        breadcrumb={["Home", "Payroll", "Social Participant List"]}
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
    <Layout
      title="Social Participant List"
      breadcrumb={["Home", "Payroll", "Social Participant List"]}
    >
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
                    <td>{s.participant_count || 0}</td>
                    <td>{s.activity_count || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() =>
                            navigate(
                              `/payroll/social-participant-report/${s.sheet_id}`
                            )
                          }
                          title="View Report"
                          aria-label="View Report"
                        >
                          <i className="fas fa-chart-bar"></i>
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
