import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Calendar, FileText, DollarSign, Settings, 
  BarChart, Play, Edit3, FilePlus, TrendingUp,
  PieChart, Users, Tag, Zap
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function QuickActions() {
  const navigate = useNavigate();
  const { hasRole, isSuperUser } = useAuthStore();

  const actions = {
    timeManagement: [
      { 
        label: 'View Time Entries', 
        icon: Play, 
        path: '/my-timecard', 
        variant: 'primary' 
      },
      { 
        label: 'Time Reports', 
        icon: BarChart, 
        path: '/reports', 
        variant: 'outline-primary' 
      }
    ],
    scheduleManagement: [
      { 
        label: 'View Schedules', 
        icon: Calendar, 
        path: '/my-schedule', 
        variant: 'primary' 
      },
      ...(hasRole('Manager') || isSuperUser() ? [
        { 
          label: 'Manage Schedules', 
          icon: Edit3, 
          path: '/scheduling/manage', 
          variant: 'success' 
        }
      ] : []),
      { 
        label: 'Schedule Reports', 
        icon: TrendingUp, 
        path: '/reports', 
        variant: 'outline-primary' 
      }
    ],
    leaveManagement: [
      { 
        label: 'My Leave Applications', 
        icon: FilePlus, 
        path: '/leave/my-applications', 
        variant: 'primary' 
      },
      { 
        label: 'Leave Reports', 
        icon: PieChart, 
        path: '/reports', 
        variant: 'outline-primary' 
      }
    ],
    payrollFinance: [
      { 
        label: 'Payroll Processing', 
        icon: DollarSign, 
        path: '/payroll/processing', 
        variant: 'success' 
      },
      { 
        label: 'Time Summary', 
        icon: Clock, 
        path: '/payroll/time-summary', 
        variant: 'outline-success' 
      },
      { 
        label: 'Overtime Report', 
        icon: TrendingUp, 
        path: '/payroll/overtime-summary', 
        variant: 'outline-warning' 
      },
      { 
        label: 'Custom Reports', 
        icon: Settings, 
        path: '/payroll/custom-builder', 
        variant: 'outline-info' 
      }
    ],
    administrative: [
      ...(isSuperUser() ? [
        { 
          label: 'Pay Rules', 
          icon: DollarSign, 
          path: '/pay-rules', 
          variant: 'warning' 
        },
        { 
          label: 'Pay Codes', 
          icon: Tag, 
          path: '/pay-codes', 
          variant: 'warning' 
        }
      ] : []),
      { 
        label: 'System Reports', 
        icon: Users, 
        path: '/reports', 
        variant: 'outline-secondary' 
      }
    ]
  };

  const recentActivities = [
    { name: 'Time Entries', icon: Clock, status: 'Active', variant: 'primary' },
    { name: 'Schedules', icon: Calendar, status: 'Current', variant: 'success' },
    { name: 'Leave Applications', icon: FileText, status: 'Available', variant: 'info' },
    { name: 'Reports', icon: BarChart, status: 'Ready', variant: 'secondary' },
    ...(isSuperUser() ? [
      { name: 'Pay Rules', icon: DollarSign, status: 'Admin', variant: 'warning' },
      { name: 'Pay Codes', icon: Tag, status: 'Admin', variant: 'warning' }
    ] : [])
  ];

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <Zap size={28} className="me-2" />
            Quick Actions
          </h2>
          <p className="text-muted mb-0">Fast access to frequently used features</p>
        </div>
      </div>

      <Row className="mb-4">
        {/* Time Management */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <Clock size={20} className="me-2" />
                Time Management
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                {actions.timeManagement.map((action, idx) => (
                  <Button
                    key={idx}
                    variant={action.variant}
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon size={18} className="me-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Schedule Management */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <Calendar size={20} className="me-2" />
                Schedule Management
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                {actions.scheduleManagement.map((action, idx) => (
                  <Button
                    key={idx}
                    variant={action.variant}
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon size={18} className="me-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Leave Management */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <FileText size={20} className="me-2" />
                Leave Management
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                {actions.leaveManagement.map((action, idx) => (
                  <Button
                    key={idx}
                    variant={action.variant}
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon size={18} className="me-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Payroll & Finance (Super User Only) */}
        {isSuperUser() && (
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-0">
                  <DollarSign size={20} className="me-2" />
                  Payroll & Finance
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  {actions.payrollFinance.map((action, idx) => (
                    <Button
                      key={idx}
                      variant={action.variant}
                      onClick={() => navigate(action.path)}
                    >
                      <action.icon size={18} className="me-2" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Administrative */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <Settings size={20} className="me-2" />
                Administrative
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                {actions.administrative.map((action, idx) => (
                  <Button
                    key={idx}
                    variant={action.variant}
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon size={18} className="me-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Section */}
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <Zap size={20} className="me-2" />
                Recent Activity
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Quick access to your most recent activities and shortcuts.</p>
              <Row>
                {recentActivities.map((activity, idx) => (
                  <Col md={4} key={idx} className="mb-3">
                    <div className="list-group list-group-flush">
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                          <activity.icon size={18} className="me-2" />
                          {activity.name}
                        </span>
                        <Badge bg={activity.variant} pill>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
