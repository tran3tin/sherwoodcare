const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

// Main chatbot endpoint
router.post("/message", chatbotController.chatbot);

// Clear chat session
router.post("/clear", chatbotController.clearSession);

// Get database schema
router.get("/schema", chatbotController.getSchema);

// Direct query endpoint (for testing)
router.post("/query", chatbotController.query);

module.exports = router;
