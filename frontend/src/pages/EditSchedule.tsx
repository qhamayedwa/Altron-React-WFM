import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { Edit, ArrowLeft, Save, Trash2, Info, AlertTriangle, Clock } from 'lucide-react';
import api from '../api/client';

interface Employee {
  id: number;
  username: string;
  fullName?: string;
  email: string;
}

interface ShiftType {
  id: number;
  name: string;
  defaultStartTime: string;
  defaultEndTime: string;
}

interface Schedule {
  id: number;
  userId: number;
  shiftTypeId?: number;
  shiftTypeName?: string;
  startTime: string;
  endTime: string;
  notes?: string;
  isActive: boolean;
  employee: {
    firstName?: string;
    lastName?: string;
    username: string;
    email: string;
    fullName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function EditSchedule() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [formData, setFormData] = useState({
    userId: '',
    shiftTypeId: '',
    startDateTime: '',
    endDateTime: '',
    notes: '',
    isActive: true
  });
  const [duration, setDuration] = useState('0.0');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (formData.startDateTime && formData.endDateTime) {
      calculateDuration();
    }
  }, [formData.startDateTime, formData.endDateTime]);

  const loadData = async () => {
    try {
      const [scheduleRes, employeesRes, shiftTypesRes] = await Promise.all([
        api.get(`/scheduling/${id}`),
        api.get('/users'),
        api.get('/scheduling/shift-types')
      ]);

      const schedData = scheduleRes.data.schedule;
      setSchedule(schedData);
      setEmployees(employeesRes.data.users || []);
      setShiftTypes(shiftTypesRes.data.shiftTypes || []);

      setFormData({
        userId: schedData.userId.toString(),
        shiftTypeId: schedData.shiftTypeId?.toString() || '',
        startDateTime: schedData.startTime ? new Date(schedData.startTime).toISOString().slice(0, 16) : '',
        endDateTime: schedData.endTime ? new Date(schedData.endTime).toISOString().slice(0, 16) : '',
        notes: schedData.notes || '',
        isActive: schedData.isActive !== false
      });

      setLoading(false);
    } catch (err: any) {
      setError('Failed to load schedule: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);
    
    if (end > start) {
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      setDuration(hours.toFixed(1));
      setDayOfWeek(start.toLocaleDateString('en-US', { weekday: 'long' }));
    } else {
      setDuration('Invalid');
    }
  };

  const handleShiftTypeChange = (shiftTypeId: string) => {
    setFormData(prev => ({ ...prev, shiftTypeId }));
    
    if (shiftTypeId && formData.startDateTime) {
      const shiftType = shiftTypes.find(st => st.id === parseInt(shiftTypeId));
      if (shiftType) {
        const currentDate = formData.startDateTime.split('T')[0];
        setFormData(prev => ({
          ...prev,
          startDateTime: `${currentDate}T${shiftType.defaultStartTime}`,
          endDateTime: `${currentDate}T${shiftType.defaultEndTime}`
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const date = formData.startDateTime.split('T')[0];
      const startTime = formData.startDateTime.split('T')[1];
      const endTime = formData.endDateTime.split('T')[1];

      await api.put(`/scheduling/${id}`, {
        date,
        startTime: `${date} ${startTime}`,
        endTime: `${date} ${endTime}`,
        notes: formData.notes,
        status: formData.isActive ? 'scheduled' : 'cancelled'
      });

      navigate('/manage-schedules');
    } catch (err: any) {
      setError('Failed to update schedule: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this schedule? This action cannot be undone.\n\nThe employee will be notified of this schedule cancellation.')) {
      return;
    }

    try {
      await api.delete(`/scheduling/${id}`);
      navigate('/manage-schedules');
    } catch (err: any) {
      setError('Failed to delete schedule: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" /></div>;
  }

  if (!schedule) {
    return <Alert variant="danger">Schedule not found</Alert>;
  }

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Edit size={28} className="me-2" />
          Edit Employee Schedule
        </h2>
        <Button variant="outline-secondary" onClick={() => navigate('/manage-schedules')}>
          <ArrowLeft size={18} className="me-2" />
          Back to Schedules
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Schedule Details</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Employee *</Form.Label>
                    <Form.Select
                      required
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.username} - {emp.fullName || emp.email}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Shift Type</Form.Label>
                    <Form.Select
                      value={formData.shiftTypeId}
                      onChange={(e) => handleShiftTypeChange(e.target.value)}
                    >
                      <option value="">Custom Schedule</option>
                      {shiftTypes.map(st => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.defaultStartTime} - {st.defaultEndTime})
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Start Date & Time *</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      required
                      value={formData.startDateTime}
                      onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>End Date & Time *</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      required
                      value={formData.endDateTime}
                      onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                    />
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Any special instructions or notes for this schedule..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active Schedule (uncheck to disable)"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                </Form.Group>

                {schedule.createdAt && (
                  <Alert variant="warning">
                    <AlertTriangle size={18} className="me-2" />
                    <strong>Schedule Information:</strong>
                    <div className="mt-2">
                      <small className="text-muted">
                        Created: {new Date(schedule.createdAt).toLocaleString()}<br />
                        {schedule.updatedAt && `Last Modified: ${new Date(schedule.updatedAt).toLocaleString()}`}
                      </small>
                    </div>
                  </Alert>
                )}

                <Alert variant="info">
                  <Info size={18} className="me-2" />
                  <strong>Note:</strong> Changes to this schedule will check for conflicts with other existing schedules.
                  The employee will be notified of any schedule changes.
                </Alert>

                <div className="d-flex justify-content-between">
                  <div>
                    <Button variant="outline-secondary" onClick={() => navigate('/manage-schedules')}>
                      Cancel
                    </Button>
                    <Button variant="outline-danger" className="ms-2" onClick={handleDelete}>
                      <Trash2 size={18} className="me-2" />
                      Delete Schedule
                    </Button>
                  </div>
                  <Button type="submit" variant="primary" disabled={loading}>
                    <Save size={18} className="me-2" />
                    Update Schedule
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">
                <Clock size={20} className="me-2" />
                Schedule Analysis
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col md={3}>
                  <h4 className="text-primary">{duration}h</h4>
                  <p className="text-muted mb-0">Duration</p>
                </Col>
                <Col md={3}>
                  <h4 className="text-success">0</h4>
                  <p className="text-muted mb-0">Conflicts</p>
                </Col>
                <Col md={3}>
                  <h4 className="text-info">{dayOfWeek || '-'}</h4>
                  <p className="text-muted mb-0">Day of Week</p>
                </Col>
                <Col md={3}>
                  <h4 className="text-warning">{formData.isActive ? 'Active' : 'Inactive'}</h4>
                  <p className="text-muted mb-0">Status</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
