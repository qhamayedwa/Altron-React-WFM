import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table, Badge } from 'react-bootstrap';
import { Download, BarChart2, ArrowLeft, FileText, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface ReportEntry {
  username?: string;
  employee?: { username: string };
  total_entries?: number;
  total_hours: number;
  overtime_hours: number;
  work_date?: string;
  clock_in_time: string;
  clock_out_time?: string;
  total_break_minutes?: number;
  status: string;
  notes?: string;
}

interface ReportData {
  entries: ReportEntry[];
  summary: {
    total_hours: number;
    overtime_hours: number;
    total_entries: number;
    avg_hours: number;
  };
}

export default function Reports() {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    // Set default date range to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const generateReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!startDate || !endDate) {
      alert('Please select a date range first');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/reports/${reportType}`, {
        params: { 
          start_date: startDate, 
          end_date: endDate,
          type: reportType
        }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select a date range first');
      return;
    }

    try {
      const response = await api.get(`/reports/export-${reportType}-csv`, {
        params: { start_date: startDate, end_date: endDate },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export functionality will be implemented in future updates');
    }
  };

  const handleReportTypeChange = (newType: string) => {
    setReportType(newType);
    if (startDate && endDate) {
      // Auto-generate report when type changes
      setTimeout(() => {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        document.querySelector('form')?.dispatchEvent(event);
      }, 100);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const calculateTotals = () => {
    if (!reportData?.entries) return { totalEntries: 0, totalHours: 0, overtimeHours: 0, regularHours: 0 };
    
    const totalEntries = reportData.entries.reduce((sum, row) => sum + (row.total_entries || 1), 0);
    const totalHours = reportData.entries.reduce((sum, row) => sum + (row.total_hours || 0), 0);
    const overtimeHours = reportData.entries.reduce((sum, row) => sum + (row.overtime_hours || 0), 0);
    const regularHours = totalHours - overtimeHours;
    
    return { totalEntries, totalHours, overtimeHours, regularHours };
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'summary': return 'Employee Summary Report';
      case 'detailed': return 'Detailed Time Entries';
      case 'overtime': return 'Overtime Report';
      case 'exceptions': return 'Exceptions Report';
      default: return 'Report';
    }
  };

  const totals = calculateTotals();

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <BarChart2 size={28} className="me-2" style={{ color: '#28468D' }} />
          Time Attendance Reports
        </h2>
        <Button
          variant="outline-secondary"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={18} className="me-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Report Filters */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Report Parameters</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={generateReport}>
            <Row className="g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Report Type</Form.Label>
                  <Form.Select 
                    value={reportType} 
                    onChange={(e) => handleReportTypeChange(e.target.value)}
                  >
                    <option value="summary">Summary by Employee</option>
                    <option value="detailed">Detailed Time Entries</option>
                    <option value="overtime">Overtime Report</option>
                    <option value="exceptions">Exceptions Report</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
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
              <Col md={3}>
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
              <Col md={3} className="d-flex align-items-end">
                <Button 
                  type="submit"
                  variant="primary"
                  style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
                  className="me-2"
                  disabled={loading}
                >
                  <Search size={18} className="me-2" />
                  {loading ? 'Loading...' : 'Generate Report'}
                </Button>
                <Button 
                  variant="outline-success"
                  onClick={exportReport}
                  disabled={!reportData}
                >
                  <Download size={18} className="me-2" />
                  Export
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Report Results */}
      {reportData && reportData.entries && reportData.entries.length > 0 ? (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{getReportTitle()}</h5>
            <small className="text-muted">{startDate} to {endDate}</small>
          </Card.Header>
          <Card.Body>
            {reportType === 'summary' ? (
              /* Summary Report Table */
              <div className="table-responsive">
                <Table striped>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Total Entries</th>
                      <th>Regular Hours</th>
                      <th>Overtime Hours</th>
                      <th>Total Hours</th>
                      <th>Average Daily Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.entries.map((row, index) => {
                      const regularHours = (row.total_hours || 0) - (row.overtime_hours || 0);
                      const avgHours = (row.total_hours || 0) / (row.total_entries || 1);
                      return (
                        <tr key={index}>
                          <td><strong>{row.username}</strong></td>
                          <td>{row.total_entries || 0}</td>
                          <td>{regularHours.toFixed(2)}</td>
                          <td>{(row.overtime_hours || 0).toFixed(2)}</td>
                          <td><strong>{(row.total_hours || 0).toFixed(2)}</strong></td>
                          <td>{avgHours.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-secondary">
                    <tr>
                      <th>TOTALS</th>
                      <th>{totals.totalEntries}</th>
                      <th>{totals.regularHours.toFixed(2)}</th>
                      <th>{totals.overtimeHours.toFixed(2)}</th>
                      <th><strong>{totals.totalHours.toFixed(2)}</strong></th>
                      <th>-</th>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            ) : (
              /* Detailed Report Table */
              <div className="table-responsive">
                <Table striped size="sm">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Break</th>
                      <th>Hours</th>
                      <th>Overtime</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.entries.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.employee?.username || entry.username}</td>
                        <td>{entry.work_date ? formatDate(entry.work_date) : formatDate(entry.clock_in_time)}</td>
                        <td>{formatTime(entry.clock_in_time)}</td>
                        <td>
                          {entry.clock_out_time ? (
                            formatTime(entry.clock_out_time)
                          ) : (
                            <Badge bg="warning">Open</Badge>
                          )}
                        </td>
                        <td>{entry.total_break_minutes || 0}m</td>
                        <td>{entry.total_hours.toFixed(2)}</td>
                        <td>
                          {entry.overtime_hours && entry.overtime_hours > 0 ? (
                            <span className="text-warning">{entry.overtime_hours.toFixed(2)}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <Badge bg={
                            entry.status === 'approved' ? 'success' :
                            entry.status === 'clocked_in' ? 'primary' : 'warning'
                          }>
                            {entry.status}
                          </Badge>
                        </td>
                        <td>
                          {entry.notes ? (
                            entry.notes.length > 50 ? `${entry.notes.substring(0, 50)}...` : entry.notes
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {/* Report Statistics */}
            <Row className="mt-4">
              <Col md={3}>
                <Card className="bg-light">
                  <Card.Body className="text-center">
                    <h5 className="text-primary">
                      {reportType === 'summary' ? reportData.entries.length : reportData.entries.length}
                    </h5>
                    <small className="text-muted">
                      {reportType === 'summary' ? 'Employees' : 'Time Entries'}
                    </small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="bg-light">
                  <Card.Body className="text-center">
                    <h5 className="text-success">{totals.totalHours.toFixed(1)}</h5>
                    <small className="text-muted">Total Hours</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="bg-light">
                  <Card.Body className="text-center">
                    <h5 className="text-warning">{totals.overtimeHours.toFixed(1)}</h5>
                    <small className="text-muted">Overtime Hours</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="bg-light">
                  <Card.Body className="text-center">
                    <h5 className="text-info">
                      {(totals.totalHours / (reportData.entries.length || 1)).toFixed(1)}
                    </h5>
                    <small className="text-muted">Average Hours</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <FileText size={64} className="text-muted mb-3" />
            <h5>No Data Found</h5>
            <p className="text-muted">Select a date range and report type to generate a report.</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
