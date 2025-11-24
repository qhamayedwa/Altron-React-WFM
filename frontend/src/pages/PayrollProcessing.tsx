import { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Alert, Badge, Row, Col, Modal, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Calendar, RefreshCw, Download, Settings, FileText, Printer, Users, Clock, TrendingUp, Eye, Filter, X, Play, CheckSquare, AlertTriangle, Edit, Check, BarChart2 } from 'lucide-react';
import api from '../api/client';

interface PayrollEntry {
  employeeId: number;
  firstName: string;
  lastName: string;
  username: string;
  regularHours: number;
  overtimeHours: number;
  baseRate: number;
  regularPay: number;
  overtimePay: number;
  grossPay: number;
  hasExceptions: boolean;
  isApproved: boolean;
}

interface PayrollSummary {
  totalEmployees: number;
  totalHours: number;
  overtimeHours: number;
  grossPay: number;
}

interface EmployeeDetails {
  id: number;
  name: string;
  department: string;
  base_rate: string;
  regular_hours: string;
  overtime_hours: string;
  total_hours: string;
  gross_pay: string;
  time_entries: Array<{
    date: string;
    clock_in: string;
    clock_out: string;
    hours: string;
    pay_code: string;
  }>;
}

export default function PayrollProcessing() {
  const navigate = useNavigate();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [payrollData, setPayrollData] = useState<PayrollEntry[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [currentEmployeeDetails, setCurrentEmployeeDetails] = useState<EmployeeDetails | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default dates to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const loadPayrollData = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/payroll/prepare', {
        startDate,
        endDate
      });
      
      setPayrollData(response.data.payrollData || []);
      setPayrollSummary(response.data.summary);
    } catch (err: any) {
      console.error('Error loading payroll:', err);
      alert(err.response?.data?.error || 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.length === payrollData.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(payrollData.map(emp => emp.employeeId));
    }
  };

  const toggleEmployee = (employeeId: number) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAllEmployees = () => {
    setSelectedEmployees(payrollData.map(emp => emp.employeeId));
  };

  const flagExceptions = () => {
    const exceptionsEmployees = payrollData
      .filter(emp => emp.hasExceptions)
      .map(emp => emp.employeeId);
    setSelectedEmployees(exceptionsEmployees);
  };

  const viewEmployeeDetails = async (employeeId: number) => {
    try {
      const response = await api.get(`/payroll/employee-details/${employeeId}`, {
        params: { startDate, endDate }
      });
      setCurrentEmployeeDetails(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to load employee details:', error);
      alert('Failed to load employee details');
    }
  };

  const processPayroll = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee to process');
      return;
    }

    if (!confirm(`Process payroll for ${selectedEmployees.length} employee(s)?`)) {
      return;
    }

    setShowProcessingModal(true);
    setProcessingProgress(0);
    
    const steps = [
      'Validating time entries...',
      'Calculating regular hours...',
      'Processing overtime...',
      'Applying pay rules...',
      'Generating payroll records...',
      'Finalizing calculations...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStatus(steps[i]);
      setProcessingProgress(((i + 1) / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      await api.post('/payroll/process', {
        employeeIds: selectedEmployees,
        startDate,
        endDate
      });

      setProcessingStatus('Payroll processing completed successfully!');
      setTimeout(() => {
        setShowProcessingModal(false);
        loadPayrollData();
      }, 2000);
    } catch (error) {
      console.error('Failed to process payroll:', error);
      setProcessingStatus('Error processing payroll');
      setTimeout(() => setShowProcessingModal(false), 2000);
    }
  };

  const exportPayroll = () => {
    const employeesParam = selectedEmployees.length > 0 ? `&employees=${selectedEmployees.join(',')}` : '';
    window.open(`/api/payroll/export?start_date=${startDate}&end_date=${endDate}${employeesParam}`, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Payroll Processing</h2>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={processPayroll}>
            <Play size={16} className="me-2" />
            Process Payroll
          </Button>
          <Button variant="outline-primary" onClick={exportPayroll}>
            <Download size={16} className="me-2" />
            Export Data
          </Button>
          <Button variant="outline-info" onClick={() => navigate('/reports/time-summary')}>
            <BarChart2 size={16} className="me-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Pay Period Selection & Summary */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Pay Period Selection</h6>
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
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" onClick={loadPayrollData} disabled={loading}>
                <RefreshCw size={16} className="me-2" />
                {loading ? 'Loading...' : 'Load Payroll Data'}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Payroll Summary</h6>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col xs={3}>
                  <strong>{payrollSummary?.totalEmployees || 0}</strong>
                  <br />
                  <small className="text-muted">Employees</small>
                </Col>
                <Col xs={3}>
                  <strong>{payrollSummary?.totalHours.toFixed(1) || 0}</strong>
                  <br />
                  <small className="text-muted">Total Hours</small>
                </Col>
                <Col xs={3}>
                  <strong>{payrollSummary?.overtimeHours.toFixed(1) || 0}</strong>
                  <br />
                  <small className="text-muted">OT Hours</small>
                </Col>
                <Col xs={3}>
                  <strong>{formatCurrency(payrollSummary?.grossPay || 0)}</strong>
                  <br />
                  <small className="text-muted">Gross Pay</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Employee Payroll Data */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Employee Payroll Data</h5>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm" onClick={selectAllEmployees}>
                  <CheckSquare size={16} /> Select All
                </Button>
                <Button variant="outline-warning" size="sm" onClick={flagExceptions}>
                  <AlertTriangle size={16} /> Flag Exceptions
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>
                        <Form.Check
                          type="checkbox"
                          checked={selectedEmployees.length === payrollData.length && payrollData.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>Employee</th>
                      <th>Regular Hours</th>
                      <th>Overtime Hours</th>
                      <th>Base Rate</th>
                      <th>Regular Pay</th>
                      <th>Overtime Pay</th>
                      <th>Gross Pay</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.length > 0 ? (
                      payrollData.map((emp) => (
                        <tr key={emp.employeeId} className={emp.hasExceptions ? 'table-warning' : ''}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedEmployees.includes(emp.employeeId)}
                              onChange={() => toggleEmployee(emp.employeeId)}
                            />
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Badge bg="primary" className="me-2">
                                {emp.firstName?.[0] || ''}{emp.lastName?.[0] || ''}
                              </Badge>
                              <div>
                                <strong>{emp.firstName} {emp.lastName}</strong>
                                <br />
                                <small className="text-muted">{emp.username}</small>
                              </div>
                            </div>
                          </td>
                          <td>{emp.regularHours.toFixed(2)}</td>
                          <td>{emp.overtimeHours.toFixed(2)}</td>
                          <td>{formatCurrency(emp.baseRate)}</td>
                          <td>{formatCurrency(emp.regularPay)}</td>
                          <td>{formatCurrency(emp.overtimePay)}</td>
                          <td><strong>{formatCurrency(emp.grossPay)}</strong></td>
                          <td>
                            {emp.hasExceptions ? (
                              <Badge bg="warning">Exception</Badge>
                            ) : emp.isApproved ? (
                              <Badge bg="success">Approved</Badge>
                            ) : (
                              <Badge bg="secondary">Pending</Badge>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => viewEmployeeDetails(emp.employeeId)}
                              >
                                <Eye size={14} />
                              </Button>
                              <Button variant="outline-warning" size="sm">
                                <Edit size={14} />
                              </Button>
                              {!emp.isApproved && (
                                <Button variant="outline-success" size="sm">
                                  <Check size={14} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="text-center text-muted">
                          No payroll data available for selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Employee Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Employee Payroll Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentEmployeeDetails ? (
            <>
              <Row>
                <Col md={6}>
                  <h6>Employee Information</h6>
                  <p>
                    <strong>Name:</strong> {currentEmployeeDetails.name}<br />
                    <strong>Employee ID:</strong> {currentEmployeeDetails.id}<br />
                    <strong>Department:</strong> {currentEmployeeDetails.department}<br />
                    <strong>Base Rate:</strong> R{currentEmployeeDetails.base_rate}
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Pay Period Summary</h6>
                  <p>
                    <strong>Regular Hours:</strong> {currentEmployeeDetails.regular_hours}<br />
                    <strong>Overtime Hours:</strong> {currentEmployeeDetails.overtime_hours}<br />
                    <strong>Total Hours:</strong> {currentEmployeeDetails.total_hours}<br />
                    <strong>Gross Pay:</strong> R{currentEmployeeDetails.gross_pay}
                  </p>
                </Col>
              </Row>
              <hr />
              <h6>Time Entries</h6>
              <Table size="sm" striped>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Hours</th>
                    <th>Pay Code</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployeeDetails.time_entries.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.date}</td>
                      <td>{entry.clock_in}</td>
                      <td>{entry.clock_out}</td>
                      <td>{entry.hours}</td>
                      <td>{entry.pay_code}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            <p>Loading employee details...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          <Button variant="primary">Export Details</Button>
        </Modal.Footer>
      </Modal>

      {/* Processing Modal */}
      <Modal show={showProcessingModal} backdrop="static" centered>
        <Modal.Header>
          <Modal.Title>Processing Payroll</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>{processingStatus}</p>
          <ProgressBar now={processingProgress} />
        </Modal.Body>
      </Modal>
    </div>
  );
}
