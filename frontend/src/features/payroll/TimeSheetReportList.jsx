import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import timesheetReportService from "../../services/timesheetReportService";
import { toast } from "react-toastify";
import {
  addDaysYMD,
  formatDMYFromYMD,
  formatDateVN,
  normalizeYMD,
} from "../../utils/dateVN";
import "../../assets/styles/list.css";

const TimeSheetReportList = () => {
  const navigate = useNavigate();

  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTimesheets();
  }, []);

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await timesheetReportService.fetchReports();
      setTimesheets(response.data || []);
    } catch (err) {
      console.error("Error loading timesheets:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateEndDate = (startDate, numDays) => {
    const ymd = normalizeYMD(startDate);
    const endYmd = addDaysYMD(ymd, parseInt(numDays, 10) - 1);
    return formatDMYFromYMD(endYmd);
  };

  const getTimesheetLabel = (ts) => {
    const startFormatted = formatDMYFromYMD(ts.start_date);
    const endFormatted = calculateEndDate(ts.start_date, ts.num_days);
    return ts.name || `TimeSheet ${startFormatted} - ${endFormatted}`;
  };

  const handleClearFilter = () => {
    setSearchTerm("");
  };

  const filteredTimesheets = useMemo(() => {
    return timesheets.filter((ts) => {
      if (searchTerm === "") return true;
      const label = getTimesheetLabel(ts).toLowerCase();
      const startDate = formatDMYFromYMD(ts.start_date).toLowerCase();
      return (
        label.includes(searchTerm.toLowerCase()) ||
        startDate.includes(searchTerm.toLowerCase())
      );
    });
  }, [timesheets, searchTerm]);

  const handleDelete = (id, name) => {
    const confirmMsg = name
      ? `Are you sure you want to delete "${name}"?`
      : "Are you sure you want to delete this report?";

    if (!window.confirm(confirmMsg)) return;

    async function performDelete() {
      try {
        await timesheetReportService.deleteReport(id);
        setTimesheets((prev) => prev.filter((ts) => ts.report_id !== id));
        toast.success("Report deleted.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (err) {
        console.error("Error deleting report:", err);
        toast.error(err.response?.data?.error || "Failed to delete report", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }

    performDelete();
  };

  if (loading) {
    return (
      <Layout
        title="Timesheet Reports"
        breadcrumb={["Home", "Payroll", "Reports"]}
      >
        <div className="list-page-container">
          <div className="loading-state">
            <i className="fas fa-spinner"></i>
            <p>Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Timesheet Reports"
        breadcrumb={["Home", "Payroll", "Reports"]}
      >
        <div className="list-page-container">
          <div className="empty-state">
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <button
              type="button"
              className="btn-create-first"
              onClick={loadTimesheets}
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
      title="Timesheet Reports"
      breadcrumb={["Home", "Payroll", "Reports"]}
    >
      <div className="list-page-container">
        <div className="list-page-header">
          <div className="list-filters">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Timesheet name, date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>&nbsp;</label>
              <button
                type="button"
                className="btn-create-new"
                onClick={() => navigate("/payroll/time-sheet")}
              >
                <i className="fas fa-plus"></i>
                Create
              </button>
            </div>
          </div>
        </div>

        {timesheets.length === 0 ? (
          <div className="empty-state">
            <h3>No Data</h3>
            <p>No saved reports yet.</p>
            <button
              type="button"
              className="btn-create-first"
              onClick={() => navigate("/payroll/time-sheet")}
            >
              <i className="fas fa-plus"></i>
              Create Your First Timesheet
            </button>
          </div>
        ) : filteredTimesheets.length === 0 ? (
          <div className="empty-state">
            <h3>No Results Found</h3>
            <p>No reports match your search criteria.</p>
            <button
              type="button"
              className="btn-clear-filter"
              onClick={handleClearFilter}
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
                  <th className="sortable">
                    Timesheet Period <i className="fas fa-sort sort-icon"></i>
                  </th>
                  <th className="sortable">
                    Start Date <i className="fas fa-sort sort-icon"></i>
                  </th>
                  <th>Days</th>
                  <th>Rows</th>
                  <th className="sortable">
                    Created <i className="fas fa-sort sort-icon"></i>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimesheets.map((ts, index) => (
                  <tr key={ts.report_id}>
                    <td>{index + 1}</td>
                    <td>{getTimesheetLabel(ts)}</td>
                    <td>{formatDMYFromYMD(ts.start_date)}</td>
                    <td>{ts.num_days}</td>
                    <td>{ts.num_rows}</td>
                    <td>{formatDateVN(ts.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() =>
                            navigate(`/payroll/report/${ts.report_id}`)
                          }
                          title="View Report"
                        >
                          <i className="fas fa-chart-bar"></i>
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() =>
                            handleDelete(ts.report_id, getTimesheetLabel(ts))
                          }
                          title="Delete Report"
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

export default TimeSheetReportList;
