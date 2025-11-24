import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table, Badge } from 'react-bootstrap';
import { Download, FileText, Clock, TrendingUp, Users, Calendar, BarChart2, Home, Printer } from 'lucide-react';
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

interface ReportData {
  total_hours: number;
  overtime_hours: number;
  attendance_summary: AttendanceSummary[];
  pay_period_summary: PayPeriodSummary[];
}

export default function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const response = await api.get('/reports/attendance', {
        params: { start_date: startDate, end_date: endDate }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const generateDetailedAnalysis = () => {
    if (!reportData) return;

    const totalEmployees = reportData.attendance_summary?.length || 0;
    const totalHours = reportData.total_hours || 0;
    const overtimeHours = reportData.overtime_hours || 0;
    
    let analysisText = `Detailed Analysis Summary:\n\n`;
    analysisText += `Total Active Employees: ${totalEmployees}\n`;
    analysisText += `Total Hours Worked: ${totalHours.toFixed(2)}\n`;
    analysisText += `Overtime Hours: ${overtimeHours.toFixed(2)}\n`;
    analysisText += `Average Hours per Employee: ${totalEmployees > 0 ? (totalHours/totalEmployees).toFixed(1) : 0}\n\n`;
    
    if (totalHours > 0) {
      analysisText += `Performance Insights:\n`;
      if (overtimeHours > 0) {
        analysisText += `• ${((overtimeHours/totalHours)*100).toFixed(1)}% of total hours are overtime\n`;
      }
      analysisText += `• Average productivity level: ${totalHours > 160 ? 'High' : totalHours > 80 ? 'Normal' : 'Low'}\n`;
    }
    
    alert(analysisText);
  };

  const exportToCSV = async (type: 'attendance' | 'payroll') => {
    try {
      const response = await api.get(`/reports/export-${type}-csv`, {
        params: { start_date: startDate, end_date: endDate },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Failed to export ${type} to CSV:`, error);
      alert(`Failed to export ${type} to CSV`);
    }
  };

  const getActivityBadge = (hours: number) => {
    if (hours > 160) {
      return <Badge bg="success">High Activity</Badge>;
    } else if (hours > 80) {
      return <Badge bg="primary">Normal</Badge>;
    } else {
      return <Badge bg="warning">Low Activity</Badge>;
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Reports & Analytics</h1>
        </div>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><a href="/">Dashboard</a></li>
            <li className="breadcrumb-item active">Reports</li>
          </ol>
        </nav>
      </div>

      {/* Date Range Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <Card>
            <Card.Body>
              <Form onSubmit={generateReport}>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
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
                        required
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
                          style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
                          disabled={loading}
                        >
                          <FileText size={18} className="me-2" />
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
      {reportData && (
        <>
          <Row className="mb-4">
            <Col md={3}>
              <Card>
                <Card.Body className="text-center">
                  <Clock size={32} className="mb-2" style={{ color: '#0d6efd' }} />
                  <h5 className="card-title">Total Hours</h5>
                  <h3 className="text-primary">{reportData.total_hours?.toFixed(2) || '0.00'}</h3>
                  <small className="text-muted">Current Period</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body className="text-center">
                  <TrendingUp size={32} className="mb-2" style={{ color: '#198754' }} />
                  <h5 className="card-title">Overtime Hours</h5>
                  <h3 className="text-success">{reportData.overtime_hours?.toFixed(2) || '0.00'}</h3>
                  <small className="text-muted">Extra Time</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body className="text-center">
                  <Users size={32} className="mb-2" style={{ color: '#20c997' }} />
                  <h5 className="card-title">Active Employees</h5>
                  <h3 className="text-info">{reportData.attendance_summary?.length || 0}</h3>
                  <small className="text-muted">With Time Entries</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body className="text-center">
                  <Calendar size={32} className="mb-2" style={{ color: '#ffc107' }} />
                  <h5 className="card-title">Total Days</h5>
                  <h3 className="text-warning">{reportData.attendance_summary?.length || 0}</h3>
                  <small className="text-muted">Attendance Days</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Employee Attendance Summary */}
          {reportData.attendance_summary && reportData.attendance_summary.length > 0 && (
            <Row className="mb-4">
              <Col xs={12}>
                <Card>
                  <Card.Header>
                    <h5 className="card-title mb-0">
                      <Users size={20} className="me-2" />
                      Employee Attendance Summary
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table striped hover>
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
                          {reportData.attendance_summary.map((summary, index) => (
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
              </Col>
            </Row>
          )}

          {/* Pay Period Summary */}
          {reportData.pay_period_summary && reportData.pay_period_summary.length > 0 && (
            <Row className="mb-4">
              <Col xs={12}>
                <Card>
                  <Card.Header>
                    <h5 className="card-title mb-0">
                      <span className="me-2 fw-bold" style={{ color: '#198754' }}>R</span>
                      Pay Period Summary
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table striped hover>
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
                          {reportData.pay_period_summary.map((period, index) => (
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
              </Col>
            </Row>
          )}

          {/* Export Options */}
          <Row>
            <Col xs={12}>
              <Card>
                <Card.Header>
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
                          onClick={() => exportToCSV('attendance')}
                        >
                          <FileText size={18} className="me-2" />
                          Export Attendance to CSV
                        </Button>
                        <Button 
                          variant="outline-success"
                          onClick={() => exportToCSV('payroll')}
                        >
                          <span className="me-2 fw-bold" style={{ color: '#198754' }}>R</span>
                          Export Payroll to CSV
                        </Button>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-grid gap-2">
                        <Button 
                          variant="outline-secondary"
                          onClick={handlePrint}
                        >
                          <Printer size={18} className="me-2" />
                          Print Report
                        </Button>
                        <Button 
                          variant="outline-info"
                          onClick={generateDetailedAnalysis}
                        >
                          <BarChart2 size={18} className="me-2" />
                          Detailed Analysis
                        </Button>
                      </div>
                    </Col>
                  </Row>
                  <small className="text-muted">Click the buttons above to export reports or generate detailed analysis.</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* No Data Message */}
      {!reportData && !loading && (
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <BarChart2 size={48} className="mb-3 text-muted" />
                <h5 className="text-muted">No Report Data Available</h5>
                <p className="text-muted">Select a date range above or ensure time entries exist for the selected period.</p>
                <a href="/" className="btn btn-primary" style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}>
                  <Home size={18} className="me-2" />
                  Back to Dashboard
                </a>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
