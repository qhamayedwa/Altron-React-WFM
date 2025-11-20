import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { api } from '../lib/api';

interface ShiftType {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  description: string | null;
  color_code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ShiftTypesPage: React.FC = () => {
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingShiftType, setEditingShiftType] = useState<ShiftType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    description: '',
    color_code: '#0d6efd',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchShiftTypes();
  }, []);

  const fetchShiftTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/scheduling/shift-types');
      setShiftTypes(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch shift types');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (shiftType?: ShiftType) => {
    if (shiftType) {
      setEditingShiftType(shiftType);
      setFormData({
        name: shiftType.name,
        start_time: shiftType.start_time,
        end_time: shiftType.end_time,
        description: shiftType.description || '',
        color_code: shiftType.color_code || '#0d6efd',
        is_active: shiftType.is_active,
      });
    } else {
      setEditingShiftType(null);
      setFormData({
        name: '',
        start_time: '',
        end_time: '',
        description: '',
        color_code: '#0d6efd',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingShiftType(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingShiftType) {
        await api.patch(`/scheduling/shift-types/${editingShiftType.id}`, formData);
        setSuccess('Shift type updated successfully');
      } else {
        await api.post('/scheduling/shift-types', formData);
        setSuccess('Shift type created successfully');
      }
      
      await fetchShiftTypes();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save shift type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this shift type?')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await api.delete(`/scheduling/shift-types/${id}`);
      setSuccess('Shift type deleted successfully');
      await fetchShiftTypes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete shift type');
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Shift Types</h2>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              + Create Shift Type
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
              ) : shiftTypes.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No shift types found. Create your first shift type to get started.
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Description</th>
                      <th>Color</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftTypes.map((shiftType) => (
                      <tr key={shiftType.id}>
                        <td><strong>{shiftType.name}</strong></td>
                        <td>{shiftType.start_time}</td>
                        <td>{shiftType.end_time}</td>
                        <td>{shiftType.description || '-'}</td>
                        <td>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              backgroundColor: shiftType.color_code || '#0d6efd',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                            }}
                            title={shiftType.color_code || '#0d6efd'}
                          />
                        </td>
                        <td>
                          <span className={`badge ${shiftType.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {shiftType.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleOpenModal(shiftType)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(shiftType.id)}
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
          <Modal.Title>{editingShiftType ? 'Edit Shift Type' : 'Create Shift Type'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Morning Shift, Night Shift"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time (HH:MM) *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                    placeholder="08:00"
                    pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                  />
                  <Form.Text className="text-muted">
                    24-hour format (e.g., 08:00, 14:30)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Time (HH:MM) *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                    placeholder="17:00"
                    pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                  />
                  <Form.Text className="text-muted">
                    24-hour format (e.g., 17:00, 23:30)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description of this shift type"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color Code</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="color"
                  value={formData.color_code}
                  onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                  style={{ width: '60px', height: '40px', marginRight: '10px' }}
                />
                <Form.Control
                  type="text"
                  value={formData.color_code}
                  onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                  placeholder="#0d6efd"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingShiftType ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ShiftTypesPage;
