import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { employeeService } from "../../services/employeeService";
import { toast } from "react-toastify";
import "../../assets/styles/form.css";
import "../../assets/styles/list.css";

export default function ViewEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getById(id);
      setEmployee(response.data);
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast.error("Failed to load employee details", {
        position: "top-right",
        autoClose: 5000,
      });
      navigate("/employee");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="View Employee" breadcrumb={["Home", "Employee", "View"]}>
        <div className="form-container">
          <div className="loading-state">
            <i className="fas fa-spinner"></i>
            <p>Loading employee details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <Layout title="View Employee" breadcrumb={["Home", "Employee", "View"]}>
      <div className="form-page-container">
        <div
          className="form-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>Employee Details</h2>

          <div className="action-buttons" style={{ marginTop: 0 }}>
            <button
              type="button"
              className="btn-action btn-edit"
              onClick={() => navigate(`/employee/edit/${id}`)}
              title="Edit"
              aria-label="Edit"
            >
              <i className="fas fa-edit"></i>
            </button>

            <button
              type="button"
              className="btn-action btn-cancel"
              onClick={() => navigate("/employee")}
              title="Back"
              aria-label="Back"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <i className="fas fa-user"></i>
            Employee Information
          </div>
          <div className="form-section-body">
            <div className="form-row">
              <div className="form-field">
                <label>Last Name</label>
                <div className="form-field-display">{employee.last_name}</div>
              </div>
              <div className="form-field">
                <label>First Name</label>
                <div className="form-field-display">{employee.first_name}</div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Preferred Name</label>
                <div className="form-field-display">
                  {employee.preferred_name || "-"}
                </div>
              </div>
              <div className="form-field">
                <label>Level</label>
                <div className="form-field-display">{employee.level}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
