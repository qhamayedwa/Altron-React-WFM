import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Table, Badge } from 'react-bootstrap';
import { FileText, Download, Calendar, Users } from 'lucide-react';
import { api } from '../lib/api';

export default function AttendanceReportsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    user_id: '',
    department_id: '',
  });

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reports/attendance', { params: filters });
      setReportData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await api.get('/reports/time-entries/csv', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${filters.start_date}-to-${filters.end_date}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('Failed to export CSV');
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1"><FileText className="me-2" size={28} />Attendance Reports</h2>
          <p className="text-muted mb-0">Generate detailed attendance and timesheet reports</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Report Filters</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Employee ID (Optional)</Form.Label>
                  <Form.Control
                    type="number"
                    value={filters.user_id}
                    onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
                    placeholder="All employees"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Department ID (Optional)</Form.Label>
                  <Form.Control
                    type="number"
                    value={filters.department_id}
                    onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
                    placeholder="All departments"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" onClick={generateReport} disabled={loading} className="me-2">
              <Calendar className="me-2" size={18} />
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
            {reportData && (
              <Button variant="success" onClick={exportCSV}>
                <Download className="me-2" size={18} />
                Export CSV
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>

      {reportData && (
        <>
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-muted">Total Employees</h6>
                  <h2 className="text-primary">{reportData.total_employees || 0}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-muted">Total Hours</h6>
                  <h2 className="text-success">{reportData.total_hours?.toFixed(2) || 0}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-muted">Avg Hours/Employee</h6>
                  <h2 className="text-info">{reportData.avg_hours_per_employee?.toFixed(2) || 0}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-muted">Attendance Rate</h6>
                  <h2 className="text-warning">{reportData.attendance_rate?.toFixed(1) || 0}%</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header>
              <h5 className="mb-0"><Users className="me-2" size={20} />Employee Details</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Days Worked</th>
                    <th>Total Hours</th>
                    <th>Avg Hours/Day</th>
                    <th>Late Count</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.employee_details?.map((emp: any, idx: number) => (
                    <tr key={idx}>
                      <td>{emp.name}</td>
                      <td>{emp.department || '-'}</td>
                      <td>{emp.days_worked}</td>
                      <td><Badge bg="info">{emp.total_hours.toFixed(2)}h</Badge></td>
                      <td>{emp.avg_hours_per_day.toFixed(2)}h</td>
                      <td>{emp.late_count > 0 ? <Badge bg="warning">{emp.late_count}</Badge> : '-'}</td>
                      <td>
                        <Badge bg={emp.status === 'Good' ? 'success' : emp.status === 'Warning' ? 'warning' : 'danger'}>
                          {emp.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}
