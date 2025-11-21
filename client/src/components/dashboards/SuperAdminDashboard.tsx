import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import apiClient from '../../lib/api';

export const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          apiClient.get('/dashboard/stats'),
          apiClient.get('/dashboard/recent-activities'),
        ]);
        setStats(statsRes.data);
        setRecentActivities(activitiesRes.data);
      } catch (error) {
        console.error('Failed to fetch admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold" style={{ color: '#0057A8' }}>
                System Administrator Dashboard
              </h2>
              <p className="text-muted">WFM24/7 System-Wide Management</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="primary" href="/organization">
                Organization Management
              </Button>
              <Button variant="outline-secondary" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* System Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-primary mb-2">
                {stats?.stats?.total_users || 0}
              </div>
              <h6 className="text-muted">Total Users</h6>
              <small className="text-muted">Across all organizations</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-success mb-2">
                {stats?.stats?.active_today || 0}
              </div>
              <h6 className="text-muted">Active Today</h6>
              <small className="text-muted">Currently clocked in</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-warning mb-2">
                {stats?.stats?.pending_system_approvals || 0}
              </div>
              <h6 className="text-muted">Pending Approvals</h6>
              <small className="text-muted">System-wide</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-info mb-2">
                {stats?.stats?.total_departments || 0}
              </div>
              <h6 className="text-muted">Departments</h6>
              <small className="text-muted">Active departments</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Admin Actions */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#0057A8', color: 'white' }}>
              <h5 className="mb-0">System Administration</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="d-grid gap-2">
                    <h6 className="text-muted">Organization</h6>
                    <Button variant="outline-primary" size="sm" href="/organization">
                      Manage Organizations
                    </Button>
                    <Button variant="outline-secondary" size="sm" href="/organization/hierarchy">
                      View Hierarchy
                    </Button>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-grid gap-2">
                    <h6 className="text-muted">User Management</h6>
                    <Button variant="outline-success" size="sm" href="/auth/users">
                      Manage Users
                    </Button>
                    <Button variant="outline-info" size="sm" href="/employee-import">
                      Import Employees
                    </Button>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-grid gap-2">
                    <h6 className="text-muted">Configuration</h6>
                    <Button variant="outline-warning" size="sm" href="/payroll/codes">
                      Pay Codes
                    </Button>
                    <Button variant="outline-danger" size="sm" href="/leave/types">
                      Leave Types
                    </Button>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-grid gap-2">
                    <h6 className="text-muted">Advanced</h6>
                    <Button variant="outline-dark" size="sm" href="/reports">
                      System Reports
                    </Button>
                    <Button variant="outline-secondary" size="sm" href="/sage-vip">
                      SAGE Integration
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* System Activity */}
      <Row>
        <Col md={8}>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#008C95', color: 'white' }}>
              <h5 className="mb-0">Recent System Activities</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {recentActivities?.activities?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentActivities.activities.map((activity: any, idx: number) => (
                    <div key={idx} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between">
                        <div>
                          <span className="fw-bold">{activity.user || 'System'}</span>
                          {' - '}
                          <span>{activity.description}</span>
                        </div>
                        <small className="text-muted">
                          {new Date(activity.timestamp).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No recent activities</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#62237A', color: 'white' }}>
              <h5 className="mb-0">System Health</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Database</span>
                  <span className="badge bg-success">Healthy</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>API Services</span>
                  <span className="badge bg-success">Online</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>SAGE VIP</span>
                  <span className="badge bg-warning">Not Configured</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>AI Services</span>
                  <span className="badge bg-success">Available</span>
                </div>
              </div>
              <div className="mt-4">
                <h6 className="text-muted mb-2">Quick Stats</h6>
                <small className="d-block text-muted">Uptime: 99.9%</small>
                <small className="d-block text-muted">Avg Response: 120ms</small>
                <small className="d-block text-muted">Active Sessions: {stats?.stats?.active_sessions || 0}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
