import { useEffect, useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Clock, Calendar, Users, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';

interface DashboardStats {
  timeEntriesToday: number;
  pendingLeaveRequests: number;
  upcomingShifts: number;
  teamMembers: number;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    timeEntriesToday: 0,
    pendingLeaveRequests: 0,
    upcomingShifts: 0,
    teamMembers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Welcome, {user?.firstName}!</h2>

      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="mb-3">
                <Clock size={48} color="#28468D" />
              </div>
              <h3>{stats.timeEntriesToday}</h3>
              <p className="text-muted mb-0">Clock Entries Today</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="mb-3">
                <Calendar size={48} color="#54B8DF" />
              </div>
              <h3>{stats.pendingLeaveRequests}</h3>
              <p className="text-muted mb-0">Pending Leave Requests</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="mb-3">
                <Calendar size={48} color="#1F4650" />
              </div>
              <h3>{stats.upcomingShifts}</h3>
              <p className="text-muted mb-0">Upcoming Shifts</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="mb-3">
                <Users size={48} color="#54DADF" />
              </div>
              <h3>{stats.teamMembers}</h3>
              <p className="text-muted mb-0">Team Members</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">No recent activity to display.</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column gap-2">
              <Button variant="primary" className="w-100">
                <Clock size={16} className="me-2" />
                Clock In
              </Button>
              <Button variant="outline-primary" className="w-100">
                <Calendar size={16} className="me-2" />
                Request Leave
              </Button>
              <Button variant="outline-primary" className="w-100">
                <TrendingUp size={16} className="me-2" />
                View Schedule
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
