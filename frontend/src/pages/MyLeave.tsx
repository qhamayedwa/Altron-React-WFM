import { Card, Button, Row, Col } from 'react-bootstrap';
import { Briefcase, Plus, List, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyLeave() {
  const navigate = useNavigate();
  const leaveBalances = [
    { name: 'Annual Leave', balance: 15.0, used: 5.0, accrued: 20.0 },
    { name: 'Sick Leave', balance: 10.0, used: 2.0, accrued: 12.0 },
    { name: 'Personal Leave', balance: 5.0, used: 0.0, accrued: 5.0 },
  ];

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
              <Row>
                {leaveBalances.map((leave, index) => (
                  <Col md={4} key={index} className="mb-3">
                    <Card className="bg-light">
                      <Card.Body className="text-center">
                        <h6 className="card-title">{leave.name}</h6>
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Applications and Quick Actions */}
      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Leave Applications</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                <Calendar size={48} className="text-muted mb-3" />
                <h6>No Leave Applications</h6>
                <p className="text-muted">You haven't submitted any leave applications yet.</p>
                <Button variant="primary" onClick={() => navigate('/apply-leave')}>
                  Apply for Leave
                </Button>
              </div>
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
