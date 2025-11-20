import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import api from '../lib/api';

export const ProfilePage: React.FC = () => {
  const { user, checkSession } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    mobile_number: user?.mobile_number || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.put('/auth/profile', formData);
      await checkSession();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } catch (error: any) {
      setMessage({ type: 'danger', text: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const userRoles = user.user_roles?.map((ur) => ur.roles.name).join(', ') || 'None';

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#0057A8', color: 'white' }}>
              <h4 className="mb-0">User Profile</h4>
            </Card.Header>
            <Card.Body className="p-4">
              {message && (
                <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>Username</Form.Label>
                      <Form.Control type="text" value={user.username} disabled />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Employee ID</Form.Label>
                      <Form.Control type="text" value={user.employee_id || 'N/A'} disabled />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Mobile Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="mobile_number"
                        value={formData.mobile_number}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Roles</Form.Label>
                  <Form.Control type="text" value={userRoles} disabled />
                </Form.Group>

                <div className="d-flex gap-2">
                  {!editing ? (
                    <Button
                      variant="primary"
                      onClick={() => setEditing(true)}
                      style={{ backgroundColor: '#0057A8', borderColor: '#0057A8' }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        variant="success"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            first_name: user?.first_name || '',
                            last_name: user?.last_name || '',
                            email: user?.email || '',
                            phone_number: user?.phone_number || '',
                            mobile_number: user?.mobile_number || '',
                          });
                        }}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
