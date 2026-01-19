import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import { employeeService } from "../../services/employeeService";
import "../../assets/styles/form.css";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    preferredName: "",
    level: "",
    socialLevel: "",
  });

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getById(id);
      const employee = response.data;
      setFormData({
        lastName: employee.last_name || "",
        firstName: employee.first_name || "",
        preferredName: employee.preferred_name || "",
        level: employee.level || "",
        socialLevel: employee.social_level || "",
      });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lastName || !formData.firstName) {
      toast.error("Please fill in all required fields", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setSubmitting(true);
      await employeeService.update(id, {
        lastName: formData.lastName,
        firstName: formData.firstName,
        preferredName: formData.preferredName,
        level: formData.level,
        socialLevel: formData.socialLevel,
      });

      toast.success("Employee updated successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/employee");
    } catch (error) {
      toast.error(error.message || "Failed to update employee", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Edit Employee" breadcrumb={["Home", "Employee", "Edit"]}>
        <div className="form-container">
          <div className="loading-state">
            <i className="fas fa-spinner"></i>
            <p>Loading employee details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Employee" breadcrumb={["Home", "Employee", "Edit"]}>
      <div className="form-page-container">
        <form onSubmit={handleSubmit}>
          <div
            className="form-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ margin: 0 }}>Edit Employee</h2>

            <div className="action-buttons" style={{ marginTop: 0 }}>
              <button
                type="submit"
                className="btn-action btn-save"
                disabled={submitting}
                aria-label="Save"
              >
                <i className="fas fa-save"></i>
              </button>

              <button
                type="button"
                className="btn-action btn-cancel"
                onClick={() => navigate("/employee")}
                disabled={submitting}
                aria-label="Cancel"
              >
                <i className="fas fa-times"></i>
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
                  <label>
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Preferred Name</label>
                  <input
                    type="text"
                    name="preferredName"
                    value={formData.preferredName}
                    onChange={handleInputChange}
                    placeholder="Enter preferred name"
                  />
                </div>

                <div className="form-field">
                  <label>Level</label>
                  <input
                    type="text"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    placeholder="Enter employee level"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Social Level</label>
                  <input
                    type="text"
                    name="socialLevel"
                    value={formData.socialLevel}
                    onChange={handleInputChange}
                    placeholder="Enter social level"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
