import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card } from 'react-bootstrap';
import apiClient from '../lib/api';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, approvalsRes, activitiesRes] = await Promise.all([
          apiClient.get('/dashboard/stats'),
          apiClient.get('/dashboard/pending-approvals'),
          apiClient.get('/dashboard/recent-activities'),
        ]);
        setStats(statsRes.data);
        setPendingApprovals(approvalsRes.data);
        setRecentActivities(activitiesRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold" style={{ color: '#0057A8' }}>
            Welcome back, {user?.first_name || user?.username}!
          </h2>
          <p className="text-muted">WFM24/7 Workforce Management System</p>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>
              <h6 className="text-muted mb-2">Time Entries Today</h6>
              <h3 className="fw-bold mb-0" style={{ color: '#0057A8' }}>
                {stats?.stats?.time_entries_today || 0}
              </h3>
              <small className="text-muted">Today</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>
              <h6 className="text-muted mb-2">Leave Balance</h6>
              <h3 className="fw-bold mb-0" style={{ color: '#00A9E0' }}>
                {stats?.stats?.leave_balances || 0}
              </h3>
              <small className="text-muted">Types Available</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>
              <h6 className="text-muted mb-2">Pending Approvals</h6>
              <h3 className="fw-bold mb-0" style={{ color: '#008C95' }}>
                {stats?.stats?.pending_approvals || 0}
              </h3>
              <small className="text-muted">Awaiting Action</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>
              <h6 className="text-muted mb-2">Recent Leave Apps</h6>
              <h3 className="fw-bold mb-0" style={{ color: '#62237A' }}>
                {stats?.stats?.recent_leave_applications || 0}
              </h3>
              <small className="text-muted">Last 5</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Header style={{ backgroundColor: '#0057A8', color: 'white' }}>
              <h5 className="mb-0">Recent Activities</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {recentActivities?.activities?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentActivities.activities.map((activity: any, idx: number) => (
                    <div key={idx} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between">
                        <span>
                          {activity.type === 'time_entry' && (
                            <i className="bi bi-clock text-primary me-2"></i>
                          )}
                          {activity.type === 'leave_application' && (
                            <i className="bi bi-calendar-x text-info me-2"></i>
                          )}
                          {activity.description}
                        </span>
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

        <Col md={6}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Header style={{ backgroundColor: '#008C95', color: 'white' }}>
              <h5 className="mb-0">Pending Approvals</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {(pendingApprovals?.pending_time_entries?.length > 0 || 
                pendingApprovals?.pending_leave_applications?.length > 0) ? (
                <>
                  {pendingApprovals.pending_time_entries?.map((entry: any, idx: number) => (
                    <div key={`time-${idx}`} className="border-bottom pb-2 mb-2">
                      <small className="text-muted">Time Entry</small>
                      <div>
                        <strong>{entry.users_time_entries_user_idTousers?.username || 'Unknown'}</strong>
                        {' - '}
                        {new Date(entry.clock_in_time).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {pendingApprovals.pending_leave_applications?.map((app: any, idx: number) => (
                    <div key={`leave-${idx}`} className="border-bottom pb-2 mb-2">
                      <small className="text-muted">Leave Application</small>
                      <div>
                        <strong>{app.users_leave_applications_user_idTousers?.username || 'Unknown'}</strong>
                        {' - '}
                        {new Date(app.start_date).toLocaleDateString()} to{' '}
                        {new Date(app.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-muted mb-0">No pending approvals</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#00A9E0', color: 'white' }}>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                <a href="/time" className="btn btn-primary">
                  <i className="bi bi-clock me-1"></i>
                  Time Tracking
                </a>
                <a href="/leave" className="btn btn-info text-white">
                  <i className="bi bi-calendar-x me-1"></i>
                  Leave Management
                </a>
                <a href="/scheduling" className="btn btn-success">
                  <i className="bi bi-calendar3 me-1"></i>
                  Scheduling
                </a>
                <a href="/payroll" className="btn btn-warning">
                  <i className="bi bi-cash me-1"></i>
                  Payroll
                </a>
                {['Admin', 'Super User', 'system_super_admin', 'Payroll'].includes((user as any)?.role || '') && (
                  <a href="/ai" className="btn btn-secondary">
                    <i className="bi bi-robot me-1"></i>
                    AI Insights
                  </a>
                )}
                {['Manager', 'Admin', 'HR', 'Super User', 'system_super_admin'].includes((user as any)?.role || '') && (
                  <a href="/reports" className="btn btn-dark">
                    <i className="bi bi-file-earmark-bar-graph me-1"></i>
                    Reports
                  </a>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
