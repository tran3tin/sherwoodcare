import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { customerService } from "../../services/customerService";
import { toast } from "react-toastify";
import "../../assets/styles/form.css";
import "../../assets/styles/list.css";

export default function ViewCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await customerService.getById(id);
      setCustomer(response.data);
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

  if (loading) {
    return (
      <Layout title="View Customer" breadcrumb={["Home", "Customer", "View"]}>
        <div className="form-container">
          <div className="loading-state">
            <i className="fas fa-spinner"></i>
            <p>Loading customer details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <Layout title="View Customer" breadcrumb={["Home", "Customer", "View"]}>
      <div className="form-page-container">
        <div
          className="form-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>Customer Details</h2>

          <div className="action-buttons" style={{ marginTop: 0 }}>
            <button
              type="button"
              className="btn-action btn-edit"
              onClick={() => navigate(`/customer/edit/${id}`)}
              title="Edit"
              aria-label="Edit"
            >
              <i className="fas fa-edit"></i>
            </button>

            <button
              type="button"
              className="btn-action btn-cancel"
              onClick={() => navigate("/customer")}
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
            Basic Information
          </div>
          <div className="form-section-body">
            <div className="form-row">
              <div className="form-field">
                <label>Full Name</label>
                <div className="form-field-display">{customer.full_name}</div>
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
              <div
                className={`checkbox-card ${
                  customer.rent_monthly ? "active" : ""
                }`}
              >
                <div className="checkbox-main">
                  <input
                    type="checkbox"
                    checked={customer.rent_monthly}
                    disabled
                    readOnly
                  />
                  <label>Rent/Monthly</label>
                </div>
                {customer.rent_monthly && (
                  <div className="checkbox-sub">
                    <input
                      type="checkbox"
                      checked={customer.rent_monthly_email}
                      disabled
                      readOnly
                    />
                    <label>Send Email</label>
                  </div>
                )}
              </div>

              <div
                className={`checkbox-card ${
                  customer.rent_fortnightly ? "active" : ""
                }`}
              >
                <div className="checkbox-main">
                  <input
                    type="checkbox"
                    checked={customer.rent_fortnightly}
                    disabled
                    readOnly
                  />
                  <label>Rent/Fortnightly</label>
                </div>
                {customer.rent_fortnightly && (
                  <div className="checkbox-sub">
                    <input
                      type="checkbox"
                      checked={customer.rent_fortnightly_email}
                      disabled
                      readOnly
                    />
                    <label>Send Email</label>
                  </div>
                )}
              </div>

              <div
                className={`checkbox-card ${
                  customer.da_weekly ? "active" : ""
                }`}
              >
                <div className="checkbox-main">
                  <input
                    type="checkbox"
                    checked={customer.da_weekly}
                    disabled
                    readOnly
                  />
                  <label>DA/Weekly</label>
                </div>
                {customer.da_weekly && (
                  <div className="checkbox-sub">
                    <input
                      type="checkbox"
                      checked={customer.da_weekly_email}
                      disabled
                      readOnly
                    />
                    <label>Send Email</label>
                  </div>
                )}
              </div>

              <div
                className={`checkbox-card ${
                  customer.social_fortnightly ? "active" : ""
                }`}
              >
                <div className="checkbox-main">
                  <input
                    type="checkbox"
                    checked={customer.social_fortnightly}
                    disabled
                    readOnly
                  />
                  <label>Social/Fortnightly</label>
                </div>
                {customer.social_fortnightly && (
                  <div className="checkbox-sub">
                    <input
                      type="checkbox"
                      checked={customer.social_fortnightly_email}
                      disabled
                      readOnly
                    />
                    <label>Send Email</label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <i className="fas fa-info-circle"></i>
            Record Information
          </div>
          <div className="form-section-body">
            <div className="form-row">
              <div className="form-field">
                <label>Created At</label>
                <div className="form-field-display">
                  {new Date(customer.created_at).toLocaleString()}
                </div>
              </div>
              <div className="form-field">
                <label>Last Updated</label>
                <div className="form-field-display">
                  {new Date(customer.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
