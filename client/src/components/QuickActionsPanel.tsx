import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface QuickAction {
  title: string;
  description: string;
  path: string;
  icon: string;
  color: string;
  roles?: string[];
}

const quickActions: QuickAction[] = [
  {
    title: 'Clock In/Out',
    description: 'Track your work hours',
    path: '/time',
    icon: '🕐',
    color: '#0057A8',
    roles: ['Employee', 'Manager', 'Super User', 'system_super_admin'],
  },
  {
    title: 'Apply Leave',
    description: 'Submit a leave request',
    path: '/leave/applications',
    icon: '✈️',
    color: '#008C95',
    roles: ['Employee', 'Manager', 'Super User', 'system_super_admin'],
  },
  {
    title: 'Approve Time',
    description: 'Review team time entries',
    path: '/approvals',
    icon: '✓',
    color: '#62237A',
    roles: ['Manager', 'Admin', 'Super User', 'system_super_admin'],
  },
  {
    title: 'Manual Entry',
    description: 'Create time entry manually',
    path: '/time/manual-entry',
    icon: '📝',
    color: '#00A9E0',
    roles: ['Manager', 'Admin', 'Super User', 'system_super_admin'],
  },
  {
    title: 'Team Timecard',
    description: 'View team hours summary',
    path: '/time/team-timecard',
    icon: '📊',
    color: '#F36E21',
    roles: ['Manager', 'Admin', 'Super User', 'system_super_admin'],
  },
  {
    title: 'My Schedule',
    description: 'View your work schedule',
    path: '/scheduling/my-schedule',
    icon: '📅',
    color: '#0057A8',
    roles: ['Employee', 'Manager', 'Super User', 'system_super_admin'],
  },
  {
    title: 'Leave Approvals',
    description: 'Process leave requests',
    path: '/leave/approvals',
    icon: '🎫',
    color: '#008C95',
    roles: ['Manager', 'Admin', 'Super User', 'system_super_admin'],
  },
  {
    title: 'Import Employees',
    description: 'Bulk import users via CSV',
    path: '/organization/import',
    icon: '📥',
    color: '#62237A',
    roles: ['HR', 'Admin', 'Super User', 'system_super_admin'],
  },
  {
    title: 'AI Insights',
    description: 'Get workforce analytics',
    path: '/ai/dashboard',
    icon: '🤖',
    color: '#00A9E0',
    roles: ['Manager', 'HR', 'Super User', 'system_super_admin'],
  },
  {
    title: 'Reports',
    description: 'Generate detailed reports',
    path: '/reports',
    icon: '📈',
    color: '#F36E21',
    roles: ['Manager', 'Admin', 'HR', 'Payroll', 'Super User', 'system_super_admin'],
  },
  {
    title: 'User Management',
    description: 'Manage users and roles',
    path: '/organization/users',
    icon: '👥',
    color: '#0057A8',
    roles: ['HR', 'Admin', 'Super User', 'system_super_admin'],
  },
  {
    title: 'Organization',
    description: 'Manage company structure',
    path: '/organization',
    icon: '🏢',
    color: '#008C95',
    roles: ['Manager', 'HR', 'Admin', 'Super User', 'system_super_admin'],
  },
];

export const QuickActionsPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userRoles = user?.user_roles?.map((ur) => ur.roles.name) || [];

  const filteredActions = quickActions.filter((action) => {
    if (!action.roles) return true;
    return action.roles.some((role) => userRoles.includes(role));
  });

  return (
    <Card className="shadow-sm border-0">
      <Card.Header style={{ backgroundColor: '#F36E21', color: 'white' }}>
        <h5 className="mb-0">⚡ Quick Actions</h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          {filteredActions.map((action, idx) => (
            <Col md={6} lg={4} xl={3} key={idx}>
              <Card
                className="h-100 shadow-sm border-0"
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
                onClick={() => navigate(action.path)}
              >
                <Card.Body className="text-center">
                  <div
                    className="mb-3"
                    style={{
                      fontSize: '2.5rem',
                      backgroundColor: action.color,
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                    }}
                  >
                    {action.icon}
                  </div>
                  <h6 className="fw-bold mb-2">{action.title}</h6>
                  <small className="text-muted">{action.description}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};
