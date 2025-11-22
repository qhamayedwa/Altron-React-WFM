import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import { User, Home, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="py-4">
      <Row>
        <Col md={8} className="mx-auto">
          <Card>
            <Card.Header>
              <h4 className="mb-0">
                <User size={24} className="me-2" />
                My Profile
              </h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6 className="text-muted">Username</h6>
                  <p>{user?.username}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Email</h6>
                  <p>{user?.email}</p>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <h6 className="text-muted">Full Name</h6>
                  <p>{user?.firstName} {user?.lastName}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Member Since</h6>
                  <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </Col>
              </Row>
              
              <Row>
                <Col xs={12}>
                  <h6 className="text-muted">Roles</h6>
                  <div>
                    {user?.roles.map((role, index) => (
                      <Badge key={index} bg="primary" className="me-2">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <div className="mt-4 text-center">
            <Button variant="outline-secondary" className="me-2">
              <Home size={18} className="me-2" />
              Back to Home
            </Button>
            {user?.roles.includes('Super User') && (
              <Button variant="primary">
                <Users size={18} className="me-2" />
                Manage Users
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
