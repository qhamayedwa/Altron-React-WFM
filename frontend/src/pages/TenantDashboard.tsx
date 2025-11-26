import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Globe, Award, Settings, Activity } from 'lucide-react';
import { Button } from 'react-bootstrap';

const TenantDashboard = () => {
  const navigate = useNavigate();

  const tenant = {
    id: 1,
    name: 'Demo Corporation',
    max_users: 50,
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR',
    subscription_plan: 'enterprise'
  };

  const totalUsers = 45;
  const activeUsers = 38;

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">{tenant.name} - Organization Dashboard</h1>
            <Button variant="outline-primary">
              <Settings size={16} className="me-1" /> Settings
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <Users className="text-primary" size={24} />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Total Users</h6>
                  <h4 className="mb-0">{totalUsers}</h4>
                  <small className="text-muted">of {tenant.max_users} max</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="text-success" size={24} />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Active Users</h6>
                  <h4 className="mb-0">{activeUsers}</h4>
                  <small className="text-muted">currently active</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <Globe className="text-info" size={24} />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Timezone</h6>
                  <p className="mb-0">{tenant.timezone}</p>
                  <small className="text-muted">{tenant.currency} currency</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <Award className="text-warning" size={24} />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Plan</h6>
                  <p className="mb-0 text-capitalize">{tenant.subscription_plan}</p>
                  <small className="text-muted">subscription</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Multi-Tenant Organization Management</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-3">
                Manage multiple organizations with complete data isolation and customizable settings.
              </p>
              <Row>
                <Col md={4}>
                  <div className="d-grid">
                    <Button variant="outline-primary">
                      <Users size={16} className="me-1" /> View Organization Users
                    </Button>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-grid">
                    <Button variant="outline-secondary">
                      <Settings size={16} className="me-1" /> Organization Settings
                    </Button>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-grid">
                    <Button variant="outline-info" onClick={() => navigate('/dashboard')}>
                      <Activity size={16} className="me-1" /> Return to WFM Dashboard
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TenantDashboard;
