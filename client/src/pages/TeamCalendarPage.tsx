import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, Button } from 'react-bootstrap';
import apiClient from '../lib/api';

export const TeamCalendarPage: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [groupedSchedules, setGroupedSchedules] = useState<Map<string, any[]>>(new Map());

  useEffect(() => {
    fetchSchedules();
  }, [startDate, endDate]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/scheduling/schedules', {
        params: { start_date: startDate, end_date: endDate },
      });
      
      const data = response.data.data || [];
      setSchedules(data);
      groupSchedulesByDate(data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupSchedulesByDate = (schedules: any[]) => {
    const grouped = new Map<string, any[]>();
    
    schedules.forEach((schedule) => {
      const date = new Date(schedule.schedule_date).toISOString().split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)?.push(schedule);
    });

    setGroupedSchedules(grouped);
  };

  const getShiftBadge = (shiftType: string) => {
    const colors: any = {
      'Morning': 'primary',
      'Day': 'success',
      'Evening': 'warning',
      'Night': 'dark',
      'Swing': 'info',
    };
    
    return <Badge bg={colors[shiftType] || 'secondary'}>{shiftType}</Badge>;
  };

  const formatTime = (time: string) => {
    if (!time) return '-';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generateDateRange = () => {
    const dates: Date[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold" style={{ color: '#0057A8' }}>
            Team Calendar
          </h2>
          <p className="text-muted">View team schedules and shift assignments</p>
        </Col>
      </Row>

      {/* Date Range Filter */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Form>
                <Row className="align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Button variant="primary" onClick={fetchSchedules} disabled={loading}>
                      {loading ? 'Loading...' : 'Refresh'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Total Shifts</h6>
              <h3 className="fw-bold" style={{ color: '#0057A8' }}>
                {schedules.length}
              </h3>
              <small className="text-muted">Scheduled</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Calendar View */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#008C95', color: 'white' }}>
              <h5 className="mb-0">📅 Schedule Calendar</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '800px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                generateDateRange().map((date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const daySchedules = groupedSchedules.get(dateStr) || [];
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                  const dateDisplay = date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  });

                  return (
                    <div key={dateStr} className="mb-4">
                      <div
                        className="p-3 rounded mb-2"
                        style={{
                          backgroundColor: daySchedules.length > 0 ? '#E3F2FD' : '#F5F5F5',
                        }}
                      >
                        <h6 className="mb-0 fw-bold">
                          {dayName}, {dateDisplay}
                          <Badge bg="secondary" className="ms-2">
                            {daySchedules.length} shifts
                          </Badge>
                        </h6>
                      </div>

                      {daySchedules.length > 0 ? (
                        <Table striped hover size="sm" className="mb-0">
                          <thead>
                            <tr>
                              <th>Employee</th>
                              <th>Shift Type</th>
                              <th>Start Time</th>
                              <th>End Time</th>
                              <th>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {daySchedules.map((schedule, idx) => (
                              <tr key={idx}>
                                <td>
                                  <strong>
                                    {schedule.user?.first_name} {schedule.user?.last_name}
                                  </strong>
                                  <br />
                                  <small className="text-muted">
                                    {schedule.user?.username}
                                  </small>
                                </td>
                                <td>
                                  {getShiftBadge(schedule.shift_type?.name || 'N/A')}
                                </td>
                                <td>{formatTime(schedule.shift_type?.start_time)}</td>
                                <td>{formatTime(schedule.shift_type?.end_time)}</td>
                                <td>
                                  <small className="text-muted">
                                    {schedule.notes || '-'}
                                  </small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <div className="text-center text-muted py-3">
                          <small>No shifts scheduled</small>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
