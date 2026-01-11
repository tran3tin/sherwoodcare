import { API_BASE_WITH_API_PREFIX } from "../config/api";

const API_URL = API_BASE_WITH_API_PREFIX;

export const employeeService = {
  // Create a new employee
  async create(employeeData) {
    const response = await fetch(`${API_URL}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create employee");
    }
    return response.json();
  },

  // Get all employees
  async getAll() {
    const response = await fetch(`${API_URL}/employees`);
    if (!response.ok) {
      throw new Error("Failed to fetch employees");
    }
    return response.json();
  },

  // Get single employee
  async getById(id) {
    const response = await fetch(`${API_URL}/employees/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch employee");
    }
    return response.json();
  },

  // Update employee
  async update(id, employeeData) {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update employee");
    }
    return response.json();
  },

  // Delete employee
  async delete(id) {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete employee");
    }
    return response.json();
  },
};
