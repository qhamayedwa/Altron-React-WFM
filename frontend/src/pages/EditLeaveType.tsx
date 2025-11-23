import { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert, ButtonGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Save, X, Eye, ArrowLeft, Info, Settings } from 'lucide-react';

export default function EditLeaveType() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_accrual_rate: '',
    max_consecutive_days: '',
    requires_approval: false,
    is_active: true,
    created_at: '',
    updated_at: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaveType();
  }, [id]);

  const loadLeaveType = async () => {
    try {
      const response = await fetch(`/api/v1/leave/types/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      } else {
        setError('Failed to load leave type');
      }
    } catch (err) {
      setError('An error occurred while loading leave type');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/v1/leave/types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate(`/leave-types/view/${id}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update leave type');
      }
    } catch (err) {
      setError('An error occurred while updating leave type');
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

  if (isLoading) {
    return <div className="py-5 text-center">Loading...</div>;
  }

  return (
    <div className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Edit size={28} className="me-2" />
          Edit Leave Type: {formData.name}
        </h2>
        <ButtonGroup>
          <Button
            variant="outline-secondary"
            onClick={() => navigate(`/leave-types/view/${id}`)}
          >
            <Eye size={18} className="me-2" />
            View Details
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/leave-types')}
          >
            <ArrowLeft size={18} className="me-2" />
            Back to Leave Types
          </Button>
        </ButtonGroup>
      </div>

      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <Settings size={20} className="me-2" />
                Leave Type Configuration
              </h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Leave Type Name</strong>
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      <Form.Text>
                        The display name for this leave type (e.g., Annual Leave, Sick Leave)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Description</strong>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Detailed description of this leave type policy"
                      />
                      <Form.Text>
                        Optional: Provide policy details, eligibility criteria, or usage guidelines
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Default Accrual Rate</strong>
                      </Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          name="default_accrual_rate"
                          value={formData.default_accrual_rate || ''}
                          onChange={handleChange}
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                        <span className="input-group-text">hours/year</span>
                      </div>
                      <Form.Text>
                        Annual hours employees automatically earn (leave blank for no accrual)
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Max Consecutive Days</strong>
                      </Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          name="max_consecutive_days"
                          value={formData.max_consecutive_days || ''}
                          onChange={handleChange}
                          min="1"
                          placeholder="No limit"
                        />
                        <span className="input-group-text">days</span>
                      </div>
                      <Form.Text>
                        Maximum continuous days allowed (leave blank for no limit)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        name="requires_approval"
                        id="requires_approval"
                        label={<strong>Requires Manager Approval</strong>}
                        checked={formData.requires_approval}
                        onChange={handleChange}
                      />
                      <Form.Text>
                        When enabled, applications need manager approval before being granted
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        name="is_active"
                        id="is_active"
                        label={<strong>Active Status</strong>}
                        checked={formData.is_active}
                        onChange={handleChange}
                      />
                      <Form.Text>
                        Only active leave types are available for new applications
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                <div className="d-flex justify-content-between">
                  <div>
                    <small className="text-muted">
                      <Info size={16} className="me-1" />
                      Created: {formData.created_at ? new Date(formData.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      {formData.updated_at && formData.updated_at !== formData.created_at && (
                        <> | Last Updated: {new Date(formData.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
                      )}
                    </small>
                  </div>
                  <div>
                    <Button
                      variant="outline-secondary"
                      className="me-2"
                      onClick={() => navigate(`/leave-types/view/${id}`)}
                    >
                      <X size={18} className="me-2" />
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      <Save size={18} className="me-2" />
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <h6 className="mb-0">
                <Info size={16} className="me-2" />
                Important Notes
              </h6>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-3">
                <strong>Accrual Rate:</strong> This sets the default for new employees. Individual employee rates can be customized in their leave balance settings.
              </Alert>
              
              <Alert variant="warning" className="mb-3">
                <strong>Deactivating Leave Types:</strong> Employees will not be able to apply for deactivated leave types. Existing applications and balances remain unaffected.
              </Alert>
              
              {formData.requires_approval && (
                <Alert variant="secondary" className="mb-0">
                  <strong>Approval Required:</strong> Applications for this leave type will be routed to the employee's manager for approval before being processed.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
