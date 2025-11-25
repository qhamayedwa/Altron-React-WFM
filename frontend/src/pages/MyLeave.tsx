import { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, Spinner, Table } from 'react-bootstrap';
import { Briefcase, Plus, List, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface LeaveApplication {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

interface LeaveBalance {
  id: number;
  leaveType: string;
  leaveTypeCode: string;
  balance: number;
  accrued: number;
  used: number;
  year: number;
}

export default function MyLeave() {
  const navigate = useNavigate();
  const [recentApplications, setRecentApplications] = useState<LeaveApplication[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [balancesLoading, setBalancesLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadRecentApplications(),
      loadLeaveBalances()
    ]);
  };

  const loadRecentApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leave/requests');
      const all = response.data.leaveRequests || [];
      setRecentApplications(all.slice(0, 5));
    } catch (error) {
      console.error('Failed to load recent applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveBalances = async () => {
    try {
      setBalancesLoading(true);
      const response = await api.get('/leave/balance');
      setLeaveBalances(response.data.balances || []);
    } catch (error) {
      console.error('Failed to load leave balances:', error);
    } finally {
      setBalancesLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <Badge bg={statusMap[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Briefcase size={28} className="me-2" />
          My Leave Dashboard
        </h2>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => navigate('/apply-leave')}>
            <Plus size={18} className="me-2" />
            Apply for Leave
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate('/my-applications')}>
            <List size={18} className="me-2" />
            View Applications
          </Button>
        </div>
      </div>

      {/* Leave Balances */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Leave Balances ({new Date().getFullYear()})</h5>
            </Card.Header>
            <Card.Body>
              {balancesLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <p className="mt-2 text-muted">Loading balances...</p>
                </div>
              ) : leaveBalances.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No leave balances available</p>
                </div>
              ) : (
                <Row>
                  {leaveBalances.map((leave, index) => (
                    <Col md={4} key={index} className="mb-3">
                      <Card className="bg-light">
                        <Card.Body className="text-center">
                          <h6 className="card-title">{leave.leaveType}</h6>
                          <h4 className="text-primary">{leave.balance.toFixed(1)}</h4>
                          <p className="text-muted mb-0">Hours Available</p>
                          <small className="text-muted">
                            Used: {leave.used.toFixed(1)}h | Accrued: {leave.accrued.toFixed(1)}h
                          </small>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Applications and Quick Actions */}
      <Row>
        <Col md={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Leave Applications</h5>
              <Button variant="outline-secondary" size="sm" onClick={() => navigate('/my-applications')}>
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <p className="mt-2 text-muted">Loading...</p>
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar size={48} className="text-muted mb-3" />
                  <h6>No Leave Applications</h6>
                  <p className="text-muted">You haven't submitted any leave applications yet.</p>
                  <Button variant="primary" onClick={() => navigate('/apply-leave')}>
                    Apply for Leave
                  </Button>
                </div>
              ) : (
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((app) => (
                      <tr key={app.id}>
                        <td>{app.leaveType}</td>
                        <td>
                          {formatDate(app.startDate)} - {formatDate(app.endDate)}
                        </td>
                        <td>{getStatusBadge(app.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col md={4}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" onClick={() => navigate('/apply-leave')}>
                  <Plus size={18} className="me-2" />
                  Apply for Leave
                </Button>
                <Button variant="outline-secondary" onClick={() => navigate('/my-applications')}>
                  <List size={18} className="me-2" />
                  View All Applications
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">Leave Policy</h6>
            </Card.Header>
            <Card.Body>
              <small className="text-muted">
                <ul className="mb-0">
                  <li>Leave applications must be submitted in advance</li>
                  <li>Manager approval required for most leave types</li>
                  <li>Check your balance before applying</li>
                  <li>Contact HR for policy questions</li>
                </ul>
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
