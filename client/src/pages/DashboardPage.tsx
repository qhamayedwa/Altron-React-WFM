import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card } from 'react-bootstrap';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold" style={{ color: '#0057A8' }}>
            Welcome back, {user?.first_name || user?.username}!
          </h2>
          <p className="text-muted">WFM24/7 Workforce Management System</p>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>
              <h6 className="text-muted mb-2">Total Hours</h6>
              <h3 className="fw-bold mb-0" style={{ color: '#0057A8' }}>0.0</h3>
              <small className="text-muted">This Month</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>
              <h6 className="text-muted mb-2">Leave Balance</h6>
              <h3 className="fw-bold mb-0" style={{ color: '#00A9E0' }}>0</h3>
              <small className="text-muted">Days Available</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>
              <h6 className="text-muted mb-2">Pending Approvals</h6>
              <h3 className="fw-bold mb-0" style={{ color: '#008C95' }}>0</h3>
              <small className="text-muted">Awaiting Action</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>
              <h6 className="text-muted mb-2">Upcoming Shifts</h6>
              <h3 className="fw-bold mb-0" style={{ color: '#62237A' }}>0</h3>
              <small className="text-muted">Next 7 Days</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#0057A8', color: 'white' }}>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                React + Node.js migration is in progress. Full functionality will be available soon.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
