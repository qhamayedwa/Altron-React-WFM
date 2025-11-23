import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { Edit, ArrowLeft, Save, Trash2, Info, AlertTriangle, BarChart3 } from 'lucide-react';
import api from '../api/client';

interface ShiftType {
  id: number;
  name: string;
  description?: string;
  code?: string;
  defaultStartTime: string;
  defaultEndTime: string;
  duration?: number;
  color?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function EditShiftType() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shiftType, setShiftType] = useState<ShiftType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultStartTime: '',
    defaultEndTime: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    activeSchedules: 0,
    totalSchedules: 0,
    lastUsed: '-'
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const response = await api.get(`/scheduling/shift-types/${id}`);
      const shiftTypeData = response.data.shiftType;
      
      setShiftType(shiftTypeData);
      setFormData({
        name: shiftTypeData.name || '',
        description: shiftTypeData.description || '',
        defaultStartTime: shiftTypeData.defaultStartTime || '',
        defaultEndTime: shiftTypeData.defaultEndTime || '',
        isActive: shiftTypeData.isActive !== false
      });

      loadStats();
      setLoading(false);
    } catch (err: any) {
      setError('Failed to load shift type: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get(`/scheduling/shift-type-stats/${id}`);
      if (response.data.success && response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const calculateDuration = () => {
    if (formData.defaultStartTime && formData.defaultEndTime) {
      const start = new Date(`2000-01-01 ${formData.defaultStartTime}`);
      let end = new Date(`2000-01-01 ${formData.defaultEndTime}`);
      
      if (end <= start) {
        end.setDate(end.getDate() + 1);
      }
      
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return hours.toFixed(1);
    }
    return '0.0';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put(`/scheduling/shift-types/${id}`, {
        name: formData.name,
        description: formData.description,
        defaultStartTime: formData.defaultStartTime,
        defaultEndTime: formData.defaultEndTime,
        isActive: formData.isActive
      });

      navigate('/shift-types');
    } catch (err: any) {
      setError('Failed to update shift type: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this shift type? This action cannot be undone.\n\nNote: This will only prevent new schedules from using this type. Existing schedules will not be affected.')) {
      return;
    }

    try {
      await api.delete(`/scheduling/shift-types/${id}`);
      navigate('/shift-types');
    } catch (err: any) {
      setError('Failed to delete shift type: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading && !shiftType) {
    return <div className="text-center py-5"><div className="spinner-border" /></div>;
  }

  if (!shiftType) {
    return <Alert variant="danger">Shift type not found</Alert>;
  }

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Edit size={28} className="me-2" />
          Edit Shift Type
        </h2>
        <Button variant="outline-secondary" onClick={() => navigate('/shift-types')}>
          <ArrowLeft size={18} className="me-2" />
          Back to Shift Types
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Shift Type Information</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Shift Name *</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      placeholder="e.g., Day, Evening, Night"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Brief description of the shift"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Default Start Time *</Form.Label>
                    <Form.Control
                      type="time"
                      required
                      value={formData.defaultStartTime}
                      onChange={(e) => setFormData({ ...formData, defaultStartTime: e.target.value })}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Default End Time *</Form.Label>
                    <Form.Control
                      type="time"
                      required
                      value={formData.defaultEndTime}
                      onChange={(e) => setFormData({ ...formData, defaultEndTime: e.target.value })}
                    />
                  </Col>
                </Row>

                {formData.defaultStartTime && formData.defaultEndTime && (
                  <Alert variant="secondary" className="mb-3">
                    <strong>Shift Duration:</strong> {calculateDuration()} hours
                  </Alert>
                )}

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active (uncheck to disable this shift type)"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                </Form.Group>

                <Alert variant="info">
                  <Info size={18} className="me-2" />
                  <strong>Note:</strong> Changes to default times will only affect new schedules created after this update. 
                  Existing schedules will retain their current times.
                </Alert>

                <Alert variant="warning">
                  <AlertTriangle size={18} className="me-2" />
                  <strong>Usage Information:</strong>
                  <div className="mt-2">
                    <small className="text-muted">
                      This shift type may be used in existing schedules. Disabling it will prevent new schedules 
                      from using this type but won't affect existing ones.
                    </small>
                  </div>
                </Alert>

                <div className="d-flex justify-content-between">
                  <div>
                    <Button variant="outline-secondary" onClick={() => navigate('/shift-types')}>
                      Cancel
                    </Button>
                    <Button variant="outline-danger" className="ms-2" onClick={handleDelete}>
                      <Trash2 size={18} className="me-2" />
                      Delete
                    </Button>
                  </div>
                  <Button type="submit" variant="primary" disabled={loading}>
                    <Save size={18} className="me-2" />
                    {loading ? 'Updating...' : 'Update Shift Type'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">
                <BarChart3 size={20} className="me-2" />
                Usage Statistics
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col md={4}>
                  <h3 className="text-primary">{stats.activeSchedules}</h3>
                  <p className="text-muted mb-0">Active Schedules</p>
                </Col>
                <Col md={4}>
                  <h3 className="text-success">{stats.totalSchedules}</h3>
                  <p className="text-muted mb-0">Total Schedules</p>
                </Col>
                <Col md={4}>
                  <h3 className="text-info">{stats.lastUsed}</h3>
                  <p className="text-muted mb-0">Last Used</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
