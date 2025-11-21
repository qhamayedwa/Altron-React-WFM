import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import apiClient from '../../lib/api';

export const ManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any>(null);
  const [teamEntries, setTeamEntries] = useState<any[]>([]);
  const [leaveApps, setLeaveApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, approvalsRes, entriesRes, leaveRes] = await Promise.all([
          apiClient.get('/dashboard/stats'),
          apiClient.get('/dashboard/pending-approvals'),
          apiClient.get('/time/entries?limit=10'),
          apiClient.get('/leave/team-applications'),
        ]);
        setStats(statsRes.data);
        setPendingApprovals(approvalsRes.data);
        setTeamEntries(entriesRes.data.data || []);
        setLeaveApps(leaveRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch manager dashboard data:', error);
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

  const teamSize = stats?.stats?.team_size || 0;
  const presentToday = stats?.stats?.present_today || 0;
  const pendingCount = stats?.stats?.pending_approvals || 0;
  const attendanceRate = teamSize > 0 ? (presentToday / teamSize) * 100 : 0;

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold" style={{ color: '#0057A8' }}>
                Manager Dashboard
              </h2>
              <p className="text-muted">Managing Your Team</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="primary" href="/organization">
                Manage Team
              </Button>
              <Button variant="outline-secondary" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Team Status Overview */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header style={{ backgroundColor: '#0057A8', color: 'white' }}>
              <h5 className="mb-0">Team Status Overview</h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col md={3}>
                  <div className="mb-3">
                    <div className="display-6 text-primary">{teamSize}</div>
                    <small className="text-muted">Team Members</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-3">
                    <div className="display-6 text-success">{presentToday}</div>
                    <small className="text-muted">Present Today</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-3">
                    <div className="display-6 text-warning">{pendingCount}</div>
                    <small className="text-muted">Pending Approvals</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-3">
                    <div className="display-6 text-info">{attendanceRate.toFixed(0)}%</div>
                    <small className="text-muted">Attendance Rate</small>
                  </div>
                </Col>
              </Row>
              <ProgressBar 
                now={attendanceRate} 
                variant="success" 
                className="mb-3"
                style={{ height: '8px' }}
              />
              <div className="d-flex gap-2">
                <Button variant="outline-primary" size="sm" href="/organization">
                  View Team Details
                </Button>
                <Button variant="outline-info" size="sm" href="/time">
                  Team Time Entries
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header style={{ backgroundColor: '#008C95', color: 'white' }}>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="warning" href="/approvals">
                  Approve Timecards ({pendingCount})
                </Button>
                <Button variant="info" href="/leave/approvals">
                  Leave Requests
                </Button>
                <Button variant="success" href="/scheduling">
                  Manage Schedules
                </Button>
                <Button variant="outline-secondary" href="/reports">
                  Team Reports
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Approvals */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#62237A', color: 'white' }}>
              <h5 className="mb-0">Pending Time Approvals</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {pendingApprovals?.pending_time_entries?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {pendingApprovals.pending_time_entries.map((entry: any, idx: number) => (
                    <div key={idx} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{entry.user?.first_name} {entry.user?.last_name}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(entry.clock_in_time).toLocaleString()} - {' '}
                            {entry.clock_out_time ? new Date(entry.clock_out_time).toLocaleString() : 'Active'}
                          </small>
                          <br />
                          <small className="text-info">{entry.total_hours?.toFixed(2) || 0} hours</small>
                        </div>
                        <div>
                          <span className="badge bg-warning">Pending</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No pending time approvals</p>
              )}
              {pendingApprovals?.pending_time_entries?.length > 0 && (
                <div className="mt-3">
                  <Button variant="primary" size="sm" href="/approvals" className="w-100">
                    Review All
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#00A9E0', color: 'white' }}>
              <h5 className="mb-0">Pending Leave Requests</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {leaveApps.filter((app: any) => app.status === 'pending').length > 0 ? (
                <div className="list-group list-group-flush">
                  {leaveApps.filter((app: any) => app.status === 'pending').map((app: any, idx: number) => (
                    <div key={idx} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{app.user?.first_name} {app.user?.last_name}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(app.start_date).toLocaleDateString()} - {' '}
                            {new Date(app.end_date).toLocaleDateString()}
                          </small>
                          <br />
                          <small className="text-info">{app.leave_type?.name}</small>
                        </div>
                        <div>
                          <span className="badge bg-warning">Pending</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No pending leave requests</p>
              )}
              {leaveApps.filter((app: any) => app.status === 'pending').length > 0 && (
                <div className="mt-3">
                  <Button variant="primary" size="sm" href="/leave/approvals" className="w-100">
                    Review All
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Team Activity */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#0057A8', color: 'white' }}>
              <h5 className="mb-0">Recent Team Time Entries</h5>
            </Card.Header>
            <Card.Body>
              {teamEntries.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Date</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Hours</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamEntries.slice(0, 10).map((entry: any, idx: number) => (
                        <tr key={idx}>
                          <td>{entry.user?.first_name} {entry.user?.last_name}</td>
                          <td>{new Date(entry.clock_in_time).toLocaleDateString()}</td>
                          <td>{new Date(entry.clock_in_time).toLocaleTimeString()}</td>
                          <td>{entry.clock_out_time ? new Date(entry.clock_out_time).toLocaleTimeString() : '-'}</td>
                          <td>{entry.total_hours ? entry.total_hours.toFixed(2) : '-'}</td>
                          <td>
                            <span className={`badge bg-${entry.status === 'approved' ? 'success' : entry.status === 'pending' ? 'warning' : 'secondary'}`}>
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted mb-0">No recent team entries</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
