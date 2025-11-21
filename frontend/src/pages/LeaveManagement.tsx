import { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Row, Col } from 'react-bootstrap';
import api from '../api/client';

export default function LeaveManagement() {
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestsRes, balancesRes] = await Promise.all([
        api.get('/leave/requests'),
        api.get('/leave/balance')
      ]);
      setRequests(requestsRes.data.leaveRequests);
      setBalances(balancesRes.data.balances);
    } catch (error) {
      console.error('Failed to load leave data:', error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Leave Management</h2>
        <Button variant="primary">Request Leave</Button>
      </div>

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Leave Balance</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {balances.map((balance: any, idx) => (
                  <Col md={3} key={idx} className="mb-3">
                    <div className="text-center">
                      <h4 className="text-primary">{balance.remainingDays}</h4>
                      <p className="mb-0 text-muted">{balance.leaveType}</p>
                      <small className="text-muted">of {balance.totalDays} days</small>
                    </div>
                  </Col>
                ))}
                {balances.length === 0 && (
                  <Col>
                    <p className="text-muted text-center">No leave balances available</p>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Leave Requests</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                requests.map((request: any) => (
                  <tr key={request.id}>
                    <td>{request.leaveType}</td>
                    <td>{new Date(request.startDate).toLocaleDateString()}</td>
                    <td>{new Date(request.endDate).toLocaleDateString()}</td>
                    <td>{request.days}</td>
                    <td>
                      <Badge bg={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}>
                        {request.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
