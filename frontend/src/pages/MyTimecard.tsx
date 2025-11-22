import { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Row, Col, Badge, Alert } from 'react-bootstrap';
import { Clock, Square, Play, Pause } from 'lucide-react';

export default function MyTimecard() {
  const [currentStatus, setCurrentStatus] = useState<'clocked_in' | 'clocked_out'>('clocked_out');
  const [onBreak, setOnBreak] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [liveTimer, setLiveTimer] = useState('00:00:00');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (currentStatus === 'clocked_in' && clockInTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - clockInTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setLiveTimer(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStatus, clockInTime]);

  const handleClockIn = () => {
    setCurrentStatus('clocked_in');
    setClockInTime(new Date());
  };

  const handleClockOut = () => {
    setCurrentStatus('clocked_out');
    setClockInTime(null);
    setOnBreak(false);
  };

  const handleBreak = (action: 'start' | 'end') => {
    setOnBreak(action === 'start');
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Clock size={28} className="me-2" />
          My Timecard
        </h2>
        <div className="d-flex gap-2">
          {currentStatus === 'clocked_in' ? (
            <>
              <Button variant="danger" onClick={handleClockOut}>
                <Square size={18} className="me-2" />
                Clock Out
                <small className="d-block">End your workday</small>
              </Button>
              {onBreak ? (
                <Button variant="success" onClick={() => handleBreak('end')}>
                  <Play size={18} className="me-2" />
                  End Break
                </Button>
              ) : (
                <Button variant="warning" onClick={() => handleBreak('start')}>
                  <Pause size={18} className="me-2" />
                  Start Break
                </Button>
              )}
            </>
          ) : (
            <Button variant="success" onClick={handleClockIn}>
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
          {currentStatus === 'clocked_in' ? (
            <Alert variant="success">
              <Clock size={18} className="me-2" />
              <strong>Currently Clocked In</strong>
              {clockInTime && (
                <>
                  <br />
                  <small>Since: {clockInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</small>
                </>
              )}
              {onBreak && (
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
                <Button variant="primary" className="me-2">Filter</Button>
                <Button variant="outline-secondary" onClick={() => { setStartDate(''); setEndDate(''); }}>
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
              <h3 className="text-primary">40:30</h3>
              <p className="text-muted mb-0">Total Hours</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">5:15</h3>
              <p className="text-muted mb-0">Overtime Hours</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Time Entries Table */}
      <Card>
        <Card.Body>
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
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    <Clock size={48} className="text-muted mb-3" />
                    <h5>No Time Entries Found</h5>
                    <p className="text-muted">Start by clocking in to begin tracking your time.</p>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
