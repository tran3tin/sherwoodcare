import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { employeeService } from "../../services/employeeService";
import { toast } from "react-toastify";
import "../../assets/styles/list.css";

export default function Employee() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAll();
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      await employeeService.delete(id);
      toast.success("Employee deleted successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      fetchEmployees();
    } catch (error) {
      toast.error("Failed to delete employee", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleClearFilter = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      searchTerm === "" ||
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.preferred_name &&
        emp.preferred_name.toLowerCase().includes(searchTerm.toLowerCase()));

    // For now, treat all as active (can be extended later)
    const matchStatus = statusFilter === "all" || statusFilter === "active";

    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <Layout title="Employee Management" breadcrumb={["Home", "Employee"]}>
        <div className="list-page-container">
          <div className="loading-state">
            <i className="fas fa-spinner"></i>
            <p>Loading employees...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (employees.length === 0) {
    return (
      <Layout title="Employee Management" breadcrumb={["Home", "Employee"]}>
        <div className="list-page-container">
          <div className="empty-state">
            <h3>No Data</h3>
            <p>No employees in the system yet.</p>
            <button
              type="button"
              className="btn-create-first"
              onClick={() => navigate("/employee/create")}
            >
              <i className="fas fa-plus"></i>
              Add First Employee
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Employee Management" breadcrumb={["Home", "Employee"]}>
      <div className="list-page-container">
        <div className="list-page-header">
          <div className="list-filters">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button
              type="button"
              className="btn-create-new"
              onClick={() => navigate("/employee/create")}
            >
              <i className="fas fa-plus"></i>
              Create Employee
            </button>
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <h3>No Results Found</h3>
            <p>No employees match your search criteria.</p>
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
                  <th>Preferred Name</th>
                  <th className="sortable">
                    Employee Name <i className="fas fa-sort sort-icon"></i>
                  </th>
                  <th className="sortable">
                    Level <i className="fas fa-sort sort-icon"></i>
                  </th>
                  <th className="sortable">
                    Status <i className="fas fa-sort sort-icon"></i>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, index) => (
                  <tr key={emp.employee_id}>
                    <td>{index + 1}</td>
                    <td>{emp.preferred_name || "-"}</td>
                    <td>{`${emp.first_name} ${emp.last_name}`}</td>
                    <td>{emp.level}</td>
                    <td>
                      <span className="status-badge active">Active</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() =>
                            navigate(`/employee/${emp.employee_id}`)
                          }
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() =>
                            navigate(`/employee/edit/${emp.employee_id}`)
                          }
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-action btn-save"
                          onClick={() =>
                            navigate(`/employee/${emp.employee_id}/notes`)
                          }
                          title="Notes / To-Do"
                        >
                          <i className="fas fa-sticky-note"></i>
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() =>
                            handleDelete(
                              emp.employee_id,
                              `${emp.first_name} ${emp.last_name}`
                            )
                          }
                          title="Delete"
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
}
