import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Badge } from 'react-bootstrap';
import apiClient from '../lib/api';

export const ShiftAssignmentPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [shiftTypes, setShiftTypes] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedShiftType, setSelectedShiftType] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 6)).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedSchedules, setGeneratedSchedules] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchShiftTypes();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/organization/departments');
      const allUsers: any[] = [];
      response.data.data?.forEach((dept: any) => {
        if (dept.users) {
          allUsers.push(...dept.users);
        }
      });
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchShiftTypes = async () => {
    try {
      const response = await apiClient.get('/scheduling/shift-types');
      setShiftTypes(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch shift types:', error);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map((u) => u.id));
  };

  const deselectAllUsers = () => {
    setSelectedUsers([]);
  };

  const generateScheduleRange = () => {
    if (!selectedShiftType || selectedUsers.length === 0) {
      setError('Please select employees and a shift type');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const schedules: any[] = [];

    selectedUsers.forEach((userId) => {
      const current = new Date(start);
      while (current <= end) {
        schedules.push({
          user_id: userId,
          shift_type_id: parseInt(selectedShiftType),
          schedule_date: current.toISOString().split('T')[0],
          notes: notes || undefined,
        });
        current.setDate(current.getDate() + 1);
      }
    });

    setGeneratedSchedules(schedules);
    setError('');
  };

  const handleBulkAssign = async () => {
    if (generatedSchedules.length === 0) {
      setError('No schedules to assign. Click "Generate Schedule" first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Group schedules by date to send batch requests
      const schedulesByDate = new Map<string, number[]>();
      generatedSchedules.forEach((schedule) => {
        const date = schedule.schedule_date;
        if (!schedulesByDate.has(date)) {
          schedulesByDate.set(date, []);
        }
        if (!schedulesByDate.get(date)!.includes(schedule.user_id)) {
          schedulesByDate.get(date)!.push(schedule.user_id);
        }
      });

      // Send one request per date with all user_ids
      const promises = Array.from(schedulesByDate.entries()).map(([date, userIds]) =>
        apiClient.post('/scheduling/schedules', {
          user_ids: userIds,
          shift_type_id: parseInt(selectedShiftType),
          start_datetime: new Date(`${date}T00:00:00`).toISOString(),
          end_datetime: new Date(`${date}T23:59:59`).toISOString(),
          notes: notes || undefined,
        })
      );

      await Promise.all(promises);
      setSuccess(`Successfully assigned ${generatedSchedules.length} shifts in ${promises.length} batches!`);
      setGeneratedSchedules([]);
      setSelectedUsers([]);
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign shifts');
    } finally {
      setLoading(false);
    }
  };

  const getDaysCount = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold" style={{ color: '#0057A8' }}>
            Bulk Shift Assignment
          </h2>
          <p className="text-muted">Assign shifts to multiple employees at once</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row>
        <Col md={8}>
          {/* Employee Selection */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header style={{ backgroundColor: '#0057A8', color: 'white' }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Step 1: Select Employees</h5>
                <div>
                  <Button size="sm" variant="light" className="me-2" onClick={selectAllUsers}>
                    Select All
                  </Button>
                  <Button size="sm" variant="outline-light" onClick={deselectAllUsers}>
                    Deselect All
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table hover size="sm">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>Select</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Job Title</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => toggleUserSelection(user.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => {}}
                        />
                      </td>
                      <td>
                        <strong>{user.first_name} {user.last_name}</strong>
                      </td>
                      <td>{user.username}</td>
                      <td>{user.job_title || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {selectedUsers.length > 0 && (
                <Alert variant="info" className="mt-3">
                  <strong>{selectedUsers.length}</strong> employees selected
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* Generated Schedule Preview */}
          {generatedSchedules.length > 0 && (
            <Card className="shadow-sm border-0">
              <Card.Header style={{ backgroundColor: '#008C95', color: 'white' }}>
                <h5 className="mb-0">Step 3: Review and Confirm</h5>
              </Card.Header>
              <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Alert variant="warning">
                  <strong>{generatedSchedules.length} shifts</strong> will be created. Review below and click "Assign Shifts" to confirm.
                </Alert>
                <Table striped size="sm">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Shift Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedSchedules.slice(0, 50).map((schedule, idx) => {
                      const user = users.find((u) => u.id === schedule.user_id);
                      const shiftType = shiftTypes.find((s) => s.id === schedule.shift_type_id);
                      return (
                        <tr key={idx}>
                          <td>{user?.first_name} {user?.last_name}</td>
                          <td>{new Date(schedule.schedule_date).toLocaleDateString()}</td>
                          <td>
                            <Badge bg="primary">{shiftType?.name}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                    {generatedSchedules.length > 50 && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted">
                          ... and {generatedSchedules.length - 50} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                <div className="d-grid">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleBulkAssign}
                    disabled={loading}
                  >
                    {loading ? 'Assigning...' : 'Assign Shifts'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          {/* Shift Configuration */}
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#62237A', color: 'white' }}>
              <h5 className="mb-0">Step 2: Configure Shift</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Shift Type *</Form.Label>
                  <Form.Select
                    value={selectedShiftType}
                    onChange={(e) => setSelectedShiftType(e.target.value)}
                    required
                  >
                    <option value="">Select Shift Type...</option>
                    {shiftTypes.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} ({shift.start_time} - {shift.end_time})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Start Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>End Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </Form.Group>

                <Alert variant="info">
                  <small>
                    <strong>Duration:</strong> {getDaysCount()} days<br />
                    <strong>Employees:</strong> {selectedUsers.length}<br />
                    <strong>Total Shifts:</strong> {getDaysCount() * selectedUsers.length}
                  </small>
                </Alert>

                <Form.Group className="mb-3">
                  <Form.Label>Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this shift assignment..."
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    onClick={generateScheduleRange}
                    disabled={selectedUsers.length === 0 || !selectedShiftType}
                  >
                    Generate Schedule
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
