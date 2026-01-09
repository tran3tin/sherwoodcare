import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/Sherwood-care-logo.webp";
import { notificationService } from "../services/notificationService";

export default function Header({ onToggle }) {
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    const result = await notificationService.getDueNotes();
    if (result.success) {
      setNotifications(result.data);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === "employee") {
      navigate(`/employee/${notification.employeeId}/notes`);
    } else if (notification.type === "customer") {
      navigate(`/customer/${notification.customerId}/notes`);
    }
    setShowNotifications(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-danger";
      case "medium":
        return "bg-warning";
      case "low":
        return "bg-info";
      default:
        return "bg-secondary";
    }
  };

  const formatDueDate = (dueDate, isOverdue, isDueToday) => {
    if (isOverdue) return "Quá hạn";
    if (isDueToday) return "Hôm nay";
    const date = new Date(dueDate);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "Ngày mai";
    if (diffDays <= 7) return `${diffDays} ngày nữa`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="navbar navbar-expand-md header-menu-one bg-light">
      {/* Logo and Toggle */}
      <div className="nav-bar-header-one">
        <div className="header-logo">
          <Link to="/">
            <img
              src={logo}
              alt="logo"
              style={{ maxWidth: "100%", maxHeight: "60px" }}
            />
          </Link>
        </div>
        <div className="toggle-button sidebar-toggle">
          <button type="button" className="item-link" onClick={onToggle}>
            <span className="btn-icon-wrap">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile toggle */}
      <div className="d-md-none mobile-nav-bar">
        <button className="navbar-toggler pulse-animation" type="button">
          <i className="far fa-arrow-alt-circle-down"></i>
        </button>
        <button
          type="button"
          className="navbar-toggler sidebar-toggle-mobile"
          onClick={onToggle}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* Main menu */}
      <div className="header-main-menu collapse navbar-collapse">
        <ul className="navbar-nav">
          {/* Search */}
          <li className="navbar-item header-search-bar">
            <div className="input-group stylish-input-group">
              <span className="input-group-addon">
                <button type="submit">
                  <span className="flaticon-search" aria-hidden="true"></span>
                </button>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Find Something . . ."
              />
            </div>
          </li>
        </ul>

        <ul className="navbar-nav">
          {/* Admin dropdown */}
          <li
            className={`navbar-item dropdown header-admin ${
              showAdmin ? "show" : ""
            }`}
          >
            <a
              className="navbar-nav-link dropdown-toggle"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowAdmin(!showAdmin);
              }}
            >
              <div className="admin-title">
                <h5 className="item-title">Admin User</h5>
                <span>Admin</span>
              </div>
              <div className="admin-img">
                <img src="/img/figure/admin.jpg" alt="Admin" />
              </div>
            </a>
            {showAdmin && (
              <div className="dropdown-menu dropdown-menu-right show">
                <div className="item-header">
                  <h6 className="item-title">Admin User</h6>
                </div>
                <div className="item-content">
                  <ul className="settings-list">
                    <li>
                      <Link to="/profile">
                        <i className="flaticon-user"></i>My Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/tasks">
                        <i className="flaticon-list"></i>Task
                      </Link>
                    </li>
                    <li>
                      <Link to="/messages">
                        <i className="flaticon-chat-comment-oval-speech-bubble-with-text-lines"></i>
                        Message
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings">
                        <i className="flaticon-gear-loading"></i>Account
                        Settings
                      </Link>
                    </li>
                    <li>
                      <Link to="/login">
                        <i className="flaticon-turn-off"></i>Log Out
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </li>

          {/* Messages dropdown */}
          <li
            className={`navbar-item dropdown header-message ${
              showMessages ? "show" : ""
            }`}
          >
            <a
              className="navbar-nav-link dropdown-toggle"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowMessages(!showMessages);
              }}
            >
              <i className="far fa-envelope"></i>
              <span>5</span>
            </a>
            {showMessages && (
              <div className="dropdown-menu dropdown-menu-right show">
                <div className="item-header">
                  <h6 className="item-title">05 Messages</h6>
                </div>
                <div className="item-content">
                  <div className="media">
                    <div className="item-img bg-skyblue">
                      <img src="/img/figure/student11.png" alt="img" />
                    </div>
                    <div className="media-body">
                      <div className="item-title">
                        <span className="item-name">Maria Zaman</span>
                        <span className="item-time">18:30</span>
                      </div>
                      <p>New message received...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* Notifications dropdown */}
          <li
            className={`navbar-item dropdown header-notification ${
              showNotifications ? "show" : ""
            }`}
          >
            <a
              className="navbar-nav-link dropdown-toggle"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowNotifications(!showNotifications);
              }}
            >
              <i className="far fa-bell"></i>
              {notifications.length > 0 && <span>{notifications.length}</span>}
            </a>
            {showNotifications && (
              <div
                className="dropdown-menu dropdown-menu-right show"
                style={{
                  minWidth: "350px",
                  maxHeight: "500px",
                  overflowY: "auto",
                }}
              >
                <div className="item-header">
                  <h6 className="item-title">
                    {notifications.length} Thông báo ghi chú đến hạn
                  </h6>
                </div>
                <div className="item-content">
                  {notifications.length === 0 ? (
                    <div className="text-center py-3 text-muted">
                      Không có thông báo mới
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="media"
                        style={{
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                          padding: "10px",
                        }}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div
                          className={`item-icon ${getPriorityColor(
                            notification.priority
                          )}`}
                        >
                          <i
                            className={
                              notification.type === "employee"
                                ? "fas fa-user"
                                : "fas fa-building"
                            }
                          ></i>
                        </div>
                        <div className="media-body" style={{ flex: 1 }}>
                          <div
                            className="post-title"
                            style={{ fontWeight: "600" }}
                          >
                            {notification.title}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginTop: "4px",
                            }}
                          >
                            {notification.type === "employee"
                              ? `Nhân viên: ${notification.employeeName}`
                              : `Khách hàng: ${notification.customerName}`}
                          </div>
                          <span
                            style={{
                              fontSize: "11px",
                              color: notification.isOverdue
                                ? "#dc3545"
                                : notification.isDueToday
                                ? "#ffc107"
                                : "#666",
                              fontWeight:
                                notification.isOverdue ||
                                notification.isDueToday
                                  ? "600"
                                  : "normal",
                            }}
                          >
                            {formatDueDate(
                              notification.dueDate,
                              notification.isOverdue,
                              notification.isDueToday
                            )}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div
                    className="item-footer"
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderTop: "1px solid #eee",
                    }}
                  >
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                      style={{ fontSize: "12px", color: "#007bff" }}
                    >
                      Xem tất cả thông báo
                    </Link>
                  </div>
                )}
              </div>
            )}
          </li>

          {/* Language */}
          <li className="navbar-item dropdown header-language">
            <a className="navbar-nav-link dropdown-toggle" href="#">
              <i className="fas fa-globe-americas"></i>EN
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
