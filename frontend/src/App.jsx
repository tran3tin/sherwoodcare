import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import TimeSheet from "./features/payroll/TimeSheet";
import Report from "./features/payroll/Report";
import "./assets/styles/home.css";

export default function App() {
  return (
    <Layout title="Admin Dashboard" breadcrumb={["Home", "Admin"]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/payroll/time-sheet" element={<TimeSheet />} />
        <Route path="/payroll/report" element={<Report />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}
