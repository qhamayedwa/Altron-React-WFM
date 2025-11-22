import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table, Modal } from 'react-bootstrap';
import { TrendingUp, Filter, X, RefreshCw, Edit2 } from 'lucide-react';
import api from '../api/client';

interface LeaveBalance {
  id: number;
  userId: number;
  username: string;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  balance: number;
  accruedThisYear: number;
  usedThisYear: number;
  lastAccrualDate: string | null;
}

interface User {
  id: number;
  username: string;
  full_name: string;
}

interface LeaveType {
  id: number;
  name: string;
}

export default function LeaveBalances() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [userFilter, setUserFilter] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null);
  const [newBalance, setNewBalance] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balancesRes, usersRes, typesRes] = await Promise.all([
        api.get('/leave/balances'),
        api.get('/auth/users'),
        api.get('/leave/types')
      ]);
      
      setBalances(balancesRes.data);
      setUsers(usersRes.data);
      setLeaveTypes(typesRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    // Filtering would be done on backend in production
    loadData();
  };

  const handleClear = () => {
    setUserFilter('');
    setLeaveTypeFilter('');
    setYearFilter(new Date().getFullYear().toString());
    loadData();
  };

  const handleRunAccrual = async () => {
    if (!confirm('Run monthly leave accrual for all employees?')) return;
    
    try {
      await api.post('/leave/run-accrual');
      alert('Leave accrual completed successfully');
      loadData();
    } catch (err) {
      console.error('Failed to run accrual:', err);
      alert('Failed to run accrual');
    }
  };

  const showAdjustModal = (balance: LeaveBalance) => {
    setSelectedBalance(balance);
    setNewBalance(balance.balance.toFixed(1));
    setAdjustReason('');
    setShowModal(true);
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBalance) return;
    
    try {
      setAdjusting(true);
      await api.post(`/leave/balances/${selectedBalance.id}/adjust`, {
        newBalance: parseFloat(newBalance),
        reason: adjustReason
      });
      
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Failed to adjust balance:', err);
      alert('Failed to adjust balance');
    } finally {
      setAdjusting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return <span className="text-muted">Never</span>;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const filteredBalances = balances.filter(balance => {
    if (userFilter && balance.userId !== parseInt(userFilter)) return false;
    if (leaveTypeFilter && balance.leaveTypeId !== parseInt(leaveTypeFilter)) return false;
    return true;
  });

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <TrendingUp size={28} className="me-2" />
          Manage Leave Balances
        </h2>
        <Button variant="success" onClick={handleRunAccrual}>
          <RefreshCw size={18} className="me-2" />
          Run Accrual
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Label>Employee</Form.Label>
              <Form.Select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                <option value="">All Employees</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.full_name})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Leave Type</Form.Label>
              <Form.Select value={leaveTypeFilter} onChange={(e) => setLeaveTypeFilter(e.target.value)}>
                <option value="">All Leave Types</option>
                {leaveTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Year</Form.Label>
              <Form.Select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="outline-primary" onClick={handleFilter} className="me-2">
                <Filter size={16} className="me-1" />
                Filter
              </Button>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={handleClear}>
                <X size={16} className="me-1" />
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Balances Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">Loading...</div>
          ) : filteredBalances.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Current Balance</th>
                    <th>Accrued This Year</th>
                    <th>Used This Year</th>
                    <th>Last Accrual</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBalances.map(balance => (
                    <tr key={balance.id}>
                      <td>
                        <strong>{balance.username}</strong>
                        <br />
                        <small className="text-muted">{balance.employeeName}</small>
                      </td>
                      <td>{balance.leaveTypeName}</td>
                      <td>
                        <strong className="text-primary">{balance.balance.toFixed(1)}</strong> hours
                      </td>
                      <td>{balance.accruedThisYear.toFixed(1)} hours</td>
                      <td>{balance.usedThisYear.toFixed(1)} hours</td>
                      <td>{formatDate(balance.lastAccrualDate)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => showAdjustModal(balance)}
                        >
                          <Edit2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <TrendingUp size={64} className="text-muted mb-3" />
              <h5>No Leave Balances Found</h5>
              <p className="text-muted">
                {userFilter || leaveTypeFilter
                  ? 'No balances match the current filters.'
                  : 'No leave balances have been created yet.'}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Balance Management Info */}
      <div className="mt-4">
        <Card>
          <Card.Header>
            <h6 className="mb-0">Balance Management</h6>
          </Card.Header>
          <Card.Body>
            <small className="text-muted">
              <ul className="mb-0">
                <li><strong>Current Balance:</strong> Available leave hours for the employee</li>
                <li><strong>Accrued This Year:</strong> Total hours earned through accrual this year</li>
                <li><strong>Used This Year:</strong> Total hours deducted for approved leave</li>
                <li><strong>Adjust Balance:</strong> Manually modify balance for corrections or special allocations</li>
                <li><strong>Run Accrual:</strong> Process monthly accrual for all eligible employees</li>
              </ul>
            </small>
          </Card.Body>
        </Card>
      </div>

      {/* Adjust Balance Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adjust Leave Balance</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAdjustBalance}>
          <Modal.Body>
            {selectedBalance && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Employee & Leave Type</Form.Label>
                  <div className="form-control-plaintext">
                    {selectedBalance.username} - {selectedBalance.leaveTypeName}
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Current Balance</Form.Label>
                  <div className="form-control-plaintext">
                    {selectedBalance.balance.toFixed(1)} hours
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Balance *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.5"
                    min="0"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    required
                    disabled={adjusting}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Reason *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Reason for balance adjustment"
                    required
                    disabled={adjusting}
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={adjusting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={adjusting}>
              {adjusting ? 'Adjusting...' : 'Adjust Balance'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
