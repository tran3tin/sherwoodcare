import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TimeSheetForm from "./features/payroll/TimeSheetForm";
import TimeSheetList from "./features/payroll/TimeSheetList";
import TimeSheetReport from "./features/payroll/TimeSheetReport";
import TimeSheetReportList from "./features/payroll/TimeSheetReportList";
import SocialSheetForm from "./features/payroll/SocialSheetForm";
import EmployeeList from "./features/employee/EmployeeList";
import CreateEmployee from "./features/employee/CreateEmployee";
import CustomerList from "./features/customer/CustomerList";
import CreateCustomer from "./features/customer/CreateCustomer";
import ViewCustomer from "./features/customer/ViewCustomer";
import EditCustomer from "./features/customer/EditCustomer";
import CustomerInvoiceList from "./features/invoice/CustomerInvoiceList";
import CreateCustomerInvoice from "./features/invoice/CreateCustomerInvoice";
import EditCustomerInvoice from "./features/invoice/EditCustomerInvoice";
import "./assets/styles/home.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/payroll/timesheets" element={<TimeSheetList />} />
      <Route path="/payroll/reports" element={<TimeSheetReportList />} />
      <Route path="/payroll/time-sheet" element={<TimeSheetForm />} />
      <Route path="/payroll/time-sheet/:id" element={<TimeSheetForm />} />
      <Route path="/payroll/social-sheet" element={<SocialSheetForm />} />
      <Route path="/payroll/report" element={<TimeSheetReport />} />
      <Route path="/payroll/report/:id" element={<TimeSheetReport />} />
      <Route path="/employee" element={<EmployeeList />} />
      <Route path="/employee/create" element={<CreateEmployee />} />
      <Route path="/customer" element={<CustomerList />} />
      <Route path="/customer/create" element={<CreateCustomer />} />
      <Route path="/customer/:id" element={<ViewCustomer />} />
      <Route path="/customer/edit/:id" element={<EditCustomer />} />
      <Route path="/customer-invoices" element={<CustomerInvoiceList />} />
      <Route
        path="/customer-invoices/create"
        element={<CreateCustomerInvoice />}
      />
      <Route
        path="/customer-invoices/edit/:id"
        element={<EditCustomerInvoice />}
      />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
