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
    first_name: "",
    last_name: "",
    reference: "",
    room: "",
    payment_method_1: "",
    payment_method_2: "",
    note: "",
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
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        reference: customer.reference || "",
        room: customer.room || "",
        payment_method_1: customer.payment_method_1 || "",
        payment_method_2: customer.payment_method_2 || "",
        note: customer.note || "",
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name.trim()) {
      toast.error("First name is required", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!formData.last_name.trim()) {
      toast.error("Last name is required", {
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
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter last name"
                  />
                </div>
                <div className="form-field required">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter first name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="reference">Reference</label>
                  <input
                    type="text"
                    id="reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    placeholder="Enter reference"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="room">Room</label>
                  <input
                    type="text"
                    id="room"
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                    placeholder="Enter room"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="payment_method_1">Payment Method 1</label>
                  <input
                    type="text"
                    id="payment_method_1"
                    name="payment_method_1"
                    value={formData.payment_method_1}
                    onChange={handleInputChange}
                    placeholder="Enter payment method 1"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="payment_method_2">Payment Method 2</label>
                  <input
                    type="text"
                    id="payment_method_2"
                    name="payment_method_2"
                    value={formData.payment_method_2}
                    onChange={handleInputChange}
                    placeholder="Enter payment method 2"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field" style={{ flex: "1 1 100%" }}>
                  <label htmlFor="note">Note</label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Enter note"
                    rows="3"
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
