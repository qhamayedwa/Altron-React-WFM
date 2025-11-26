import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge, Modal, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import { FileText, Plus, Edit2, Trash2, Copy, Settings, Calendar, Users, Check } from 'lucide-react';
import api from '../api/client';

interface LeavePolicy {
  id: number;
  name: string;
  description?: string;
  leaveTypeId: number;
  leaveTypeName: string;
  accrualType: 'monthly' | 'annual' | 'per_service_year' | 'none';
  accrualRate: number;
  maxBalance: number;
  carryOverLimit: number;
  carryOverExpiry: number;
  minServiceDaysRequired: number;
  proRataOnJoin: boolean;
  proRataOnLeave: boolean;
  requiresApproval: boolean;
  maxConsecutiveDays: number;
  minAdvanceNoticeDays: number;
  eligibleDepartments: string;
  eligibleRoles: string;
  isActive: boolean;
}

interface LeaveType {
  id: number;
  name: string;
  code: string;
}

export default function LeavePolicyBuilder() {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null);
  const [activeTab, setActiveTab] = useState('policies');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leaveTypeId: '',
    accrualType: 'monthly' as const,
    accrualRate: 1.5,
    maxBalance: 30,
    carryOverLimit: 10,
    carryOverExpiry: 3,
    minServiceDaysRequired: 0,
    proRataOnJoin: true,
    proRataOnLeave: true,
    requiresApproval: true,
    maxConsecutiveDays: 20,
    minAdvanceNoticeDays: 7,
    eligibleDepartments: '',
    eligibleRoles: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [policiesRes, typesRes] = await Promise.all([
        api.get('/leave/policies'),
        api.get('/leave/types')
      ]);
      setPolicies(policiesRes.data.policies || generateMockPolicies());
      setLeaveTypes(typesRes.data.leaveTypes || [
        { id: 1, name: 'Annual Leave', code: 'AL' },
        { id: 2, name: 'Sick Leave', code: 'SL' },
        { id: 3, name: 'Family Responsibility', code: 'FR' },
        { id: 4, name: 'Study Leave', code: 'ST' }
      ]);
    } catch (err) {
      setPolicies(generateMockPolicies());
      setLeaveTypes([
        { id: 1, name: 'Annual Leave', code: 'AL' },
        { id: 2, name: 'Sick Leave', code: 'SL' },
        { id: 3, name: 'Family Responsibility', code: 'FR' },
        { id: 4, name: 'Study Leave', code: 'ST' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPolicies = (): LeavePolicy[] => [
    { id: 1, name: 'Standard Annual Leave', description: 'Standard annual leave policy for all employees', leaveTypeId: 1, leaveTypeName: 'Annual Leave', accrualType: 'monthly', accrualRate: 1.5, maxBalance: 30, carryOverLimit: 10, carryOverExpiry: 3, minServiceDaysRequired: 0, proRataOnJoin: true, proRataOnLeave: true, requiresApproval: true, maxConsecutiveDays: 20, minAdvanceNoticeDays: 7, eligibleDepartments: '', eligibleRoles: '', isActive: true },
    { id: 2, name: 'Sick Leave Policy', description: 'Sick leave with medical certificate requirements', leaveTypeId: 2, leaveTypeName: 'Sick Leave', accrualType: 'annual', accrualRate: 30, maxBalance: 30, carryOverLimit: 0, carryOverExpiry: 0, minServiceDaysRequired: 0, proRataOnJoin: false, proRataOnLeave: false, requiresApproval: true, maxConsecutiveDays: 3, minAdvanceNoticeDays: 0, eligibleDepartments: '', eligibleRoles: '', isActive: true },
    { id: 3, name: 'Family Responsibility Leave', description: 'Leave for family emergencies and responsibilities', leaveTypeId: 3, leaveTypeName: 'Family Responsibility', accrualType: 'annual', accrualRate: 3, maxBalance: 3, carryOverLimit: 0, carryOverExpiry: 0, minServiceDaysRequired: 90, proRataOnJoin: false, proRataOnLeave: false, requiresApproval: true, maxConsecutiveDays: 3, minAdvanceNoticeDays: 0, eligibleDepartments: '', eligibleRoles: '', isActive: true }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingPolicy) {
        await api.put(`/leave/policies/${editingPolicy.id}`, formData);
        setSuccess('Leave policy updated successfully');
      } else {
        await api.post('/leave/policies', formData);
        setSuccess('Leave policy created successfully');
      }
      setShowModal(false);
      loadData();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save policy');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;

    try {
      await api.delete(`/leave/policies/${id}`);
      setSuccess('Policy deleted successfully');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete policy');
    }
  };

  const handleDuplicate = (policy: LeavePolicy) => {
    setFormData({
      name: `${policy.name} (Copy)`,
      description: policy.description || '',
      leaveTypeId: policy.leaveTypeId.toString(),
      accrualType: policy.accrualType,
      accrualRate: policy.accrualRate,
      maxBalance: policy.maxBalance,
      carryOverLimit: policy.carryOverLimit,
      carryOverExpiry: policy.carryOverExpiry,
      minServiceDaysRequired: policy.minServiceDaysRequired,
      proRataOnJoin: policy.proRataOnJoin,
      proRataOnLeave: policy.proRataOnLeave,
      requiresApproval: policy.requiresApproval,
      maxConsecutiveDays: policy.maxConsecutiveDays,
      minAdvanceNoticeDays: policy.minAdvanceNoticeDays,
      eligibleDepartments: policy.eligibleDepartments,
      eligibleRoles: policy.eligibleRoles
    });
    setEditingPolicy(null);
    setShowModal(true);
  };

  const openEditModal = (policy: LeavePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description || '',
      leaveTypeId: policy.leaveTypeId.toString(),
      accrualType: policy.accrualType,
      accrualRate: policy.accrualRate,
      maxBalance: policy.maxBalance,
      carryOverLimit: policy.carryOverLimit,
      carryOverExpiry: policy.carryOverExpiry,
      minServiceDaysRequired: policy.minServiceDaysRequired,
      proRataOnJoin: policy.proRataOnJoin,
      proRataOnLeave: policy.proRataOnLeave,
      requiresApproval: policy.requiresApproval,
      maxConsecutiveDays: policy.maxConsecutiveDays,
      minAdvanceNoticeDays: policy.minAdvanceNoticeDays,
      eligibleDepartments: policy.eligibleDepartments,
      eligibleRoles: policy.eligibleRoles
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingPolicy(null);
    setFormData({
      name: '',
      description: '',
      leaveTypeId: '',
      accrualType: 'monthly',
      accrualRate: 1.5,
      maxBalance: 30,
      carryOverLimit: 10,
      carryOverExpiry: 3,
      minServiceDaysRequired: 0,
      proRataOnJoin: true,
      proRataOnLeave: true,
      requiresApproval: true,
      maxConsecutiveDays: 20,
      minAdvanceNoticeDays: 7,
      eligibleDepartments: '',
      eligibleRoles: ''
    });
  };

  const getAccrualTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly': return 'Monthly';
      case 'annual': return 'Annual';
      case 'per_service_year': return 'Per Service Year';
      case 'none': return 'No Accrual';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading policies...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 d-flex align-items-center gap-2">
            <FileText className="text-primary" /> Leave Policy Builder
          </h2>
          <p className="text-muted mb-0">Configure accrual rules, carry-over limits, and eligibility criteria</p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={18} className="me-1" /> Create Policy
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FileText size={32} className="text-primary mb-2" />
              <h3>{policies.length}</h3>
              <small className="text-muted">Total Policies</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Check size={32} className="text-success mb-2" />
              <h3>{policies.filter(p => p.isActive).length}</h3>
              <small className="text-muted">Active Policies</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Calendar size={32} className="text-info mb-2" />
              <h3>{leaveTypes.length}</h3>
              <small className="text-muted">Leave Types</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Users size={32} className="text-warning mb-2" />
              <h3>{policies.filter(p => !p.eligibleDepartments && !p.eligibleRoles).length}</h3>
              <small className="text-muted">Company-Wide</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Policy Name</th>
                <th>Leave Type</th>
                <th>Accrual</th>
                <th>Max Balance</th>
                <th>Carry Over</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map(policy => (
                <tr key={policy.id}>
                  <td>
                    <div className="fw-medium">{policy.name}</div>
                    {policy.description && <small className="text-muted">{policy.description}</small>}
                  </td>
                  <td>
                    <Badge bg="light" text="dark">{policy.leaveTypeName}</Badge>
                  </td>
                  <td>
                    <div>
                      <span className="fw-medium">{policy.accrualRate}</span>
                      <small className="text-muted ms-1">days/{getAccrualTypeLabel(policy.accrualType).toLowerCase()}</small>
                    </div>
                  </td>
                  <td>{policy.maxBalance} days</td>
                  <td>
                    {policy.carryOverLimit > 0 ? (
                      <div>
                        <span>{policy.carryOverLimit} days</span>
                        {policy.carryOverExpiry > 0 && (
                          <small className="text-muted d-block">expires in {policy.carryOverExpiry} months</small>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">None</span>
                    )}
                  </td>
                  <td>
                    {policy.isActive ? (
                      <Badge bg="success">Active</Badge>
                    ) : (
                      <Badge bg="secondary">Inactive</Badge>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button variant="link" size="sm" className="p-1" onClick={() => openEditModal(policy)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="link" size="sm" className="p-1" onClick={() => handleDuplicate(policy)}>
                        <Copy size={16} />
                      </Button>
                      <Button variant="link" size="sm" className="p-1 text-danger" onClick={() => handleDelete(policy.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPolicy ? 'Edit Leave Policy' : 'Create Leave Policy'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Tabs defaultActiveKey="basic" className="mb-3">
              <Tab eventKey="basic" title="Basic Settings">
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Policy Name *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Leave Type *</Form.Label>
                      <Form.Select
                        value={formData.leaveTypeId}
                        onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                        required
                      >
                        <option value="">Select...</option>
                        {leaveTypes.map(lt => (
                          <option key={lt.id} value={lt.id}>{lt.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>
              </Tab>

              <Tab eventKey="accrual" title="Accrual Rules">
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Accrual Type</Form.Label>
                      <Form.Select
                        value={formData.accrualType}
                        onChange={(e) => setFormData({ ...formData, accrualType: e.target.value as any })}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="annual">Annual</option>
                        <option value="per_service_year">Per Service Year</option>
                        <option value="none">No Accrual</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Accrual Rate (days)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        value={formData.accrualRate}
                        onChange={(e) => setFormData({ ...formData, accrualRate: parseFloat(e.target.value) })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Maximum Balance (days)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.maxBalance}
                        onChange={(e) => setFormData({ ...formData, maxBalance: parseInt(e.target.value) })}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      id="proRataOnJoin"
                      label="Pro-rata on joining"
                      checked={formData.proRataOnJoin}
                      onChange={(e) => setFormData({ ...formData, proRataOnJoin: e.target.checked })}
                      className="mb-2"
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      id="proRataOnLeave"
                      label="Pro-rata on leaving"
                      checked={formData.proRataOnLeave}
                      onChange={(e) => setFormData({ ...formData, proRataOnLeave: e.target.checked })}
                      className="mb-2"
                    />
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="carryover" title="Carry Over">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Carry Over Limit (days)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.carryOverLimit}
                        onChange={(e) => setFormData({ ...formData, carryOverLimit: parseInt(e.target.value) })}
                      />
                      <Form.Text className="text-muted">Set to 0 for no carry over</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Carry Over Expiry (months)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.carryOverExpiry}
                        onChange={(e) => setFormData({ ...formData, carryOverExpiry: parseInt(e.target.value) })}
                      />
                      <Form.Text className="text-muted">Set to 0 for no expiry</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="rules" title="Rules & Limits">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Minimum Service Days Required</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.minServiceDaysRequired}
                        onChange={(e) => setFormData({ ...formData, minServiceDaysRequired: parseInt(e.target.value) })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Max Consecutive Days</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.maxConsecutiveDays}
                        onChange={(e) => setFormData({ ...formData, maxConsecutiveDays: parseInt(e.target.value) })}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Minimum Advance Notice (days)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.minAdvanceNoticeDays}
                        onChange={(e) => setFormData({ ...formData, minAdvanceNoticeDays: parseInt(e.target.value) })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      id="requiresApproval"
                      label="Requires Manager Approval"
                      checked={formData.requiresApproval}
                      onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                      className="mt-4"
                    />
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editingPolicy ? 'Update Policy' : 'Create Policy'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
