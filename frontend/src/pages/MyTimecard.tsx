import { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { Clock, Square, Play, Pause } from 'lucide-react';
import api from '../api/client';
import { format, parseISO } from 'date-fns';

interface TimeEntry {
  id: number;
  clockInTime: string;
  clockOutTime: string | null;
  breakMinutes: number;
  totalHours: number | null;
  status: string;
  notes?: string;
  overtimeHours?: number;
  isOvertimeApproved?: boolean;
}

interface CurrentStatus {
  id: number;
  clockInTime: string;
  status: string;
  onBreak: boolean;
  breakMinutes: number;
}

export default function MyTimecard() {
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus | null>(null);
  const [liveTimer, setLiveTimer] = useState('00:00:00');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalOvertime, setTotalOvertime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCurrentStatus();
    loadTimeEntries();
  }, []);

  useEffect(() => {
    if (currentStatus && currentStatus.status === 'clocked_in') {
      const interval = setInterval(() => {
        const now = new Date();
        const clockInTime = new Date(currentStatus.clockInTime);
        const diff = now.getTime() - clockInTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setLiveTimer(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStatus]);

  const loadCurrentStatus = async () => {
    try {
      const response = await api.get('/api/time-attendance/current-status');
      setCurrentStatus(response.data.currentStatus);
    } catch (error) {
      console.error('Failed to load current status:', error);
    }
  };

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/api/time-attendance/entries', { params });
      setTimeEntries(response.data.timeEntries);

      // Calculate totals
      let totalHrs = 0;
      let totalOT = 0;
      response.data.timeEntries.forEach((entry: TimeEntry) => {
        if (entry.totalHours) totalHrs += entry.totalHours;
        if (entry.overtimeHours) totalOT += entry.overtimeHours;
      });
      setTotalHours(totalHrs);
      setTotalOvertime(totalOT);
    } catch (error) {
      console.error('Failed to load time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      
      // Get user location if available
      let location = {};
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (error) {
          console.log('Location not available:', error);
        }
      }

      await api.post('/api/time-attendance/clock-in', location);
      await loadCurrentStatus();
      await loadTimeEntries();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to clock in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentStatus) return;
    
    try {
      setActionLoading(true);
      
      // Get user location if available
      let location: any = {
        breakMinutes: currentStatus.breakMinutes || 0
      };
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          location.latitude = position.coords.latitude;
          location.longitude = position.coords.longitude;
        } catch (error) {
          console.log('Location not available:', error);
        }
      }

      await api.post(`/api/time-attendance/clock-out/${currentStatus.id}`, location);
      setCurrentStatus(null);
      await loadTimeEntries();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to clock out');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBreak = async (action: 'start' | 'end') => {
    try {
      setActionLoading(true);
      const endpoint = action === 'start' ? '/api/time-attendance/start-break' : '/api/time-attendance/end-break';
      const response = await api.post(endpoint);
      
      if (response.data.success) {
        await loadCurrentStatus();
      } else {
        alert(response.data.message);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to ${action} break`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFilter = () => {
    loadTimeEntries();
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setTimeout(loadTimeEntries, 100);
  };

  const formatHours = (hours: number | null): string => {
    if (hours === null) return '0:00';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${String(m).padStart(2, '0')}`;
  };

  const formatDateTime = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy hh:mm a');
    } catch {
      return '-';
    }
  };

  const formatTime = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'hh:mm a');
    } catch {
      return '-';
    }
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Clock size={28} className="me-2" />
          My Timecard
        </h2>
        <div className="d-flex gap-2">
          {currentStatus && currentStatus.status === 'clocked_in' ? (
            <>
              <Button 
                variant="danger" 
                onClick={handleClockOut}
                disabled={actionLoading}
              >
                <Square size={18} className="me-2" />
                {actionLoading ? 'Processing...' : 'Clock Out'}
                <small className="d-block">End your workday</small>
              </Button>
              {currentStatus.onBreak ? (
                <Button 
                  variant="success" 
                  onClick={() => handleBreak('end')}
                  disabled={actionLoading}
                >
                  <Play size={18} className="me-2" />
                  {actionLoading ? 'Processing...' : 'End Break'}
                </Button>
              ) : (
                <Button 
                  variant="warning" 
                  onClick={() => handleBreak('start')}
                  disabled={actionLoading}
                >
                  <Pause size={18} className="me-2" />
                  {actionLoading ? 'Processing...' : 'Start Break'}
                </Button>
              )}
            </>
          ) : (
            <Button 
              variant="success" 
              onClick={handleClockIn}
              disabled={actionLoading}
            >
              <Clock size={18} className="me-2" />
              {actionLoading ? 'Processing...' : 'Clock In'}
              <small className="d-block">Start your workday</small>
            </Button>
          )}
        </div>
      </div>

      {/* Current Status Card */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="card-title">Current Status</h5>
          {currentStatus && currentStatus.status === 'clocked_in' ? (
            <Alert variant="success">
              <Clock size={18} className="me-2" />
              <strong>Currently Clocked In</strong>
              {currentStatus.clockInTime && (
                <>
                  <br />
                  <small>Since: {formatTime(currentStatus.clockInTime)}</small>
                </>
              )}
              {currentStatus.onBreak && (
                <>
                  <br />
                  <Badge bg="warning">On Break</Badge>
                </>
              )}
              <div className="mt-2 h4" style={{ color: '#28468D' }}>{liveTimer}</div>
            </Alert>
          ) : (
            <Alert variant="info">
              <Clock size={18} className="me-2" />
              <strong>Currently Clocked Out</strong>
              <br />
              <small>Click "Clock In" to start your workday</small>
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label>Start Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Label>End Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Button variant="primary" className="me-2" onClick={handleFilter}>Filter</Button>
                <Button variant="outline-secondary" onClick={handleClearFilter}>
                  Clear
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Summary Stats */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 style={{ color: '#28468D' }}>{formatHours(totalHours)}</h3>
              <p className="text-muted mb-0">Total Hours</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{formatHours(totalOvertime)}</h3>
              <p className="text-muted mb-0">Overtime Hours</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Time Entries Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading time entries...</p>
            </div>
          ) : timeEntries.length > 0 ? (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Break Time</th>
                    <th>Total Hours</th>
                    <th>Overtime</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDateTime(entry.clockInTime).split(',')[0]}</td>
                      <td>{formatTime(entry.clockInTime)}</td>
                      <td>
                        {entry.clockOutTime ? (
                          formatTime(entry.clockOutTime)
                        ) : (
                          <Badge bg="success">Active</Badge>
                        )}
                      </td>
                      <td>{entry.breakMinutes || 0} min</td>
                      <td>{formatHours(entry.totalHours)}</td>
                      <td>
                        {entry.overtimeHours && entry.overtimeHours > 0 ? (
                          <>
                            <span className="text-warning">{formatHours(entry.overtimeHours)}</span>
                            {entry.isOvertimeApproved ? (
                              <span className="text-success ms-1" title="Approved">✓</span>
                            ) : (
                              <span className="text-warning ms-1" title="Pending Approval">⏱</span>
                            )}
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <Badge 
                          bg={
                            entry.status === 'approved' ? 'success' :
                            entry.status === 'clocked_in' ? 'primary' :
                            entry.status === 'clocked_out' ? 'warning' : 'secondary'
                          }
                        >
                          {entry.status}
                        </Badge>
                      </td>
                      <td>{entry.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <Clock size={48} className="text-muted mb-3" />
              <h5>No Time Entries Found</h5>
              <p className="text-muted">Start by clocking in to begin tracking your time.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
