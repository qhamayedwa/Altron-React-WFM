import React, { useState } from 'react';
import { Container, Table, Badge, Button, Form, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface TimeEntry {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string | null;
    last_name: string | null;
  };
  clock_in_time: string;
  clock_out_time: string | null;
  total_hours: number;
  status: string;
  notes: string | null;
}

export const TimeEntriesPage: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['time-entries', page, startDate, endDate, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      });
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (status) params.append('status', status);
      
      const response = await api.get(`/time/entries?${params}`);
      return response.data.data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Open: 'primary',
      Closed: 'warning',
      Approved: 'success',
      Rejected: 'danger',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const fullName = (entry: TimeEntry) => {
    if (entry.user.first_name && entry.user.last_name) {
      return `${entry.user.first_name} ${entry.user.last_name}`;
    }
    return entry.user.username;
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Failed to load time entries. Please try again.</Alert>
      </Container>
    );
  }

  const entries = data?.entries || [];
  const pagination = data?.pagination || {};

  return (
    <Container className="py-4">
      <h2 className="mb-4">Time Entries</h2>

      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All</option>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setStatus('');
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Total Hours</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    No time entries found
                  </td>
                </tr>
              ) : (
                entries.map((entry: TimeEntry) => (
                  <tr key={entry.id}>
                    <td>{fullName(entry)}</td>
                    <td>{formatDateTime(entry.clock_in_time)}</td>
                    <td>
                      {entry.clock_out_time ? formatDateTime(entry.clock_out_time) : '-'}
                    </td>
                    <td>{entry.total_hours.toFixed(2)} hrs</td>
                    <td>{getStatusBadge(entry.status)}</td>
                    <td>
                      {entry.notes ? (
                        <small className="text-muted">{entry.notes}</small>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {pagination.total_pages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted">
                Page {pagination.page} of {pagination.total_pages} ({pagination.total} total)
              </div>
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPage(page - 1)}
                  className="me-2"
                >
                  Previous
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={pagination.page === pagination.total_pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};
