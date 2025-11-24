import { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Edit, User as UserIcon, Phone, MapPin, AlertCircle, Briefcase, Award, Activity, Key, Trash2 } from 'lucide-react';
import api from '../api/client';

export default function UserEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // Basic Information
    username: '',
    email: '',
    
    // Personal Details
    first_name: '',
    last_name: '',
    
    // Contact Information
    phone: '',
    mobile: '',
    
    // Address Information
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    
    // Employment Information
    employee_number: '',
    department_id: '',
    position: '',
    employment_type: '',
    hire_date: '',
    manager_id: '',
    pay_code: '',
    hourly_rate: '',
    
    // Professional Information
    education_level: '',
    skills: '',
    notes: '',
    
    // Roles and Status
    roles: [] as string[],
    is_active: true,
    
    // Activity
    created_at: '',
    last_login: '',
  });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/auth/users/${id}`);
      const user = response.data;
      
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        mobile: user.mobile || '',
        address_line1: user.address_line1 || '',
        address_line2: user.address_line2 || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
        emergency_contact_relationship: user.emergency_contact_relationship || '',
        employee_number: user.employee_number || '',
        department_id: user.department_id || '',
        position: user.position || '',
        employment_type: user.employment_type || '',
        hire_date: user.hire_date || '',
        manager_id: user.manager_id || '',
        pay_code: user.pay_code || '',
        hourly_rate: user.hourly_rate || '',
        education_level: user.education_level || '',
        skills: user.skills || '',
        notes: user.notes || '',
        roles: user.roles || [],
        is_active: user.is_active !== false,
        created_at: user.created_at || '',
        last_login: user.last_login || '',
      });
    } catch (err: any) {
      console.error('Failed to load user:', err);
      setError(err.response?.data?.error || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await api.put(`/auth/users/${id}`, {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        mobile: formData.mobile,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        postal_code: formData.postal_code,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        employee_number: formData.employee_number,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        position: formData.position,
        employment_type: formData.employment_type,
        hire_date: formData.hire_date,
        manager_id: formData.manager_id ? parseInt(formData.manager_id) : null,
        pay_code: formData.pay_code,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        education_level: formData.education_level,
        skills: formData.skills,
        notes: formData.notes,
        is_active: formData.is_active,
        roles: formData.roles
      });

      setSuccess('User updated successfully!');
      setTimeout(() => navigate('/user-management'), 2000);
    } catch (err: any) {
      console.error('Failed to update user:', err);
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete user "${formData.username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/auth/users/${id}`);
      alert('User deleted successfully');
      navigate('/user-management');
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card>
            <Card.Header>
              <h4 className="mb-0" style={{ color: '#28468D' }}>
                <Edit size={20} className="me-2" />
                Edit User Details
              </h4>
            </Card.Header>
            <Card.Body>
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

              <Form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h6 className="text-muted mb-3">Basic Information</h6>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.username}
                      disabled
                      readOnly
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </Col>
                </Row>

                {/* Personal Details */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h6 className="text-muted mb-3">
                      <UserIcon size={16} className="me-2" />
                      Personal Details
                    </h6>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </Col>
                </Row>

                {/* Contact Information */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h6 className="text-muted mb-3">
                      <Phone size={16} className="me-2" />
                      Contact Information
                    </h6>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Mobile</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />
                  </Col>
                </Row>

                {/* Address Information */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h6 className="text-muted mb-3">
                      <MapPin size={16} className="me-2" />
                      Address Information
                    </h6>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Address Line 1</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.address_line1}
                      onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Address Line 2</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.address_line2}
                      onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    />
                  </Col>
                </Row>

                {/* Emergency Contact */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h6 className="text-muted mb-3">
                      <AlertCircle size={16} className="me-2" />
                      Emergency Contact
                    </h6>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Emergency Contact Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Emergency Contact Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Relationship</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.emergency_contact_relationship}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                    />
                  </Col>
                </Row>

                {/* Employment Information */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h6 className="text-muted mb-3">
                      <Briefcase size={16} className="me-2" />
                      Employment Information
                    </h6>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Employee ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.employee_number}
                      onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })}
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Select
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    >
                      <option value="">Select Department</option>
                    </Form.Select>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Position</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Employment Type</Form.Label>
                    <Form.Select
                      value={formData.employment_type}
                      onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    >
                      <option value="">Select Type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                    </Form.Select>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Hire Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Manager ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.manager_id}
                      onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                    />
                  </Col>
                  <Col md={3} className="mb-3">
                    <Form.Label>Pay Code</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.pay_code}
                      onChange={(e) => setFormData({ ...formData, pay_code: e.target.value })}
                      placeholder="e.g. EMP001"
                    />
                    <Form.Text className="text-muted">Payroll system identifier</Form.Text>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Form.Label>Hourly Rate</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>R</InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                      />
                      <InputGroup.Text>/hour</InputGroup.Text>
                    </InputGroup>
                  </Col>
                </Row>

                {/* Professional Information */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h6 className="text-muted mb-3">
                      <Award size={16} className="me-2" />
                      Professional Information
                    </h6>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Education Level</Form.Label>
                    <Form.Select
                      value={formData.education_level}
                      onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                    >
                      <option value="">Select Education Level</option>
                      <option value="High School">High School</option>
                      <option value="Associate Degree">Associate Degree</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="Doctorate">Doctorate</option>
                    </Form.Select>
                  </Col>
                  <Col md={12} className="mb-3">
                    <Form.Label>Skills</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="List skills, certifications, and qualifications..."
                    />
                  </Col>
                  <Col md={12} className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about the employee..."
                    />
                  </Col>
                </Row>

                {/* Roles and Status */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h6 className="text-muted mb-3">Roles and Status</h6>
                  </Col>
                  <Col md={8} className="mb-3">
                    <Form.Label>Roles</Form.Label>
                    <div className="d-flex flex-wrap gap-3">
                      {['Super User', 'Admin', 'Manager', 'Employee', 'HR', 'Payroll'].map(role => (
                        <Form.Check
                          key={role}
                          type="checkbox"
                          label={role}
                          checked={formData.roles.includes(role)}
                          onChange={() => handleRoleToggle(role)}
                          inline
                        />
                      ))}
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Account Status</Form.Label>
                    <Form.Check
                      type="checkbox"
                      label="Active Account"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  </Col>
                </Row>

                {/* Action Buttons */}
                <Row>
                  <Col xs={12}>
                    <div className="d-flex justify-content-between">
                      <Button variant="secondary" onClick={() => navigate('/user-management')}>
                        <ArrowLeft size={18} className="me-2" />
                        Back to User Management
                      </Button>
                      
                      <div className="btn-group">
                        <Button type="submit" variant="primary" disabled={saving}>
                          {saving ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save size={18} className="me-2" />
                              Update User
                            </>
                          )}
                        </Button>
                        
                        <Button variant="outline-danger" onClick={handleDelete} disabled={saving}>
                          <Trash2 size={18} className="me-2" />
                          Delete User
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* User Activity Summary */}
          <Card className="mt-4">
            <Card.Header>
              <h6 className="mb-0" style={{ color: '#28468D' }}>
                <Activity size={16} className="me-2" />
                User Activity Summary
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <div className="h4 mb-0" style={{ color: '#28468D' }}>
                      {formData.created_at ? new Date(formData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not available'}
                    </div>
                    <small className="text-muted">Account Created</small>
                  </div>
                </Col>
                
                <Col md={3}>
                  <div className="text-center">
                    <div className="h4 mb-0" style={{ color: '#54B8DF' }}>
                      {formData.last_login ? new Date(formData.last_login).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                    </div>
                    <small className="text-muted">Last Login</small>
                  </div>
                </Col>
                
                <Col md={3}>
                  <div className="text-center">
                    <div className="h4 mb-0 text-success">0</div>
                    <small className="text-muted">Time Entries</small>
                  </div>
                </Col>
                
                <Col md={3}>
                  <div className="text-center">
                    <div className="h4 mb-0 text-warning">0</div>
                    <small className="text-muted">Leave Applications</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Password Reset Section */}
          <Card className="mt-4">
            <Card.Header>
              <h6 className="mb-0" style={{ color: '#28468D' }}>
                <Key size={16} className="me-2" />
                Password Management
              </h6>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-3">
                For security reasons, passwords cannot be viewed or edited directly. 
                Use the button below to reset the user's password.
              </p>
              
              <Button variant="outline-warning" onClick={() => alert('Password reset functionality would be implemented here. The user would receive a new temporary password via email.')}>
                <Key size={18} className="me-2" />
                Reset Password
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
