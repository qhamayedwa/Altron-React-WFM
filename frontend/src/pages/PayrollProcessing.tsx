import { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Alert, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Calendar, RefreshCw, Download, Settings, FileText, Printer, Users, Clock, TrendingUp, Eye, Filter, X } from 'lucide-react';
import api from '../api/client';

interface PayrollEntry {
  userId: number;
  employeeId: string;
  employeeName: string;
  username: string;
  regularHours: number;
  ot15Hours: number;
  ot20Hours: number;
  totalHours: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  payCodeBreakdown?: Record<string, any>;
}

interface PayCode {
  id: number;
  code: string;
  description: string;
}

export default function PayrollProcessing() {
  const navigate = useNavigate();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [payrollData, setPayrollData] = useState<PayrollEntry[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [availablePayCodes, setAvailablePayCodes] = useState<PayCode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    
    loadEmployees();
    loadPayCodes();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await api.get('/users/employees');
      setEmployees(response.data.employees || []);
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  };

  const loadPayCodes = async () => {
    try {
      const response = await api.get('/payroll/pay-codes');
      setAvailablePayCodes(response.data.payCodes || []);
    } catch (err) {
      console.error('Error loading pay codes:', err);
    }
  };

  const processPayroll = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/payroll/calculate', {
        startDate,
        endDate,
        employeeFilter: selectedEmployeeId || undefined
      });
      
      setPayrollData(response.data.payroll || []);
    } catch (err: any) {
      console.error('Error processing payroll:', err);
      alert(err.response?.data?.error || 'Failed to process payroll');
    } finally {
      setLoading(false);
    }
  };

  const exportPayroll = () => {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (selectedEmployeeId) {
      params.append('employee_filter', selectedEmployeeId);
    }
    
    window.open(`/api/v1/payroll/export?${params.toString()}`, '_blank');
  };

  const clearFilter = () => {
    setSelectedEmployeeId('');
    setEmployeeFilter('');
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  const totalHours = payrollData.reduce((sum, emp) => sum + emp.totalHours, 0);
  const totalOtHours = payrollData.reduce((sum, emp) => sum + emp.ot15Hours + emp.ot20Hours, 0);
  const totalGrossPay = payrollData.reduce((sum, emp) => sum + emp.grossPay, 0);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Payroll Processing</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0" style={{ background: 'none', padding: 0 }}>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>Dashboard</a>
                </li>
                <li className="breadcrumb-item active">Payroll Processing</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">
                <Calendar size={20} className="me-2" />
                Pay Period Selection
              </h5>
            </Card.Header>
            <Card.Body>
              <Form className="row g-3">
                <Col md={3}>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Filter by Employee</Form.Label>
                  <Form.Select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  >
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.username} - {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">Select specific employee or leave blank for all</Form.Text>
                </Col>
                <Col md={3}>
                  <Form.Label>&nbsp;</Form.Label>
                  <div className="d-grid gap-2">
                    <Button variant="primary" onClick={processPayroll} disabled={loading}>
                      <RefreshCw size={18} className="me-2" />
                      {loading ? 'Processing...' : 'Process Payroll'}
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => navigate('/payroll/configuration')}>
                      <Settings size={16} className="me-2" />
                      Configure Rates
                    </Button>
                  </div>
                </Col>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>

      {selectedEmployeeId && (
        <div className="row mb-3">
          <div className="col-12">
            <Alert variant="info" className="d-flex justify-content-between align-items-center">
              <div>
                <Filter size={18} className="me-2" />
                <strong>Active Filter:</strong> Showing payroll data for {employees.find(e => e.id === parseInt(selectedEmployeeId))?.username || selectedEmployeeId}
              </div>
              <Button variant="outline-secondary" size="sm" onClick={clearFilter}>
                <X size={16} className="me-1" />
                Clear Filter
              </Button>
            </Alert>
          </div>
        </div>
      )}

      {payrollData.length > 0 && (
        <>
          <div className="row mb-4">
            <Col md={3}>
              <Card>
                <Card.Body className="text-center">
                  <Users size={32} className="mb-2 text-primary" />
                  <h5 className="card-title">Total Employees</h5>
                  <h3 className="text-primary">{payrollData.length}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body className="text-center">
                  <Clock size={32} className="mb-2 text-success" />
                  <h5 className="card-title">Total Hours</h5>
                  <h3 className="text-success">{totalHours.toFixed(1)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body className="text-center">
                  <TrendingUp size={32} className="mb-2 text-warning" />
                  <h5 className="card-title">Overtime Hours</h5>
                  <h3 className="text-warning">{totalOtHours.toFixed(1)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body className="text-center">
                  <div className="mb-2 fw-bold text-danger" style={{ fontSize: '32px' }}>R</div>
                  <h5 className="card-title">Total Gross Pay</h5>
                  <h3 className="text-danger">{formatCurrency(totalGrossPay)}</h3>
                </Card.Body>
              </Card>
            </Col>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <Card>
                <Card.Header>
                  <h5 className="card-title mb-0">
                    <Download size={20} className="me-2" />
                    Export Options
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <Button variant="success" onClick={exportPayroll}>
                      <FileText size={18} className="me-2" />
                      Export to CSV
                    </Button>
                    <Button variant="outline-primary" onClick={() => window.print()}>
                      <Printer size={18} className="me-2" />
                      Print Report
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <Card>
                <Card.Header>
                  <h5 className="card-title mb-0">
                    <FileText size={20} className="me-2" />
                    Processed Payroll Data
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Regular Hours</th>
                          <th>OT 1.5x Hours</th>
                          <th>OT 2.0x Hours</th>
                          <th>Total Hours</th>
                          <th>Gross Pay</th>
                          <th>Deductions</th>
                          <th>Net Pay</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollData.map(employee => (
                          <tr key={employee.userId}>
                            <td>
                              <strong>{employee.employeeName}</strong>
                              <br /><small className="text-muted">{employee.username}</small>
                            </td>
                            <td>{employee.regularHours.toFixed(2)}</td>
                            <td>{employee.ot15Hours.toFixed(2)}</td>
                            <td>{employee.ot20Hours.toFixed(2)}</td>
                            <td><strong>{employee.totalHours.toFixed(2)}</strong></td>
                            <td className="text-success"><strong>{formatCurrency(employee.grossPay)}</strong></td>
                            <td className="text-warning">{formatCurrency(employee.deductions)}</td>
                            <td className="text-primary"><strong>{formatCurrency(employee.netPay)}</strong></td>
                            <td>
                              <Button variant="outline-info" size="sm">
                                <Eye size={14} className="me-1" />
                                Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </>
      )}

      {!loading && payrollData.length === 0 && (
        <div className="row">
          <div className="col-12">
            <Card>
              <Card.Body className="text-center py-5">
                <Calendar size={48} className="mb-3 text-muted" />
                <h5 className="text-muted">No Payroll Data Available</h5>
                <p className="text-muted">Select a pay period above to process payroll data.</p>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
