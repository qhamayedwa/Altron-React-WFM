import React from 'react';
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
import LeaveBalancesPage from './pages/LeaveBalancesPage';
import LeaveApplicationsPage from './pages/LeaveApplicationsPage';
import LeaveApprovalsPage from './pages/LeaveApprovalsPage';
import LeaveTypesPage from './pages/LeaveTypesPage';
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
              <Route path="/time" element={<TimeTrackingPage />} />
              <Route path="/time/entries" element={<TimeEntriesPage />} />
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
