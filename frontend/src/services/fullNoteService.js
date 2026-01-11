import axios from "axios";
import { API_BASE_WITH_API_PREFIX } from "../config/api";

const API_URL = API_BASE_WITH_API_PREFIX;

export const fullNoteService = {
  getAll: async ({ status = "all", type = "all" } = {}) => {
    const response = await axios.get(`${API_URL}/full-notes`, {
      params: { status, type },
    });
    return response.data;
  },
};
