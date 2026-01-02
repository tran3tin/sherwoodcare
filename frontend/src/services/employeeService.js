const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const employeeService = {
  // Create a new employee
  async create(employeeData) {
    const response = await fetch(`${API_URL}/api/employees`, {
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
    const response = await fetch(`${API_URL}/api/employees`);
    if (!response.ok) {
      throw new Error("Failed to fetch employees");
    }
    return response.json();
  },

  // Get single employee
  async getById(id) {
    const response = await fetch(`${API_URL}/api/employees/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch employee");
    }
    return response.json();
  },

  // Update employee
  async update(id, employeeData) {
    const response = await fetch(`${API_URL}/api/employees/${id}`, {
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
    const response = await fetch(`${API_URL}/api/employees/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete employee");
    }
    return response.json();
  },
};
