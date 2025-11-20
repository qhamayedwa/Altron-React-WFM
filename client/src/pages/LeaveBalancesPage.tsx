import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Spinner } from 'react-bootstrap';

interface LeaveBalance {
  id: number;
  balance: number;
  accrued_this_year: number | null;
  leave_types: {
    id: number;
    name: string;
  };
}

export default function LeaveBalancesPage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/leave/my-balances', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leave balances');
      }

      const data = await response.json();
      setBalances(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2 className="mb-4">My Leave Balances</h2>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Card>
            <Card.Header>
              <h5 className="mb-0">Leave Balances for {new Date().getFullYear()}</h5>
            </Card.Header>
            <Card.Body>
              {balances.length === 0 ? (
                <p className="text-muted">No leave balances found for the current year.</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Current Balance</th>
                      <th>Accrued This Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balances.map((balance) => (
                      <tr key={balance.id}>
                        <td>
                          <strong>{balance.leave_types.name}</strong>
                        </td>
                        <td>
                          <span className={balance.balance < 0 ? 'text-danger' : balance.balance === 0 ? 'text-warning' : 'text-success'}>
                            {balance.balance.toFixed(1)} days
                          </span>
                        </td>
                        <td>
                          {balance.accrued_this_year !== null ? (
                            <span>{balance.accrued_this_year.toFixed(1)} days</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
