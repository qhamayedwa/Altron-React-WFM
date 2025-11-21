import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Badge } from 'react-bootstrap';
import apiClient from '../lib/api';

export const TeamTimecardPage: React.FC = () => {
  const [teamEntries, setTeamEntries] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchTeamTimecard();
  }, [startDate, endDate]);

  const fetchTeamTimecard = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/time/entries', {
        params: {
          start_date: startDate,
          end_date: endDate,
          per_page: 1000,
        },
      });
      
      const entries = response.data.entries || [];
      setTeamEntries(entries);
      calculateSummary(entries);
    } catch (error) {
      console.error('Failed to fetch team timecard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (entries: any[]) => {
    const userSummary = new Map();
    
    entries.forEach((entry) => {
      const userId = entry.user?.id;
      if (!userId) return;
      
      if (!userSummary.has(userId)) {
        userSummary.set(userId, {
          user: entry.user,
          totalHours: 0,
          approvedHours: 0,
          pendingHours: 0,
          entries: 0,
        });
      }
      
      const summary = userSummary.get(userId);
      summary.totalHours += entry.total_hours || 0;
      summary.entries += 1;
      
      if (entry.status === 'approved') {
        summary.approvedHours += entry.total_hours || 0;
      } else if (entry.status === 'pending') {
        summary.pendingHours += entry.total_hours || 0;
      }
    });
    
    setSummary(Array.from(userSummary.values()));
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger',
      clocked_in: 'info',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold" style={{ color: '#0057A8' }}>
            Team Timecard
          </h2>
          <p className="text-muted">View consolidated team time entries and hours</p>
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
                    <Button variant="primary" onClick={fetchTeamTimecard} disabled={loading}>
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
              <h6 className="text-muted mb-2">Total Entries</h6>
              <h3 className="fw-bold" style={{ color: '#0057A8' }}>
                {teamEntries.length}
              </h3>
              <small className="text-muted">
                {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Employee Summary */}
      {summary && summary.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm border-0">
              <Card.Header style={{ backgroundColor: '#008C95', color: 'white' }}>
                <h5 className="mb-0">Employee Summary</h5>
              </Card.Header>
              <Card.Body>
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Total Hours</th>
                      <th>Approved Hours</th>
                      <th>Pending Hours</th>
                      <th>Total Entries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td>
                          <strong>
                            {item.user?.first_name} {item.user?.last_name}
                          </strong>
                          <br />
                          <small className="text-muted">{item.user?.username}</small>
                        </td>
                        <td>
                          <h5 className="mb-0">{item.totalHours.toFixed(2)}</h5>
                        </td>
                        <td>
                          <span className="text-success fw-bold">
                            {item.approvedHours.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span className="text-warning fw-bold">
                            {item.pendingHours.toFixed(2)}
                          </span>
                        </td>
                        <td>{item.entries}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-secondary">
                      <td><strong>Total</strong></td>
                      <td>
                        <strong>
                          {summary.reduce((sum: number, item: any) => sum + item.totalHours, 0).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {summary.reduce((sum: number, item: any) => sum + item.approvedHours, 0).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {summary.reduce((sum: number, item: any) => sum + item.pendingHours, 0).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <strong>{teamEntries.length}</strong>
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Detailed Entries */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#0057A8', color: 'white' }}>
              <h5 className="mb-0">Detailed Time Entries</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : teamEntries.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Total Hours</th>
                      <th>Break Time</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamEntries.map((entry, idx) => (
                      <tr key={idx}>
                        <td>
                          {entry.user?.first_name} {entry.user?.last_name}
                        </td>
                        <td>{new Date(entry.clock_in_time).toLocaleDateString()}</td>
                        <td>{new Date(entry.clock_in_time).toLocaleTimeString()}</td>
                        <td>
                          {entry.clock_out_time
                            ? new Date(entry.clock_out_time).toLocaleTimeString()
                            : '-'}
                        </td>
                        <td>
                          <strong>{entry.total_hours?.toFixed(2) || '0.00'}</strong>
                        </td>
                        <td>{entry.break_time || '0'} min</td>
                        <td>{getStatusBadge(entry.status)}</td>
                        <td>
                          <small className="text-muted">
                            {entry.notes || '-'}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center text-muted py-5">
                  <p>No time entries found for the selected date range</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
