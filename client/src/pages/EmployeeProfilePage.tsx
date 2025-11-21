import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Tab, Tabs, Table, Alert } from 'react-bootstrap';
import { User, Mail, Phone, Calendar, Clock, TrendingUp, FileText } from 'lucide-react';
import { api } from '../lib/api';

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchEmployeeData();
    }
  }, [id]);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const [profileRes, entriesRes, balanceRes] = await Promise.all([
        api.get(`/auth/profile`),
        api.get(`/time/entries`, { params: { user_id: id, per_page: 10 } }),
        api.get(`/leave/balances`, { params: { user_id: id } })
      ]);

      setEmployee(profileRes.data);
      setTimeEntries(entriesRes.data.entries || []);
      setLeaveBalance(balanceRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" />
      </Container>
    );
  }

  if (error || !employee) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error || 'Employee not found'}</Alert>
        <Button variant="secondary" onClick={() => navigate('/organization/users')}>
          Back to Users
        </Button>
      </Container>
    );
  }

  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
  const avgHoursPerDay = timeEntries.length > 0 ? totalHours / timeEntries.length : 0;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Button variant="outline-secondary" onClick={() => navigate(-1)} className="mb-3">
            ← Back
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Body className="text-center">
              <div className="mb-3">
                <User size={80} className="text-primary" />
              </div>
              <h3>{employee.first_name} {employee.last_name}</h3>
              <p className="text-muted">@{employee.username}</p>
              <Badge bg="primary" className="mb-2">{employee.role}</Badge>
              <hr />
              <div className="text-start">
                <p className="mb-2"><Mail size={16} className="me-2" />{employee.email}</p>
                {employee.phone && <p className="mb-2"><Phone size={16} className="me-2" />{employee.phone}</p>}
                <p className="mb-2"><strong>Employee ID:</strong> {employee.employee_number || 'N/A'}</p>
                <p className="mb-2"><strong>Department:</strong> {employee.department?.name || 'Unassigned'}</p>
                {employee.is_active ? (
                  <Badge bg="success">Active</Badge>
                ) : (
                  <Badge bg="secondary">Inactive</Badge>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Row className="mb-3">
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <Clock size={32} className="text-primary mb-2" />
                  <h6 className="text-muted">Total Hours (Last 10)</h6>
                  <h3>{totalHours.toFixed(2)}h</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <TrendingUp size={32} className="text-success mb-2" />
                  <h6 className="text-muted">Avg Hours/Day</h6>
                  <h3>{avgHoursPerDay.toFixed(2)}h</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <Calendar size={32} className="text-info mb-2" />
                  <h6 className="text-muted">Leave Balance</h6>
                  <h3>{leaveBalance.reduce((sum, b) => sum + b.balance, 0).toFixed(1)}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Body>
              <Tabs defaultActiveKey="time" className="mb-3">
                <Tab eventKey="time" title="Recent Time Entries">
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Hours</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeEntries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-muted">No time entries found</td>
                        </tr>
                      ) : (
                        timeEntries.map((entry) => (
                          <tr key={entry.id}>
                            <td>{new Date(entry.clock_in_time).toLocaleDateString()}</td>
                            <td>{new Date(entry.clock_in_time).toLocaleTimeString()}</td>
                            <td>{entry.clock_out_time ? new Date(entry.clock_out_time).toLocaleTimeString() : '-'}</td>
                            <td><Badge bg="info">{entry.total_hours?.toFixed(2) || 0}h</Badge></td>
                            <td>
                              <Badge bg={
                                entry.status === 'Approved' ? 'success' :
                                entry.status === 'Rejected' ? 'danger' :
                                entry.status === 'Closed' ? 'warning' : 'secondary'
                              }>
                                {entry.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Tab>

                <Tab eventKey="leave" title="Leave Balances">
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Leave Type</th>
                        <th>Balance</th>
                        <th>Used</th>
                        <th>Total Allocated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveBalance.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center text-muted">No leave balances found</td>
                        </tr>
                      ) : (
                        leaveBalance.map((balance: any) => (
                          <tr key={balance.id}>
                            <td>{balance.leave_type?.name || 'Unknown'}</td>
                            <td><Badge bg="success">{balance.balance.toFixed(1)} days</Badge></td>
                            <td>{balance.used.toFixed(1)} days</td>
                            <td>{balance.total_allocated.toFixed(1)} days</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Tab>

                <Tab eventKey="info" title="Employment Info">
                  <Table>
                    <tbody>
                      <tr>
                        <td><strong>Employee Number</strong></td>
                        <td>{employee.employee_number || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Email</strong></td>
                        <td>{employee.email}</td>
                      </tr>
                      <tr>
                        <td><strong>Phone</strong></td>
                        <td>{employee.phone || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Role</strong></td>
                        <td><Badge bg="primary">{employee.role}</Badge></td>
                      </tr>
                      <tr>
                        <td><strong>Department</strong></td>
                        <td>{employee.department?.name || 'Unassigned'}</td>
                      </tr>
                      <tr>
                        <td><strong>Status</strong></td>
                        <td>
                          {employee.is_active ? (
                            <Badge bg="success">Active</Badge>
                          ) : (
                            <Badge bg="secondary">Inactive</Badge>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
