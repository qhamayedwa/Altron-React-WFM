import { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { CreditCard, ArrowLeft, X, FileText, CheckCircle, Plus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface Employee {
  id: number;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  username: string;
  isActive?: boolean;
  is_active?: boolean;
  roles?: Array<{ name: string } | string>;
}

export default function CalculatePay() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saveResults, setSaveResults] = useState(false);
  const [earliestDate] = useState('');
  const [latestDate] = useState('');

  useEffect(() => {
    loadEmployees();
    setDefaultDates();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await api.get('/users');
      const activeEmployees = response.data.filter((user: any) => 
        user.isActive === true || user.is_active === true
      );
      setEmployees(activeEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const getEmployeeName = (employee: Employee): string => {
    if (employee.full_name) return employee.full_name;
    const firstName = employee.firstName || employee.first_name || '';
    const lastName = employee.lastName || employee.last_name || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return employee.username;
  };

  const getRoleName = (role: { name: string } | string): string => {
    return typeof role === 'string' ? role : role.name;
  };

  const setDefaultDates = () => {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstOfMonth.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEmployeeIds(employees.map(emp => emp.id));
    } else {
      setSelectedEmployeeIds([]);
    }
  };

  const handleEmployeeToggle = (employeeId: number) => {
    setSelectedEmployeeIds(prev => {
      const newSelection = prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId];
      
      setSelectAll(newSelection.length === employees.length);
      return newSelection;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEmployeeIds.length === 0) {
      alert('Please select at least one employee.');
      return;
    }

    try {
      await api.post('/pay-rules/calculate-pay', {
        employee_ids: selectedEmployeeIds,
        start_date: startDate,
        end_date: endDate,
        save_results: saveResults
      });

      if (saveResults) {
        alert('Pay calculations saved successfully!');
      } else {
        alert('Pay calculations completed successfully!');
      }
      navigate('/pay-rules/calculations');
    } catch (error) {
      console.error('Error calculating pay:', error);
      alert('Failed to calculate pay. Please try again.');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <CreditCard size={32} className="me-2" style={{ color: '#28468D' }} />
          Calculate Pay
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
                    <h5 className="mb-0">Pay Period</h5>
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

                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Employee Selection</h5>
                  </Card.Header>
                  <Card.Body>
                    {employees.length > 0 ? (
                      <>
                        <div className="mb-3">
                          <Form.Check
                            type="checkbox"
                            id="select_all"
                            checked={selectAll}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            label={<strong>Select All Employees</strong>}
                          />
                        </div>
                        <Row>
                          {employees.map((employee) => (
                            <Col md={6} className="mb-2" key={employee.id}>
                              <Form.Check
                                type="checkbox"
                                id={`employee_${employee.id}`}
                                checked={selectedEmployeeIds.includes(employee.id)}
                                onChange={() => handleEmployeeToggle(employee.id)}
                                label={
                                  <>
                                    {getEmployeeName(employee)} ({employee.username})
                                    {employee.roles && employee.roles.length > 0 && (
                                      <>
                                        <br />
                                        <small className="text-muted">
                                          {employee.roles.map((role, idx) => (
                                            <span key={idx} className="badge bg-secondary me-1">
                                              {getRoleName(role)}
                                            </span>
                                          ))}
                                        </small>
                                      </>
                                    )}
                                  </>
                                }
                              />
                            </Col>
                          ))}
                        </Row>
                      </>
                    ) : (
                      <Alert variant="warning">
                        <AlertTriangle size={16} className="me-2" />
                        No active employees found.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>

                {employees.length > 0 && (
                  <>
                    <Card className="mb-4">
                      <Card.Header>
                        <h5 className="mb-0">Options</h5>
                      </Card.Header>
                      <Card.Body>
                        <Form.Check
                          type="checkbox"
                          id="save_results"
                          checked={saveResults}
                          onChange={(e) => setSaveResults(e.target.checked)}
                          label="Save calculation results to database"
                        />
                        <Form.Text className="text-muted d-block mt-2">
                          When enabled, calculated pay will be saved and can be viewed later
                        </Form.Text>
                      </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-between">
                      <Button variant="secondary" onClick={() => navigate('/pay-rules')}>
                        <X size={16} className="me-2" />
                        Cancel
                      </Button>
                      <Button variant="success" type="submit" style={{ backgroundColor: '#28a745' }}>
                        <CreditCard size={16} className="me-2" />
                        Calculate Pay
                      </Button>
                    </div>
                  </>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Pay Calculation Process</h6>
            </Card.Header>
            <Card.Body>
              <h6>How It Works</h6>
              <ol className="small">
                <li>System retrieves closed time entries for the period</li>
                <li>Active pay rules are applied in priority order</li>
                <li>Pay components are calculated for each employee</li>
                <li>Results are summarized and displayed</li>
              </ol>

              <h6 className="mt-3">Included Time Entries</h6>
              <ul className="small">
                <li>Only <strong>closed</strong> time entries are processed</li>
                <li>Entries must fall within the selected date range</li>
                <li>All approved overtime is included</li>
              </ul>

              <Alert variant="info" className="small mt-3">
                <strong>Note:</strong> Calculations use all active pay rules. Deactivate rules you don't want to apply.
              </Alert>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">Quick Actions</h6>
            </Card.Header>
            <Card.Body className="d-grid gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate('/pay-rules/calculations')}
              >
                <FileText size={16} className="me-2" />
                View Past Calculations
              </Button>
              <Button
                variant="outline-info"
                size="sm"
                onClick={() => navigate('/pay-rules/test')}
              >
                <CheckCircle size={16} className="me-2" />
                Test Rules First
              </Button>
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => navigate('/pay-rules/create')}
              >
                <Plus size={16} className="me-2" />
                Create New Rule
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
