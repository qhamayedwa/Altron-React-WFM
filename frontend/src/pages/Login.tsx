import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import { Clock, Shield, Users, BarChart3 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      const { user } = response.data;
      setAuth(user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-hero">
      <Container>
        <Row className="justify-content-center align-items-center g-4">
          <Col lg={5} className="d-none d-lg-block">
            <div className="text-white pe-4">
              <h1 className="display-4 fw-bold mb-4" style={{ position: 'relative', zIndex: 1 }}>
                TimeLogic AI
              </h1>
              <p className="lead mb-5" style={{ position: 'relative', zIndex: 1, opacity: 0.9 }}>
                Complete Workforce Management for 24/7 Operations
              </p>
              
              <div className="d-flex flex-column gap-4" style={{ position: 'relative', zIndex: 1 }}>
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      background: 'linear-gradient(135deg, rgba(84, 218, 223, 0.3), rgba(235, 249, 130, 0.3))'
                    }}
                  >
                    <Clock size={24} />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-semibold">Time & Attendance</h6>
                    <small style={{ opacity: 0.8 }}>GPS-enabled clock in/out tracking</small>
                  </div>
                </div>
                
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      background: 'linear-gradient(135deg, rgba(192, 242, 215, 0.3), rgba(235, 249, 130, 0.3))'
                    }}
                  >
                    <Users size={24} />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-semibold">Team Management</h6>
                    <small style={{ opacity: 0.8 }}>Scheduling, leave & approvals</small>
                  </div>
                </div>
                
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      background: 'linear-gradient(135deg, rgba(239, 134, 91, 0.3), rgba(235, 249, 130, 0.3))'
                    }}
                  >
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-semibold">Analytics & Reports</h6>
                    <small style={{ opacity: 0.8 }}>AI-powered workforce insights</small>
                  </div>
                </div>
                
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      background: 'linear-gradient(135deg, rgba(84, 184, 223, 0.3), rgba(255, 255, 255, 0.3))'
                    }}
                  >
                    <Shield size={24} />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-semibold">SAGE VIP Integration</h6>
                    <small style={{ opacity: 0.8 }}>Seamless payroll connectivity</small>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          
          <Col md={8} lg={5}>
            <Card className="login-card border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ 
                      width: 64, 
                      height: 64, 
                      background: 'linear-gradient(135deg, #54B8DF, #28468D)'
                    }}
                  >
                    <Shield size={32} color="#fff" />
                  </div>
                  <h2 className="mb-2 fw-bold" style={{ color: '#28468D' }}>Welcome Back</h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {error && (
                  <Alert variant="danger" className="border-0" style={{ 
                    background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(239, 134, 91, 0.1))',
                    borderLeft: '4px solid #DC3545'
                  }}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                      className="py-2"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="py-2"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2 fw-semibold"
                    disabled={loading}
                    style={{ 
                      borderRadius: 8,
                      fontSize: '1.05rem'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : 'Sign In'}
                  </Button>
                </Form>

                <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #dee2e6' }}>
                  <small className="text-muted">
                    © {new Date().getFullYear()} Altron. All rights reserved.
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
