import axios from "axios";

import { API_BASE_WITH_API_PREFIX } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_WITH_API_PREFIX,
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
