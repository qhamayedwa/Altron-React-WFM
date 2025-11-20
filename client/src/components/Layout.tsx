import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Offcanvas } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const ALTRON_COLORS = {
  royalBlue: '#0057A8',
  lightBlue: '#00A9E0',
  darkTeal: '#008C95',
  darkPurple: '#62237A',
};

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const fullName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username;

  const userRoles = user?.user_roles?.map((ur) => ur.roles.name) || [];
  const isManager = userRoles.includes('Manager') || userRoles.includes('system_super_admin');
  const isAdmin = userRoles.includes('Admin') || userRoles.includes('Super User') || userRoles.includes('system_super_admin');

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        expand="lg"
        style={{ backgroundColor: ALTRON_COLORS.royalBlue }}
        variant="dark"
        className="shadow-sm"
      >
        <Container fluid>
          <Navbar.Brand as={Link} to="/dashboard" className="fw-bold">
            WFM24/7
          </Navbar.Brand>
          
          <Navbar.Toggle
            aria-controls="offcanvasNavbar"
            onClick={() => setShow(!show)}
          />
          
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
            show={show}
            onHide={() => setShow(false)}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel">
                WFM24/7 Menu
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-start flex-grow-1">
                <Nav.Link
                  as={Link}
                  to="/dashboard"
                  onClick={() => setShow(false)}
                >
                  Dashboard
                </Nav.Link>
                
                <Nav.Link
                  as={Link}
                  to="/time"
                  onClick={() => setShow(false)}
                >
                  Time & Attendance
                </Nav.Link>
                
                <Nav.Link
                  as={Link}
                  to="/leave"
                  onClick={() => setShow(false)}
                >
                  Leave Management
                </Nav.Link>
                
                <Nav.Link
                  as={Link}
                  to="/schedule"
                  onClick={() => setShow(false)}
                >
                  Scheduling
                </Nav.Link>

                {(isManager || isAdmin) && (
                  <NavDropdown title="Management" id="management-dropdown">
                    {isManager && (
                      <>
                        <NavDropdown.Item
                          as={Link}
                          to="/approvals"
                          onClick={() => setShow(false)}
                        >
                          Approvals
                        </NavDropdown.Item>
                        <NavDropdown.Item
                          as={Link}
                          to="/reports"
                          onClick={() => setShow(false)}
                        >
                          Reports
                        </NavDropdown.Item>
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <NavDropdown.Divider />
                        <NavDropdown.Item
                          as={Link}
                          to="/payroll"
                          onClick={() => setShow(false)}
                        >
                          Payroll
                        </NavDropdown.Item>
                        <NavDropdown.Item
                          as={Link}
                          to="/organization"
                          onClick={() => setShow(false)}
                        >
                          Organization
                        </NavDropdown.Item>
                      </>
                    )}
                  </NavDropdown>
                )}
              </Nav>

              <Nav>
                <NavDropdown
                  title={fullName}
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item
                    as={Link}
                    to="/profile"
                    onClick={() => setShow(false)}
                  >
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>

      <main className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <Outlet />
      </main>

      <footer
        className="py-3 text-center text-white"
        style={{ backgroundColor: ALTRON_COLORS.darkTeal }}
      >
        <Container>
          <small>
            &copy; {new Date().getFullYear()} Altron WFM24/7. All rights reserved.
          </small>
        </Container>
      </footer>
    </div>
  );
};
