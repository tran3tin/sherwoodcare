const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const customerInvoiceService = {
  async create(payload) {
    const response = await fetch(`${API_URL}/api/customer-invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create invoice");
    }

    return response.json();
  },

  async getAll({ customer_id } = {}) {
    const url = new URL(`${API_URL}/api/customer-invoices`);
    if (customer_id) {
      url.searchParams.set("customer_id", String(customer_id));
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Failed to fetch invoices");
    }
    return response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/api/customer-invoices/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch invoice");
    }
    return response.json();
  },

  async update(id, payload) {
    const response = await fetch(`${API_URL}/api/customer-invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update invoice");
    }

    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/api/customer-invoices/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete invoice");
    }

    return response.json();
  },
};
