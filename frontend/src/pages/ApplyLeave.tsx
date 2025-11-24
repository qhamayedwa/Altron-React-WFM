import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Calendar, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface LeaveType {
  id: number;
  name: string;
  code: string;
  description: string;
}

interface LeaveBalance {
  leaveType: string;
  remainingDays: number;
}

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false
  });
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [typesRes, balancesRes] = await Promise.all([
        api.get('/leave/types'),
        api.get('/leave/balances')
      ]);
      setLeaveTypes(typesRes.data || []);
      setBalances(balancesRes.data.balances || []);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/leave/request', {
        leaveTypeId: parseInt(formData.leaveTypeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      });
      setSuccess('Leave request submitted successfully!');
      setTimeout(() => {
        navigate('/my-leave');
      }, 1500);
    } catch (err: any) {
      console.error('Error submitting leave request:', err);
      setError(err.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-4">
      <div className="mb-4">
        <h2>
          <Calendar size={28} className="me-2" />
          Apply for Leave
        </h2>
        <p className="text-muted">Submit a new leave request for approval</p>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Leave Request Form</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading...</p>
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Leave Type *</Form.Label>
                    <Form.Select
                      value={formData.leaveTypeId}
                      onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                      required
                      disabled={submitting}
                    >
                      <option value="">Select leave type...</option>
                      {leaveTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Start Date *</Form.Label>
                        <Form.Control
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                          disabled={submitting}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>End Date *</Form.Label>
                        <Form.Control
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          required
                          disabled={submitting}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Half Day Leave"
                      checked={formData.halfDay}
                      onChange={(e) => setFormData({ ...formData, halfDay: e.target.checked })}
                      disabled={submitting}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Reason *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Provide a reason for your leave request..."
                      required
                      disabled={submitting}
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button variant="primary" type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Spinner size="sm" animation="border" className="me-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={18} className="me-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                    <Button variant="outline-secondary" onClick={() => navigate('/my-leave')} disabled={submitting}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Leave Balance</h6>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner size="sm" animation="border" variant="primary" />
                </div>
              ) : balances.length > 0 ? (
                <div className="mb-3">
                  {balances.map((balance, index) => (
                    <div key={index} className="d-flex justify-content-between mb-2">
                      <strong>{balance.leaveType}</strong>
                      <span>{balance.remainingDays} days</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No leave balances available</p>
              )}
            </Card.Body>
          </Card>

          <Alert variant="info">
            <strong>Note:</strong> Leave requests require manager approval. You will be notified once your request is reviewed.
          </Alert>
        </Col>
      </Row>
    </div>
  );
}
