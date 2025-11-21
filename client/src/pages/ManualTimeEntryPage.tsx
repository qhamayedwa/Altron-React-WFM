import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert } from 'react-bootstrap';
import apiClient from '../lib/api';

export const ManualTimeEntryPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [clockInTime, setClockInTime] = useState('09:00');
  const [clockOutTime, setClockOutTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [recentEntries, setRecentEntries] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchRecentEntries();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/organization/departments');
      // Extract all users from departments
      const allUsers: any[] = [];
      response.data.data?.forEach((dept: any) => {
        if (dept.users) {
          allUsers.push(...dept.users);
        }
      });
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchRecentEntries = async () => {
    try {
      const response = await apiClient.get('/time/entries', {
        params: { per_page: 10 }
      });
      setRecentEntries(response.data.entries || []);
    } catch (err) {
      console.error('Failed to fetch recent entries:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      // Create time entry manually
      const clockInDateTime = new Date(`${entryDate}T${clockInTime}:00`);
      const clockOutDateTime = new Date(`${entryDate}T${clockOutTime}:00`);

      await apiClient.post('/time/manual-entry', {
        user_id: parseInt(selectedUser),
        clock_in_time: clockInDateTime.toISOString(),
        clock_out_time: clockOutDateTime.toISOString(),
        break_time: 30,
        notes: notes || undefined,
      });

      setSuccess('Time entry created successfully!');
      setSelectedUser('');
      setNotes('');
      fetchRecentEntries();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create time entry');
    } finally {
      setLoading(false);
    }
  };

  const calculateHours = () => {
    if (!clockInTime || !clockOutTime) return 0;
    const clockIn = new Date(`2000-01-01T${clockInTime}:00`);
    const clockOut = new Date(`2000-01-01T${clockOutTime}:00`);
    const diff = clockOut.getTime() - clockIn.getTime();
    return (diff / (1000 * 60 * 60)).toFixed(2);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold" style={{ color: '#0057A8' }}>
            Manual Time Entry
          </h2>
          <p className="text-muted">Create time entries for employees</p>
        </Col>
      </Row>

      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row>
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#0057A8', color: 'white' }}>
              <h5 className="mb-0">Create Time Entry</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    required
                  >
                    <option value="">Select Employee...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.username})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Clock In Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={clockInTime}
                        onChange={(e) => setClockInTime(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Clock Out Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={clockOutTime}
                        onChange={(e) => setClockOutTime(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Alert variant="info">
                  <strong>Total Hours:</strong> {calculateHours()} hours
                </Alert>

                <Form.Group className="mb-3">
                  <Form.Label>Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this entry..."
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant="primary" size="lg" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Time Entry'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#008C95', color: 'white' }}>
              <h5 className="mb-0">Recent Manual Entries</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.length > 0 ? (
                    recentEntries.map((entry, idx) => (
                      <tr key={idx}>
                        <td>
                          {entry.user?.first_name} {entry.user?.last_name}
                        </td>
                        <td>{new Date(entry.clock_in_time).toLocaleDateString()}</td>
                        <td>{entry.total_hours?.toFixed(2) || '-'}</td>
                        <td>
                          <span className={`badge bg-${
                            entry.status === 'approved' ? 'success' : 
                            entry.status === 'pending' ? 'warning' : 'secondary'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">
                        No recent entries
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
