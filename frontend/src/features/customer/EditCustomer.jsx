import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { customerService } from "../../services/customerService";
import { toast } from "react-toastify";
import "../../assets/styles/form.css";
import "../../assets/styles/list.css";

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    rent_monthly: false,
    rent_monthly_email: false,
    rent_fortnightly: false,
    rent_fortnightly_email: false,
    da_weekly: false,
    da_weekly_email: false,
    social_fortnightly: false,
    social_fortnightly_email: false,
  });

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await customerService.getById(id);
      const customer = response.data;
      setFormData({
        full_name: customer.full_name || "",
        rent_monthly: customer.rent_monthly || false,
        rent_monthly_email: customer.rent_monthly_email || false,
        rent_fortnightly: customer.rent_fortnightly || false,
        rent_fortnightly_email: customer.rent_fortnightly_email || false,
        da_weekly: customer.da_weekly || false,
        da_weekly_email: customer.da_weekly_email || false,
        social_fortnightly: customer.social_fortnightly || false,
        social_fortnightly_email: customer.social_fortnightly_email || false,
      });
    } catch (error) {
      console.error("Error fetching customer:", error);
      toast.error("Failed to load customer details", {
        position: "top-right",
        autoClose: 5000,
      });
      navigate("/customer");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMainCheckboxChange = (frequencyName, emailName) => {
    setFormData((prev) => {
      const newValue = !prev[frequencyName];
      return {
        ...prev,
        [frequencyName]: newValue,
        [emailName]: newValue ? prev[emailName] : false,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      toast.error("Full name is required", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setSubmitting(true);
      await customerService.update(id, formData);
      toast.success("Customer updated successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/customer");
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error(error.response?.data?.error || "Failed to update customer", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Edit Customer" breadcrumb={["Home", "Customer", "Edit"]}>
        <div className="form-container">
          <div className="loading-state">
            <i className="fas fa-spinner"></i>
            <p>Loading customer details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Customer" breadcrumb={["Home", "Customer", "Edit"]}>
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
            <h2 style={{ margin: 0 }}>Edit Customer</h2>

            <div className="action-buttons" style={{ marginTop: 0 }}>
              <button
                type="submit"
                className="btn-action btn-save"
                disabled={submitting}
                title="Save"
                aria-label="Save"
              >
                <i className="fas fa-save"></i>
              </button>

              <button
                type="button"
                className="btn-action btn-cancel"
                onClick={() => navigate("/customer")}
                disabled={submitting}
                title="Cancel"
                aria-label="Cancel"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <i className="fas fa-user"></i>
              Customer Information
            </div>
            <div className="form-section-body">
              <div className="form-row">
                <div className="form-field required">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter full name"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <i className="fas fa-calendar-alt"></i>
              Payment Frequency
            </div>
            <div className="form-section-body">
              <div className="form-field-checkbox-group">
                <div className="checkbox-card">
                  <div className="checkbox-main">
                    <input
                      type="checkbox"
                      id="rent_monthly"
                      checked={formData.rent_monthly}
                      onChange={() =>
                        handleMainCheckboxChange(
                          "rent_monthly",
                          "rent_monthly_email"
                        )
                      }
                    />
                    <label htmlFor="rent_monthly">Rent/Monthly</label>
                  </div>
                  <div className="checkbox-sub">
                    <input
                      type="checkbox"
                      id="rent_monthly_email"
                      name="rent_monthly_email"
                      checked={formData.rent_monthly_email}
                      onChange={handleInputChange}
                      disabled={!formData.rent_monthly}
                    />
                    <label htmlFor="rent_monthly_email">Send Email</label>
                  </div>
                </div>

                <div className="checkbox-card">
                  <div className="checkbox-main">
                    <input
                      type="checkbox"
                      id="rent_fortnightly"
                      checked={formData.rent_fortnightly}
                      onChange={() =>
                        handleMainCheckboxChange(
                          "rent_fortnightly",
                          "rent_fortnightly_email"
                        )
                      }
                    />
                    <label htmlFor="rent_fortnightly">Rent/Fortnightly</label>
                  </div>
                  <div className="checkbox-sub">
                    <input
                      type="checkbox"
                      id="rent_fortnightly_email"
                      name="rent_fortnightly_email"
                      checked={formData.rent_fortnightly_email}
                      onChange={handleInputChange}
                      disabled={!formData.rent_fortnightly}
                    />
                    <label htmlFor="rent_fortnightly_email">Send Email</label>
                  </div>
                </div>

                <div className="checkbox-card">
                  <div className="checkbox-main">
                    <input
                      type="checkbox"
                      id="da_weekly"
                      checked={formData.da_weekly}
                      onChange={() =>
                        handleMainCheckboxChange("da_weekly", "da_weekly_email")
                      }
                    />
                    <label htmlFor="da_weekly">DA/Weekly</label>
                  </div>
                  <div className="checkbox-sub">
                    <input
                      type="checkbox"
                      id="da_weekly_email"
                      name="da_weekly_email"
                      checked={formData.da_weekly_email}
                      onChange={handleInputChange}
                      disabled={!formData.da_weekly}
                    />
                    <label htmlFor="da_weekly_email">Send Email</label>
                  </div>
                </div>

                <div className="checkbox-card">
                  <div className="checkbox-main">
                    <input
                      type="checkbox"
                      id="social_fortnightly"
                      checked={formData.social_fortnightly}
                      onChange={() =>
                        handleMainCheckboxChange(
                          "social_fortnightly",
                          "social_fortnightly_email"
                        )
                      }
                    />
                    <label htmlFor="social_fortnightly">
                      Social/Fortnightly
                    </label>
                  </div>
                  <div className="checkbox-sub">
                    <input
                      type="checkbox"
                      id="social_fortnightly_email"
                      name="social_fortnightly_email"
                      checked={formData.social_fortnightly_email}
                      onChange={handleInputChange}
                      disabled={!formData.social_fortnightly}
                    />
                    <label htmlFor="social_fortnightly_email">Send Email</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
