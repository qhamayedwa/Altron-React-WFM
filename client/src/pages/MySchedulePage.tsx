import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Spinner, Form, Badge } from 'react-bootstrap';
import { api } from '../lib/api';

interface Schedule {
  id: number;
  user_id: number;
  shift_type_id: number | null;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  assigned_by_manager_id: number;
  batch_id: string | null;
  created_at: string;
  updated_at: string;
  shift_type?: {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    color_code: string | null;
  } | null;
}

const MySchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchMySchedule();
  }, [startDate, endDate]);

  const fetchMySchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (startDate) {
        const startISO = new Date(startDate + 'T00:00:00').toISOString();
        params.append('start_date', startISO);
      }
      if (endDate) {
        const endISO = new Date(endDate + 'T23:59:59').toISOString();
        params.append('end_date', endISO);
      }

      const response = await api.get(`/scheduling/my-schedule?${params.toString()}`);
      setSchedules(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch your schedule');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Johannesburg',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      scheduled: 'bg-primary',
      completed: 'bg-success',
      cancelled: 'bg-danger',
      in_progress: 'bg-warning',
    };
    return statusMap[status] || 'bg-secondary';
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>My Schedule</h2>
          <p className="text-muted">View your upcoming and past shifts</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Row className="mb-3">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Form>
                <Row className="align-items-end">
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <div className="text-muted small">
                      {schedules.length} shift{schedules.length !== 1 ? 's' : ''}
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : schedules.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No scheduled shifts found for the selected date range.
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Shift Type</th>
                      <th>Start Date & Time</th>
                      <th>End Date & Time</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td>
                          {schedule.shift_type ? (
                            <div className="d-flex align-items-center">
                              <div
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  backgroundColor: schedule.shift_type.color_code || '#0d6efd',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  marginRight: '8px',
                                }}
                              />
                              <strong>{schedule.shift_type.name}</strong>
                            </div>
                          ) : (
                            <span className="text-muted">No shift type</span>
                          )}
                        </td>
                        <td>{formatDateTime(schedule.start_time)}</td>
                        <td>{formatDateTime(schedule.end_time)}</td>
                        <td>{calculateDuration(schedule.start_time, schedule.end_time)}</td>
                        <td>
                          <Badge bg={getStatusBadge(schedule.status)}>
                            {schedule.status}
                          </Badge>
                        </td>
                        <td>{schedule.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MySchedulePage;
