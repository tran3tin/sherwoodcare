import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import timesheetService from "../../services/timesheetService";
import { useToast } from "../../components/ToastProvider";
import {
  addDaysYMD,
  formatDMYFromYMD,
  formatDateVN,
  normalizeYMD,
} from "../../utils/dateVN";
import "./TimeSheetList.css";

const TimeSheetList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTimesheets();
  }, []);

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await timesheetService.fetchTimesheets();
      setTimesheets(response.data || []);
    } catch (err) {
      console.error("Error loading timesheets:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to load timesheets"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmMsg = name
      ? `Are you sure you want to delete "${name}"?`
      : "Are you sure you want to delete this timesheet?";

    toast.warning(confirmMsg, {
      durationMs: 7000,
      actions: [
        {
          label: "Delete",
          variant: "primary",
          onClick: async () => {
            try {
              await timesheetService.deleteTimesheet(id);
              setTimesheets((prev) => prev.filter((ts) => ts.period_id !== id));
              toast.success("Timesheet deleted.");
            } catch (err) {
              console.error("Error deleting timesheet:", err);
              toast.error(
                err.response?.data?.error || "Failed to delete timesheet"
              );
            }
          },
        },
        {
          label: "Cancel",
          onClick: () => {
            toast.info("Cancelled.");
          },
        },
      ],
    });
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

  if (loading) {
    return (
      <div className="timesheet-list-container">
        <div className="loading-message">Loading timesheets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timesheet-list-container">
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button type="button" className="btn-retry" onClick={loadTimesheets}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="timesheet-list-container">
      <div className="list-header">
        <h2>Saved Timesheets</h2>
        <button
          type="button"
          className="btn-create-new"
          onClick={() => navigate("/payroll/time-sheet")}
        >
          + Create New Timesheet
        </button>
      </div>

      {timesheets.length === 0 ? (
        <div className="empty-state">
          <p>No saved timesheets yet.</p>
          <button
            type="button"
            className="btn-create-first"
            onClick={() => navigate("/payroll/time-sheet")}
          >
            Create Your First Timesheet
          </button>
        </div>
      ) : (
        <div className="timesheet-table-wrapper">
          <table className="timesheet-list-table">
            <thead>
              <tr>
                <th>Timesheet Period</th>
                <th>Start Date</th>
                <th>Days</th>
                <th>Rows</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((ts) => (
                <tr key={ts.period_id}>
                  <td className="period-name">{getTimesheetLabel(ts)}</td>
                  <td>{formatDMYFromYMD(ts.start_date)}</td>
                  <td>{ts.num_days}</td>
                  <td>{ts.num_rows}</td>
                  <td>{formatDateVN(ts.created_at)}</td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      className="btn-edit"
                      onClick={() =>
                        navigate(`/payroll/time-sheet/${ts.period_id}`)
                      }
                      title="Edit timesheet"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() =>
                        handleDelete(ts.period_id, getTimesheetLabel(ts))
                      }
                      title="Delete timesheet"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimeSheetList;
