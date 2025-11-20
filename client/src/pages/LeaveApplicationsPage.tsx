import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';

interface LeaveApplication {
  id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string | null;
  status: string;
  approver_notes: string | null;
  created_at: string;
  leave_types: {
    id: number;
    name: string;
  };
}

interface LeaveType {
  id: number;
  name: string;
  max_consecutive_days: number | null;
}

export default function LeaveApplicationsPage() {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    fetchApplications();
    fetchLeaveTypes();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/leave/applications', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leave applications');
      }

      const data = await response.json();
      setApplications(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch('/api/leave/leave-types', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leave types');
      }

      const data = await response.json();
      setLeaveTypes(data.data || []);
    } catch (err) {
      console.error('Error fetching leave types:', err);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leave_type_id || !formData.start_date || !formData.end_date) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date must be on or after start date');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/leave/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          leave_type_id: parseInt(formData.leave_type_id),
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit leave application');
      }

      setSuccess('Leave application submitted successfully!');
      setShowCreateModal(false);
      setFormData({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
      });
      fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelApplication = async (applicationId: number) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(`/api/leave/applications/${applicationId}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel leave application');
      }

      setSuccess('Leave application cancelled successfully!');
      fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      cancelled: 'secondary',
    };

    return (
      <Badge bg={statusMap[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
            <h2>My Leave Applications</h2>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Request Leave
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
              {applications.length === 0 ? (
                <p className="text-muted">No leave applications found.</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Applied Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td>{app.leave_types.name}</td>
                        <td>{new Date(app.start_date).toLocaleDateString()}</td>
                        <td>{new Date(app.end_date).toLocaleDateString()}</td>
                        <td>{app.days_requested}</td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td>{new Date(app.created_at).toLocaleDateString()}</td>
                        <td>
                          {app.status === 'pending' && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleCancelApplication(app.id)}
                            >
                              Cancel
                            </Button>
                          )}
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

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitApplication}>
            <Form.Group className="mb-3">
              <Form.Label>Leave Type *</Form.Label>
              <Form.Select
                value={formData.leave_type_id}
                onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
                required
              >
                <option value="">Select leave type...</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date *</Form.Label>
              <Form.Control
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date *</Form.Label>
              <Form.Control
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reason (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Please provide a reason for your leave request..."
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
