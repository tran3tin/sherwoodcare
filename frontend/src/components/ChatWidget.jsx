import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import { chatbotService } from "../services/chatbotService";
import "./ChatWidget.css";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Xin chào! 👋\n\nBạn cần tôi giúp gì?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const messageToSend = input.trim();
    if (!messageToSend || loading) return;

    // Add user message
    const userMessage = { role: "user", content: messageToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(messageToSend);

      if (response.success) {
        const assistantMessage = {
          role: "assistant",
          content: response.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        role: "assistant",
        content: `❌ Xin lỗi, đã có lỗi: ${
          error.response?.data?.error || error.message
        }`,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    try {
      await chatbotService.clearSession();
      setMessages([
        {
          role: "assistant",
          content: "Đã xóa lịch sử chat! 🚀",
        },
      ]);
      toast.success("Đã xóa chat");
    } catch (error) {
      toast.error("Không thể xóa chat");
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Widget */}
      <div className={`chat-widget ${isOpen ? "open" : ""}`}>
        {/* Chat Header */}
        <div className="chat-widget-header">
          <div className="header-left">
            <div className="ai-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div className="header-info">
              <h4>AI Assistant</h4>
              <span className="status">
                <i className="fas fa-circle"></i> Online
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="icon-btn"
              onClick={handleClearChat}
              title="Xóa lịch sử"
            >
              <i className="fas fa-trash"></i>
            </button>
            <button className="icon-btn" onClick={toggleChat} title="Thu nhỏ">
              <i className="fas fa-minus"></i>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-widget-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-msg ${msg.role} ${msg.isError ? "error" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="msg-avatar ai">
                  <i className="fas fa-robot"></i>
                </div>
              )}
              <div className="msg-content-wrapper">
                <div className="msg-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <div className="msg-time">
                  {new Date().toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              {msg.role === "user" && (
                <div className="msg-avatar user">
                  <i className="fas fa-user"></i>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-msg assistant">
              <div className="msg-avatar ai">
                <i className="fas fa-robot"></i>
              </div>
              <div className="msg-content-wrapper">
                <div className="msg-content">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="chat-widget-input">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            rows="1"
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>

      {/* Chat Toggle Button */}
      <button className="chat-widget-toggle" onClick={toggleChat}>
        {isOpen ? (
          <i className="fas fa-times"></i>
        ) : (
          <i className="fas fa-robot"></i>
        )}
      </button>
    </>
  );
}
