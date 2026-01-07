import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../assets/images/Sherwood-care-logo.webp";

const menuItems = [
  {
    title: "Dashboard",
    icon: "flaticon-dashboard",
    submenu: [
      { title: "Admin", path: "/" },
      { title: "Students", path: "/students-dashboard" },
      { title: "Parents", path: "/parents-dashboard" },
    ],
  },
  {
    title: "Payroll",
    icon: "flaticon-list",
    submenu: [
      { title: "Timesheet List", path: "/payroll/timesheets" },
      { title: "Timesheet Reports", path: "/payroll/reports" },
      {
        title: "Social List",
        path: "/payroll/social-participants",
      },
    ],
  },
  {
    title: "NexGenus",
    icon: "flaticon-shopping-bag",
    submenu: [{ title: "Payroll NexGenus List", path: "/nexgenus/payroll" }],
  },
  {
    title: "Employee",
    icon: "flaticon-multiple-users-silhouette",
    submenu: [{ title: "Employee List", path: "/employee" }],
  },
  {
    title: "Customer",
    icon: "flaticon-user",
    submenu: [
      { title: "Customer List", path: "/customer" },
      { title: "Invoices", path: "/customer-invoices" },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const [openMenus, setOpenMenus] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebarOpenMenus");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const toggleSubmenu = (index) => {
    setOpenMenus((prev) => {
      const newState = { ...prev, [index]: !prev[index] };
      localStorage.setItem("sidebarOpenMenus", JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <>
      {/* Mobile header */}
      <div className="mobile-sidebar-header d-md-none">
        <div className="header-logo">
          <Link to="/">
            <img
              src={logo}
              alt="logo"
              style={{ maxWidth: "100%", maxHeight: "50px" }}
            />
          </Link>
        </div>
      </div>

      <div className="sidebar-menu-content">
        <ul className="nav nav-sidebar-menu sidebar-toggle-view">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`nav-item ${item.submenu ? "sidebar-nav-item" : ""} ${
                openMenus[index] ? "active" : ""
              }`}
            >
              {item.submenu ? (
                <>
                  <a
                    href="#"
                    className="nav-link"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSubmenu(index);
                    }}
                  >
                    <i className={item.icon}></i>
                    <span>{item.title}</span>
                  </a>
                  <ul
                    className={`nav sub-group-menu ${
                      openMenus[index] ? "sub-group-active" : ""
                    }`}
                  >
                    {item.submenu.map((sub, subIndex) => (
                      <li key={subIndex} className="nav-item">
                        <NavLink
                          to={sub.path}
                          className={({ isActive }) =>
                            `nav-link ${isActive ? "menu-active" : ""}`
                          }
                        >
                          <i className="fas fa-angle-right"></i>
                          {sub.title}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "menu-active" : ""}`
                  }
                >
                  <i className={item.icon}></i>
                  <span>{item.title}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
