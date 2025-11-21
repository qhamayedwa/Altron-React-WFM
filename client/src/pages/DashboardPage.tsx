import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EmployeeDashboard } from '../components/dashboards/EmployeeDashboard';
import { ManagerDashboard } from '../components/dashboards/ManagerDashboard';
import { SuperAdminDashboard } from '../components/dashboards/SuperAdminDashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Get user's primary role
  const getUserRole = () => {
    if (!user?.user_roles || user.user_roles.length === 0) {
      return 'Employee';
    }
    
    const roleName = user.user_roles[0]?.roles?.name;
    
    // Check for Super Admin roles
    if (roleName === 'Super User' || roleName === 'system_super_admin' || roleName === 'Admin') {
      return 'Super Admin';
    }
    
    // Check for Manager role
    if (roleName === 'Manager') {
      return 'Manager';
    }
    
    // Default to Employee
    return 'Employee';
  };

  const role = getUserRole();

  // Render role-specific dashboard
  if (role === 'Super Admin') {
    return <SuperAdminDashboard />;
  }
  
  if (role === 'Manager') {
    return <ManagerDashboard />;
  }
  
  return <EmployeeDashboard />;
};
