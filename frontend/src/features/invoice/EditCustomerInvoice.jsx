import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import "../../assets/styles/form.css";
import "../../assets/styles/list.css";

import { customerService } from "../../services/customerService";
import { customerInvoiceService } from "../../services/customerInvoiceService";

function computeFrequencies(customer) {
  if (!customer) return "";
  const frequencies = [];
  if (customer.rent_monthly) frequencies.push("Rent/Monthly");
  if (customer.rent_fortnightly) frequencies.push("Rent/Fortnightly");
  if (customer.da_weekly) frequencies.push("DA/Weekly");
  if (customer.social_fortnightly) frequencies.push("Social/Fortnightly");
  return frequencies.length ? frequencies.join(", ") : "None";
}

export default function EditCustomerInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);

  const [form, setForm] = useState({
    customer_id: "",
    invoice_date: "",
    invoice_no: "",
    memory: "",
    amount: "0",
    amount_due: "0",
    note: "",
  });

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [customersRes, invoiceRes] = await Promise.all([
        customerService.getAll(),
        customerInvoiceService.getById(id),
      ]);

      const customerRows = customersRes.data || [];
      const invoice = invoiceRes.data;

      setCustomers(customerRows);
      setForm({
        customer_id: String(invoice.customer_id ?? ""),
        invoice_date: invoice.invoice_date || "",
        invoice_no: invoice.invoice_no || "",
        memory: invoice.memory || "",
        amount: String(invoice.amount ?? 0),
        amount_due: String(invoice.amount_due ?? 0),
        note: invoice.note || "",
      });
    } catch (error) {
      console.error("Error loading invoice:", error);
      toast.error("Failed to load invoice", { position: "top-right" });
      navigate("/customer-invoices");
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = useMemo(() => {
    return customers.find(
      (c) => String(c.customer_id) === String(form.customer_id)
    );
  }, [customers, form.customer_id]);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.customer_id) {
      toast.error("Name is required", { position: "top-right" });
      return;
    }

    if (!form.invoice_date) {
      toast.error("Date is required", { position: "top-right" });
      return;
    }

    try {
      setSubmitting(true);
      await customerInvoiceService.update(id, {
        customer_id: Number(form.customer_id),
        invoice_date: form.invoice_date,
        invoice_no: form.invoice_no,
        memory: form.memory,
        amount: Number(form.amount || 0),
        amount_due: Number(form.amount_due || 0),
        note: form.note,
      });

      toast.success("Invoice updated successfully", { position: "top-right" });
      navigate("/customer-invoices");
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error(error.message || "Failed to update invoice", {
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout
        title="Edit Invoice"
        breadcrumb={["Home", "Customer", "Invoices", "Edit"]}
      >
        <div className="form-page-container">
          <div className="loading-state">
            <i className="fas fa-spinner"></i>
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Edit Invoice"
      breadcrumb={["Home", "Customer", "Invoices", "Edit"]}
    >
      <div className="form-page-container">
        <form onSubmit={onSubmit}>
          <div
            className="form-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ margin: 0 }}>Edit Invoice</h2>
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
                onClick={() => navigate("/customer-invoices")}
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
              <i className="fas fa-file-invoice"></i>
              Invoice Information
            </div>
            <div className="form-section-body">
              <div className="form-row">
                <div className="form-field required">
                  <label>
                    Name <span className="required">*</span>
                  </label>
                  <select
                    value={form.customer_id}
                    onChange={onChange("customer_id")}
                    required
                  >
                    <option value="">Select customer...</option>
                    {customers.map((c) => (
                      <option key={c.customer_id} value={c.customer_id}>
                        {c.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Payment Frequencies</label>
                  <input
                    type="text"
                    value={computeFrequencies(selectedCustomer)}
                    readOnly
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field required">
                  <label>
                    Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.invoice_date}
                    onChange={onChange("invoice_date")}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Invoice No.</label>
                  <input
                    type="text"
                    value={form.invoice_no}
                    onChange={onChange("invoice_no")}
                    placeholder="Enter invoice no"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Memory</label>
                  <input
                    type="text"
                    value={form.memory}
                    onChange={onChange("memory")}
                    placeholder="Enter memory"
                  />
                </div>

                <div className="form-field">
                  <label>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={onChange("amount")}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Amount Due</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount_due}
                    onChange={onChange("amount_due")}
                  />
                </div>

                <div className="form-field">
                  <label>Note</label>
                  <input
                    type="text"
                    value={form.note}
                    onChange={onChange("note")}
                    placeholder="Enter note"
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
