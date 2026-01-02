import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

const timesheetReportService = {
  async fetchReports() {
    const response = await api.get("/timesheetreports");
    return response.data;
  },

  async fetchReportById(id) {
    const response = await api.get(`/timesheetreports/${id}`);
    return response.data;
  },

  async createReport(data) {
    const response = await api.post("/timesheetreports", data);
    return response.data;
  },

  async updateReport(id, data) {
    const response = await api.put(`/timesheetreports/${id}`, data);
    return response.data;
  },

  async deleteReport(id) {
    const response = await api.delete(`/timesheetreports/${id}`);
    return response.data;
  },

  async saveEntries(reportId, entries) {
    const response = await api.post(`/timesheetreports/${reportId}/entries`, {
      entries,
    });
    return response.data;
  },
};

export default timesheetReportService;
