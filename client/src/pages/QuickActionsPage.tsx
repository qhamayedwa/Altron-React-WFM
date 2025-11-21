import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { QuickActionsPanel } from '../components/QuickActionsPanel';

export const QuickActionsPage: React.FC = () => {
  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold" style={{ color: '#0057A8' }}>
            Quick Actions
          </h2>
          <p className="text-muted">Access frequently used features and shortcuts</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <QuickActionsPanel />
        </Col>
      </Row>
    </Container>
  );
};
