import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link2, Wifi, Settings, Users, Clock, Umbrella, Tag, FileText, Download, Upload } from 'lucide-react';

const SageVIPDashboard = () => {
  const handleSync = (type: string) => {
    if (window.confirm(`This will sync ${type} from SAGE VIP. Continue?`)) {
      console.log(`Syncing ${type}...`);
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Header>
              <h4 className="card-title mb-0">
                <Link2 className="me-2" size={20} />
                SAGE VIP Payroll Integration
              </h4>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                Manage bidirectional data synchronization between WFM and SAGE VIP Payroll system.
              </p>

              <Row className="mb-4">
                <Col md={6}>
                  <Card className="border-info">
                    <Card.Body className="text-center">
                      <Wifi className="text-info mb-2" size={48} />
                      <h5>Connection Status</h5>
                      <Button variant="outline-info">Test Connection</Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-warning">
                    <Card.Body className="text-center">
                      <Settings className="text-warning mb-2" size={48} />
                      <h5>Integration Settings</h5>
                      <Button variant="outline-warning">Configure Settings</Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <h5 className="mb-3">Data Synchronization</h5>
                </Col>
              </Row>

              <Row>
                <Col md={4} className="mb-3">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <Users className="text-primary mb-3" size={40} />
                      <h6>Employee Data</h6>
                      <p className="text-muted small">Sync employee information from SAGE VIP to WFM</p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSync('employee data')}
                      >
                        <Download size={14} className="me-1" />
                        Pull from SAGE
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-3">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <Clock className="text-success mb-3" size={40} />
                      <h6>Time Entries</h6>
                      <p className="text-muted small">Push time entries from WFM to SAGE VIP</p>
                      <Button variant="success" size="sm">
                        <Upload size={14} className="me-1" />
                        Push to SAGE
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-3">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <Umbrella className="text-warning mb-3" size={40} />
                      <h6>Leave Applications</h6>
                      <p className="text-muted small">Push leave data from WFM to SAGE VIP</p>
                      <Button variant="warning" size="sm">
                        <Upload size={14} className="me-1" />
                        Push to SAGE
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md={4} className="mb-3">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <div className="text-info mb-3 fw-bold" style={{ fontSize: '40px' }}>R</div>
                      <h6>Payroll Data</h6>
                      <p className="text-muted small">Retrieve processed payroll from SAGE VIP</p>
                      <Button variant="info" size="sm">
                        <Download size={14} className="me-1" />
                        Pull from SAGE
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-3">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <Tag className="text-secondary mb-3" size={40} />
                      <h6>Pay Codes</h6>
                      <p className="text-muted small">Sync pay codes from SAGE VIP to WFM</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSync('pay codes')}
                      >
                        <Download size={14} className="me-1" />
                        Pull from SAGE
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-3">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <FileText className="text-dark mb-3" size={40} />
                      <h6>Integration Logs</h6>
                      <p className="text-muted small">View synchronization history and logs</p>
                      <Button variant="dark" size="sm">
                        <FileText size={14} className="me-1" />
                        View Logs
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SageVIPDashboard;
