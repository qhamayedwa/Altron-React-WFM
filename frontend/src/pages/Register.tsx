import { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { UserPlus, ArrowLeft, Briefcase, Shield, Info, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    employeeId: 'AUTO-' + Date.now(),
    departmentId: '',
    jobId: '',
    position: '',
    roles: [] as string[],
    isActive: true
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableRoles = [
    { id: 1, name: 'Employee', description: 'Basic employee access (recommended for regular employees)' },
    { id: 2, name: 'Manager', description: 'Team management and approval permissions' },
    { id: 3, name: 'Admin', description: 'System administration access' },
    { id: 4, name: 'HR', description: 'Human resources management' },
    { id: 5, name: 'Super User', description: 'Complete system control' }
  ];

  const handleRoleToggle = (roleName: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter(r => r !== roleName)
        : [...prev.roles, roleName]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.roles.length === 0) {
      setError('Please select at least one role');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        employeeId: formData.employeeId,
        departmentId: formData.departmentId || null,
        jobId: formData.jobId || null,
        position: formData.position,
        roles: formData.roles,
        isActive: formData.isActive
      });

      setSuccess(true);
      setTimeout(() => navigate('/user-management'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">
                <UserPlus size={20} className="me-2" />
                Register New User
              </h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert variant="success">
                  User registered successfully! Redirecting...
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                        disabled={loading || success}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={loading || success}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        disabled={loading || success}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        disabled={loading || success}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password *</Form.Label>
                      <Form.Control
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        disabled={loading || success}
                        minLength={6}
                      />
                      <Form.Text className="text-muted">
                        Minimum 6 characters
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password *</Form.Label>
                      <Form.Control
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        disabled={loading || success}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Employee Information Section */}
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">
                      <Briefcase size={16} className="me-2" />
                      Employee Information
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Employee ID *</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.employeeId}
                            className="bg-light"
                            readOnly
                            disabled
                          />
                          <small className="text-success">
                            <CheckCircle size={14} className="me-1" />
                            Automatically generated unique ID
                          </small>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Department</Form.Label>
                          <Form.Select
                            value={formData.departmentId}
                            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                            disabled={loading || success}
                          >
                            <option value="">Select Department</option>
                            <option value="1">Administration</option>
                          </Form.Select>
                          <small className="text-muted">Select the employee's department</small>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Job/Position</Form.Label>
                          <Form.Select
                            value={formData.jobId}
                            onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                            disabled={loading || success}
                          >
                            <option value="">Select Job Position</option>
                          </Form.Select>
                          <small className="text-muted">Select the employee's job position</small>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Position/Job Title</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            placeholder="Custom position title (optional)"
                            disabled={loading || success}
                          />
                          <small className="text-muted">Override job title if needed</small>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Role Assignment Section */}
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">
                      <Shield size={16} className="me-2" />
                      Role Assignment
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {availableRoles.map((role) => (
                        <Col md={6} key={role.id} className="mb-2">
                          <Form.Check
                            type="checkbox"
                            id={`role-${role.id}`}
                            checked={formData.roles.includes(role.name)}
                            onChange={() => handleRoleToggle(role.name)}
                            disabled={loading || success}
                            label={
                              <>
                                <strong>{role.name}</strong>
                                <small className="text-muted d-block">{role.description}</small>
                              </>
                            }
                          />
                        </Col>
                      ))}
                    </Row>
                    <Alert variant="info" className="mt-3 mb-0">
                      <small>
                        <Info size={14} className="me-1" />
                        <strong>Tip:</strong> For regular employees, select only "Employee" role for restricted access to personal information only.
                      </small>
                    </Alert>
                  </Card.Body>
                </Card>

                {/* Account Status */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="is-active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    disabled={loading || success}
                    label={
                      <>
                        Active User Account
                        <small className="text-muted d-block">Uncheck to create inactive account</small>
                      </>
                    }
                  />
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/user-management')}
                    disabled={loading || success}
                  >
                    <ArrowLeft size={16} className="me-2" />
                    Back to Users
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading || success}>
                    {loading ? 'Registering...' : 'Register'}
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
