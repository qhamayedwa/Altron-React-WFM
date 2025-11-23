import { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Play, Download, BarChart2, RefreshCw, CheckSquare, AlertTriangle, Eye, Edit, Check } from 'lucide-react';
import api from '../api/client';

interface EmployeePayroll {
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

export default function PayrollPreparation() {
  const navigate = useNavigate();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [payrollData, setPayrollData] = useState<EmployeePayroll[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary>({
    totalEmployees: 0,
    totalHours: 0,
    overtimeHours: 0,
    grossPay: 0
  });
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
      const response = await api.post('/payroll/prepare', { startDate, endDate });
      setPayrollData(response.data.payrollData || []);
      setPayrollSummary(response.data.summary || { totalEmployees: 0, totalHours: 0, overtimeHours: 0, grossPay: 0 });
    } catch (err) {
      console.error('Error loading payroll data:', err);
      alert('Failed to load payroll data');
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

  const toggleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const selectAllEmployees = () => {
    setSelectedEmployees(payrollData.map(emp => emp.employeeId));
  };

  const flagExceptions = () => {
    const exceptionEmployees = payrollData.filter(emp => emp.hasExceptions).map(emp => emp.employeeId);
    setSelectedEmployees(exceptionEmployees);
  };

  const processPayroll = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee to process');
      return;
    }

    if (!window.confirm(`Process payroll for ${selectedEmployees.length} employees?`)) {
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
        startDate,
        endDate,
        employeeIds: selectedEmployees
      });

      setProcessingStatus('Payroll processing completed successfully!');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowProcessingModal(false);
      loadPayrollData();
    } catch (err) {
      console.error('Error processing payroll:', err);
      alert('Failed to process payroll');
      setShowProcessingModal(false);
    }
  };

  const exportPayroll = () => {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (selectedEmployees.length > 0) {
      params.append('employees', selectedEmployees.join(','));
    }
    
    window.open(`/api/v1/payroll/export?${params.toString()}`, '_blank');
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Payroll Preparation</h2>
            <div className="d-flex gap-2">
              <Button variant="success" onClick={processPayroll}>
                <Play size={18} className="me-2" />
                Process Payroll
              </Button>
              <Button variant="outline-primary" onClick={exportPayroll}>
                <Download size={18} className="me-2" />
                Export Data
              </Button>
              <Button variant="outline-info" onClick={() => navigate('/payroll/processing')}>
                <BarChart2 size={18} className="me-2" />
                View Reports
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Pay Period Selection</h6>
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </Form.Group>
                </div>
              </div>
              <Button variant="primary" onClick={loadPayrollData} disabled={loading}>
                <RefreshCw size={18} className="me-2" />
                {loading ? 'Loading...' : 'Load Payroll Data'}
              </Button>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Payroll Summary</h6>
            </Card.Header>
            <Card.Body>
              <div className="row text-center">
                <div className="col-3">
                  <strong>{payrollSummary.totalEmployees}</strong><br />
                  <small className="text-muted">Employees</small>
                </div>
                <div className="col-3">
                  <strong>{payrollSummary.totalHours.toFixed(1)}</strong><br />
                  <small className="text-muted">Total Hours</small>
                </div>
                <div className="col-3">
                  <strong>{payrollSummary.overtimeHours.toFixed(1)}</strong><br />
                  <small className="text-muted">OT Hours</small>
                </div>
                <div className="col-3">
                  <strong>R{payrollSummary.grossPay.toFixed(2)}</strong><br />
                  <small className="text-muted">Gross Pay</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Employee Payroll Data</h5>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm" onClick={selectAllEmployees}>
                  <CheckSquare size={16} className="me-1" />
                  Select All
                </Button>
                <Button variant="outline-warning" size="sm" onClick={flagExceptions}>
                  <AlertTriangle size={16} className="me-1" />
                  Flag Exceptions
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {payrollData.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>
                          <Form.Check
                            type="checkbox"
                            checked={selectedEmployees.length === payrollData.length}
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
                      {payrollData.map(emp => (
                        <tr key={emp.employeeId} className={emp.hasExceptions ? 'table-warning' : ''}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedEmployees.includes(emp.employeeId)}
                              onChange={() => toggleEmployeeSelection(emp.employeeId)}
                            />
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                <Badge bg="primary">{emp.firstName[0]}{emp.lastName[0]}</Badge>
                              </div>
                              <div>
                                <strong>{emp.firstName} {emp.lastName}</strong><br />
                                <small className="text-muted">{emp.username}</small>
                              </div>
                            </div>
                          </td>
                          <td>{emp.regularHours.toFixed(2)}</td>
                          <td>{emp.overtimeHours.toFixed(2)}</td>
                          <td>R{emp.baseRate.toFixed(2)}</td>
                          <td>R{emp.regularPay.toFixed(2)}</td>
                          <td>R{emp.overtimePay.toFixed(2)}</td>
                          <td><strong>R{emp.grossPay.toFixed(2)}</strong></td>
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
                              <Button variant="outline-primary" size="sm">
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
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted py-5">No payroll data available for selected period</div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <Modal show={showProcessingModal} backdrop="static" centered>
        <Modal.Header>
          <Modal.Title>Processing Payroll</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>{processingStatus}</p>
          <div className="progress">
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ width: `${processingProgress}%` }}
              aria-valuenow={processingProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
