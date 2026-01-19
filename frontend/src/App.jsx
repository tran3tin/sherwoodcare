import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import TimeSheetForm from "./features/payroll/TimeSheetForm";
import TimeSheetList from "./features/payroll/TimeSheetList";
import TimeSheetReport from "./features/payroll/TimeSheetReport";
import TimeSheetReportList from "./features/payroll/TimeSheetReportList";
import PayrollMyOBUpload from "./features/payroll/PayrollMyOBUpload";
import PayrollNexgenusForm from "./features/nexgenus/PayrollNexgenusForm";
import PayrollNexgenuslist from "./features/nexgenus/PayrollNexgenuslist";
import PayrollNexgenusReport from "./features/nexgenus/PayrollNexgenusReport";
import SocialSheetForm from "./features/payroll/SocialSheetForm";
import SocialParticipantReport from "./features/payroll/SocialParticipantReport";
import SocialEmployeeReport from "./features/payroll/SocialEmployeeReport";
import SocialParticipantList from "./features/payroll/SocialParticipantList";
import ViewSocialSheet from "./features/payroll/ViewSocialSheet";
import EditSocialSheet from "./features/payroll/EditSocialSheet";
import EmployeeList from "./features/employee/EmployeeList";
import CreateEmployee from "./features/employee/CreateEmployee";
import ViewEmployee from "./features/employee/ViewEmployee";
import EditEmployee from "./features/employee/EditEmployee";
import EmployeeNotes from "./features/employee/EmployeeNotes";
import CustomerList from "./features/customer/CustomerList";
import CreateCustomer from "./features/customer/CreateCustomer";
import ViewCustomer from "./features/customer/ViewCustomer";
import EditCustomer from "./features/customer/EditCustomer";
import CustomerNotes from "./features/customer/CustomerNotes";
import CustomerInvoiceList from "./features/invoice/CustomerInvoiceList";
import CreateCustomerInvoice from "./features/invoice/CreateCustomerInvoice";
import EditCustomerInvoice from "./features/invoice/EditCustomerInvoice";
import KanbanBoard from "./features/tasks/KanbanBoard";
import FullNotes from "./features/dashboard/FullNotes";
import "./assets/styles/home.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={<Navigate to="/dashboard/tasks" replace />}
      />
      <Route path="/dashboard/tasks" element={<KanbanBoard />} />
      <Route path="/dashboard/notes" element={<FullNotes />} />
      <Route path="/payroll/timesheets" element={<TimeSheetList />} />
      <Route path="/payroll/reports" element={<TimeSheetReportList />} />
      <Route path="/payroll/time-sheet" element={<TimeSheetForm />} />
      <Route path="/payroll/time-sheet/:id" element={<TimeSheetForm />} />
      <Route path="/payroll/myob-upload" element={<PayrollMyOBUpload />} />
      <Route path="/payroll/social-sheet" element={<SocialSheetForm />} />
      <Route path="/payroll/social-sheet/:id" element={<ViewSocialSheet />} />
      <Route
        path="/payroll/social-sheet/edit/:id"
        element={<EditSocialSheet />}
      />
      <Route
        path="/payroll/social-participants"
        element={<SocialParticipantList />}
      />
      <Route path="/nexgenus/payroll" element={<PayrollNexgenuslist />} />
      <Route path="/nexgenus/payroll/new" element={<PayrollNexgenusForm />} />
      <Route path="/nexgenus/payroll/:id" element={<PayrollNexgenusReport />} />
      <Route
        path="/nexgenus/payroll/edit/:id"
        element={<PayrollNexgenusForm />}
      />
      <Route
        path="/payroll/social-participant-report"
        element={<SocialParticipantReport />}
      />
      <Route
        path="/payroll/social-participant-report/:id"
        element={<SocialParticipantReport />}
      />
      <Route
        path="/payroll/social-employee-report"
        element={<SocialEmployeeReport />}
      />
      <Route
        path="/payroll/social-employee-report/:id"
        element={<SocialEmployeeReport />}
      />
      <Route path="/payroll/report" element={<TimeSheetReport />} />
      <Route path="/payroll/report/:id" element={<TimeSheetReport />} />
      <Route path="/employee" element={<EmployeeList />} />
      <Route path="/employee/create" element={<CreateEmployee />} />
      <Route path="/employee/:id" element={<ViewEmployee />} />
      <Route path="/employee/edit/:id" element={<EditEmployee />} />
      <Route path="/employee/:employeeId/notes" element={<EmployeeNotes />} />
      <Route path="/customer" element={<CustomerList />} />
      <Route path="/customer/create" element={<CreateCustomer />} />
      <Route path="/customer/:id" element={<ViewCustomer />} />
      <Route path="/customer/edit/:id" element={<EditCustomer />} />
      <Route path="/customer/:customerId/notes" element={<CustomerNotes />} />
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
