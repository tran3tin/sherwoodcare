import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import Layout from "../../components/Layout";
import { chatbotService } from "../../services/chatbotService";
import "./AIChatbot.css";

export default function AIChatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Xin chào! 👋 Tôi là trợ lý AI của NexGenus. Tôi có thể giúp bạn tra cứu thông tin trong hệ thống như:\n\n- Thông tin nhân viên, khách hàng\n- Dữ liệu timesheet, payroll\n- Ghi chú, công việc (tasks)\n- Và nhiều thông tin khác...\n\nHãy đặt câu hỏi bằng tiếng Việt hoặc tiếng Anh!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [schema, setSchema] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (customMessage = null) => {
    const messageToSend = customMessage || input.trim();
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
          queryResults: response.queryResults,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        role: "assistant",
        content: `❌ Xin lỗi, đã có lỗi xảy ra: ${
          error.response?.data?.error || error.message
        }`,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa lịch sử chat?")) return;

    try {
      await chatbotService.clearSession();
      setMessages([
        {
          role: "assistant",
          content: "Chat đã được xóa. Tôi sẵn sàng giúp bạn! 🚀",
        },
      ]);
      toast.success("Chat cleared");
    } catch (error) {
      toast.error("Failed to clear chat");
    }
  };

  const handleShowSchema = async () => {
    if (schema) {
      setShowSchema(!showSchema);
      return;
    }

    try {
      const response = await chatbotService.getSchema();
      if (response.success) {
        setSchema(response.data);
        setShowSchema(true);
      }
    } catch (error) {
      toast.error("Failed to load schema");
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === "user";

    return (
      <div
        key={index}
        className={`chat-message ${isUser ? "user" : "assistant"} ${
          msg.isError ? "error" : ""
        }`}
      >
        <div className="message-avatar">
          {isUser ? (
            <i className="fas fa-user"></i>
          ) : (
            <i className="fas fa-robot"></i>
          )}
        </div>
        <div className="message-content">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                if (!inline && match) {
                  return (
                    <pre className={`code-block language-${match[1]}`}>
                      <code {...props}>{children}</code>
                    </pre>
                  );
                }
                return (
                  <code className="inline-code" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="chatbot-container">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-title">
            <h2>
              <i className="fas fa-comments"></i> AI Assistant
            </h2>
          </div>
          <div className="chatbot-actions">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleShowSchema}
              title="View database schema"
            >
              <i className="fas fa-database"></i>
              {showSchema ? " Hide Schema" : " Schema"}
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleClearChat}
              title="Clear chat history"
            >
              <i className="fas fa-trash"></i> Clear
            </button>
          </div>
        </div>

        <div className="chatbot-body">
          {/* Schema Panel */}
          {showSchema && schema && (
            <div className="schema-panel">
              <h4>
                <i className="fas fa-sitemap"></i> Database Schema
              </h4>
              <div className="schema-content">
                {Object.entries(schema.tables).map(([tableName, tableInfo]) => (
                  <div key={tableName} className="schema-table">
                    <div className="table-name">
                      <i className="fas fa-table"></i> {tableName}
                    </div>
                    <div className="table-columns">
                      {tableInfo.columns.slice(0, 5).map((col) => (
                        <span key={col.name} className="column-tag">
                          {col.isPrimaryKey && <i className="fas fa-key"></i>}
                          {col.name}
                        </span>
                      ))}
                      {tableInfo.columns.length > 5 && (
                        <span className="column-more">
                          +{tableInfo.columns.length - 5} more
                        </span>
                      )}
                    </div>
                    {tableInfo.foreignKeys.length > 0 && (
                      <div className="table-fks">
                        {tableInfo.foreignKeys.map((fk, i) => (
                          <span key={i} className="fk-tag">
                            <i className="fas fa-link"></i>
                            {fk.column} → {fk.referencesTable}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, index) => renderMessage(msg, index))}

            {loading && (
              <div className="chat-message assistant loading">
                <div className="message-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="chatbot-input">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn... (Enter để gửi)"
              rows="1"
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
          <p className="input-hint">
            <i className="fas fa-info-circle"></i> AI có thể tra cứu dữ liệu
            employees, customers, timesheets, tasks, và nhiều bảng khác.
          </p>
        </div>
      </div>
    </Layout>
  );
}
