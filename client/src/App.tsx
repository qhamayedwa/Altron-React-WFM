import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { TimeTrackingPage } from './pages/TimeTrackingPage';
import { TimeEntriesPage } from './pages/TimeEntriesPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { ManualTimeEntryPage } from './pages/ManualTimeEntryPage';
import { TeamTimecardPage } from './pages/TeamTimecardPage';
import { EmployeeImportPage } from './pages/EmployeeImportPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { QuickActionsPage } from './pages/QuickActionsPage';
import { TeamCalendarPage } from './pages/TeamCalendarPage';
import { DepartmentManagementPage } from './pages/DepartmentManagementPage';
import { ShiftAssignmentPage } from './pages/ShiftAssignmentPage';
import { TimeEntryCorrectionsPage } from './pages/TimeEntryCorrectionsPage';
import LeaveBalancesPage from './pages/LeaveBalancesPage';
import LeaveApplicationsPage from './pages/LeaveApplicationsPage';
import LeaveApprovalsPage from './pages/LeaveApprovalsPage';
import LeaveTypesPage from './pages/LeaveTypesPage';
import ShiftTypesPage from './pages/ShiftTypesPage';
import TeamSchedulePage from './pages/TeamSchedulePage';
import MySchedulePage from './pages/MySchedulePage';
import PayCodesPage from './pages/PayCodesPage';
import PayRulesPage from './pages/PayRulesPage';
import PayrollCalculatePage from './pages/PayrollCalculatePage';
import PayrollReportsPage from './pages/PayrollReportsPage';
import AIDashboardPage from './pages/AIDashboardPage';
import AINaturalQueryPage from './pages/AINaturalQueryPage';
import AISchedulingOptimizerPage from './pages/AISchedulingOptimizerPage';
import AIPayrollInsightsPage from './pages/AIPayrollInsightsPage';
import AIAttendanceAnalyzerPage from './pages/AIAttendanceAnalyzerPage';
import OrganizationDashboardPage from './pages/OrganizationDashboardPage';
import OrgHierarchyPage from './pages/OrgHierarchyPage';
import NotificationsPage from './pages/NotificationsPage';
import SageVipPage from './pages/SageVipPage';
import ReportsPage from './pages/ReportsPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/quick-actions" element={<QuickActionsPage />} />
              <Route path="/time" element={<TimeTrackingPage />} />
              <Route path="/time/entries" element={<TimeEntriesPage />} />
              <Route
                path="/time/manual-entry"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'Super User', 'system_super_admin', 'Admin']}>
                    <ManualTimeEntryPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/time/team-timecard"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'Super User', 'system_super_admin', 'Admin']}>
                    <TeamTimecardPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/time/corrections"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'Admin', 'Super User', 'system_super_admin']}>
                    <TimeEntryCorrectionsPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/approvals"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'Super User', 'system_super_admin', 'Admin']}>
                    <ApprovalsPage />
                  </RoleProtectedRoute>
                }
              />
              
              <Route path="/leave/balances" element={<LeaveBalancesPage />} />
              <Route path="/leave/applications" element={<LeaveApplicationsPage />} />
              <Route
                path="/leave/approvals"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'Super User', 'system_super_admin', 'Admin']}>
                    <LeaveApprovalsPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/leave/types"
                element={
                  <RoleProtectedRoute allowedRoles={['Admin', 'Super User', 'system_super_admin']}>
                    <LeaveTypesPage />
                  </RoleProtectedRoute>
                }
              />
              
              <Route path="/scheduling/my-schedule" element={<MySchedulePage />} />
              <Route
                path="/scheduling/team"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'Admin', 'Super User', 'system_super_admin']}>
                    <TeamSchedulePage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/scheduling/shift-types"
                element={
                  <RoleProtectedRoute allowedRoles={['Admin', 'Super User', 'system_super_admin']}>
                    <ShiftTypesPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/scheduling/calendar"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'Admin', 'Super User', 'system_super_admin']}>
                    <TeamCalendarPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/scheduling/assign"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'Admin', 'Super User', 'system_super_admin']}>
                    <ShiftAssignmentPage />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/payroll/pay-codes"
                element={
                  <RoleProtectedRoute allowedRoles={['Admin', 'Payroll', 'Super User', 'system_super_admin']}>
                    <PayCodesPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/payroll/pay-rules"
                element={
                  <RoleProtectedRoute allowedRoles={['Super User', 'system_super_admin']}>
                    <PayRulesPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/payroll/calculate"
                element={
                  <RoleProtectedRoute allowedRoles={['Super User', 'system_super_admin']}>
                    <PayrollCalculatePage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/payroll/reports"
                element={
                  <RoleProtectedRoute allowedRoles={['Payroll', 'Super User', 'system_super_admin']}>
                    <PayrollReportsPage />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/ai/dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'HR', 'Super User', 'system_super_admin']}>
                    <AIDashboardPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/ai/natural-query"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'HR', 'Payroll', 'Admin', 'Super User', 'system_super_admin']}>
                    <AINaturalQueryPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/ai/scheduling-optimizer"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'Super User', 'system_super_admin']}>
                    <AISchedulingOptimizerPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/ai/payroll-insights"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'Payroll', 'Admin', 'Super User', 'system_super_admin']}>
                    <AIPayrollInsightsPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/ai/attendance-analyzer"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'HR', 'Payroll', 'Admin', 'Super User', 'system_super_admin']}>
                    <AIAttendanceAnalyzerPage />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/organization"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'HR', 'Admin', 'Super User', 'system_super_admin']}>
                    <OrganizationDashboardPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/organization/hierarchy"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'HR', 'Admin', 'Super User', 'system_super_admin']}>
                    <OrgHierarchyPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/organization/hierarchy/:companyId"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'HR', 'Admin', 'Super User', 'system_super_admin']}>
                    <OrgHierarchyPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/organization/import"
                element={
                  <RoleProtectedRoute allowedRoles={['HR', 'Admin', 'Super User', 'system_super_admin']}>
                    <EmployeeImportPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/organization/users"
                element={
                  <RoleProtectedRoute allowedRoles={['HR', 'Admin', 'Super User', 'system_super_admin']}>
                    <UserManagementPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/organization/departments"
                element={
                  <RoleProtectedRoute allowedRoles={['HR', 'Admin', 'Super User', 'system_super_admin']}>
                    <DepartmentManagementPage />
                  </RoleProtectedRoute>
                }
              />
              
              <Route path="/notifications" element={<NotificationsPage />} />
              
              <Route
                path="/sage-vip"
                element={
                  <RoleProtectedRoute allowedRoles={['Super User', 'Admin', 'Payroll', 'system_super_admin']}>
                    <SageVipPage />
                  </RoleProtectedRoute>
                }
              />
              
              <Route
                path="/reports"
                element={
                  <RoleProtectedRoute allowedRoles={['Manager', 'Admin', 'HR', 'Payroll', 'Super User', 'system_super_admin']}>
                    <ReportsPage />
                  </RoleProtectedRoute>
                }
              />
              
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
