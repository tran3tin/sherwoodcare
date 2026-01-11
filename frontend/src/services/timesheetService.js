import axios from "axios";

import { API_BASE_WITH_API_PREFIX } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_WITH_API_PREFIX,
  headers: {
    "Content-Type": "application/json",
  },
});

const timesheetService = {
  // Fetch all timesheets
  async fetchTimesheets() {
    const response = await api.get("/timesheets");
    return response.data;
  },

  // Fetch single timesheet by ID
  async fetchTimesheetById(id) {
    const response = await api.get(`/timesheets/${id}`);
    return response.data;
  },

  // Create new timesheet
  async createTimesheet(data) {
    const response = await api.post("/timesheets", data);
    return response.data;
  },

  // Update existing timesheet
  async updateTimesheet(id, data) {
    const response = await api.put(`/timesheets/${id}`, data);
    return response.data;
  },

  // Delete timesheet
  async deleteTimesheet(id) {
    const response = await api.delete(`/timesheets/${id}`);
    return response.data;
  },

  // Save entries for a timesheet
  async saveEntries(periodId, entries) {
    const response = await api.post(`/timesheets/${periodId}/entries`, {
      entries,
    });
    return response.data;
  },
};

export default timesheetService;
