import { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Table, Badge } from 'react-bootstrap';
import { Shield, Edit, Upload, Users, AlertTriangle, BarChart2, Calendar, Play, Clock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface TimeEntry {
  id: number;
  username: string;
  employeeName: string;
  clockInTime: string;
  clockOutTime: string | null;
  totalHours: number | null;
  status: string;
  isOvertimeApproved: boolean;
}

export default function TimeAttendanceAdmin() {
  const navigate = useNavigate();
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = {
    totalEntriesToday: 24,
    openEntries: 12,
    exceptionsCount: 3,
    weekTotalHours: 342.5
  };

  useEffect(() => {
    loadRecentEntries();
  }, []);

  const loadRecentEntries = async () => {
    try {
      const response = await api.get('/time-attendance/recent-entries');
      setRecentEntries(response.data);
    } catch (err) {
      console.error('Failed to load recent entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'approved': 'success',
      'clocked_in': 'primary',
      'clocked_out': 'info',
      'exception': 'warning',
      'Open': 'primary',
      'Closed': 'success',
      'Exception': 'warning'
    };
    return statusMap[status] || 'secondary';
  };

  const approveEntry = async (entryId: number) => {
    try {
      await api.post(`/time-attendance/approve/${entryId}`);
      loadRecentEntries();
    } catch (err) {
      console.error('Failed to approve entry:', err);
    }
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Shield size={28} className="me-2" />
          Time Attendance Administration
        </h2>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => navigate('/manual-time-entry')}>
            <Edit size={18} className="me-2" />
            Manual Entry
          </Button>
          <Button variant="outline-secondary" onClick={() => alert('Import Data functionality')}>
            <Upload size={18} className="me-2" />
            Import Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <Calendar size={32} className="text-primary mb-2" />
              <h3 className="text-primary">{stats.totalEntriesToday}</h3>
              <p className="text-muted mb-0">Entries Today</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <Play size={32} className="text-success mb-2" />
              <h3 className="text-success">{stats.openEntries}</h3>
              <p className="text-muted mb-0">Currently Clocked In</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <AlertTriangle size={32} className="text-warning mb-2" />
              <h3 className="text-warning">{stats.exceptionsCount}</h3>
              <p className="text-muted mb-0">Exceptions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <Clock size={32} className="text-info mb-2" />
              <h3 className="text-info">{stats.weekTotalHours.toFixed(1)}</h3>
              <p className="text-muted mb-0">Week Total Hours</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions and System Status */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" onClick={() => navigate('/employee-timecards')}>
                  <Users size={18} className="me-2" />
                  View All Timecards
                </Button>
                <Button variant="outline-warning" onClick={() => navigate('/time-exceptions')}>
                  <AlertTriangle size={18} className="me-2" />
                  Review Exceptions
                </Button>
                <Button variant="outline-info" onClick={() => navigate('/reports')}>
                  <BarChart2 size={18} className="me-2" />
                  Generate Reports
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">System Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Time Tracking</span>
                <span className="badge bg-success">Active</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>GPS Tracking</span>
                <span className="badge bg-info">Optional</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Break Tracking</span>
                <span className="badge bg-success">Enabled</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Overtime Calculation</span>
                <span className="badge bg-success">Automatic</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Time Entries */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Recent Time Entries</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <p className="text-muted text-center">Loading...</p>
          ) : recentEntries.length > 0 ? (
            <div className="table-responsive">
              <Table size="sm">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.username}</td>
                      <td>{formatDate(entry.clockInTime)}</td>
                      <td>{formatTime(entry.clockInTime)}</td>
                      <td>
                        {entry.clockOutTime ? (
                          formatTime(entry.clockOutTime)
                        ) : (
                          <Badge bg="success">Active</Badge>
                        )}
                      </td>
                      <td>{entry.totalHours ? entry.totalHours.toFixed(2) : '-'}</td>
                      <td>
                        <Badge bg={getStatusBadge(entry.status)}>
                          {entry.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {entry.status === 'exception' && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => approveEntry(entry.id)}
                              title="Approve Entry"
                            >
                              <Check size={14} />
                            </Button>
                          )}
                          {entry.totalHours && entry.totalHours > 8 && !entry.isOvertimeApproved && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => alert('Approve overtime')}
                              title="Approve Overtime"
                            >
                              <Clock size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-muted text-center">No recent entries found.</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
