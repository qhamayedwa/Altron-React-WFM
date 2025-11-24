import { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { Clock, Square, Play, Pause } from 'lucide-react';
import api from '../api/client';

interface TimeEntry {
  id: number;
  clock_in_time: string;
  clock_out_time: string | null;
  status: string;
  notes: string | null;
  total_break_minutes: number | null;
  total_hours: number;
  overtime_hours: number;
  is_overtime_approved: boolean;
}

interface CurrentStatus {
  status: 'clocked_in' | 'clocked_out';
  entry_id?: number;
  clock_in_time?: string;
  on_break?: boolean;
  break_start_time?: string;
}

interface Summary {
  total_hours: string;
  total_overtime: string;
}

export default function MyTimecard() {
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus>({ status: 'clocked_out' });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [summary, setSummary] = useState<Summary>({ total_hours: '0.00', total_overtime: '0.00' });
  const [liveTimer, setLiveTimer] = useState('00:00:00');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [startDate, endDate, currentPage]);

  useEffect(() => {
    if (currentStatus.status === 'clocked_in' && currentStatus.clock_in_time) {
      const interval = setInterval(() => {
        const clockInTime = new Date(currentStatus.clock_in_time!);
        const now = new Date();
        const diff = now.getTime() - clockInTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setLiveTimer(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load current status
      const statusRes = await api.get('/api/time/current-status');
      setCurrentStatus(statusRes.data);

      // Load time entries
      const params: any = { page: currentPage };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const entriesRes = await api.get('/api/time/entries', { params });
      setTimeEntries(entriesRes.data.entries || []);
      setTotalPages(entriesRes.data.pagination?.total_pages || 1);

      // Load summary
      const summaryParams: any = {};
      if (startDate) summaryParams.start_date = startDate;
      if (endDate) summaryParams.end_date = endDate;
      
      const summaryRes = await api.get('/api/time/summary', { params: summaryParams });
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error loading timecard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      
      // Try to get GPS coordinates
      let latitude, longitude;
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
              resolve(true);
            },
            () => resolve(false)
          );
        });
      }

      await api.post('/api/time/clock-in', { latitude, longitude });
      await loadData();
      alert('Successfully clocked in!');
    } catch (error: any) {
      console.error('Error clocking in:', error);
      alert(error.response?.data?.error || 'Failed to clock in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      
      // Try to get GPS coordinates
      let latitude, longitude;
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
              resolve(true);
            },
            () => resolve(false)
          );
        });
      }

      await api.post('/api/time/clock-out', { latitude, longitude });
      await loadData();
      alert('Successfully clocked out!');
    } catch (error: any) {
      console.error('Error clocking out:', error);
      alert(error.response?.data?.error || 'Failed to clock out');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBreak = async (action: 'start' | 'end') => {
    try {
      setActionLoading(true);
      await api.post(`/api/time/break/${action}`);
      await loadData();
      alert(action === 'start' ? 'Break started' : 'Break ended');
    } catch (error: any) {
      console.error(`Error ${action}ing break:`, error);
      alert(error.response?.data?.error || `Failed to ${action} break`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFilter = () => {
    setCurrentPage(1);
    loadData();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatHours = (hours: number) => {
    if (!hours || hours === 0) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${String(m).padStart(2, '0')}`;
  };

  const formatSummaryHours = (hoursStr: string) => {
    const hours = parseFloat(hoursStr);
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${String(m).padStart(2, '0')}`;
  };

  if (loading && timeEntries.length === 0) {
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading timecard...</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Clock size={28} className="me-2" />
          My Timecard
        </h2>
        <div className="d-flex gap-2">
          {currentStatus.status === 'clocked_in' ? (
            <>
              <Button 
                variant="danger" 
                onClick={handleClockOut}
                disabled={actionLoading}
              >
                <Square size={18} className="me-2" />
                Clock Out
                <small className="d-block">End your workday</small>
              </Button>
              {currentStatus.on_break ? (
                <Button 
                  variant="success" 
                  onClick={() => handleBreak('end')}
                  disabled={actionLoading}
                >
                  <Play size={18} className="me-2" />
                  End Break
                </Button>
              ) : (
                <Button 
                  variant="warning" 
                  onClick={() => handleBreak('start')}
                  disabled={actionLoading}
                >
                  <Pause size={18} className="me-2" />
                  Start Break
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
              Clock In
              <small className="d-block">Start your workday</small>
            </Button>
          )}
        </div>
      </div>

      {/* Current Status Card */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="card-title">Current Status</h5>
          {currentStatus.status === 'clocked_in' ? (
            <Alert variant="success">
              <Clock size={18} className="me-2" />
              <strong>Currently Clocked In</strong>
              {currentStatus.clock_in_time && (
                <>
                  <br />
                  <small>Since: {formatTime(currentStatus.clock_in_time)}</small>
                </>
              )}
              {currentStatus.on_break && (
                <>
                  <br />
                  <Badge bg="warning">On Break</Badge>
                </>
              )}
              <div className="mt-2 h4 text-primary">{liveTimer}</div>
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
          <Form onSubmit={(e) => { e.preventDefault(); handleFilter(); }}>
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
                <Button variant="primary" className="me-2" type="submit">Filter</Button>
                <Button variant="outline-secondary" onClick={handleClearFilters}>
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
              <h3 className="text-primary">{formatSummaryHours(summary.total_hours)}</h3>
              <p className="text-muted mb-0">Total Hours</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{formatSummaryHours(summary.total_overtime)}</h3>
              <p className="text-muted mb-0">Overtime Hours</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Time Entries Table */}
      <Card>
        <Card.Body>
          {timeEntries.length > 0 ? (
            <>
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
                        <td>{formatDate(entry.clock_in_time)}</td>
                        <td>{formatTime(entry.clock_in_time)}</td>
                        <td>
                          {entry.clock_out_time ? (
                            formatTime(entry.clock_out_time)
                          ) : (
                            <Badge bg="success">Active</Badge>
                          )}
                        </td>
                        <td>{entry.total_break_minutes || 0} min</td>
                        <td>{formatHours(entry.total_hours)}</td>
                        <td>
                          {entry.overtime_hours > 0 ? (
                            <span className="text-warning">
                              {formatHours(entry.overtime_hours)}
                              {entry.is_overtime_approved && (
                                <Badge bg="success" className="ms-1">Approved</Badge>
                              )}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <Badge 
                            bg={entry.status === 'Closed' ? 'success' : entry.status === 'Open' ? 'primary' : 'warning'}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Timecard pagination">
                  <ul className="pagination justify-content-center mt-3">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li 
                        key={page} 
                        className={`page-item ${currentPage === page ? 'active' : ''}`}
                      >
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
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
