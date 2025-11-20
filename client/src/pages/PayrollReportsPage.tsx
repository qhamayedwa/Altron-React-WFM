import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import api from '../lib/api';

interface PayCalculation {
  id: number;
  user_id: number;
  pay_period_start: string;
  pay_period_end: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  double_time_hours: number;
  total_allowances: number;
  pay_components: string;
  calculated_at: string;
  users_pay_calculations_user_idTousers: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  users_pay_calculations_calculated_by_idTousers: {
    id: number;
    username: string;
  };
}

interface PayComponent {
  hours?: number;
  amount?: number;
  multiplier?: number;
  differential?: number;
  type?: string;
  rules_applied?: string[];
}

export default function PayrollReportsPage() {
  const [calculations, setCalculations] = useState<PayCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCalculation, setSelectedCalculation] = useState<PayCalculation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadCalculations();
  }, []);

  const loadCalculations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/payroll/calculations', {
        params: { page: 1, per_page: 100 },
      });
      
      setCalculations(response.data.data.calculations);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load payroll calculations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (calculation: PayCalculation) => {
    setSelectedCalculation(calculation);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZA');
  };

  const renderPayComponents = (componentsJson: string) => {
    const components: Record<string, PayComponent> = JSON.parse(componentsJson);
    
    return (
      <Table size="sm" className="mb-0">
        <thead>
          <tr>
            <th>Component</th>
            <th>Hours</th>
            <th>Multiplier</th>
            <th>Amount/Diff</th>
            <th>Type</th>
            <th>Rules Applied</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(components).map(([name, component]) => (
            <tr key={name}>
              <td><code>{name}</code></td>
              <td>{component.hours ? formatHours(component.hours) : '-'}</td>
              <td>{component.multiplier ? `${component.multiplier}x` : '-'}</td>
              <td>
                {component.amount && formatCurrency(component.amount)}
                {component.differential && `${formatCurrency(component.differential)}/h`}
                {!component.amount && !component.differential && '-'}
              </td>
              <td>
                <Badge bg="info" className="text-capitalize">{component.type || 'hours'}</Badge>
              </td>
              <td>
                <small>{component.rules_applied?.join(', ') || '-'}</small>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2>Payroll Reports</h2>
          <p className="text-muted">View saved payroll calculation results and employee pay components</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={loadCalculations}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : calculations.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox display-1"></i>
              <p className="mt-3">No payroll calculations found</p>
              <p>Calculate payroll in the Payroll Calculation page and save the results to see them here.</p>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Pay Period</th>
                  <th>Total Hours</th>
                  <th>Regular</th>
                  <th>Overtime</th>
                  <th>Double Time</th>
                  <th>Allowances</th>
                  <th>Calculated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {calculations.map((calc) => {
                  const employee = calc.users_pay_calculations_user_idTousers;
                  const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
                  
                  return (
                    <tr key={calc.id}>
                      <td>
                        <strong>{employee.username}</strong>
                        {fullName && (
                          <>
                            <br />
                            <small className="text-muted">{fullName}</small>
                          </>
                        )}
                      </td>
                      <td>
                        {formatDate(calc.pay_period_start)}
                        <br />
                        to {formatDate(calc.pay_period_end)}
                      </td>
                      <td>
                        <Badge bg="primary">{formatHours(calc.total_hours)}</Badge>
                      </td>
                      <td>{formatHours(calc.regular_hours)}</td>
                      <td>
                        {calc.overtime_hours > 0 ? (
                          <Badge bg="warning">{formatHours(calc.overtime_hours)}</Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {calc.double_time_hours > 0 ? (
                          <Badge bg="danger">{formatHours(calc.double_time_hours)}</Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {calc.total_allowances > 0 ? (
                          formatCurrency(calc.total_allowances)
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <small>
                          {formatDateTime(calc.calculated_at)}
                          <br />
                          by {calc.users_pay_calculations_calculated_by_idTousers.username}
                        </small>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetails(calc)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Payroll Calculation Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCalculation && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Employee Information</h5>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <th>Username:</th>
                        <td>{selectedCalculation.users_pay_calculations_user_idTousers.username}</td>
                      </tr>
                      <tr>
                        <th>Name:</th>
                        <td>
                          {`${selectedCalculation.users_pay_calculations_user_idTousers.first_name || ''} ${
                            selectedCalculation.users_pay_calculations_user_idTousers.last_name || ''
                          }`.trim() || '-'}
                        </td>
                      </tr>
                      <tr>
                        <th>Employee ID:</th>
                        <td>{selectedCalculation.user_id}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Calculation Metadata</h5>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <th>Pay Period:</th>
                        <td>
                          {formatDate(selectedCalculation.pay_period_start)} to {formatDate(selectedCalculation.pay_period_end)}
                        </td>
                      </tr>
                      <tr>
                        <th>Calculated At:</th>
                        <td>{formatDateTime(selectedCalculation.calculated_at)}</td>
                      </tr>
                      <tr>
                        <th>Calculated By:</th>
                        <td>{selectedCalculation.users_pay_calculations_calculated_by_idTousers.username}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              <hr />

              <h5 className="mb-3">Hours Summary</h5>
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <div className="display-6">{formatHours(selectedCalculation.total_hours)}</div>
                      <div className="text-muted">Total Hours</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <div className="display-6">{formatHours(selectedCalculation.regular_hours)}</div>
                      <div className="text-muted">Regular (1.0x)</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <div className="display-6">{formatHours(selectedCalculation.overtime_hours)}</div>
                      <div className="text-muted">Overtime (1.5x)</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <div className="display-6">{formatHours(selectedCalculation.double_time_hours)}</div>
                      <div className="text-muted">Double Time (2.0x)</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Body>
                      <div className="display-6">{formatCurrency(selectedCalculation.total_allowances)}</div>
                      <div className="text-muted">Total Allowances</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <hr />

              <h5 className="mb-3">Pay Components Detail</h5>
              {renderPayComponents(selectedCalculation.pay_components)}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
