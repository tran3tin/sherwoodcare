import axios from "axios";

import { API_BASE_WITH_API_PREFIX } from "../config/api";

const API_URL = API_BASE_WITH_API_PREFIX;

export const customerNoteService = {
  // Get all notes for a customer
  getByCustomerId: async (customerId) => {
    const response = await axios.get(
      `${API_URL}/customer-notes/customer/${customerId}`
    );
    return response.data;
  },

  // Get notes count for a customer
  getCount: async (customerId) => {
    const response = await axios.get(
      `${API_URL}/customer-notes/customer/${customerId}/count`
    );
    return response.data;
  },

  // Get single note
  getById: async (noteId) => {
    const response = await axios.get(`${API_URL}/customer-notes/${noteId}`);
    return response.data;
  },

  // Create new note (with optional file attachment)
  create: async (noteData, file = null) => {
    const formData = new FormData();
    formData.append("customer_id", noteData.customer_id);
    formData.append("title", noteData.title);
    formData.append("content", noteData.content || "");
    formData.append("priority", noteData.priority || "medium");
    if (noteData.due_date) {
      formData.append("due_date", noteData.due_date);
    }
    if (file) {
      formData.append("attachment", file);
    }

    const response = await axios.post(`${API_URL}/customer-notes`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update note (with optional file attachment)
  update: async (noteId, noteData, file = null, removeAttachment = false) => {
    const formData = new FormData();
    formData.append("title", noteData.title);
    formData.append("content", noteData.content || "");
    formData.append("priority", noteData.priority || "medium");
    formData.append("is_completed", noteData.is_completed ? "true" : "false");
    if (noteData.due_date) {
      formData.append("due_date", noteData.due_date);
    }
    if (file) {
      formData.append("attachment", file);
    }
    if (removeAttachment) {
      formData.append("remove_attachment", "true");
    }

    const response = await axios.put(
      `${API_URL}/customer-notes/${noteId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Toggle note completion
  toggleComplete: async (noteId) => {
    const response = await axios.patch(
      `${API_URL}/customer-notes/${noteId}/toggle`
    );
    return response.data;
  },

  // Toggle note pin
  togglePin: async (noteId) => {
    const response = await axios.patch(`${API_URL}/customer-notes/${noteId}/pin`);
    return response.data;
  },

  // Delete note
  delete: async (noteId) => {
    const response = await axios.delete(`${API_URL}/customer-notes/${noteId}`);
    return response.data;
  },
};
