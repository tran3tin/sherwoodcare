import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

const socialSheetService = {
  async fetchSheets() {
    const response = await api.get("/social-sheets");
    return response.data;
  },

  async fetchSheetById(id) {
    const response = await api.get(`/social-sheets/${id}`);
    return response.data;
  },

  async createSheet(data) {
    const response = await api.post("/social-sheets", data);
    return response.data;
  },

  async updateSheet(id, data) {
    const response = await api.put(`/social-sheets/${id}`, data);
    return response.data;
  },

  async deleteSheet(id) {
    const response = await api.delete(`/social-sheets/${id}`);
    return response.data;
  },
};

export default socialSheetService;
