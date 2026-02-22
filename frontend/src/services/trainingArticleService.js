import axios from "axios";
import { API_BASE_WITH_API_PREFIX } from "../config/api";

const API_URL = `${API_BASE_WITH_API_PREFIX}/training-articles`;

export const trainingArticleService = {
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  create: async ({ title, content, attachment }) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (attachment) {
      formData.append("attachment", attachment);
    }

    const response = await axios.post(API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  update: async (
    articleId,
    { title, content, attachment, removeAttachment },
  ) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (attachment) {
      formData.append("attachment", attachment);
    }
    if (removeAttachment) {
      formData.append("remove_attachment", "true");
    }

    const response = await axios.put(`${API_URL}/${articleId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  delete: async (articleId) => {
    const response = await axios.delete(`${API_URL}/${articleId}`);
    return response.data;
  },
};
