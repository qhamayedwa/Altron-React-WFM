import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { api } from '../lib/api';

interface ShiftType {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  color_code: string | null;
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  department_id: number;
}

interface Schedule {
  id: number;
  user_id: number;
  shift_type_id: number | null;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  batch_id: string | null;
  created_at: string;
  user?: User;
  shift_type?: ShiftType;
}

const TeamSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    user_ids: [] as number[],
    shift_type_id: '',
    start_datetime: '',
    end_datetime: '',
    status: 'scheduled',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [conflictCheckResult, setConflictCheckResult] = useState<any>(null);

  const [filterUserId, setFilterUserId] = useState('');
  const [filterShiftTypeId, setFilterShiftTypeId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [filterEndDate, setFilterEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [filterUserId, filterShiftTypeId, filterStatus, filterStartDate, filterEndDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [schedulesRes, shiftTypesRes, usersRes] = await Promise.all([
        api.get('/scheduling/schedules'),
        api.get('/scheduling/shift-types'),
        api.get('/auth/users'),
      ]);
      
      setSchedules(schedulesRes.data.data);
      setShiftTypes(shiftTypesRes.data.data.filter((st: ShiftType & { is_active: boolean }) => st.is_active));
      setUsers(usersRes.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterUserId) params.append('user_id', filterUserId);
      if (filterShiftTypeId) params.append('shift_type_id', filterShiftTypeId);
      if (filterStatus) params.append('status', filterStatus);
      if (filterStartDate) {
        const startISO = new Date(filterStartDate + 'T00:00:00').toISOString();
        params.append('start_date', startISO);
      }
      if (filterEndDate) {
        const endISO = new Date(filterEndDate + 'T23:59:59').toISOString();
        params.append('end_date', endISO);
      }

      const response = await api.get(`/scheduling/schedules?${params.toString()}`);
      setSchedules(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeLocal = (isoString: string): string => {
    // Normalize to UTC first to handle any timezone offset (Z, +XX:XX, -XX:XX)
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.error('Invalid ISO string:', isoString);
      return '';
    }
    // Extract local components from the UTC-normalized date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleOpenModal = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      const startDate = formatDateTimeLocal(schedule.start_time);
      const endDate = formatDateTimeLocal(schedule.end_time);
      setFormData({
        user_ids: [schedule.user_id],
        shift_type_id: schedule.shift_type_id?.toString() || '',
        start_datetime: startDate,
        end_datetime: endDate,
        status: schedule.status,
        notes: schedule.notes || '',
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        user_ids: [],
        shift_type_id: '',
        start_datetime: '',
        end_datetime: '',
        status: 'scheduled',
        notes: '',
      });
    }
    setConflictCheckResult(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
    setConflictCheckResult(null);
    setError(null);
  };

  const handleCheckConflicts = async () => {
    if (formData.user_ids.length === 0 || !formData.start_datetime || !formData.end_datetime) {
      setError('Please select employee(s) and date/time range');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      
      if (formData.user_ids.length > 1) {
        const conflictChecks = formData.user_ids.map(userId =>
          api.post('/scheduling/check-conflicts', {
            user_id: userId,
            start_time: new Date(formData.start_datetime).toISOString(),
            end_time: new Date(formData.end_datetime).toISOString(),
            exclude_schedule_id: editingSchedule?.id,
          })
        );
        
        const results = await Promise.all(conflictChecks);
        let totalConflicts = 0;
        const conflictUsers: number[] = [];
        const allConflicts: any[] = [];
        
        results.forEach((response, index) => {
          if (response.data.data.has_conflicts) {
            const userId = formData.user_ids[index];
            const userConflicts = response.data.data.conflicts;
            totalConflicts += userConflicts.length;
            conflictUsers.push(userId);
            // Add user context to each conflict
            userConflicts.forEach((conflict: any) => {
              allConflicts.push({ ...conflict, conflict_user_id: userId });
            });
          }
        });
        
        if (totalConflicts > 0) {
          setError(`Conflicts detected for ${conflictUsers.length} of ${formData.user_ids.length} employees. ${totalConflicts} total conflicts found.`);
          setConflictCheckResult({ 
            has_conflicts: true, 
            conflicts: allConflicts, 
            conflict_count: totalConflicts 
          });
        } else {
          setSuccess(`No conflicts found for all ${formData.user_ids.length} selected employees. Safe to schedule.`);
          setConflictCheckResult({ has_conflicts: false, conflicts: [], conflict_count: 0 });
        }
      } else {
        const response = await api.post('/scheduling/check-conflicts', {
          user_id: formData.user_ids[0],
          start_time: new Date(formData.start_datetime).toISOString(),
          end_time: new Date(formData.end_datetime).toISOString(),
          exclude_schedule_id: editingSchedule?.id,
        });
        setConflictCheckResult(response.data.data);
        if (response.data.data.has_conflicts) {
          setError(`Conflict detected! ${response.data.data.conflicts.length} overlapping schedule(s) found.`);
        } else {
          setSuccess('No conflicts found. Safe to schedule.');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check conflicts');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingSchedule) {
        await api.patch(`/scheduling/schedules/${editingSchedule.id}`, {
          shift_type_id: formData.shift_type_id ? parseInt(formData.shift_type_id) : null,
          start_datetime: new Date(formData.start_datetime).toISOString(),
          end_datetime: new Date(formData.end_datetime).toISOString(),
          status: formData.status,
          notes: formData.notes,
        });
        setSuccess('Schedule updated successfully');
        await fetchSchedules();
        handleCloseModal();
      } else {
        const response = await api.post('/scheduling/schedules', {
          user_ids: formData.user_ids,
          shift_type_id: formData.shift_type_id ? parseInt(formData.shift_type_id) : null,
          start_datetime: new Date(formData.start_datetime).toISOString(),
          end_datetime: new Date(formData.end_datetime).toISOString(),
          status: formData.status,
          notes: formData.notes,
        });
        
        if (response.data.data.conflict_employees?.length > 0) {
          setError(`Created ${response.data.data.created_count} schedule(s). Skipped ${response.data.data.conflict_employees.length} employee(s) due to conflicts.`);
          await fetchSchedules();
        } else {
          setSuccess(`Schedule created successfully for ${formData.user_ids.length} employee(s)`);
          await fetchSchedules();
          handleCloseModal();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await api.delete(`/scheduling/schedules/${id}`);
      setSuccess('Schedule deleted successfully');
      await fetchSchedules();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete schedule');
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

  const handleUserSelection = (userId: number, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, user_ids: [...formData.user_ids, userId] });
    } else {
      setFormData({ ...formData, user_ids: formData.user_ids.filter(id => id !== userId) });
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Team Schedule Management</h2>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              + Create Schedule
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Row className="mb-3">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Employee</Form.Label>
                      <Form.Select
                        value={filterUserId}
                        onChange={(e) => setFilterUserId(e.target.value)}
                      >
                        <option value="">All Employees</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} ({user.username})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Shift Type</Form.Label>
                      <Form.Select
                        value={filterShiftTypeId}
                        onChange={(e) => setFilterShiftTypeId(e.target.value)}
                      >
                        <option value="">All Shift Types</option>
                        {shiftTypes.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="">All Statuses</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col>
                    <div className="text-muted small">
                      {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} found
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
                  No schedules found. Create your first schedule to get started.
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Shift Type</th>
                      <th>Start Date & Time</th>
                      <th>End Date & Time</th>
                      <th>Status</th>
                      <th>Batch</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td>
                          {schedule.user ? (
                            <strong>
                              {schedule.user.first_name} {schedule.user.last_name}
                            </strong>
                          ) : (
                            <span className="text-muted">Unknown</span>
                          )}
                        </td>
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
                              {schedule.shift_type.name}
                            </div>
                          ) : (
                            <span className="text-muted">No shift type</span>
                          )}
                        </td>
                        <td>{formatDateTime(schedule.start_time)}</td>
                        <td>{formatDateTime(schedule.end_time)}</td>
                        <td>
                          <Badge bg={getStatusBadge(schedule.status)}>
                            {schedule.status}
                          </Badge>
                        </td>
                        <td>
                          {schedule.batch_id ? (
                            <Badge bg="info" title={schedule.batch_id}>
                              Batch
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{schedule.notes || '-'}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleOpenModal(schedule)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingSchedule ? 'Edit Schedule' : 'Create Schedule'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            {conflictCheckResult && (
              <Alert variant={conflictCheckResult.has_conflicts ? 'warning' : 'success'}>
                {conflictCheckResult.has_conflicts
                  ? `Conflict detected! ${conflictCheckResult.conflict_count || conflictCheckResult.conflicts.length} overlapping schedule(s) found.`
                  : 'No conflicts found. Safe to schedule.'}
              </Alert>
            )}
            
            {editingSchedule ? (
              <Form.Group className="mb-3">
                <Form.Label>Employee</Form.Label>
                <Form.Control
                  type="text"
                  value={editingSchedule.user ? `${editingSchedule.user.first_name} ${editingSchedule.user.last_name}` : 'Unknown'}
                  disabled
                />
              </Form.Group>
            ) : (
              <Form.Group className="mb-3">
                <Form.Label>Select Employees (for batch scheduling) *</Form.Label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                  {users.map((user) => (
                    <Form.Check
                      key={user.id}
                      type="checkbox"
                      id={`user-${user.id}`}
                      label={`${user.first_name} ${user.last_name} (${user.username})`}
                      checked={formData.user_ids.includes(user.id)}
                      onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                    />
                  ))}
                </div>
                <Form.Text className="text-muted">
                  Select one or more employees. Selecting multiple creates a batch schedule.
                </Form.Text>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Shift Type</Form.Label>
              <Form.Select
                value={formData.shift_type_id}
                onChange={(e) => setFormData({ ...formData, shift_type_id: e.target.value })}
              >
                <option value="">No specific shift type</option>
                {shiftTypes.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.start_time} - {st.end_time})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date & Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date & Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.end_datetime}
                    onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes about this schedule"
              />
            </Form.Group>

            {!editingSchedule && (
              <Button
                variant="outline-secondary"
                onClick={handleCheckConflicts}
                className="mb-3"
              >
                Check for Conflicts
              </Button>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingSchedule ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default TeamSchedulePage;
