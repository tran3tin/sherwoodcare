import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import { customerService } from "../../services/customerService";
import "../../assets/styles/form.css";

const initial = {
  last_name: "",
  first_name: "",
  reference: "",
  room: "",
  payment_method_1: "",
  payment_method_2: "",
  note: "",
};

export default function CreateCustomer() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.last_name.trim()) {
      toast.error("Last name is required", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    if (!form.first_name.trim()) {
      toast.error("First name is required", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    try {
      await customerService.create(form);
      toast.success("customer created successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/customer");
    } catch (error) {
      toast.error(error.message || "Failed to create customer", {
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
    <Layout title="Create customer" breadcrumb={["Home", "customer", "Create"]}>
      <div className="form-page-container">
        <form onSubmit={onSubmit}>
          <div className="form-section">
            <div className="form-section-header">
              <i className="fas fa-user"></i>
              customer Information
            </div>
            <div className="form-section-body">
              <div className="form-row">
                <div className="form-field">
                  <label>
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={onChange("last_name")}
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
                    value={form.first_name}
                    onChange={onChange("first_name")}
                    placeholder="Enter first name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Reference</label>
                  <input
                    type="text"
                    value={form.reference}
                    onChange={onChange("reference")}
                    placeholder="Enter reference"
                  />
                </div>
                <div className="form-field">
                  <label>Room</label>
                  <input
                    type="text"
                    value={form.room}
                    onChange={onChange("room")}
                    placeholder="Enter room"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Payment Method (Rent)</label>
                  <input
                    type="text"
                    value={form.payment_method_1}
                    onChange={onChange("payment_method_1")}
                    placeholder="Enter payment method 1"
                  />
                </div>
                <div className="form-field">
                  <label>Payment Method (DA)</label>
                  <input
                    type="text"
                    value={form.payment_method_2}
                    onChange={onChange("payment_method_2")}
                    placeholder="Enter payment method 2"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field form-field-full">
                  <label>Note</label>
                  <textarea
                    value={form.note}
                    onChange={onChange("note")}
                    placeholder="Enter note"
                    rows="3"
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
                  onClick={() => navigate("/customer")}
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
