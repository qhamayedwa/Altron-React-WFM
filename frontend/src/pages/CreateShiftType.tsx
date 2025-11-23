import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { Plus, ArrowLeft, Save, Info } from 'lucide-react';
import api from '../api/client';

export default function CreateShiftType() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultStartTime: '09:00',
    defaultEndTime: '17:00'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/scheduling/shift-types', {
        name: formData.name,
        description: formData.description,
        defaultStartTime: formData.defaultStartTime,
        defaultEndTime: formData.defaultEndTime
      });

      navigate('/shift-types');
    } catch (err: any) {
      setError('Failed to create shift type: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
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

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Plus size={28} className="me-2" />
          Create Shift Type
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

                <Alert variant="info">
                  <Info size={18} className="me-2" />
                  <strong>Note:</strong> The default times will be used as templates when creating new schedules. 
                  Individual schedules can still have custom times.
                </Alert>

                <div className="d-flex justify-content-between">
                  <Button variant="outline-secondary" onClick={() => navigate('/shift-types')}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={loading}>
                    <Save size={18} className="me-2" />
                    {loading ? 'Creating...' : 'Create Shift Type'}
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
