import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { toast } from "react-toastify";
import "../../assets/styles/list.css";

import { customerInvoiceService } from "../../services/customerInvoiceService";

function getPaymentFrequencies(row) {
  const frequencies = [];
  if (row.rent_monthly) frequencies.push("Rent/Monthly");
  if (row.rent_fortnightly) frequencies.push("Rent/Fortnightly");
  if (row.da_weekly) frequencies.push("DA/Weekly");
  if (row.social_fortnightly) frequencies.push("Social/Fortnightly");
  return frequencies.length ? frequencies.join(", ") : "None";
}

export default function CustomerInvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await customerInvoiceService.getAll();
      setInvoices(response.data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId, invoiceNo) => {
    if (
      !confirm(
        `Are you sure you want to delete invoice ${invoiceNo || invoiceId}?`
      )
    ) {
      return;
    }

    try {
      await customerInvoiceService.delete(invoiceId);
      toast.success("Invoice deleted successfully", { position: "top-right" });
      fetchInvoices();
    } catch (error) {
      toast.error("Failed to delete invoice", { position: "top-right" });
    }
  };

  const filteredInvoices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return invoices;

    return invoices.filter((row) => {
      const hay = [
        row.full_name,
        row.invoice_no,
        row.memory,
        row.note,
        String(row.amount ?? ""),
        String(row.amount_due ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(term);
    });
  }, [invoices, searchTerm]);

  const handleClearFilter = () => setSearchTerm("");

  if (loading) {
    return (
      <Layout
        title="Customer Invoices"
        breadcrumb={["Home", "Customer", "Invoices"]}
      >
        <div className="list-page-container">
          <div className="loading-state">
            <i className="fas fa-spinner"></i>
            <p>Loading invoices...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (invoices.length === 0) {
    return (
      <Layout
        title="Customer Invoices"
        breadcrumb={["Home", "Customer", "Invoices"]}
      >
        <div className="list-page-container">
          <div className="empty-state">
            <h3>No Data</h3>
            <p>No invoices in the system yet.</p>
            <button
              type="button"
              className="btn-create-first"
              onClick={() => navigate("/customer-invoices/create")}
            >
              <i className="fas fa-plus"></i>
              Add First Invoice
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Customer Invoices"
      breadcrumb={["Home", "Customer", "Invoices"]}
    >
      <div className="list-page-container">
        <div className="list-page-header">
          <div className="list-filters">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Name, invoice no, memo, note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn-create-new"
              onClick={() => navigate("/customer-invoices/create")}
            >
              <i className="fas fa-plus"></i>
              Create Invoice
            </button>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <h3>No Results Found</h3>
            <p>No invoices match your search criteria.</p>
            <button
              type="button"
              className="btn-clear-filter"
              onClick={handleClearFilter}
            >
              <i className="fas fa-redo"></i>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="list-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Payment Frequencies</th>
                  <th>Date</th>
                  <th>Invoice No.</th>
                  <th>Memory</th>
                  <th>Amount</th>
                  <th>Amount Due</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((row, index) => (
                  <tr key={row.invoice_id}>
                    <td>{index + 1}</td>
                    <td>{row.full_name}</td>
                    <td>{getPaymentFrequencies(row)}</td>
                    <td>
                      {row.invoice_date
                        ? new Date(row.invoice_date).toLocaleDateString()
                        : ""}
                    </td>
                    <td>{row.invoice_no || ""}</td>
                    <td>{row.memory || ""}</td>
                    <td>{Number(row.amount ?? 0).toFixed(2)}</td>
                    <td>{Number(row.amount_due ?? 0).toFixed(2)}</td>
                    <td>{row.note || ""}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-edit"
                          onClick={() =>
                            navigate(
                              `/customer-invoices/edit/${row.invoice_id}`
                            )
                          }
                          title="Edit"
                          aria-label="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() =>
                            handleDelete(row.invoice_id, row.invoice_no)
                          }
                          title="Delete"
                          aria-label="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
