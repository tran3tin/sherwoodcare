import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Generate a unique session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("chatbot_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    sessionStorage.setItem("chatbot_session_id", sessionId);
  }
  return sessionId;
};

export const chatbotService = {
  /**
   * Send a message to the chatbot
   */
  sendMessage: async (message) => {
    const response = await axios.post(`${API_URL}/chatbot/message`, {
      message,
      sessionId: getSessionId(),
    });
    return response.data;
  },

  /**
   * Clear chat session
   */
  clearSession: async () => {
    sessionStorage.removeItem("chatbot_session_id");
    const response = await axios.post(`${API_URL}/chatbot/clear`, {
      sessionId: getSessionId(),
    });
    return response.data;
  },

  /**
   * Get database schema
   */
  getSchema: async () => {
    const response = await axios.get(`${API_URL}/chatbot/schema`);
    return response.data;
  },

  /**
   * Execute direct query (for advanced users)
   */
  query: async (sql, limit = 100) => {
    const response = await axios.post(`${API_URL}/chatbot/query`, {
      sql,
      limit,
    });
    return response.data;
  },

  /**
   * Get new session ID
   */
  newSession: () => {
    sessionStorage.removeItem("chatbot_session_id");
    return getSessionId();
  },
};

export default chatbotService;
