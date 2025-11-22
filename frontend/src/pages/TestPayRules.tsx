import { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import { CheckCircle, ArrowLeft, Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface PayRule {
  id: number;
  name: string;
  priority: number;
  description: string;
  is_active: boolean;
}

interface TestResult {
  employee_id?: number;
  employee_name?: string;
  total_hours?: number;
  regular_hours?: number;
  overtime_hours?: number;
  total_pay?: number;
  rules_applied?: string[];
  [key: string]: any;
}

export default function TestPayRules() {
  const navigate = useNavigate();
  const [payRules, setPayRules] = useState<PayRule[]>([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [earliestDate] = useState('');
  const [latestDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);

  useEffect(() => {
    loadPayRules();
    setDefaultDates();
  }, []);

  const loadPayRules = async () => {
    try {
      const response = await api.get('/pay-rules');
      const activeRules = response.data.filter((rule: PayRule) => rule.is_active);
      setPayRules(activeRules);
      setSelectedRuleIds(activeRules.map((rule: PayRule) => rule.id));
    } catch (error) {
      console.error('Error fetching pay rules:', error);
    }
  };

  const setDefaultDates = () => {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstOfMonth.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const handleRuleToggle = (ruleId: number) => {
    setSelectedRuleIds(prev =>
      prev.includes(ruleId)
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRuleIds.length === 0) {
      alert('Please select at least one rule to test.');
      return;
    }

    setLoading(true);
    setTestResults(null);

    try {
      const response = await api.post('/pay-rules/test-rules', {
        rule_ids: selectedRuleIds,
        start_date: startDate,
        end_date: endDate
      });

      setTestResults(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (error) {
      console.error('Error testing pay rules:', error);
      alert('Failed to run test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <CheckCircle size={32} className="me-2" style={{ color: '#28468D' }} />
          Test Pay Rules
        </h2>
        <Button variant="outline-secondary" onClick={() => navigate('/pay-rules')}>
          <ArrowLeft size={16} className="me-2" />
          Back to Rules
        </Button>
      </div>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Select Rules to Test</h5>
                  </Card.Header>
                  <Card.Body>
                    {payRules.length > 0 ? (
                      <Row>
                        {payRules.map((rule) => (
                          <Col md={6} className="mb-3" key={rule.id}>
                            <Form.Check
                              type="checkbox"
                              id={`rule_${rule.id}`}
                              checked={selectedRuleIds.includes(rule.id)}
                              onChange={() => handleRuleToggle(rule.id)}
                              label={
                                <>
                                  <strong>{rule.name}</strong>
                                  <span className="badge bg-secondary ms-2">Priority: {rule.priority}</span>
                                  <br />
                                  <small className="text-muted">
                                    {rule.description && rule.description.length > 100
                                      ? `${rule.description.substring(0, 100)}...`
                                      : rule.description}
                                  </small>
                                </>
                              }
                            />
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Alert variant="warning">
                        No active pay rules found.{' '}
                        <Alert.Link onClick={() => navigate('/pay-rules/create')}>
                          Create a rule
                        </Alert.Link>{' '}
                        to test.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>

                {payRules.length > 0 && (
                  <>
                    <Card className="mb-4">
                      <Card.Header>
                        <h5 className="mb-0">Test Parameters</h5>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Start Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={earliestDate}
                                max={latestDate}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>End Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={earliestDate}
                                max={latestDate}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        {earliestDate && latestDate && (
                          <Form.Text className="text-muted">
                            Available time entries from {earliestDate} to {latestDate}
                          </Form.Text>
                        )}
                      </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-between">
                      <Button variant="secondary" onClick={() => navigate('/pay-rules')}>
                        <X size={16} className="me-2" />
                        Cancel
                      </Button>
                      <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Running Test...
                          </>
                        ) : (
                          <>
                            <Play size={16} className="me-2" />
                            Run Test
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </Form>
            </Card.Body>
          </Card>

          {testResults && testResults.length > 0 && (
            <Card className="mt-4">
              <Card.Header>
                <h5 className="mb-0">Test Results</h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="success">
                  Test completed successfully! Results for {testResults.length} record(s).
                </Alert>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Total Hours</th>
                        <th>Regular Hours</th>
                        <th>Overtime Hours</th>
                        <th>Total Pay</th>
                        <th>Rules Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResults.map((result, idx) => (
                        <tr key={idx}>
                          <td>{result.employee_name || `Employee ${result.employee_id || idx + 1}`}</td>
                          <td>
                            <Badge bg="primary">{result.total_hours?.toFixed(1) || '0.0'}h</Badge>
                          </td>
                          <td>
                            <Badge bg="success">{result.regular_hours?.toFixed(1) || '0.0'}h</Badge>
                          </td>
                          <td>
                            <Badge bg="warning">{result.overtime_hours?.toFixed(1) || '0.0'}h</Badge>
                          </td>
                          <td>
                            <Badge bg="info">R{result.total_pay?.toFixed(2) || '0.00'}</Badge>
                          </td>
                          <td>
                            {result.rules_applied && result.rules_applied.length > 0 ? (
                              result.rules_applied.map((rule, rIdx) => (
                                <Badge key={rIdx} bg="secondary" className="me-1">
                                  {rule}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Testing Overview</h6>
            </Card.Header>
            <Card.Body>
              <h6>What This Test Does</h6>
              <ul className="small">
                <li>Validates rule logic against real time entries</li>
                <li>Checks for rule conflicts and overlaps</li>
                <li>Calculates pay components for test period</li>
                <li>Provides detailed debugging information</li>
              </ul>

              <h6 className="mt-3">Test Results Include</h6>
              <ul className="small">
                <li>Pay calculation breakdown by employee</li>
                <li>Rule application summary</li>
                <li>Validation warnings and errors</li>
                <li>Debug logs for troubleshooting</li>
              </ul>

              <Alert variant="info" className="small mt-3">
                <strong>Note:</strong> Testing uses actual time entries but does not save results. Use the "Calculate Pay" feature to save calculations.
              </Alert>
            </Card.Body>
          </Card>

          {payRules.length === 0 && (
            <Card className="mt-3">
              <Card.Header>
                <h6 className="mb-0">No Rules to Test</h6>
              </Card.Header>
              <Card.Body>
                <p className="small">You need to create pay rules before you can test them.</p>
                <Button variant="primary" size="sm" onClick={() => navigate('/pay-rules/create')}>
                  Create Your First Rule
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
