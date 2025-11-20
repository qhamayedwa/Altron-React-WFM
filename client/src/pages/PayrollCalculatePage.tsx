import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Table, Badge, Collapse } from 'react-bootstrap';
import api from '../lib/api';

interface PayComponent {
  hours?: number;
  amount?: number;
  multiplier?: number;
  differential?: number;
  type?: string;
  rules_applied?: string[];
}

interface EmployeeResult {
  user_id: number;
  username: string;
  total_hours: number;
  pay_components: Record<string, PayComponent>;
  summary: {
    regular_hours: number;
    overtime_hours: number;
    double_time_hours: number;
    total_allowances: number;
    shift_differentials: number;
  };
}

interface CalculationResult {
  employee_results: Record<number, EmployeeResult>;
  summary: {
    regular_hours: number;
    overtime_hours: number;
    double_time_hours: number;
    total_allowances: number;
    shift_differentials: number;
  };
  employee_count: number;
  saved_calculations: any[] | null;
}

export default function PayrollCalculatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [expandedEmployees, setExpandedEmployees] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState({
    pay_period_start: '',
    pay_period_end: '',
    employee_ids: '',
    save_results: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResult(null);

    try {
      setLoading(true);

      const payload: any = {
        pay_period_start: new Date(formData.pay_period_start).toISOString(),
        pay_period_end: new Date(formData.pay_period_end).toISOString(),
        save_results: formData.save_results,
      };

      if (formData.employee_ids.trim()) {
        const ids = formData.employee_ids.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
        if (ids.length > 0) {
          payload.employee_ids = ids;
        }
      }

      const response = await api.post('/payroll/calculate', payload);
      setResult(response.data.data);
      setSuccess(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to calculate payroll');
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeDetails = (userId: number) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedEmployees(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(2);
  };

  const renderPayComponents = (components: Record<string, PayComponent>) => {
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
          <h2>Payroll Calculation</h2>
          <p className="text-muted">Calculate payroll for a specific pay period using configured pay rules</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Calculation Parameters</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Pay Period Start *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.pay_period_start}
                    onChange={(e) => setFormData({ ...formData, pay_period_start: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Pay Period End *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.pay_period_end}
                    onChange={(e) => setFormData({ ...formData, pay_period_end: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Employee IDs (optional)</Form.Label>
              <Form.Control
                type="text"
                value={formData.employee_ids}
                onChange={(e) => setFormData({ ...formData, employee_ids: e.target.value })}
                placeholder="e.g., 1, 5, 12 (leave empty for all employees)"
              />
              <Form.Text>Comma-separated list of employee IDs. Leave empty to calculate for all employees.</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Save calculation results to database"
                checked={formData.save_results}
                onChange={(e) => setFormData({ ...formData, save_results: e.target.checked })}
              />
              <Form.Text>Saved results can be viewed in the Payroll Reports page</Form.Text>
            </Form.Group>

            <Button type="submit" variant="primary" disabled={loading} className="me-2">
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Calculating...
                </>
              ) : (
                <>
                  <i className="bi bi-calculator me-2"></i>
                  Calculate Payroll
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {result && (
        <>
          <Card className="mb-4">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Calculation Summary</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <div className="display-6">{result.employee_count}</div>
                    <div className="text-muted">Employees</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="display-6">{formatHours(result.summary.regular_hours)}</div>
                    <div className="text-muted">Regular Hours</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="display-6">{formatHours(result.summary.overtime_hours)}</div>
                    <div className="text-muted">Overtime (1.5x)</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="display-6">{formatHours(result.summary.double_time_hours)}</div>
                    <div className="text-muted">Double Time (2.0x)</div>
                  </div>
                </Col>
              </Row>
              <Row className="mt-4">
                <Col md={6}>
                  <div className="text-center">
                    <div className="display-6">{formatCurrency(result.summary.total_allowances)}</div>
                    <div className="text-muted">Total Allowances</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center">
                    <div className="display-6">{formatCurrency(result.summary.shift_differentials)}</div>
                    <div className="text-muted">Shift Differentials</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Employee-Level Results</h5>
            </Card.Header>
            <Card.Body>
              {Object.values(result.employee_results).map((employee) => (
                <Card key={employee.user_id} className="mb-3">
                  <Card.Header
                    className="d-flex justify-content-between align-items-center"
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleEmployeeDetails(employee.user_id)}
                  >
                    <div>
                      <strong>{employee.username}</strong> (ID: {employee.user_id})
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="me-4">
                        <Badge bg="primary" className="me-2">
                          {formatHours(employee.total_hours)} total hours
                        </Badge>
                        <Badge bg="success">
                          {formatHours(employee.summary.regular_hours)} regular
                        </Badge>
                        {employee.summary.overtime_hours > 0 && (
                          <Badge bg="warning" className="ms-2">
                            {formatHours(employee.summary.overtime_hours)} OT
                          </Badge>
                        )}
                        {employee.summary.double_time_hours > 0 && (
                          <Badge bg="danger" className="ms-2">
                            {formatHours(employee.summary.double_time_hours)} DT
                          </Badge>
                        )}
                      </div>
                      <i className={`bi bi-chevron-${expandedEmployees.has(employee.user_id) ? 'up' : 'down'}`}></i>
                    </div>
                  </Card.Header>
                  <Collapse in={expandedEmployees.has(employee.user_id)}>
                    <div>
                      <Card.Body>
                        <h6>Pay Components</h6>
                        {renderPayComponents(employee.pay_components)}

                        <hr />

                        <h6>Summary</h6>
                        <Row>
                          <Col md={3}>
                            <div className="mb-2">
                              <strong>Regular Hours:</strong>
                              <div>{formatHours(employee.summary.regular_hours)}</div>
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="mb-2">
                              <strong>Overtime (1.5x):</strong>
                              <div>{formatHours(employee.summary.overtime_hours)}</div>
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="mb-2">
                              <strong>Double Time (2.0x):</strong>
                              <div>{formatHours(employee.summary.double_time_hours)}</div>
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="mb-2">
                              <strong>Total Hours:</strong>
                              <div>{formatHours(employee.total_hours)}</div>
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <div className="mb-2">
                              <strong>Total Allowances:</strong>
                              <div>{formatCurrency(employee.summary.total_allowances)}</div>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-2">
                              <strong>Shift Differentials:</strong>
                              <div>{formatCurrency(employee.summary.shift_differentials)}</div>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </div>
                  </Collapse>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}
