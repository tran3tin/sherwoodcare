import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import "../../assets/styles/list.css";
import { API_BASE_WITH_API_PREFIX } from "../../config/api";

// Format yyyy-mm-dd to dd/mm/yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const PayrollNexgenuslist = () => {
  const navigate = useNavigate();

  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadPayrolls();
  }, []);

  const loadPayrolls = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_BASE_WITH_API_PREFIX}/payroll-nexgenus`
      );
      if (!response.ok) {
        throw new Error("Failed to load payrolls");
      }
      const data = await response.json();
      setPayrolls(data || []);
    } catch (err) {
      console.error("Error loading payrolls:", err);
      setError(err.message || "Failed to load payrolls");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (payrollId, startDate) => {
    const confirmMsg = startDate
      ? `Are you sure you want to delete payroll with start date "${formatDate(
          startDate
        )}"?`
      : "Are you sure you want to delete this payroll?";

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(
        `${API_BASE_WITH_API_PREFIX}/payroll-nexgenus/${payrollId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete payroll");
      }

      setPayrolls((prev) => prev.filter((p) => p.id !== payrollId));
      toast.success("Payroll deleted successfully.", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Error deleting payroll:", err);
      toast.error(err.message || "Failed to delete payroll", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const filteredPayrolls = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return payrolls;

    return payrolls.filter((p) => {
      const id = String(p.id || "").toLowerCase();
      const startDate = String(p.start_date || "").toLowerCase();
      return id.includes(term) || startDate.includes(term);
    });
  }, [payrolls, searchTerm]);

  if (loading) {
    return (
      <Layout
        title="Payroll NexGenus List"
        breadcrumb={["Home", "NexGenus", "Payroll List"]}
      >
        <div className="list-page-container">
          <div className="loading-state">
            <i className="fas fa-spinner"></i>
            <p>Loading payrolls...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Payroll NexGenus List"
        breadcrumb={["Home", "NexGenus", "Payroll List"]}
      >
        <div className="list-page-container">
          <div className="empty-state">
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <button
              type="button"
              className="btn-create-first"
              onClick={loadPayrolls}
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
      title="Payroll NexGenus List"
      breadcrumb={["Home", "NexGenus", "Payroll List"]}
    >
      <div className="list-page-container">
        <div className="list-page-header">
          <div className="list-filters">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                className="filter-input"
                placeholder="ID or Date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>&nbsp;</label>
              <button
                type="button"
                className="btn-create-new"
                onClick={() => navigate("/nexgenus/payroll/new")}
              >
                <i className="fas fa-plus"></i>
                Create
              </button>
            </div>
          </div>
        </div>

        {payrolls.length === 0 ? (
          <div className="empty-state">
            <h3>No Data</h3>
            <p>No saved payrolls yet.</p>
            <button
              type="button"
              className="btn-create-first"
              onClick={() => navigate("/nexgenus/payroll/new")}
            >
              <i className="fas fa-plus"></i>
              Create Your First Payroll
            </button>
          </div>
        ) : filteredPayrolls.length === 0 ? (
          <div className="empty-state">
            <h3>No Results Found</h3>
            <p>No payrolls match your search criteria.</p>
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
                  <th>ID</th>
                  <th>Start Date</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.map((p, index) => (
                  <tr key={p.id}>
                    <td>{index + 1}</td>
                    <td>{p.id}</td>
                    <td>{formatDate(p.start_date)}</td>
                    <td>
                      {p.created_at
                        ? new Date(p.created_at).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      {p.updated_at
                        ? new Date(p.updated_at).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => navigate(`/nexgenus/payroll/${p.id}`)}
                          title="View Report"
                          aria-label="View Report"
                        >
                          <i className="fas fa-file-alt"></i>
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() =>
                            navigate(`/nexgenus/payroll/edit/${p.id}`)
                          }
                          title="Edit"
                          aria-label="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(p.id, p.start_date)}
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

export default PayrollNexgenuslist;
