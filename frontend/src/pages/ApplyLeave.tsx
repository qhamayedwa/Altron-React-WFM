import { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Calendar, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting leave request:', formData);
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

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Leave Request Form</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Leave Type *</Form.Label>
                  <Form.Select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    required
                  >
                    <option value="">Select leave type...</option>
                    <option value="annual">Annual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="family">Family Responsibility</option>
                    <option value="unpaid">Unpaid Leave</option>
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
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit">
                    <Send size={18} className="me-2" />
                    Submit Request
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate('/my-leave')}>
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Leave Balance</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <strong>Annual Leave</strong>
                  <span>12 days</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <strong>Sick Leave</strong>
                  <span>8 days</span>
                </div>
              </div>
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
