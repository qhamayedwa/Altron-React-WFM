import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';

const CreateOrganization = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    admin_email: '',
    phone: '',
    domain: '',
    address: '',
    subscription_plan: 'basic',
    max_users: '50',
    is_active: true,
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating organization:', formData);
    navigate('/tenant/organizations');
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Create New Organization</h1>
            <Button variant="outline-secondary" onClick={() => navigate('/tenant/organizations')}>
              <ArrowLeft size={16} className="me-1" /> Back to Organizations
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Organization Details</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Organization Name</Form.Label>
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
                      <Form.Label>Subdomain</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="text"
                          value={formData.subdomain}
                          onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                          required
                        />
                        <span className="input-group-text">.wfm.app</span>
                      </div>
                      <small className="text-muted">Used for organization-specific access</small>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Admin Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.admin_email}
                        onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Custom Domain</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  />
                  <small className="text-muted">Optional: Custom domain for this organization</small>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Subscription Plan</Form.Label>
                      <Form.Select
                        value={formData.subscription_plan}
                        onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                      >
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Max Users</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.max_users}
                        onChange={(e) => setFormData({ ...formData, max_users: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Check
                        type="checkbox"
                        id="is_active"
                        label="Active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Timezone</Form.Label>
                      <Form.Select
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      >
                        <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Currency</Form.Label>
                      <Form.Select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      >
                        <option value="ZAR">ZAR (South African Rand)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="GBP">GBP (British Pound)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={() => navigate('/tenant/organizations')}>
                    <X size={16} className="me-1" /> Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Create Organization
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Organization Setup</h5>
            </Card.Header>
            <Card.Body>
              <h6>What happens next?</h6>
              <ol className="text-muted">
                <li>Organization will be created with default settings</li>
                <li>You can then create a tenant admin for this organization</li>
                <li>The tenant admin can manage users within their organization</li>
                <li>All data will be completely isolated per organization</li>
              </ol>

              <h6 className="mt-4">Data Isolation</h6>
              <p className="text-muted small">Each organization has completely separate:</p>
              <ul className="text-muted small">
                <li>Users and authentication</li>
                <li>Time tracking records</li>
                <li>Schedules and shifts</li>
                <li>Leave applications</li>
                <li>Payroll data</li>
                <li>Custom settings and branding</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateOrganization;
