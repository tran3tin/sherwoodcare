const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const customerService = {
  // Create a new customer
  async create(customerData) {
    const response = await fetch(`${API_URL}/api/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create customer");
    }
    return response.json();
  },

  // Get all customers
  async getAll() {
    const response = await fetch(`${API_URL}/api/customers`);
    if (!response.ok) {
      throw new Error("Failed to fetch customers");
    }
    return response.json();
  },

  // Get single customer
  async getById(id) {
    const response = await fetch(`${API_URL}/api/customers/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch customer");
    }
    return response.json();
  },

  // Update customer
  async update(id, customerData) {
    const response = await fetch(`${API_URL}/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update customer");
    }
    return response.json();
  },

  // Delete customer
  async delete(id) {
    const response = await fetch(`${API_URL}/api/customers/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete customer");
    }
    return response.json();
  },
};
