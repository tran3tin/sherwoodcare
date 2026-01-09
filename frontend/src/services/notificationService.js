import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
