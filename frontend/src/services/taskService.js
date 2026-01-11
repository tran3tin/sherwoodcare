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
  create: async (taskData, file = null) => {
    const formData = new FormData();
    Object.keys(taskData).forEach((key) => {
      if (
        taskData[key] !== null &&
        taskData[key] !== undefined &&
        taskData[key] !== ""
      ) {
        formData.append(key, taskData[key]);
      }
    });
    if (file) {
      formData.append("attachment", file);
    }
    const response = await axios.post(`${API_URL}/tasks`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update task (with file upload)
  update: async (taskId, taskData, file = null, removeAttachment = false) => {
    const formData = new FormData();
    Object.keys(taskData).forEach((key) => {
      if (taskData[key] !== null && taskData[key] !== undefined) {
        formData.append(key, taskData[key]);
      }
    });
    if (file) {
      formData.append("attachment", file);
    }
    if (removeAttachment) {
      formData.append("remove_attachment", "true");
    }
    const response = await axios.put(`${API_URL}/tasks/${taskId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
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
};
