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
          <Route path="time-attendance" element={<TimeAttendance />} />
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="scheduling" element={<Scheduling />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="organization" element={<OrganizationManagement />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
