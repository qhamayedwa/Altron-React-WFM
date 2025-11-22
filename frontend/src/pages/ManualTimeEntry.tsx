import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Edit, ArrowLeft, Save, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export default function ManualTimeEntry() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    userId: '',
    workDate: new Date().toISOString().split('T')[0],
    clockInTime: '',
    clockOutTime: '',
    notes: '',
    approveOvertime: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadUsers();
    initializeDefaultTimes();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.map((user: any) => ({
        ...user,
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
      })));
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const initializeDefaultTimes = () => {
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    const clockInDefault = now.toISOString().slice(0, 16);
    setFormData(prev => ({ ...prev, clockInTime: clockInDefault }));
    updateClockOutTime(clockInDefault);
  };

  const updateClockOutTime = (clockInTime: string) => {
    if (clockInTime) {
      const clockIn = new Date(clockInTime);
      const clockOut = new Date(clockIn.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours
      setFormData(prev => ({ ...prev, clockOutTime: clockOut.toISOString().slice(0, 16) }));
    }
  };

  const handleClockInChange = (value: string) => {
    setFormData(prev => ({ ...prev, clockInTime: value }));
    updateClockOutTime(value);
  };

  const validateForm = (): boolean => {
    if (!formData.userId) {
      setError('Please select an employee');
      return false;
    }

    if (!formData.clockInTime) {
      setError('Clock in time is required');
      return false;
    }

    if (formData.clockOutTime) {
      const clockIn = new Date(formData.clockInTime);
      const clockOut = new Date(formData.clockOutTime);

      if (clockOut <= clockIn) {
        setError('Clock out time must be after clock in time');
        return false;
      }

      const hoursWorked = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
      if (hoursWorked > 24) {
        const confirmed = window.confirm('This entry shows more than 24 hours worked. Are you sure this is correct?');
        if (!confirmed) return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    try {
      setLoading(true);
      await api.post('/time-attendance/manual-entry', {
        userId: parseInt(formData.userId),
        clockInTime: formData.clockInTime,
        clockOutTime: formData.clockOutTime || null,
        notes: formData.notes,
        approveOvertime: formData.approveOvertime
      });

      setSuccess(true);
      setTimeout(() => navigate('/time-attendance-admin'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create time entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Edit size={28} className="me-2" />
          Manual Time Entry
        </h2>
        <Button variant="outline-secondary" onClick={() => navigate('/time-attendance-admin')}>
          <ArrowLeft size={18} className="me-2" />
          Back to Dashboard
        </Button>
      </div>

      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Create Manual Time Entry</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
              {success && (
                <Alert variant="success">
                  Time entry created successfully! Redirecting...
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Employee *</Form.Label>
                      <Form.Select
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        required
                        disabled={loading || success}
                      >
                        <option value="">Select Employee</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.username} - {user.full_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Work Date *</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.workDate}
                        onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
                        required
                        disabled={loading || success}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Clock In Time *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={formData.clockInTime}
                        onChange={(e) => handleClockInChange(e.target.value)}
                        required
                        disabled={loading || success}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Clock Out Time</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={formData.clockOutTime}
                        onChange={(e) => setFormData({ ...formData, clockOutTime: e.target.value })}
                        disabled={loading || success}
                      />
                      <small className="text-muted">Leave empty for open time entry</small>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Enter any notes about this time entry..."
                    disabled={loading || success}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        id="approve-overtime"
                        checked={formData.approveOvertime}
                        onChange={(e) => setFormData({ ...formData, approveOvertime: e.target.checked })}
                        label="Pre-approve overtime (if applicable)"
                        disabled={loading || success}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Alert variant="info">
                  <Info size={18} className="me-2" />
                  <strong>Note:</strong> Manual entries are automatically approved by the system administrator.
                  Ensure accuracy before submitting as this will affect payroll calculations.
                </Alert>

                <div className="d-flex justify-content-between">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/time-attendance-admin')}
                    disabled={loading || success}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading || success}>
                    <Save size={18} className="me-2" />
                    {loading ? 'Creating...' : 'Create Entry'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
