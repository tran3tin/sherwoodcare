import axios from "axios";

import { API_BASE_WITH_API_PREFIX } from "../config/api";

const API_URL = API_BASE_WITH_API_PREFIX;

export const taskService = {
  // Get all tasks (grouped by status)
  getAll: async () => {
    const response = await axios.get(`${API_URL}/tasks`);
    return response.data;
  },

  // Get single task
  getById: async (taskId) => {
    const response = await axios.get(`${API_URL}/tasks/${taskId}`);
    return response.data;
  },

  // Create new task (with file upload)
  create: async (taskData, files = null) => {
    const formData = new FormData();
    Object.keys(taskData).forEach((key) => {
      const value = taskData[key];
      // Only append non-empty values (skip null, undefined, empty string)
      // This prevents PostgreSQL DATE type error with empty strings
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, value);
      }
    });

    if (files) {
      if (files instanceof FileList || Array.isArray(files)) {
        Array.from(files).forEach((file) => {
          formData.append("attachments", file);
        });
      } else {
        formData.append("attachments", files);
      }
    }

    try {
      const response = await axios.post(`${API_URL}/tasks`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Task create error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Update task (with file upload)
  update: async (taskId, taskData, files = null, removeAttachmentIds = []) => {
    const formData = new FormData();
    Object.keys(taskData).forEach((key) => {
      const value = taskData[key];
      // Append all values except null/undefined (allow empty string for clearing fields)
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (files) {
      if (files instanceof FileList || Array.isArray(files)) {
        Array.from(files).forEach((file) => {
          formData.append("attachments", file);
        });
      } else {
        formData.append("attachments", files);
      }
    }

    if (removeAttachmentIds && removeAttachmentIds.length > 0) {
      formData.append(
        "remove_attachment_ids",
        JSON.stringify(removeAttachmentIds),
      );
    }

    try {
      const response = await axios.put(`${API_URL}/tasks/${taskId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Task update error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Update task position (drag & drop)
  updatePosition: async (taskId, status, position) => {
    const response = await axios.patch(`${API_URL}/tasks/${taskId}/position`, {
      status,
      position,
    });
    return response.data;
  },

  // Reorder tasks in a column
  reorder: async (status, taskIds) => {
    const response = await axios.post(`${API_URL}/tasks/reorder`, {
      status,
      taskIds,
    });
    return response.data;
  },

  // Delete task
  delete: async (taskId) => {
    const response = await axios.delete(`${API_URL}/tasks/${taskId}`);
    return response.data;
  },

  // Get task counts
  getCounts: async () => {
    const response = await axios.get(`${API_URL}/tasks/counts`);
    return response.data;
  },

  // Toggle task pin
  togglePin: async (taskId) => {
    const response = await axios.patch(`${API_URL}/tasks/${taskId}/pin`);
    return response.data;
  },
};
