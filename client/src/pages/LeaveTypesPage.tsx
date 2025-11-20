import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';

interface LeaveType {
  id: number;
  name: string;
  description: string | null;
  default_accrual_rate: number;
  requires_approval: boolean;
  max_consecutive_days: number | null;
  is_active: boolean;
  created_at: string;
  applications_count?: number;
  total_days_used?: number;
}

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_accrual_rate: '',
    requires_approval: true,
    max_consecutive_days: '',
    is_active: true,
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/leave/leave-types?include_stats=true', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leave types');
      }

      const data = await response.json();
      setLeaveTypes(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      default_accrual_rate: '',
      requires_approval: true,
      max_consecutive_days: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEditClick = (leaveType: LeaveType) => {
    setEditingType(leaveType);
    setFormData({
      name: leaveType.name,
      description: leaveType.description || '',
      default_accrual_rate: leaveType.default_accrual_rate.toString(),
      requires_approval: leaveType.requires_approval,
      max_consecutive_days: leaveType.max_consecutive_days?.toString() || '',
      is_active: leaveType.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.default_accrual_rate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        name: formData.name,
        description: formData.description || null,
        default_accrual_rate: parseFloat(formData.default_accrual_rate),
        requires_approval: formData.requires_approval,
        max_consecutive_days: formData.max_consecutive_days ? parseInt(formData.max_consecutive_days) : null,
        is_active: formData.is_active,
      };

      const url = editingType 
        ? `/api/leave/leave-types/${editingType.id}`
        : '/api/leave/leave-types';
      
      const method = editingType ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editingType ? 'update' : 'create'} leave type`);
      }

      setSuccess(`Leave type ${editingType ? 'updated' : 'created'} successfully!`);
      setShowModal(false);
      fetchLeaveTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (leaveType: LeaveType) => {
    try {
      setError(null);

      const response = await fetch(`/api/leave/leave-types/${leaveType.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...leaveType,
          is_active: !leaveType.is_active,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update leave type');
      }

      setSuccess(`Leave type ${!leaveType.is_active ? 'activated' : 'deactivated'} successfully!`);
      fetchLeaveTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Leave Types Management</h2>
            <Button variant="primary" onClick={handleCreateClick}>
              Create Leave Type
            </Button>
          </div>

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

          <Card>
            <Card.Body>
              {leaveTypes.length === 0 ? (
                <p className="text-muted">No leave types found.</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Accrual Rate</th>
                      <th>Max Consecutive Days</th>
                      <th>Requires Approval</th>
                      <th>Status</th>
                      <th>Usage Stats</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveTypes.map((type) => (
                      <tr key={type.id}>
                        <td><strong>{type.name}</strong></td>
                        <td>
                          {type.description ? (
                            <span>{type.description.substring(0, 50)}{type.description.length > 50 ? '...' : ''}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>{type.default_accrual_rate} days/year</td>
                        <td>
                          {type.max_consecutive_days !== null ? (
                            <span>{type.max_consecutive_days} days</span>
                          ) : (
                            <span className="text-muted">No limit</span>
                          )}
                        </td>
                        <td>
                          {type.requires_approval ? (
                            <Badge bg="warning">Yes</Badge>
                          ) : (
                            <Badge bg="success">No</Badge>
                          )}
                        </td>
                        <td>
                          {type.is_active ? (
                            <Badge bg="success">Active</Badge>
                          ) : (
                            <Badge bg="secondary">Inactive</Badge>
                          )}
                        </td>
                        <td>
                          {type.applications_count !== undefined && type.total_days_used !== undefined ? (
                            <span>
                              {type.applications_count} applications<br />
                              <small className="text-muted">{type.total_days_used.toFixed(1)} days used</small>
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditClick(type)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant={type.is_active ? 'outline-warning' : 'outline-success'}
                              size="sm"
                              onClick={() => handleToggleActive(type)}
                            >
                              {type.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingType ? 'Edit' : 'Create'} Leave Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Accrual Rate (days/year) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formData.default_accrual_rate}
                    onChange={(e) => setFormData({ ...formData, default_accrual_rate: e.target.value })}
                    required
                  />
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
                placeholder="Brief description of this leave type..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Consecutive Days</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.max_consecutive_days}
                    onChange={(e) => setFormData({ ...formData, max_consecutive_days: e.target.value })}
                    placeholder="Leave blank for no limit"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Requires Approval"
                    checked={formData.requires_approval}
                    onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingType ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
