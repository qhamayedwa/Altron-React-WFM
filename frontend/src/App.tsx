import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TimeAttendance from './pages/TimeAttendance';
import LeaveManagement from './pages/LeaveManagement';
import Scheduling from './pages/Scheduling';
import UserManagement from './pages/UserManagement';
import OrganizationManagement from './pages/OrganizationManagement';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Payroll from './pages/Payroll';
import Layout from './components/Layout';

import MyTimecard from './pages/MyTimecard';
import MySchedule from './pages/MySchedule';
import MyLeave from './pages/MyLeave';
import TeamCommunication from './pages/TeamCommunication';

import TeamTimecard from './pages/TeamTimecard';
import EmployeeTimecards from './pages/EmployeeTimecards';
import TeamCalendar from './pages/TeamCalendar';
import TimeExceptions from './pages/TimeExceptions';
import ManageSchedules from './pages/ManageSchedules';
import ShiftTypes from './pages/ShiftTypes';
import AIScheduling from './pages/AIScheduling';

import OrganizationDashboard from './pages/OrganizationDashboard';
import CompanyManagement from './pages/CompanyManagement';
import EmployeeImport from './pages/EmployeeImport';
import CreateCompany from './pages/CreateCompany';

import TimeAttendanceAdmin from './pages/TimeAttendanceAdmin';
import ManualTimeEntry from './pages/ManualTimeEntry';
import LeaveTypes from './pages/LeaveTypes';
import LeaveBalances from './pages/LeaveBalances';

import PayCodes from './pages/PayCodes';
import PayRules from './pages/PayRules';
import ApplyLeave from './pages/ApplyLeave';
import MyApplications from './pages/MyApplications';
import TeamApplications from './pages/TeamApplications';
import Notifications from './pages/Notifications';
import Register from './pages/Register';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          
          {/* Personal */}
          <Route path="my-timecard" element={<MyTimecard />} />
          <Route path="my-schedule" element={<MySchedule />} />
          <Route path="my-leave" element={<MyLeave />} />
          <Route path="apply-leave" element={<ApplyLeave />} />
          <Route path="my-applications" element={<MyApplications />} />
          <Route path="team-communication" element={<TeamCommunication />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          
          {/* Management */}
          <Route path="team-timecard" element={<TeamTimecard />} />
          <Route path="employee-timecards" element={<EmployeeTimecards />} />
          <Route path="team-calendar" element={<TeamCalendar />} />
          <Route path="time-exceptions" element={<TimeExceptions />} />
          <Route path="team-applications" element={<TeamApplications />} />
          <Route path="manage-schedules" element={<ManageSchedules />} />
          <Route path="shift-types" element={<ShiftTypes />} />
          <Route path="ai-scheduling" element={<AIScheduling />} />
          
          {/* Organization */}
          <Route path="organization-dashboard" element={<OrganizationDashboard />} />
          <Route path="company-management" element={<CompanyManagement />} />
          <Route path="employee-import" element={<EmployeeImport />} />
          <Route path="create-company" element={<CreateCompany />} />
          
          {/* Administration */}
          <Route path="user-management" element={<UserManagement />} />
          <Route path="register" element={<Register />} />
          <Route path="time-attendance-admin" element={<TimeAttendanceAdmin />} />
          <Route path="manual-time-entry" element={<ManualTimeEntry />} />
          <Route path="leave-types" element={<LeaveTypes />} />
          <Route path="leave-balances" element={<LeaveBalances />} />
          <Route path="pay-codes" element={<PayCodes />} />
          <Route path="pay-rules" element={<PayRules />} />
          
          {/* Legacy routes */}
          <Route path="time-attendance" element={<TimeAttendance />} />
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="scheduling" element={<Scheduling />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="organization" element={<OrganizationManagement />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
