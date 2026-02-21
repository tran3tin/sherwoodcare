import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { API_BASE_WITH_API_PREFIX } from "./config/api";
import Home from "./pages/Home";
import Login from "./pages/Login";
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
import CustomerLedger from "./features/customer/CustomerLedger";
import CreateCustomer from "./features/customer/CreateCustomer";
import ViewCustomer from "./features/customer/ViewCustomer";
import EditCustomer from "./features/customer/EditCustomer";
import CustomerNotes from "./features/customer/CustomerNotes";
import KanbanBoard from "./features/tasks/KanbanBoard";
import FullNotes from "./features/dashboard/FullNotes";
import IAS from "./features/tax/IAS";
import BAS from "./features/tax/BAS";
import "./assets/styles/home.css";

function RequireAuth({ isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("simple_auth") === "true",
  );

  // ── Keep backend alive (ping every 4 minutes) ──────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const ping = () =>
      fetch(`${API_BASE_WITH_API_PREFIX}/health`, { method: "GET" }).catch(
        () => {},
      );
    ping(); // ping immediately on load
    const id = setInterval(ping, 4 * 60 * 1000); // every 4 minutes
    return () => clearInterval(id);
  }, [isAuthenticated]);

  const handleLogin = (email, password) => {
    const isValid =
      email === "tran3tin@gmail.com" && password === "140293NgocDiem!";

    if (isValid) {
      localStorage.setItem("simple_auth", "true");
      setIsAuthenticated(true);
      return true;
    }

    return false;
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard/tasks" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />

      <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
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
        <Route
          path="/nexgenus/payroll/:id"
          element={<PayrollNexgenusReport />}
        />
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
        <Route path="/customer/ledger" element={<CustomerLedger />} />
        <Route path="/customer/create" element={<CreateCustomer />} />
        <Route path="/customer/:id" element={<ViewCustomer />} />
        <Route path="/customer/edit/:id" element={<EditCustomer />} />
        <Route path="/customer/:customerId/notes" element={<CustomerNotes />} />
        <Route path="/tax/ias" element={<IAS />} />
        <Route path="/tax/bas" element={<BAS />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
