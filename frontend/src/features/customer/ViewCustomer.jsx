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
            Customer Information
          </div>
          <div className="form-section-body">
            <div className="form-row">
              <div className="form-field">
                <label>Full Name</label>
                <div className="form-field-display">{customer.full_name}</div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Reference</label>
                <div className="form-field-display">
                  {customer.reference || "-"}
                </div>
              </div>
              <div className="form-field">
                <label>Room</label>
                <div className="form-field-display">{customer.room || "-"}</div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Payment Method 1</label>
                <div className="form-field-display">
                  {customer.payment_method_1 || "-"}
                </div>
              </div>
              <div className="form-field">
                <label>Payment Method 2</label>
                <div className="form-field-display">
                  {customer.payment_method_2 || "-"}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Note</label>
                <div className="form-field-display">{customer.note || "-"}</div>
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
