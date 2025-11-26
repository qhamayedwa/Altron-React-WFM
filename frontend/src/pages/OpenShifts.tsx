import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import { Shuffle, Clock, Users, Check, X, Calendar, ArrowRightLeft, Plus, Eye } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

interface OpenShift {
  id: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  departmentId: number;
  departmentName: string;
  siteId?: number;
  siteName?: string;
  requiredSkills?: string[];
  status: 'open' | 'pending' | 'filled';
  applicants: number;
  createdAt: string;
}

interface ShiftSwap {
  id: number;
  requesterId: number;
  requesterName: string;
  targetUserId?: number;
  targetUserName?: string;
  originalShiftId: number;
  originalShiftDate: string;
  originalStartTime: string;
  originalEndTime: string;
  targetShiftId?: number;
  targetShiftDate?: string;
  targetStartTime?: string;
  targetEndTime?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function OpenShifts() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [openShifts, setOpenShifts] = useState<OpenShift[]>([]);
  const [swapRequests, setSwapRequests] = useState<ShiftSwap[]>([]);
  const [activeTab, setActiveTab] = useState('open-shifts');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<OpenShift | null>(null);
  const [selectedSwap, setSelectedSwap] = useState<ShiftSwap | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newShift, setNewShift] = useState({
    shiftDate: '',
    startTime: '08:00',
    endTime: '17:00',
    departmentId: ''
  });

  const isManager = user?.roles?.some(r => ['Manager', 'Super User', 'Admin'].includes(r));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shiftsRes, swapsRes] = await Promise.all([
        api.get('/scheduling/open-shifts'),
        api.get('/scheduling/swap-requests')
      ]);
      setOpenShifts(shiftsRes.data.openShifts || generateMockOpenShifts());
      setSwapRequests(swapsRes.data.swapRequests || generateMockSwaps());
    } catch (err) {
      setOpenShifts(generateMockOpenShifts());
      setSwapRequests(generateMockSwaps());
    } finally {
      setLoading(false);
    }
  };

  const generateMockOpenShifts = (): OpenShift[] => {
    const today = new Date();
    return [
      { id: 1, shiftDate: new Date(today.getTime() + 86400000).toISOString(), startTime: '08:00', endTime: '16:00', departmentId: 1, departmentName: 'Operations', siteName: 'Head Office', status: 'open', applicants: 2, createdAt: today.toISOString() },
      { id: 2, shiftDate: new Date(today.getTime() + 172800000).toISOString(), startTime: '14:00', endTime: '22:00', departmentId: 2, departmentName: 'Customer Service', siteName: 'Branch A', status: 'open', applicants: 0, createdAt: today.toISOString() },
      { id: 3, shiftDate: new Date(today.getTime() + 259200000).toISOString(), startTime: '06:00', endTime: '14:00', departmentId: 1, departmentName: 'Operations', siteName: 'Head Office', status: 'pending', applicants: 3, createdAt: today.toISOString() }
    ];
  };

  const generateMockSwaps = (): ShiftSwap[] => {
    const today = new Date();
    return [
      { id: 1, requesterId: 3, requesterName: 'Sarah Johnson', targetUserId: 5, targetUserName: 'Mike Brown', originalShiftId: 10, originalShiftDate: new Date(today.getTime() + 86400000).toISOString(), originalStartTime: '08:00', originalEndTime: '16:00', targetShiftId: 11, targetShiftDate: new Date(today.getTime() + 172800000).toISOString(), targetStartTime: '14:00', targetEndTime: '22:00', reason: 'Medical appointment', status: 'pending', createdAt: today.toISOString() },
      { id: 2, requesterId: 7, requesterName: 'Emma Wilson', originalShiftId: 12, originalShiftDate: new Date(today.getTime() + 259200000).toISOString(), originalStartTime: '06:00', originalEndTime: '14:00', reason: 'Family commitment', status: 'pending', createdAt: today.toISOString() }
    ];
  };

  const handleApplyForShift = async () => {
    if (!selectedShift) return;
    
    try {
      await api.post(`/scheduling/open-shifts/${selectedShift.id}/apply`);
      setSuccess('Applied for shift successfully');
      setShowApplyModal(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to apply for shift');
    }
  };

  const handleSwapAction = async (swapId: number, action: 'approve' | 'reject') => {
    try {
      await api.post(`/scheduling/swap-requests/${swapId}/${action}`);
      setSuccess(`Swap request ${action}d successfully`);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${action} swap request`);
    }
  };

  const handleCreateOpenShift = async () => {
    try {
      await api.post('/scheduling/open-shifts', newShift);
      setSuccess('Open shift created successfully');
      setShowCreateModal(false);
      setNewShift({ shiftDate: '', startTime: '08:00', endTime: '17:00', departmentId: '' });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create open shift');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge bg="success">Open</Badge>;
      case 'pending': return <Badge bg="warning">Pending Review</Badge>;
      case 'filled': return <Badge bg="secondary">Filled</Badge>;
      case 'approved': return <Badge bg="success">Approved</Badge>;
      case 'rejected': return <Badge bg="danger">Rejected</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading shifts...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 d-flex align-items-center gap-2">
            <Shuffle className="text-primary" /> Open Shifts & Swap Management
          </h2>
          <p className="text-muted mb-0">Manage shift availability and swap requests</p>
        </div>
        {isManager && (
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} className="me-1" /> Create Open Shift
          </Button>
        )}
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Clock size={32} className="text-primary mb-2" />
              <h3>{openShifts.filter(s => s.status === 'open').length}</h3>
              <small className="text-muted">Available Shifts</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <ArrowRightLeft size={32} className="text-warning mb-2" />
              <h3>{swapRequests.filter(s => s.status === 'pending').length}</h3>
              <small className="text-muted">Pending Swaps</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Users size={32} className="text-success mb-2" />
              <h3>{openShifts.reduce((sum, s) => sum + s.applicants, 0)}</h3>
              <small className="text-muted">Total Applicants</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'open-shifts')}>
            <Tab eventKey="open-shifts" title={`Open Shifts (${openShifts.length})`} />
            <Tab eventKey="swap-requests" title={`Swap Requests (${swapRequests.length})`} />
          </Tabs>
        </Card.Header>
        <Card.Body className="p-0">
          {activeTab === 'open-shifts' && (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Applicants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {openShifts.map(shift => (
                  <tr key={shift.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Calendar size={16} className="text-muted" />
                        {formatDate(shift.shiftDate)}
                      </div>
                    </td>
                    <td>
                      <Badge bg="light" text="dark">
                        {shift.startTime} - {shift.endTime}
                      </Badge>
                    </td>
                    <td>{shift.departmentName}</td>
                    <td>{shift.siteName || '-'}</td>
                    <td>{getStatusBadge(shift.status)}</td>
                    <td>
                      <Badge bg={shift.applicants > 0 ? 'info' : 'secondary'}>
                        {shift.applicants}
                      </Badge>
                    </td>
                    <td>
                      {shift.status === 'open' && !isManager && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => { setSelectedShift(shift); setShowApplyModal(true); }}
                        >
                          Apply
                        </Button>
                      )}
                      {isManager && (
                        <Button variant="link" size="sm" className="p-0">
                          <Eye size={16} /> View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {openShifts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No open shifts available
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}

          {activeTab === 'swap-requests' && (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Requester</th>
                  <th>Original Shift</th>
                  <th>Target Shift</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {swapRequests.map(swap => (
                  <tr key={swap.id}>
                    <td>{swap.requesterName}</td>
                    <td>
                      <div>
                        <small className="text-muted">{formatDate(swap.originalShiftDate)}</small>
                        <div>{swap.originalStartTime} - {swap.originalEndTime}</div>
                      </div>
                    </td>
                    <td>
                      {swap.targetShiftDate ? (
                        <div>
                          <small className="text-muted">{formatDate(swap.targetShiftDate)}</small>
                          <div>{swap.targetStartTime} - {swap.targetEndTime}</div>
                          {swap.targetUserName && <small>with {swap.targetUserName}</small>}
                        </div>
                      ) : (
                        <span className="text-muted">Any available</span>
                      )}
                    </td>
                    <td><small>{swap.reason}</small></td>
                    <td>{getStatusBadge(swap.status)}</td>
                    <td>
                      {swap.status === 'pending' && isManager && (
                        <div className="d-flex gap-1">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleSwapAction(swap.id, 'approve')}
                          >
                            <Check size={14} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleSwapAction(swap.id, 'reject')}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {swapRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No swap requests
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Apply for Shift</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedShift && (
            <div>
              <p>Are you sure you want to apply for this shift?</p>
              <div className="p-3 bg-light rounded">
                <div><strong>Date:</strong> {formatDate(selectedShift.shiftDate)}</div>
                <div><strong>Time:</strong> {selectedShift.startTime} - {selectedShift.endTime}</div>
                <div><strong>Department:</strong> {selectedShift.departmentName}</div>
                <div><strong>Location:</strong> {selectedShift.siteName || 'Not specified'}</div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApplyModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleApplyForShift}>Confirm Application</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Open Shift</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(e) => { e.preventDefault(); handleCreateOpenShift(); }}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Shift Date</Form.Label>
              <Form.Control
                type="date"
                value={newShift.shiftDate}
                onChange={(e) => setNewShift({ ...newShift, shiftDate: e.target.value })}
                required
              />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Shift</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
