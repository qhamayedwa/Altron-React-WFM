import { useState } from 'react';
import { Card, Form, Button, Row, Col, Table } from 'react-bootstrap';
import { Calculator, Download } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function Payroll() {
  const { hasRole, isSuperUser } = useAuthStore();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [payrollData, setPayrollData] = useState<any>(null);

  const calculatePayroll = async () => {
    setLoading(true);
    try {
      const response = await api.post('/payroll/calculate', {
        startDate,
        endDate
      });
      setPayrollData(response.data);
    } catch (error) {
      console.error('Failed to calculate payroll:', error);
      alert('Failed to calculate payroll');
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole('Payroll') && !isSuperUser()) {
    return (
      <div>
        <h2 className="mb-4">Payroll</h2>
        <Card>
          <Card.Body>
            <p className="text-muted">You do not have permission to access payroll.</p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Payroll Management</h2>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Calculate Payroll</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
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
              <Form.Group className="mb-3">
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
              <Form.Group className="mb-3">
                <Form.Label>&nbsp;</Form.Label>
                <Button 
                  variant="primary" 
                  className="w-100"
                  onClick={calculatePayroll}
                  disabled={loading || !startDate || !endDate}
                >
                  <Calculator size={18} className="me-2" />
                  {loading ? 'Calculating...' : 'Calculate'}
                </Button>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {payrollData && (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Payroll Results</h5>
            <Button variant="outline-primary" size="sm">
              <Download size={16} className="me-2" />
              Export
            </Button>
          </Card.Header>
          <Card.Body>
            <Row className="mb-4">
              <Col md={6}>
                <div className="text-center p-3 bg-light rounded">
                  <h4>{payrollData.summary.totalEmployees}</h4>
                  <small>Total Employees</small>
                </div>
              </Col>
              <Col md={6}>
                <div className="text-center p-3 bg-light rounded">
                  <h4>R {payrollData.summary.totalGrossPay}</h4>
                  <small>Total Gross Pay</small>
                </div>
              </Col>
            </Row>

            <Table responsive hover>
              <thead>
                <tr>
                  <th>Employee #</th>
                  <th>Name</th>
                  <th>Base Rate</th>
                  <th>Regular Hours</th>
                  <th>OT Hours</th>
                  <th>Regular Pay</th>
                  <th>OT Pay</th>
                  <th>Gross Pay</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.payroll.map((emp: any) => (
                  <tr key={emp.userId}>
                    <td>{emp.employeeNumber}</td>
                    <td>{emp.firstName} {emp.lastName}</td>
                    <td>R {emp.baseRate.toFixed(2)}</td>
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
