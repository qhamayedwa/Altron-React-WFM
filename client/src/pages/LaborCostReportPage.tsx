import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Table, Badge } from 'react-bootstrap';
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { api } from '../lib/api';

export default function LaborCostReportPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    department_id: '',
    site_id: '',
  });

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reports/payroll-summary', { params: filters });
      setReportData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate labor cost report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1"><DollarSign className="me-2" size={28} />Labor Cost Analysis</h2>
          <p className="text-muted mb-0">Real-time labor cost and payroll analysis</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Report Parameters</h5>
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
                  <Form.Label>Department (Optional)</Form.Label>
                  <Form.Control
                    type="number"
                    value={filters.department_id}
                    onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
                    placeholder="All departments"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Site (Optional)</Form.Label>
                  <Form.Control
                    type="number"
                    value={filters.site_id}
                    onChange={(e) => setFilters({ ...filters, site_id: e.target.value })}
                    placeholder="All sites"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" onClick={generateReport} disabled={loading}>
              <BarChart3 className="me-2" size={18} />
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {reportData && (
        <>
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center bg-primary text-white">
                <Card.Body>
                  <h6>Total Labor Cost</h6>
                  <h2>{formatCurrency(reportData.total_cost || 0)}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-success text-white">
                <Card.Body>
                  <h6>Regular Hours Cost</h6>
                  <h2>{formatCurrency(reportData.regular_cost || 0)}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-warning text-white">
                <Card.Body>
                  <h6>Overtime Cost</h6>
                  <h2>{formatCurrency(reportData.overtime_cost || 0)}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-info text-white">
                <Card.Body>
                  <h6>Avg Cost/Employee</h6>
                  <h2>{formatCurrency(reportData.avg_cost_per_employee || 0)}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0"><TrendingUp className="me-2" size={20} />Cost Breakdown</h5>
                </Card.Header>
                <Card.Body>
                  <Table>
                    <tbody>
                      <tr>
                        <td><strong>Regular Hours</strong></td>
                        <td className="text-end">{reportData.total_regular_hours?.toFixed(2) || 0}h</td>
                        <td className="text-end"><Badge bg="success">{formatCurrency(reportData.regular_cost || 0)}</Badge></td>
                      </tr>
                      <tr>
                        <td><strong>Overtime Hours</strong></td>
                        <td className="text-end">{reportData.total_overtime_hours?.toFixed(2) || 0}h</td>
                        <td className="text-end"><Badge bg="warning">{formatCurrency(reportData.overtime_cost || 0)}</Badge></td>
                      </tr>
                      <tr>
                        <td><strong>Bonuses</strong></td>
                        <td className="text-end">-</td>
                        <td className="text-end"><Badge bg="info">{formatCurrency(reportData.bonuses || 0)}</Badge></td>
                      </tr>
                      <tr>
                        <td><strong>Deductions</strong></td>
                        <td className="text-end">-</td>
                        <td className="text-end"><Badge bg="danger">-{formatCurrency(reportData.deductions || 0)}</Badge></td>
                      </tr>
                      <tr className="table-primary">
                        <td><strong>Total</strong></td>
                        <td className="text-end"><strong>{reportData.total_hours?.toFixed(2) || 0}h</strong></td>
                        <td className="text-end"><strong>{formatCurrency(reportData.total_cost || 0)}</strong></td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Top 5 Cost Centers</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped>
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th className="text-end">Employees</th>
                        <th className="text-end">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.top_departments?.slice(0, 5).map((dept: any, idx: number) => (
                        <tr key={idx}>
                          <td>{dept.name}</td>
                          <td className="text-end">{dept.employee_count}</td>
                          <td className="text-end">{formatCurrency(dept.total_cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Department-wise Labor Cost</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Employees</th>
                    <th>Regular Hours</th>
                    <th>OT Hours</th>
                    <th>Total Hours</th>
                    <th>Total Cost</th>
                    <th>Cost/Hour</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.department_breakdown?.map((dept: any, idx: number) => (
                    <tr key={idx}>
                      <td><strong>{dept.name}</strong></td>
                      <td>{dept.employee_count}</td>
                      <td>{dept.regular_hours.toFixed(2)}h</td>
                      <td>{dept.overtime_hours.toFixed(2)}h</td>
                      <td><Badge bg="info">{dept.total_hours.toFixed(2)}h</Badge></td>
                      <td><strong>{formatCurrency(dept.total_cost)}</strong></td>
                      <td>{formatCurrency(dept.cost_per_hour)}</td>
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
