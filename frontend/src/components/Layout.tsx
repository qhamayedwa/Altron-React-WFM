import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { 
  Home, Clock, Calendar, Building2, User, 
  LogOut, Bell, Menu, FileText, ChevronDown, ChevronRight,
  ClipboardList, CalendarCheck, Briefcase, MessageSquare, BarChart3,
  UserCheck, FileSpreadsheet, AlertCircle, CalendarClock, Shield,
  UserCog, Settings, FilePlus, ClipboardEdit, DollarSign, GitBranch,
  Workflow, LayoutDashboard, BellRing, Upload, Globe, Link2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export default function Layout() {
  const { user, logout, isSuperUser, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div 
        className={`sidebar ${!sidebarOpen && 'd-none'}`}
        style={{ 
          width: '250px',
          transition: 'all 0.3s ease',
          overflow: 'hidden'
        }}
      >
        <div className="p-3">
          <h4 className="text-white mb-4">Altron WFM24/7</h4>
          <Nav className="flex-column">
            {/* 1. Dashboard */}
            <Link to="/" className="nav-link d-flex align-items-center gap-2 p-2 rounded mb-1">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>

            {/* 2. Personal */}
            <div className="mb-1">
              <button 
                className="nav-link d-flex align-items-center justify-content-between w-100 p-2 rounded border-0 bg-transparent text-start"
                onClick={() => toggleDropdown('personal')}
              >
                <div className="d-flex align-items-center gap-2">
                  <User size={20} />
                  <span>Personal</span>
                </div>
                {openDropdown === 'personal' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openDropdown === 'personal' && (
                <div className="ms-4 mt-1">
                  <Link to="/my-timecard" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                    <ClipboardList size={16} />
                    <span>My Timecard</span>
                  </Link>
                  <Link to="/my-schedule" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                    <CalendarCheck size={16} />
                    <span>My Schedule</span>
                  </Link>
                  <Link to="/my-leave" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                    <Briefcase size={16} />
                    <span>My Leave</span>
                  </Link>
                  <Link to="/team-communication" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                    <MessageSquare size={16} />
                    <span>Team Communication</span>
                  </Link>
                  <Link to="/reports" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                    <BarChart3 size={16} />
                    <span>Reports</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Management */}
            {(isSuperUser() || hasRole('Manager')) && (
              <div className="mb-1">
                <button 
                  className="nav-link d-flex align-items-center justify-content-between w-100 p-2 rounded border-0 bg-transparent text-start"
                  onClick={() => toggleDropdown('management')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <UserCheck size={20} />
                    <span>Management</span>
                  </div>
                  {openDropdown === 'management' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {openDropdown === 'management' && (
                  <div className="ms-4 mt-1">
                    <Link to="/team-timecard" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <ClipboardList size={16} />
                      <span>Team Timecard</span>
                    </Link>
                    <Link to="/employee-timecards" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <FileSpreadsheet size={16} />
                      <span>Employee Time Cards</span>
                    </Link>
                    <Link to="/team-calendar" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <Calendar size={16} />
                      <span>Team Calendar View</span>
                    </Link>
                    <Link to="/time-exceptions" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <AlertCircle size={16} />
                      <span>Time Exceptions</span>
                    </Link>
                    <Link to="/manage-schedules" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <CalendarClock size={16} />
                      <span>Manage Schedules</span>
                    </Link>
                    <Link to="/shift-types" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <Clock size={16} />
                      <span>Shift Types</span>
                    </Link>
                    <Link to="/ai-scheduling" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <Shield size={16} />
                      <span>AI Scheduling</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 4. Organization */}
            {(isSuperUser() || hasRole('HR')) && (
              <div className="mb-1">
                <button 
                  className="nav-link d-flex align-items-center justify-content-between w-100 p-2 rounded border-0 bg-transparent text-start"
                  onClick={() => toggleDropdown('organization')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Building2 size={20} />
                    <span>Organization</span>
                  </div>
                  {openDropdown === 'organization' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {openDropdown === 'organization' && (
                  <div className="ms-4 mt-1">
                    <Link to="/organization-dashboard" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <BarChart3 size={16} />
                      <span>Organization Dashboard</span>
                    </Link>
                    <Link to="/company-management" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <Building2 size={16} />
                      <span>Company Management</span>
                    </Link>
                    <Link to="/employee-import" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <FilePlus size={16} />
                      <span>Employee Import</span>
                    </Link>
                    <Link to="/create-company" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <ClipboardEdit size={16} />
                      <span>Create Company</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 5. Administration */}
            {(isSuperUser() || hasRole('Admin') || hasRole('HR')) && (
              <div className="mb-1">
                <button 
                  className="nav-link d-flex align-items-center justify-content-between w-100 p-2 rounded border-0 bg-transparent text-start"
                  onClick={() => toggleDropdown('administration')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Settings size={20} />
                    <span>Administration</span>
                  </div>
                  {openDropdown === 'administration' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {openDropdown === 'administration' && (
                  <div className="ms-4 mt-1">
                    <Link to="/user-management" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <UserCog size={16} />
                      <span>User Management</span>
                    </Link>
                    <Link to="/time-attendance-admin" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <Clock size={16} />
                      <span>Time Attendance Admin</span>
                    </Link>
                    <Link to="/manual-time-entry" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <ClipboardEdit size={16} />
                      <span>Manual Time Entry</span>
                    </Link>
                    <Link to="/import-time-data" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <Upload size={16} />
                      <span>Import Time Data</span>
                    </Link>
                    <Link to="/leave-types" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <FileText size={16} />
                      <span>Leave Types</span>
                    </Link>
                    <Link to="/leave-balances" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <BarChart3 size={16} />
                      <span>Leave Balances</span>
                    </Link>
                    <Link to="/pay-codes" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <DollarSign size={16} />
                      <span>Pay Codes</span>
                    </Link>
                    <Link to="/pay-rules" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <GitBranch size={16} />
                      <span>Pay Rules</span>
                    </Link>
                    <Link to="/pay-code-configuration" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <Settings size={16} />
                      <span>Pay Code Configuration</span>
                    </Link>
                    <Link to="/timecard-rollup" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <FileSpreadsheet size={16} />
                      <span>Timecard Rollup</span>
                    </Link>
                    <Link to="/automation-workflows" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <Workflow size={16} />
                      <span>Automation & Workflows</span>
                    </Link>
                    <Link to="/dashboard-configuration" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <LayoutDashboard size={16} />
                      <span>Dashboard Configuration</span>
                    </Link>
                    <Link to="/notification-management" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <BellRing size={16} />
                      <span>Notification Management</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 6. Pulse Survey */}
            {(isSuperUser() || hasRole('Manager')) && (
              <div className="mb-1">
                <button 
                  className="nav-link d-flex align-items-center justify-content-between w-100 p-2 rounded border-0 bg-transparent text-start"
                  onClick={() => toggleDropdown('pulse-survey')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <MessageSquare size={20} />
                    <span>Pulse Survey</span>
                  </div>
                  {openDropdown === 'pulse-survey' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {openDropdown === 'pulse-survey' && (
                  <div className="ms-4 mt-1">
                    <Link to="/pulse-survey/dashboard" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <BarChart3 size={16} />
                      <span>Survey Dashboard</span>
                    </Link>
                    <Link to="/pulse-survey/create" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <FilePlus size={16} />
                      <span>Create Survey</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 7. Tenant Management (Super Admin only) */}
            {isSuperUser() && (
              <div className="mb-1">
                <button 
                  className="nav-link d-flex align-items-center justify-content-between w-100 p-2 rounded border-0 bg-transparent text-start"
                  onClick={() => toggleDropdown('tenant')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Globe size={20} />
                    <span>Multi-Tenant</span>
                  </div>
                  {openDropdown === 'tenant' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {openDropdown === 'tenant' && (
                  <div className="ms-4 mt-1">
                    <Link to="/tenant/organizations" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <Building2 size={16} />
                      <span>Organizations</span>
                    </Link>
                    <Link to="/tenant/organizations/create" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <FilePlus size={16} />
                      <span>Create Organization</span>
                    </Link>
                    <Link to="/tenant/dashboard" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <LayoutDashboard size={16} />
                      <span>Tenant Dashboard</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 8. Integrations */}
            {(isSuperUser() || hasRole('Admin')) && (
              <div className="mb-1">
                <button 
                  className="nav-link d-flex align-items-center justify-content-between w-100 p-2 rounded border-0 bg-transparent text-start"
                  onClick={() => toggleDropdown('integrations')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Link2 size={20} />
                    <span>Integrations</span>
                  </div>
                  {openDropdown === 'integrations' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {openDropdown === 'integrations' && (
                  <div className="ms-4 mt-1">
                    <Link to="/integrations/sage-vip" className="nav-link d-flex align-items-center gap-2 p-2 ps-3 rounded mb-1">
                      <Link2 size={16} />
                      <span>SAGE VIP Payroll</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 9. My Profile */}
            <Link to="/profile" className="nav-link d-flex align-items-center gap-2 p-2 rounded mb-1">
              <User size={20} />
              <span>My Profile</span>
            </Link>

            {/* 10. Sign Out */}
            <button 
              onClick={handleLogout}
              className="nav-link d-flex align-items-center gap-2 p-2 rounded mb-1 border-0 bg-transparent text-start w-100"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </Nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Top Navbar */}
        <Navbar bg="primary" variant="dark" className="px-3">
          <button
            className="btn btn-link text-white me-3"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>
          <Navbar.Brand>{user?.tenantName}</Navbar.Brand>
          <Nav className="ms-auto align-items-center">
            <Nav.Link href="#" className="text-white">
              <Bell size={20} />
            </Nav.Link>
            <NavDropdown
              title={
                <span className="text-white">
                  <User size={20} className="me-2" />
                  {user?.firstName} {user?.lastName}
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile">
                <User size={16} className="me-2" />
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <LogOut size={16} className="me-2" />
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar>

        {/* Page Content */}
        <Container fluid className="p-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
}
