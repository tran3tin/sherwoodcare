import axios from "axios";
import { API_BASE_WITH_API_PREFIX } from "../config/api";

const API_URL = `${API_BASE_WITH_API_PREFIX}/training-articles`;

export const trainingArticleService = {
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getById: async (articleId) => {
    const response = await axios.get(`${API_URL}/${articleId}`);
    return response.data;
  },

  create: async ({ title, content, attachments = [] }) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    attachments.forEach((file) => formData.append("attachments", file));

    const response = await axios.post(API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  update: async (
    articleId,
    { title, content, attachments = [], removeAttachment, removeAttachmentUrls },
  ) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    attachments.forEach((file) => formData.append("attachments", file));
    if (removeAttachment) {
      formData.append("remove_attachment", "true");
    }
    if (Array.isArray(removeAttachmentUrls) && removeAttachmentUrls.length > 0) {
      formData.append(
        "remove_attachment_urls",
        JSON.stringify(removeAttachmentUrls),
      );
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
