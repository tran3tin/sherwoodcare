import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../assets/styles/app.css";

export default function Layout({
  children,
  title = "Dashboard",
  breadcrumb = ["Home"],
}) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed(!collapsed);

  return (
    <div
      id="wrapper"
      className={`wrapper bg-ash ${collapsed ? "sidebar-collapsed" : ""}`}
    >
      {/* Header */}
      <Header onToggle={toggle} />

      {/* Page Area */}
      <div className="dashboard-page-one">
        {/* Sidebar */}
        <div
          className={`sidebar-main sidebar-menu-one sidebar-expand-md sidebar-color ${
            collapsed ? "sidebar-collapsed" : ""
          }`}
        >
          <Sidebar collapsed={collapsed} onToggle={toggle} />
        </div>

        {/* Main Content */}
        <div className="dashboard-content-one">
          {/* Breadcrumbs */}
          <div className="breadcrumbs-area">
            <h3>{title}</h3>
            <ul>
              {breadcrumb.map((item, index) => (
                <li key={index}>
                  {index < breadcrumb.length - 1 ? (
                    <Link to="/">{item}</Link>
                  ) : (
                    item
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Page Content */}
          {children}

          {/* Footer */}
          <footer className="footer-wrap-layout1">
            <div className="copyright">
              © Copyrights <a href="#">Sherwoodcare</a> 2025. All rights
              reserved.
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
