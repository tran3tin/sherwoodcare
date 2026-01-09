import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import { employeeService } from "../../services/employeeService";
import "../../assets/styles/form.css";

const initial = {
  lastName: "",
  firstName: "",
  preferName: "",
  level: "",
};

export default function CreateEmployee() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initial);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await employeeService.create({
        lastName: form.lastName,
        firstName: form.firstName,
        preferredName: form.preferName,
        level: form.level,
      });

      toast.success("Employee created successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/employee");
    } catch (error) {
      toast.error(error.message || "Failed to create employee", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <Layout title="Create Employee" breadcrumb={["Home", "Employee", "Create"]}>
      <div className="form-page-container">
        <form onSubmit={onSubmit}>
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
                    value={form.lastName}
                    onChange={onChange("lastName")}
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
                    value={form.firstName}
                    onChange={onChange("firstName")}
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
                    value={form.preferName}
                    onChange={onChange("preferName")}
                    placeholder="Enter preferred name"
                  />
                </div>

                <div className="form-field">
                  <label>
                    Level <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.level}
                    onChange={onChange("level")}
                    placeholder="Enter employee level"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary-submit">
                  <i className="fas fa-plus"></i>
                  Create
                </button>
                <button
                  type="button"
                  className="btn-secondary-back"
                  onClick={() => navigate("/employee")}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
