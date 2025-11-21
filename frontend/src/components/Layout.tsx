import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { 
  Home, Clock, Calendar, Users, Building2, User, 
  LogOut, Bell, Menu
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export default function Layout() {
  const { user, logout, isSuperUser, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div 
        className={`sidebar ${sidebarOpen ? '' : 'd-none d-md-block'}`}
        style={{ width: sidebarOpen ? '250px' : '0', transition: 'width 0.3s' }}
      >
        <div className="p-3">
          <h4 className="text-white mb-4">Altron WFM24/7</h4>
          <Nav className="flex-column">
            <Link to="/" className="nav-link d-flex align-items-center gap-2 p-2 rounded mb-1">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/time-attendance" className="nav-link d-flex align-items-center gap-2 p-2 rounded mb-1">
              <Clock size={20} />
              <span>Time & Attendance</span>
            </Link>
            <Link to="/leave" className="nav-link d-flex align-items-center gap-2 p-2 rounded mb-1">
              <Calendar size={20} />
              <span>Leave Management</span>
            </Link>
            <Link to="/scheduling" className="nav-link d-flex align-items-center gap-2 p-2 rounded mb-1">
              <Calendar size={20} />
              <span>Scheduling</span>
            </Link>
            {(isSuperUser() || hasRole('HR')) && (
              <>
                <Link to="/users" className="nav-link d-flex align-items-center gap-2 p-2 rounded mb-1">
                  <Users size={20} />
                  <span>User Management</span>
                </Link>
                <Link to="/organization" className="nav-link d-flex align-items-center gap-2 p-2 rounded mb-1">
                  <Building2 size={20} />
                  <span>Organization</span>
                </Link>
              </>
            )}
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
