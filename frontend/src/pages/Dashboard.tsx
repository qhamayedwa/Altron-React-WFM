import { useEffect, useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Clock, Calendar, Users, TrendingUp, DollarSign, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import SuperAdminDashboard from './SuperAdminDashboard';

interface DashboardStats {
  timeEntriesToday: number;
  pendingLeaveRequests: number;
  upcomingShifts: number;
  teamMembers: number;
}

export default function Dashboard() {
  const { user, isSuperUser } = useAuthStore();
  const navigate = useNavigate();

  if (isSuperUser()) {
    return <SuperAdminDashboard />;
  }
  const [stats, setStats] = useState<DashboardStats>({
    timeEntriesToday: 0,
    pendingLeaveRequests: 0,
    upcomingShifts: 0,
    teamMembers: 0
  });
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  return (
    <div>
      {/* Welcome Banner with Gradient */}
      <div className="welcome-banner mb-4">
        <Row className="align-items-center">
          <Col lg={8}>
            <h2 className="fw-bold mb-2">Welcome back, {user?.firstName}!</h2>
            <p className="mb-0" style={{ opacity: 0.9 }}>
              Here's what's happening with your workforce today
            </p>
          </Col>
          <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
            <Button 
              variant="light" 
              onClick={() => navigate('/quick-actions')}
              className="d-inline-flex align-items-center gap-2"
              style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#28468D',
                border: 'none',
                fontWeight: 600
              }}
            >
              Quick Actions
              <ArrowRight size={18} />
            </Button>
          </Col>
        </Row>
      </div>

      {/* Stats Cards with Gradient Backgrounds */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="text-center h-100 stats-card blue border-0">
            <Card.Body className="py-4">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ 
                  width: 64, 
                  height: 64, 
                  background: 'linear-gradient(135deg, #28468D, #1F4650)'
                }}
              >
                <Clock size={28} color="#fff" />
              </div>
              <h2 className="fw-bold mb-1" style={{ color: '#28468D' }}>{stats.timeEntriesToday}</h2>
              <p className="text-muted mb-0 small fw-medium">Clock Entries Today</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="text-center h-100 stats-card teal border-0">
            <Card.Body className="py-4">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ 
                  width: 64, 
                  height: 64, 
                  background: 'linear-gradient(135deg, #54DADF, #54B8DF)'
                }}
              >
                <Calendar size={28} color="#fff" />
              </div>
              <h2 className="fw-bold mb-1" style={{ color: '#1F4650' }}>{stats.pendingLeaveRequests}</h2>
              <p className="text-muted mb-0 small fw-medium">Pending Leave Requests</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="text-center h-100 stats-card mint border-0">
            <Card.Body className="py-4">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ 
                  width: 64, 
                  height: 64, 
                  background: 'linear-gradient(135deg, #C0F2D7, #28A745)'
                }}
              >
                <CheckCircle2 size={28} color="#fff" />
              </div>
              <h2 className="fw-bold mb-1" style={{ color: '#1F4650' }}>{stats.upcomingShifts}</h2>
              <p className="text-muted mb-0 small fw-medium">Upcoming Shifts</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="text-center h-100 stats-card orange border-0">
            <Card.Body className="py-4">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ 
                  width: 64, 
                  height: 64, 
                  background: 'linear-gradient(135deg, #EF865B, #EBF982)'
                }}
              >
                <Users size={28} color="#1F4650" />
              </div>
              <h2 className="fw-bold mb-1" style={{ color: '#1F4650' }}>{stats.teamMembers}</h2>
              <p className="text-muted mb-0 small fw-medium">Team Members</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header className="gradient-blue py-3">
              <h5 className="mb-0 fw-semibold">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-5">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ 
                    width: 64, 
                    height: 64, 
                    background: 'linear-gradient(135deg, rgba(84, 184, 223, 0.2), rgba(40, 70, 141, 0.2))'
                  }}
                >
                  <AlertCircle size={28} color="#28468D" />
                </div>
                <p className="text-muted mb-0">No recent activity to display</p>
                <small className="text-muted">Activity will appear here as you use the system</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="h-100">
            <Card.Header className="gradient-teal py-3">
              <h5 className="mb-0 fw-semibold">Quick Actions</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column gap-3 p-4">
              <Button 
                variant="primary" 
                className="w-100 py-3 d-flex align-items-center justify-content-center gap-2" 
                onClick={() => navigate('/my-timecard')}
              >
                <Clock size={20} />
                <span className="fw-semibold">Clock In</span>
              </Button>
              <Button 
                variant="outline-primary" 
                className="w-100 py-2 d-flex align-items-center justify-content-center gap-2" 
                onClick={() => navigate('/apply-leave')}
              >
                <Calendar size={18} />
                <span>Request Leave</span>
              </Button>
              <Button 
                variant="outline-primary" 
                className="w-100 py-2 d-flex align-items-center justify-content-center gap-2" 
                onClick={() => navigate('/my-schedule')}
              >
                <TrendingUp size={18} />
                <span>View Schedule</span>
              </Button>
              <Button 
                variant="outline-primary" 
                className="w-100 py-2 d-flex align-items-center justify-content-center gap-2" 
                onClick={() => navigate('/payroll/processing')}
                style={{ 
                  borderColor: '#C0F2D7',
                  color: '#1F4650'
                }}
              >
                <DollarSign size={18} />
                <span>View Payroll</span>
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Section Divider */}
      <hr className="section-divider my-4" />

      {/* Additional Info Section */}
      <Row className="g-4">
        <Col md={6}>
          <div className="highlight-section">
            <h6 className="fw-bold mb-2" style={{ color: '#28468D' }}>Today's Schedule</h6>
            <p className="text-muted mb-0 small">
              Check your schedule and upcoming shifts to stay on top of your work.
            </p>
            <Button 
              variant="link" 
              className="p-0 mt-2"
              onClick={() => navigate('/my-schedule')}
              style={{ color: '#54B8DF' }}
            >
              View full schedule <ArrowRight size={14} />
            </Button>
          </div>
        </Col>
        <Col md={6}>
          <div className="highlight-section teal">
            <h6 className="fw-bold mb-2" style={{ color: '#1F4650' }}>Leave Balance</h6>
            <p className="text-muted mb-0 small">
              Review your available leave days and plan your time off.
            </p>
            <Button 
              variant="link" 
              className="p-0 mt-2"
              onClick={() => navigate('/my-leave')}
              style={{ color: '#54DADF' }}
            >
              Check leave balance <ArrowRight size={14} />
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
