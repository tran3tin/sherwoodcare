import axios from "axios";

import { API_BASE_WITH_API_PREFIX } from "../config/api";

const API_URL = API_BASE_WITH_API_PREFIX;

export const notificationService = {
  // Get all due/overdue notes for notifications
  getDueNotes: async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/due-notes`);
      return response.data;
    } catch (error) {
      console.error("Error fetching due notes:", error);
      return { success: false, data: [] };
    }
  },
};
