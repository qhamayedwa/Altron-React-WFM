import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';

interface LeaveApplication {
  id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string | null;
  status: string;
  created_at: string;
  users_leave_applications_user_idTousers: {
    id: number;
    username: string;
    first_name: string | null;
    last_name: string | null;
  };
  leave_types: {
    id: number;
    name: string;
  };
}

export default function LeaveApprovalsPage() {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeamApplications();
  }, []);

  const fetchTeamApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/leave/team-applications?status=pending', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team leave applications');
      }

      const data = await response.json();
      setApplications(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (applicationId: number) => {
    setSelectedApplicationId(applicationId);
    setActionType('approve');
    setNotes('');
    setShowNotesModal(true);
  };

  const handleRejectClick = (applicationId: number) => {
    setSelectedApplicationId(applicationId);
    setActionType('reject');
    setNotes('');
    setShowNotesModal(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedApplicationId || !actionType) return;

    try {
      setSubmitting(true);
      setError(null);

      const endpoint = actionType === 'approve' 
        ? '/api/leave/applications/approve'
        : '/api/leave/applications/reject';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          application_id: selectedApplicationId,
          notes: notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${actionType} leave application`);
      }

      setSuccess(`Leave application ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`);
      setShowNotesModal(false);
      setSelectedApplicationId(null);
      setActionType(null);
      setNotes('');
      fetchTeamApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const getUserDisplayName = (app: LeaveApplication) => {
    const userData = app.users_leave_applications_user_idTousers;
    if (userData.first_name && userData.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    return userData.username;
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
          <h2 className="mb-4">Leave Approvals</h2>

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
            <Card.Header>
              <h5 className="mb-0">Pending Leave Applications ({applications.length})</h5>
            </Card.Header>
            <Card.Body>
              {applications.length === 0 ? (
                <p className="text-muted">No pending leave applications requiring approval.</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Applied Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <strong>{getUserDisplayName(app)}</strong>
                          <br />
                          <small className="text-muted">{app.users_leave_applications_user_idTousers.username}</small>
                        </td>
                        <td>{app.leave_types.name}</td>
                        <td>{new Date(app.start_date).toLocaleDateString()}</td>
                        <td>{new Date(app.end_date).toLocaleDateString()}</td>
                        <td>{app.days_requested}</td>
                        <td>
                          {app.reason ? (
                            <span>{app.reason.substring(0, 50)}{app.reason.length > 50 ? '...' : ''}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>{new Date(app.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApproveClick(app.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRejectClick(app.id)}
                            >
                              Reject
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

      <Modal show={showNotesModal} onHide={() => setShowNotesModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Application
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or comments..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotesModal(false)}>
            Cancel
          </Button>
          <Button
            variant={actionType === 'approve' ? 'success' : 'danger'}
            onClick={handleSubmitAction}
            disabled={submitting}
          >
            {submitting ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
