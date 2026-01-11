import { API_BASE_WITH_API_PREFIX } from "../config/api";

const API_URL = API_BASE_WITH_API_PREFIX;

export const employerService = {
  // Create a new employer
  async create(employerData) {
    const response = await fetch(`${API_URL}/employers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employerData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create employer");
    }
    return response.json();
  },

  // Get all employers
  async getAll() {
    const response = await fetch(`${API_URL}/employers`);
    if (!response.ok) {
      throw new Error("Failed to fetch employers");
    }
    return response.json();
  },

  // Get single employer
  async getById(id) {
    const response = await fetch(`${API_URL}/employers/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch employer");
    }
    return response.json();
  },

  // Update employer
  async update(id, employerData) {
    const response = await fetch(`${API_URL}/employers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employerData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update employer");
    }
    return response.json();
  },

  // Delete employer
  async delete(id) {
    const response = await fetch(`${API_URL}/employers/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete employer");
    }
    return response.json();
  },
};
