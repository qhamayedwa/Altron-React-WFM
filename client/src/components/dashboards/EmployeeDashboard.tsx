import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import apiClient from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [clockStatus, setClockStatus] = useState<any>(null);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, entriesRes, balancesRes, scheduleRes] = await Promise.all([
          apiClient.get('/time/current-status'),
          apiClient.get('/time/entries?limit=5'),
          apiClient.get('/leave/my-balances'),
          apiClient.get('/scheduling/my-schedule'),
        ]);
        setClockStatus(statusRes.data);
        setTimeEntries(entriesRes.data.data || []);
        setLeaveBalances(balancesRes.data.data || []);
        setSchedule(scheduleRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch employee dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClockAction = async () => {
    try {
      const endpoint = clockStatus?.isClockedIn ? '/time/clock-out' : '/time/clock-in';
      await apiClient.post(endpoint, {
        latitude: 0,
        longitude: 0,
      });
      // Refresh status
      const statusRes = await apiClient.get('/time/current-status');
      setClockStatus(statusRes.data);
    } catch (error) {
      console.error('Clock action failed:', error);
    }
  };

  const calculateHoursToday = () => {
    const today = new Date().toDateString();
    return timeEntries
      .filter(entry => new Date(entry.clock_in_time).toDateString() === today)
      .reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
  };

  const calculateHoursWeek = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return timeEntries
      .filter(entry => new Date(entry.clock_in_time) >= weekAgo)
      .reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  const hoursToday = calculateHoursToday();
  const hoursWeek = calculateHoursWeek();
  const weekProgress = (hoursWeek / 40) * 100;

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold" style={{ color: '#0057A8' }}>
                Welcome back, {user?.first_name || user?.username}!
              </h2>
              <p className="text-muted">Your personal workspace for time tracking and schedule management</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="primary" href="/time">
                My Timecard
              </Button>
              <Button variant="outline-secondary" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Personal Time Tracking */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: '#0057A8', color: 'white' }}>
              <h5 className="mb-0">Today's Time Tracking</h5>
              {clockStatus?.isClockedIn ? (
                <span className="badge bg-success">Active</span>
              ) : (
                <span className="badge bg-secondary">Inactive</span>
              )}
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <h6>Current Status</h6>
                    <div className="d-flex align-items-center">
                      <div 
                        className={`rounded-circle me-2`} 
                        style={{ 
                          width: '12px', 
                          height: '12px', 
                          backgroundColor: clockStatus?.isClockedIn ? '#28a745' : '#6c757d' 
                        }}
                      />
                      <span className="fw-bold">
                        {clockStatus?.isClockedIn ? 'Clocked In' : 'Clocked Out'}
                      </span>
                      {clockStatus?.clockInTime && (
                        <small className="text-muted ms-2">
                          since {new Date(clockStatus.clockInTime).toLocaleTimeString()}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <h6>Hours Today</h6>
                    <div className="display-6 text-primary">{hoursToday.toFixed(1)}h</div>
                    <small className="text-muted">Target: 8.0h</small>
                  </div>
                  <div className="d-grid">
                    <Button 
                      variant={clockStatus?.isClockedIn ? 'danger' : 'success'}
                      onClick={handleClockAction}
                    >
                      {clockStatus?.isClockedIn ? 'Clock Out' : 'Clock In'}
                    </Button>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <h6>This Week</h6>
                    <div className="h4 text-info">{hoursWeek.toFixed(1)}h</div>
                    <ProgressBar 
                      now={weekProgress} 
                      variant="info" 
                      className="mb-2"
                      style={{ height: '8px' }}
                    />
                    <small className="text-muted">{hoursWeek.toFixed(1)}/40 hours</small>
                  </div>
                  <div className="d-grid">
                    <Button variant="outline-primary" size="sm" href="/time">
                      View Time Entries
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header style={{ backgroundColor: '#00A9E0', color: 'white' }}>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-warning" href="/leave/apply">
                  Request Leave
                </Button>
                <Button variant="outline-info" href="/scheduling">
                  View Schedule
                </Button>
                <Button variant="outline-success" href="/profile">
                  Update Profile
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Leave & Schedule */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#62237A', color: 'white' }}>
              <h5 className="mb-0">Leave Balances</h5>
            </Card.Header>
            <Card.Body>
              {leaveBalances.length > 0 ? (
                <div className="list-group list-group-flush">
                  {leaveBalances.map((balance: any, idx: number) => (
                    <div key={idx} className="list-group-item border-0 px-0 d-flex justify-content-between">
                      <span>{balance.leave_type?.name || 'Unknown'}</span>
                      <span className="badge bg-info">{balance.balance || 0} days</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No leave balances available</p>
              )}
              <div className="mt-3">
                <Button variant="primary" size="sm" href="/leave" className="w-100">
                  View All Leave
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#008C95', color: 'white' }}>
              <h5 className="mb-0">Upcoming Schedule</h5>
            </Card.Header>
            <Card.Body>
              {schedule.length > 0 ? (
                <div className="list-group list-group-flush">
                  {schedule.slice(0, 5).map((item: any, idx: number) => (
                    <div key={idx} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between">
                        <span>{item.shift_type?.name || 'Shift'}</span>
                        <small className="text-muted">
                          {new Date(item.scheduled_date).toLocaleDateString()}
                        </small>
                      </div>
                      <small className="text-muted">
                        {item.shift_type?.start_time} - {item.shift_type?.end_time}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No upcoming shifts</p>
              )}
              <div className="mt-3">
                <Button variant="success" size="sm" href="/scheduling" className="w-100">
                  View Full Schedule
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Time Entries */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#0057A8', color: 'white' }}>
              <h5 className="mb-0">Recent Time Entries</h5>
            </Card.Header>
            <Card.Body>
              {timeEntries.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Hours</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeEntries.map((entry: any, idx: number) => (
                        <tr key={idx}>
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
                <p className="text-muted mb-0">No recent time entries</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
