import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { customerService } from "../../services/customerService";
import { toast } from "react-toastify";
import "../../assets/styles/list.css";

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAll();
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      await customerService.delete(id);
      toast.success("Customer deleted successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to delete customer", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleClearFilter = () => {
    setSearchTerm("");
  };

  const getPaymentFrequencies = (customer) => {
    const frequencies = [];
    if (customer.rent_monthly) frequencies.push("Rent/Monthly");
    if (customer.rent_fortnightly) frequencies.push("Rent/Fortnightly");
    if (customer.da_weekly) frequencies.push("DA/Weekly");
    if (customer.social_fortnightly) frequencies.push("Social/Fortnightly");
    return frequencies.length > 0 ? frequencies.join(", ") : "None";
  };

  const getEmailStatuses = (customer) => {
    const emails = [];
    if (customer.rent_monthly && customer.rent_monthly_email)
      emails.push("Rent/Monthly");
    if (customer.rent_fortnightly && customer.rent_fortnightly_email)
      emails.push("Rent/Fortnightly");
    if (customer.da_weekly && customer.da_weekly_email)
      emails.push("DA/Weekly");
    if (customer.social_fortnightly && customer.social_fortnightly_email)
      emails.push("Social/Fortnightly");
    return emails.length > 0 ? emails.join(", ") : "None";
  };

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchSearch =
      searchTerm === "" ||
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchSearch;
  });

  if (loading) {
    return (
      <Layout title="Customer Management" breadcrumb={["Home", "Customer"]}>
        <div className="list-page-container">
          <div className="loading-state">
            <i className="fas fa-spinner"></i>
            <p>Loading customers...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (customers.length === 0) {
    return (
      <Layout title="Customer Management" breadcrumb={["Home", "Customer"]}>
        <div className="list-page-container">
          <div className="empty-state">
            <h3>No Data</h3>
            <p>No customers in the system yet.</p>
            <button
              type="button"
              className="btn-create-first"
              onClick={() => navigate("/customer/create")}
            >
              <i className="fas fa-plus"></i>
              Add First Customer
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Customer Management" breadcrumb={["Home", "Customer"]}>
      <div className="list-page-container">
        <div className="list-page-header">
          <div className="list-filters">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn-create-new"
              onClick={() => navigate("/customer/create")}
            >
              <i className="fas fa-plus"></i>
              Create Customer
            </button>
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <h3>No Results Found</h3>
            <p>No customers match your search criteria.</p>
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
                  <th className="sortable">
                    Full Name <i className="fas fa-sort sort-icon"></i>
                  </th>
                  <th>Payment Frequencies</th>
                  <th>Email Enabled For</th>
                  <th className="sortable">
                    Created Date <i className="fas fa-sort sort-icon"></i>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer.customer_id}>
                    <td>{index + 1}</td>
                    <td>{customer.full_name}</td>
                    <td>{getPaymentFrequencies(customer)}</td>
                    <td>{getEmailStatuses(customer)}</td>
                    <td>
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() =>
                            navigate(`/customer/${customer.customer_id}`)
                          }
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() =>
                            navigate(`/customer/edit/${customer.customer_id}`)
                          }
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-action btn-save"
                          onClick={() =>
                            navigate(`/customer/${customer.customer_id}/notes`)
                          }
                          title="Notes / To-Do"
                        >
                          <i className="fas fa-sticky-note"></i>
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() =>
                            handleDelete(
                              customer.customer_id,
                              customer.full_name
                            )
                          }
                          title="Delete"
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
