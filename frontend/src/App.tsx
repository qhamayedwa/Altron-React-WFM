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
import EmployeeImportUpload from './pages/EmployeeImportUpload';
import EmployeeImportConfirm from './pages/EmployeeImportConfirm';
import CreateCompany from './pages/CreateCompany';
import ViewCompany from './pages/ViewCompany';
import EditCompany from './pages/EditCompany';

import TimeAttendanceAdmin from './pages/TimeAttendanceAdmin';
import ManualTimeEntry from './pages/ManualTimeEntry';
import LeaveTypes from './pages/LeaveTypes';
import LeaveBalances from './pages/LeaveBalances';
import CreateLeaveType from './pages/CreateLeaveType';
import EditLeaveType from './pages/EditLeaveType';
import ViewLeaveType from './pages/ViewLeaveType';
import CreateDepartment from './pages/CreateDepartment';
import ViewDepartment from './pages/ViewDepartment';
import MyDepartment from './pages/MyDepartment';

import PayCodes from './pages/PayCodes';
import CreatePayCode from './pages/CreatePayCode';
import EditPayCode from './pages/EditPayCode';
import ViewPayCode from './pages/ViewPayCode';
import PayRules from './pages/PayRules';
import CreatePayRule from './pages/CreatePayRule';
import EditPayRule from './pages/EditPayRule';
import ViewPayRule from './pages/ViewPayRule';
import TestPayRules from './pages/TestPayRules';
import CalculatePay from './pages/CalculatePay';
import PayCalculations from './pages/PayCalculations';
import PayCodeConfiguration from './pages/PayCodeConfiguration';
import PayCodesManagement from './pages/PayCodesManagement';
import BulkPayCodeAssignment from './pages/BulkPayCodeAssignment';
import AbsenceManagement from './pages/AbsenceManagement';
import TimecardRollup from './pages/TimecardRollup';
import TimecardRollupDashboard from './pages/TimecardRollupDashboard';
import TimecardRollupConfig from './pages/TimecardRollupConfig';
import SageVIPTimecardConfig from './pages/SageVIPTimecardConfig';
import AutomationWorkflows from './pages/AutomationWorkflows';
import DashboardConfiguration from './pages/DashboardConfiguration';
import NotificationManagement from './pages/NotificationManagement';
import ApplyLeave from './pages/ApplyLeave';
import MyApplications from './pages/MyApplications';
import TeamApplications from './pages/TeamApplications';
import Notifications from './pages/Notifications';
import Register from './pages/Register';
import ImportTimeData from './pages/ImportTimeData';
import CreateSchedule from './pages/CreateSchedule';
import EditSchedule from './pages/EditSchedule';
import CreateShiftType from './pages/CreateShiftType';
import EditShiftType from './pages/EditShiftType';
import CreateRegion from './pages/CreateRegion';
import EditRegion from './pages/EditRegion';
import ViewRegion from './pages/ViewRegion';
import CreateSite from './pages/CreateSite';
import ViewSite from './pages/ViewSite';
import EditSite from './pages/EditSite';
import AssignEmployee from './pages/AssignEmployee';
import PayrollConfiguration from './pages/PayrollConfiguration';
import PayrollPreparation from './pages/PayrollPreparation';
import PayrollProcessing from './pages/PayrollProcessing';
import ApplyLeaveForEmployee from './pages/ApplyLeaveForEmployee';
import ManagerScheduleTool from './pages/ManagerScheduleTool';
import EmployeeScheduleView from './pages/EmployeeScheduleView';
import LeaveSummaryReport from './pages/LeaveSummaryReport';
import OvertimeSummaryReport from './pages/OvertimeSummaryReport';
import TimeSummaryReport from './pages/TimeSummaryReport';
import CustomReportBuilder from './pages/CustomReportBuilder';
import EditBatchSchedules from './pages/EditBatchSchedules';
import AIDashboard from './pages/AIDashboard';
import AIQuery from './pages/AIQuery';
import AISchedulingHistory from './pages/AISchedulingHistory';
import AISchedulingResults from './pages/AISchedulingResults';
import AIScheduleGenerate from './pages/AIScheduleGenerate';
import NotificationTriggerDetail from './pages/NotificationTriggerDetail';
import AutomationDashboard from './pages/AutomationDashboard';
import CreatePulseSurvey from './pages/CreatePulseSurvey';
import PulseSurveyDashboard from './pages/PulseSurveyDashboard';
import RespondPulseSurvey from './pages/RespondPulseSurvey';
import ViewPulseSurvey from './pages/ViewPulseSurvey';
import CreateOrganization from './pages/CreateOrganization';
import OrganizationList from './pages/OrganizationList';
import TenantDashboard from './pages/TenantDashboard';
import SageVIPDashboard from './pages/SageVIPDashboard';
import UserEdit from './pages/UserEdit';
import QuickActions from './pages/QuickActions';

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
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Personal */}
          <Route path="my-timecard" element={<MyTimecard />} />
          <Route path="my-schedule" element={<MySchedule />} />
          <Route path="my-leave" element={<MyLeave />} />
          <Route path="apply-leave" element={<ApplyLeave />} />
          <Route path="my-applications" element={<MyApplications />} />
          <Route path="team-communication" element={<TeamCommunication />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="quick-actions" element={<QuickActions />} />
          
          {/* Management */}
          <Route path="team-timecard" element={<TeamTimecard />} />
          <Route path="employee-timecards" element={<EmployeeTimecards />} />
          <Route path="team-calendar" element={<TeamCalendar />} />
          <Route path="time-exceptions" element={<TimeExceptions />} />
          <Route path="team-applications" element={<TeamApplications />} />
          <Route path="manage-schedules" element={<ManageSchedules />} />
          <Route path="scheduling/create" element={<CreateSchedule />} />
          <Route path="scheduling/edit/:id" element={<EditSchedule />} />
          <Route path="shift-types" element={<ShiftTypes />} />
          <Route path="shift-types/create" element={<CreateShiftType />} />
          <Route path="shift-types/edit/:id" element={<EditShiftType />} />
          <Route path="ai-scheduling" element={<AIScheduling />} />
          <Route path="ai-scheduling/generate" element={<AIScheduleGenerate />} />
          
          {/* AI & Advanced Features - Priority 3 */}
          <Route path="ai/dashboard" element={<AIDashboard />} />
          <Route path="ai/query" element={<AIQuery />} />
          <Route path="ai-scheduling/history" element={<AISchedulingHistory />} />
          <Route path="ai-scheduling/results/:id" element={<AISchedulingResults />} />
          <Route path="notifications/triggers/:id" element={<NotificationTriggerDetail />} />
          <Route path="automation/dashboard" element={<AutomationDashboard />} />
          
          {/* Manager Tools - Priority 2 */}
          <Route path="leave/apply-for-employee" element={<ApplyLeaveForEmployee />} />
          <Route path="scheduling/manager-tool" element={<ManagerScheduleTool />} />
          <Route path="scheduling/employee/:id" element={<EmployeeScheduleView />} />
          <Route path="scheduling/edit-batch" element={<EditBatchSchedules />} />
          
          {/* Organization */}
          <Route path="organization-dashboard" element={<OrganizationDashboard />} />
          <Route path="company-management" element={<CompanyManagement />} />
          <Route path="employee-import" element={<EmployeeImport />} />
          <Route path="employee-import/upload" element={<EmployeeImportUpload />} />
          <Route path="employee-import/confirm" element={<EmployeeImportConfirm />} />
          <Route path="create-company" element={<CreateCompany />} />
          
          {/* Administration */}
          <Route path="user-management" element={<UserManagement />} />
          <Route path="users/edit/:id" element={<UserEdit />} />
          <Route path="register" element={<Register />} />
          <Route path="time-attendance-admin" element={<TimeAttendanceAdmin />} />
          <Route path="manual-time-entry" element={<ManualTimeEntry />} />
          <Route path="import-time-data" element={<ImportTimeData />} />
          <Route path="leave-types" element={<LeaveTypes />} />
          <Route path="leave-types/create" element={<CreateLeaveType />} />
          <Route path="leave-types/edit/:id" element={<EditLeaveType />} />
          <Route path="leave-types/view/:id" element={<ViewLeaveType />} />
          <Route path="leave-balances" element={<LeaveBalances />} />
          
          {/* Organization Department Routes */}
          <Route path="organization/my-department" element={<MyDepartment />} />
          <Route path="organization/departments/create" element={<CreateDepartment />} />
          <Route path="organization/departments/view/:id" element={<ViewDepartment />} />
          
          {/* Organization Region Routes */}
          <Route path="organization/regions/create" element={<CreateRegion />} />
          <Route path="organization/regions/edit/:id" element={<EditRegion />} />
          <Route path="organization/regions/view/:id" element={<ViewRegion />} />
          
          {/* Organization Site Routes */}
          <Route path="organization/sites/create" element={<CreateSite />} />
          <Route path="organization/sites/view/:id" element={<ViewSite />} />
          <Route path="organization/sites/edit/:id" element={<EditSite />} />
          
          {/* Organization Company Routes */}
          <Route path="organization/companies" element={<CompanyManagement />} />
          <Route path="organization/companies/view/:id" element={<ViewCompany />} />
          <Route path="organization/companies/edit/:id" element={<EditCompany />} />
          
          {/* Organization Employee Assignment */}
          <Route path="organization/assign-employee" element={<AssignEmployee />} />
          
          {/* Payroll Routes */}
          <Route path="payroll/configuration" element={<PayrollConfiguration />} />
          <Route path="payroll/preparation" element={<PayrollPreparation />} />
          <Route path="payroll/processing" element={<PayrollProcessing />} />
          
          {/* Specialized Reports - Priority 2 */}
          <Route path="payroll/reports/leave-summary" element={<LeaveSummaryReport />} />
          <Route path="payroll/reports/overtime-summary" element={<OvertimeSummaryReport />} />
          <Route path="payroll/reports/time-summary" element={<TimeSummaryReport />} />
          <Route path="payroll/reports/custom-builder" element={<CustomReportBuilder />} />
          
          <Route path="pay-codes" element={<PayCodes />} />
          <Route path="pay-codes/create" element={<CreatePayCode />} />
          <Route path="pay-codes/edit/:id" element={<EditPayCode />} />
          <Route path="pay-codes/view/:id" element={<ViewPayCode />} />
          <Route path="pay-rules" element={<PayRules />} />
          <Route path="pay-rules/create" element={<CreatePayRule />} />
          <Route path="pay-rules/edit/:id" element={<EditPayRule />} />
          <Route path="pay-rules/view/:id" element={<ViewPayRule />} />
          <Route path="pay-rules/test" element={<TestPayRules />} />
          <Route path="pay-rules/calculate" element={<CalculatePay />} />
          <Route path="pay-rules/calculations" element={<PayCalculations />} />
          <Route path="pay-code-configuration" element={<PayCodeConfiguration />} />
          <Route path="pay-codes-management" element={<PayCodesManagement />} />
          <Route path="pay-codes/bulk-assign" element={<BulkPayCodeAssignment />} />
          <Route path="pay-codes/absences" element={<AbsenceManagement />} />
          <Route path="timecard-rollup" element={<TimecardRollupDashboard />} />
          <Route path="timecard-rollup/configure" element={<TimecardRollupConfig />} />
          <Route path="timecard-rollup/sage-config" element={<SageVIPTimecardConfig />} />
          <Route path="timecard-rollup/history" element={<TimecardRollup />} />
          <Route path="automation-workflows" element={<AutomationWorkflows />} />
          <Route path="dashboard-configuration" element={<DashboardConfiguration />} />
          <Route path="notification-management" element={<NotificationManagement />} />
          
          {/* Priority 4: Pulse Survey Module */}
          <Route path="pulse-survey/create" element={<CreatePulseSurvey />} />
          <Route path="pulse-survey/dashboard" element={<PulseSurveyDashboard />} />
          <Route path="pulse-survey/respond/:id" element={<RespondPulseSurvey />} />
          <Route path="pulse-survey/view/:id" element={<ViewPulseSurvey />} />
          
          {/* Priority 4: Tenant Management Module */}
          <Route path="tenant/organizations" element={<OrganizationList />} />
          <Route path="tenant/organizations/create" element={<CreateOrganization />} />
          <Route path="tenant/dashboard" element={<TenantDashboard />} />
          
          {/* Priority 4: Sage VIP Integration */}
          <Route path="integrations/sage-vip" element={<SageVIPDashboard />} />
          
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
