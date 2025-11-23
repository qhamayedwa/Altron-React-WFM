import { useState } from 'react';
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, ArrowLeft } from 'lucide-react';

export default function CreateLeaveType() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_accrual_rate: '',
    max_consecutive_days: '',
    requires_approval: true
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/leave/types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/leave-types');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create leave type');
      }
    } catch (err) {
      setError('An error occurred while creating leave type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card>
            <Card.Header>
              <h4 className="mb-0">
                <Plus size={20} className="me-2" />
                Create New Leave Type
              </h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Leave Type Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Annual Leave, Sick Leave"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Annual Accrual Rate (Hours)</Form.Label>
                      <Form.Control
                        type="number"
                        name="default_accrual_rate"
                        value={formData.default_accrual_rate}
                        onChange={handleChange}
                        step="0.5"
                        min="0"
                        placeholder="e.g., 160 for 20 days annual leave"
                      />
                      <Form.Text className="text-muted">
                        Total hours employees earn per year for this leave type
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Max Consecutive Days</Form.Label>
                      <Form.Control
                        type="number"
                        name="max_consecutive_days"
                        value={formData.max_consecutive_days}
                        onChange={handleChange}
                        min="1"
                        placeholder="e.g., 14 for maximum 2 weeks"
                      />
                      <Form.Text className="text-muted">
                        Maximum number of consecutive days allowed (leave blank for no limit)
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Brief description of this leave type"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="requires_approval"
                        id="requires_approval"
                        label="Requires Manager Approval"
                        checked={formData.requires_approval}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Whether applications for this leave type need manager approval
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-between mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/leave-types')}
                  >
                    <ArrowLeft size={18} className="me-2" />
                    Back to Leave Types
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <Save size={18} className="me-2" />
                    {isSubmitting ? 'Creating...' : 'Create Leave Type'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <h6 className="mb-0">Common Leave Type Examples</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Annual Leave</h6>
                  <ul className="small text-muted">
                    <li>Accrual Rate: 160 hours/year (20 days)</li>
                    <li>Requires Approval: Yes</li>
                    <li>Max Consecutive: 14 days</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Sick Leave</h6>
                  <ul className="small text-muted">
                    <li>Accrual Rate: 80 hours/year (10 days)</li>
                    <li>Requires Approval: No</li>
                    <li>Max Consecutive: 5 days</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
