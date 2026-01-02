import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TimeSheetForm from "./features/payroll/TimeSheetForm";
import TimeSheetList from "./features/payroll/TimeSheetList";
import Report from "./features/payroll/Report";
import Employee from "./features/employee/Employee";
import CreateEmployee from "./features/employee/CreateEmployee";
import "./assets/styles/home.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/payroll/timesheets" element={<TimeSheetList />} />
      <Route path="/payroll/time-sheet" element={<TimeSheetForm />} />
      <Route path="/payroll/time-sheet/:id" element={<TimeSheetForm />} />
      <Route path="/payroll/report" element={<Report />} />
      <Route path="/payroll/report/:id" element={<Report />} />
      <Route path="/employee" element={<Employee />} />
      <Route path="/employee/create" element={<CreateEmployee />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
