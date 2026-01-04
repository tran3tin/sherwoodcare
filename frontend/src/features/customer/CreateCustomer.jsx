import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import { customerService } from "../../services/customerService";
import "../../assets/styles/form.css";

const initial = {
  full_name: "",
  rent_monthly: false,
  rent_monthly_email: false,
  rent_fortnightly: false,
  rent_fortnightly_email: false,
  da_weekly: false,
  da_weekly_email: false,
  social_fortnightly: false,
  social_fortnightly_email: false,
};

export default function CreateCustomer() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);

  const onChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      toast.error("Full name is required", {
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
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={onChange("full_name")}
                    placeholder="Enter full name"
                    required
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
              <div className="form-row">
                <div className="form-field-checkbox-group">
                  <div className="checkbox-card">
                    <div className="checkbox-main">
                      <input
                        type="checkbox"
                        id="rent_monthly"
                        checked={form.rent_monthly}
                        onChange={onChange("rent_monthly")}
                      />
                      <label htmlFor="rent_monthly">Rent/Monthly</label>
                    </div>
                    <div className="checkbox-sub">
                      <input
                        type="checkbox"
                        id="rent_monthly_email"
                        checked={form.rent_monthly_email}
                        onChange={onChange("rent_monthly_email")}
                        disabled={!form.rent_monthly}
                      />
                      <label htmlFor="rent_monthly_email">Send Email</label>
                    </div>
                  </div>

                  <div className="checkbox-card">
                    <div className="checkbox-main">
                      <input
                        type="checkbox"
                        id="rent_fortnightly"
                        checked={form.rent_fortnightly}
                        onChange={onChange("rent_fortnightly")}
                      />
                      <label htmlFor="rent_fortnightly">Rent/Fortnightly</label>
                    </div>
                    <div className="checkbox-sub">
                      <input
                        type="checkbox"
                        id="rent_fortnightly_email"
                        checked={form.rent_fortnightly_email}
                        onChange={onChange("rent_fortnightly_email")}
                        disabled={!form.rent_fortnightly}
                      />
                      <label htmlFor="rent_fortnightly_email">Send Email</label>
                    </div>
                  </div>

                  <div className="checkbox-card">
                    <div className="checkbox-main">
                      <input
                        type="checkbox"
                        id="da_weekly"
                        checked={form.da_weekly}
                        onChange={onChange("da_weekly")}
                      />
                      <label htmlFor="da_weekly">DA/Weekly</label>
                    </div>
                    <div className="checkbox-sub">
                      <input
                        type="checkbox"
                        id="da_weekly_email"
                        checked={form.da_weekly_email}
                        onChange={onChange("da_weekly_email")}
                        disabled={!form.da_weekly}
                      />
                      <label htmlFor="da_weekly_email">Send Email</label>
                    </div>
                  </div>

                  <div className="checkbox-card">
                    <div className="checkbox-main">
                      <input
                        type="checkbox"
                        id="social_fortnightly"
                        checked={form.social_fortnightly}
                        onChange={onChange("social_fortnightly")}
                      />
                      <label htmlFor="social_fortnightly">
                        Social/Fortnightly
                      </label>
                    </div>
                    <div className="checkbox-sub">
                      <input
                        type="checkbox"
                        id="social_fortnightly_email"
                        checked={form.social_fortnightly_email}
                        onChange={onChange("social_fortnightly_email")}
                        disabled={!form.social_fortnightly}
                      />
                      <label htmlFor="social_fortnightly_email">
                        Send Email
                      </label>
                    </div>
                  </div>
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

