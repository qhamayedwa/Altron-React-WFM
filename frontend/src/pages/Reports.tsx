import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table, Badge } from 'react-bootstrap';
import { 
  Clock, TrendingUp, Users, Calendar, Search, 
  FileText, Download, Printer, BarChart2, Home 
} from 'lucide-react';
import api from '../api/client';

interface AttendanceSummary {
  username: string;
  email: string;
  total_days: number;
  total_hours: number;
  avg_hours: number;
}

interface PayPeriodSummary {
  period_start: string;
  period_end: string;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  gross_pay: number;
}

export default function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [payPeriodSummary, setPayPeriodSummary] = useState<PayPeriodSummary[]>([]);

  useEffect(() => {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    setEndDate(endDate.toISOString().split('T')[0]);
    setStartDate(startDate.toISOString().split('T')[0]);
  }, []);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/reports/attendance', {
        params: { start_date: startDate, end_date: endDate }
      });
      
      if (response.data) {
        setTotalHours(response.data.total_hours || 0);
        setOvertimeHours(response.data.overtime_hours || 0);
        setAttendanceSummary(response.data.attendance_summary || []);
        setPayPeriodSummary(response.data.pay_period_summary || []);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    window.location.href = `/api/reports/export/csv?start_date=${startDate}&end_date=${endDate}`;
  };

  const exportPayrollCSV = () => {
    window.location.href = `/api/reports/export/payroll-csv?start_date=${startDate}&end_date=${endDate}`;
  };

  const printReport = () => {
    window.print();
  };

  const generateDetailedReport = () => {
    const totalEmployees = attendanceSummary.length;
    const avgHoursPerEmployee = totalEmployees > 0 ? (totalHours / totalEmployees).toFixed(1) : 0;
    const overtimePercentage = totalHours > 0 ? ((overtimeHours / totalHours) * 100).toFixed(1) : 0;
    const productivityLevel = totalHours > 160 ? 'High' : totalHours > 80 ? 'Normal' : 'Low';

    let analysisText = `Detailed Analysis Summary:\n\n`;
    analysisText += `Total Active Employees: ${totalEmployees}\n`;
    analysisText += `Total Hours Worked: ${totalHours.toFixed(2)}\n`;
    analysisText += `Overtime Hours: ${overtimeHours.toFixed(2)}\n`;
    analysisText += `Average Hours per Employee: ${avgHoursPerEmployee}\n\n`;
    
    if (totalHours > 0) {
      analysisText += `Performance Insights:\n`;
      if (overtimeHours > 0) {
        analysisText += `• ${overtimePercentage}% of total hours are overtime\n`;
      }
      analysisText += `• Average productivity level: ${productivityLevel}\n`;
    }
    
    alert(analysisText);
  };

  const getActivityBadge = (hours: number) => {
    if (hours > 160) return <Badge bg="success">High Activity</Badge>;
    if (hours > 80) return <Badge bg="primary">Normal</Badge>;
    return <Badge bg="warning">Low Activity</Badge>;
  };

  const hasData = attendanceSummary.length > 0 || payPeriodSummary.length > 0;

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">Reports & Analytics</h1>
              <p className="text-muted mb-0">Time & Attendance Summary</p>
            </div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/">Dashboard</a>
                </li>
                <li className="breadcrumb-item active">Reports</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <Card>
            <Card.Body>
              <Form onSubmit={(e) => { e.preventDefault(); generateReport(); }}>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>&nbsp;</Form.Label>
                      <div className="d-grid">
                        <Button 
                          type="submit"
                          variant="primary" 
                          disabled={loading}
                          style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
                        >
                          <Search size={16} className="me-2" />
                          {loading ? 'Generating...' : 'Generate Report'}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="row mb-4">
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <Clock size={32} className="mb-2" style={{ color: '#0d6efd' }} />
              <h5 className="card-title">Total Hours</h5>
              <h3 className="text-primary">{totalHours.toFixed(2)}</h3>
              <small className="text-muted">Current Period</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <TrendingUp size={32} className="mb-2" style={{ color: '#198754' }} />
              <h5 className="card-title">Overtime Hours</h5>
              <h3 className="text-success">{overtimeHours.toFixed(2)}</h3>
              <small className="text-muted">Extra Time</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <Users size={32} className="mb-2" style={{ color: '#20c997' }} />
              <h5 className="card-title">Active Employees</h5>
              <h3 className="text-info">{attendanceSummary.length}</h3>
              <small className="text-muted">With Time Entries</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <Calendar size={32} className="mb-2" style={{ color: '#ffc107' }} />
              <h5 className="card-title">Total Days</h5>
              <h3 className="text-warning">{attendanceSummary.length}</h3>
              <small className="text-muted">Attendance Days</small>
            </Card.Body>
          </Card>
        </Col>
      </div>

      {/* Employee Attendance Summary */}
      {attendanceSummary.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <Card>
              <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                <h5 className="card-title mb-0">
                  <Users size={20} className="me-2" />
                  Employee Attendance Summary
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped className="mb-0">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Total Days</th>
                        <th>Total Hours</th>
                        <th>Average Hours/Day</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceSummary.map((summary, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{summary.username}</strong>
                            {summary.email && (
                              <>
                                <br />
                                <small className="text-muted">{summary.email}</small>
                              </>
                            )}
                          </td>
                          <td>{summary.total_days}</td>
                          <td>{summary.total_hours.toFixed(2)} hrs</td>
                          <td>{summary.avg_hours.toFixed(2)} hrs</td>
                          <td>{getActivityBadge(summary.total_hours)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}

      {/* Pay Period Summary */}
      {payPeriodSummary.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <Card>
              <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                <h5 className="card-title mb-0">
                  <span className="me-2 fw-bold text-success">R</span>
                  Pay Period Summary
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped className="mb-0">
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Regular Hours</th>
                        <th>Overtime Hours</th>
                        <th>Total Hours</th>
                        <th>Gross Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payPeriodSummary.map((period, index) => (
                        <tr key={index}>
                          <td>
                            {new Date(period.period_start).toLocaleDateString()} - {new Date(period.period_end).toLocaleDateString()}
                          </td>
                          <td>{period.regular_hours.toFixed(2)} hrs</td>
                          <td>{period.overtime_hours.toFixed(2)} hrs</td>
                          <td>{period.total_hours.toFixed(2)} hrs</td>
                          <td>R{period.gross_pay.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!hasData && !loading && startDate && endDate && (
        <div className="row">
          <div className="col-12">
            <Card>
              <Card.Body className="text-center py-5">
                <BarChart2 size={48} className="mb-3" style={{ color: '#6c757d' }} />
                <h5 className="text-muted">No Report Data Available</h5>
                <p className="text-muted">
                  Select a date range above or ensure time entries exist for the selected period.
                </p>
                <a href="/" className="btn btn-primary" style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}>
                  <Home size={16} className="me-2" />
                  Back to Dashboard
                </a>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="row mt-4">
        <div className="col-12">
          <Card>
            <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
              <h5 className="card-title mb-0">
                <Download size={20} className="me-2" />
                Export Options
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Export report data in various formats for further analysis.</p>
              <Row>
                <Col md={6}>
                  <div className="d-grid gap-2">
                    <Button 
                      variant="outline-primary" 
                      onClick={exportCSV}
                      style={{ borderColor: '#28468D', color: '#28468D' }}
                    >
                      <FileText size={16} className="me-2" />
                      Export Attendance to CSV
                    </Button>
                    <Button 
                      variant="outline-success" 
                      onClick={exportPayrollCSV}
                    >
                      <span className="me-2 fw-bold text-success">R</span>
                      Export Payroll to CSV
                    </Button>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-grid gap-2">
                    <Button 
                      variant="outline-secondary" 
                      onClick={printReport}
                    >
                      <Printer size={16} className="me-2" />
                      Print Report
                    </Button>
                    <Button 
                      variant="outline-info" 
                      onClick={generateDetailedReport}
                    >
                      <BarChart2 size={16} className="me-2" />
                      Detailed Analysis
                    </Button>
                  </div>
                </Col>
              </Row>
              <small className="text-muted d-block mt-2">
                Click the buttons above to export reports or generate detailed analysis.
              </small>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
