import { useState } from 'react';
import { Card, Form, Button, Row, Col, Table, Badge } from 'react-bootstrap';
import { Download, FileText } from 'lucide-react';
import api from '../api/client';

export default function Reports() {
  const [reportType, setReportType] = useState('time-attendance');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/${reportType}`, {
        params: { startDate, endDate }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reports</h2>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Generate Report</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Report Type</Form.Label>
                <Form.Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="time-attendance">Time & Attendance</option>
                  <option value="leave">Leave Summary</option>
                  <option value="payroll">Payroll Summary</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>&nbsp;</Form.Label>
                <Button 
                  variant="primary" 
                  className="w-100"
                  onClick={generateReport}
                  disabled={loading || !startDate || !endDate}
                >
                  <FileText size={18} className="me-2" />
                  {loading ? 'Generating...' : 'Generate'}
                </Button>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {reportData && (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Report Results</h5>
            <Button variant="outline-primary" size="sm">
              <Download size={16} className="me-2" />
              Export
            </Button>
          </Card.Header>
          <Card.Body>
            {reportType === 'time-attendance' && reportData.summary && (
              <Row className="mb-3">
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4>{reportData.summary.totalEntries}</h4>
                    <small>Total Entries</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4>{reportData.summary.totalHours}</h4>
                    <small>Total Hours</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4>{reportData.summary.approvedHours}</h4>
                    <small>Approved Hours</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4>{reportData.summary.pendingEntries}</h4>
                    <small>Pending</small>
                  </div>
                </Col>
              </Row>
            )}

            {reportType === 'leave' && reportData.summary && (
              <Row className="mb-3">
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4>{reportData.summary.totalRequests}</h4>
                    <small>Total Requests</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4>{reportData.summary.totalDays}</h4>
                    <small>Total Days</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4>{reportData.summary.approvedDays}</h4>
                    <small>Approved Days</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4>{reportData.summary.pendingRequests}</h4>
                    <small>Pending</small>
                  </div>
                </Col>
              </Row>
            )}

            {reportType === 'payroll' && reportData.summary && (
              <Row className="mb-3">
                <Col md={6}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4>{reportData.summary.totalEmployees}</h4>
                    <small>Employees</small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4>R {reportData.summary.totalGrossPay}</h4>
                    <small>Total Gross Pay</small>
                  </div>
                </Col>
              </Row>
            )}

            <Table responsive hover>
              <thead>
                <tr>
                  {reportType === 'time-attendance' && (
                    <>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Hours</th>
                      <th>Status</th>
                    </>
                  )}
                  {reportType === 'leave' && (
                    <>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Status</th>
                    </>
                  )}
                  {reportType === 'payroll' && (
                    <>
                      <th>Employee #</th>
                      <th>Name</th>
                      <th>Regular Hrs</th>
                      <th>OT Hrs</th>
                      <th>Regular Pay</th>
                      <th>OT Pay</th>
                      <th>Gross Pay</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {reportType === 'time-attendance' && reportData.entries?.map((entry: any) => (
                  <tr key={entry.id}>
                    <td>{entry.first_name} {entry.last_name}</td>
                    <td>{new Date(entry.clock_in_time).toLocaleDateString()}</td>
                    <td>{new Date(entry.clock_in_time).toLocaleTimeString()}</td>
                    <td>{entry.clock_out_time ? new Date(entry.clock_out_time).toLocaleTimeString() : '-'}</td>
                    <td>{entry.total_hours}</td>
                    <td><Badge bg={entry.status === 'approved' ? 'success' : 'warning'}>{entry.status}</Badge></td>
                  </tr>
                ))}
                {reportType === 'leave' && reportData.requests?.map((request: any) => (
                  <tr key={request.id}>
                    <td>{request.first_name} {request.last_name}</td>
                    <td>{request.leave_type}</td>
                    <td>{new Date(request.start_date).toLocaleDateString()}</td>
                    <td>{new Date(request.end_date).toLocaleDateString()}</td>
                    <td>{request.days}</td>
                    <td><Badge bg={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}>{request.status}</Badge></td>
                  </tr>
                ))}
                {reportType === 'payroll' && reportData.employees?.map((emp: any) => (
                  <tr key={emp.id}>
                    <td>{emp.employee_number}</td>
                    <td>{emp.first_name} {emp.last_name}</td>
                    <td>{emp.regularHours}</td>
                    <td>{emp.overtimeHours}</td>
                    <td>R {emp.regularPay}</td>
                    <td>R {emp.overtimePay}</td>
                    <td><strong>R {emp.grossPay}</strong></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
