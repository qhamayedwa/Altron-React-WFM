import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { CreditCard, Plus, Users, BarChart, Edit, Trash2, CheckCircle, AlertTriangle, Clock, Save, UserCheck, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface PayCode {
  id: number;
  code: string;
  name: string;
  description: string;
  hourly_rate: number | null;
  is_overtime: boolean;
  overtime_multiplier: number | null;
  is_active: boolean;
  is_absence_code: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface PayCodeStats {
  total_pay_codes: number;
  active_pay_codes: number;
  pay_codes_in_use: number;
  unassigned_employees: number;
}

const PayCodeConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const [payCodes, setPayCodes] = useState<PayCode[]>([]);
  const [stats, setStats] = useState<PayCodeStats>({
    total_pay_codes: 0,
    active_pay_codes: 0,
    pay_codes_in_use: 0,
    unassigned_employees: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPayCode, setEditingPayCode] = useState<PayCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    hourly_rate: '',
    is_overtime: false,
    overtime_multiplier: '1.5',
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [codesResponse, statsResponse] = await Promise.all([
        api.get('/pay-codes'),
        api.get('/pay-codes/statistics')
      ]);
      
      setPayCodes(Array.isArray(codesResponse.data) ? codesResponse.data : []);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading pay codes:', error);
      setError('Failed to load pay codes');
    } finally {
      setLoading(false);
    }
  };

  const handleShowCreate = () => {
    setEditingPayCode(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      hourly_rate: '',
      is_overtime: false,
      overtime_multiplier: '1.5',
      is_active: true
    });
    setShowModal(true);
  };

  const handleShowEdit = (payCode: PayCode) => {
    setEditingPayCode(payCode);
    setFormData({
      code: payCode.code,
      name: payCode.name || payCode.description,
      description: payCode.description || '',
      hourly_rate: payCode.hourly_rate?.toString() || '',
      is_overtime: payCode.is_overtime,
      overtime_multiplier: payCode.overtime_multiplier?.toString() || '1.5',
      is_active: payCode.is_active
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.name || formData.description,
        is_absence_code: false,
        is_active: formData.is_active,
        configuration: JSON.stringify({
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          is_overtime: formData.is_overtime,
          overtime_multiplier: formData.is_overtime ? parseFloat(formData.overtime_multiplier) : null
        })
      };

      if (editingPayCode) {
        await api.put(`/pay-codes/${editingPayCode.id}`, payload);
      } else {
        await api.post('/pay-codes', payload);
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving pay code:', error);
      setError('Failed to save pay code');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (payCode: PayCode) => {
    if (!confirm(`Are you sure you want to delete pay code "${payCode.code}"?`)) {
      return;
    }

    try {
      await api.delete(`/pay-codes/${payCode.id}`);
      loadData();
    } catch (error: any) {
      console.error('Error deleting pay code:', error);
      setError(error.response?.data?.error || 'Failed to delete pay code');
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'Not set';
    return `R ${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <CreditCard className="me-2" size={28} style={{ color: '#28468D' }} />
          Pay Code Administration
        </h2>
        <div className="btn-group">
          <Button variant="primary" onClick={handleShowCreate} style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}>
            <Plus className="me-2" size={16} />
            Create Pay Code
          </Button>
          <Button variant="outline-primary" onClick={() => navigate('/pay-codes/assign')} style={{ color: '#28468D', borderColor: '#28468D' }}>
            <Users className="me-2" size={16} />
            Assign to Employees
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate('/payroll/reports')}>
            <BarChart className="me-2" size={16} />
            Reports
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Overview */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-white" style={{ backgroundColor: '#28468D' }}>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h4 className="mb-0">{stats.total_pay_codes}</h4>
                  <small>Total Pay Codes</small>
                </div>
                <CreditCard size={32} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-success text-white">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h4 className="mb-0">{stats.active_pay_codes}</h4>
                  <small>Active Pay Codes</small>
                </div>
                <CheckCircle size={32} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white" style={{ backgroundColor: '#54B8DF' }}>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h4 className="mb-0">{stats.pay_codes_in_use}</h4>
                  <small>Pay Codes in Use</small>
                </div>
                <UserCheck size={32} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-warning text-white">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h4 className="mb-0">{stats.unassigned_employees}</h4>
                  <small>Unassigned Employees</small>
                </div>
                <AlertTriangle size={32} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pay Codes Table */}
      <Card>
        <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
          <h5 className="mb-0">
            <List className="me-2" size={20} style={{ color: '#28468D' }} />
            Pay Code Management
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped hover>
              <thead className="table-dark">
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Hourly Rate</th>
                  <th>Overtime</th>
                  <th>Employees Assigned</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payCodes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No pay codes found. Click "Create Pay Code" to add one.
                    </td>
                  </tr>
                ) : (
                  payCodes.map((payCode) => (
                    <tr key={payCode.id} className={!payCode.is_active ? 'table-secondary' : ''}>
                      <td>
                        <Badge bg="secondary">{payCode.code}</Badge>
                      </td>
                      <td>{payCode.name || payCode.description}</td>
                      <td>
                        <small className="text-muted">{payCode.description || '-'}</small>
                      </td>
                      <td>
                        {payCode.hourly_rate ? (
                          <span className="text-success">{formatCurrency(payCode.hourly_rate)}</span>
                        ) : (
                          <span className="text-muted">Not set</span>
                        )}
                      </td>
                      <td>
                        {payCode.is_overtime ? (
                          <Badge bg="warning" text="dark">
                            <Clock size={12} className="me-1" />
                            {payCode.overtime_multiplier}x
                          </Badge>
                        ) : (
                          <span className="text-muted">Regular</span>
                        )}
                      </td>
                      <td>
                        {payCode.usage_count > 0 ? (
                          <Badge bg="info">{payCode.usage_count} employees</Badge>
                        ) : (
                          <span className="text-muted">Not assigned</span>
                        )}
                      </td>
                      <td>
                        {payCode.is_active ? (
                          <Badge bg="success">Active</Badge>
                        ) : (
                          <Badge bg="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            title="Edit"
                            onClick={() => handleShowEdit(payCode)}
                          >
                            <Edit size={14} />
                          </Button>
                          {payCode.usage_count === 0 && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              title="Delete"
                              onClick={() => handleDelete(payCode)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPayCode ? (
              <>
                <Edit className="me-2" size={20} />
                Edit Pay Code: {editingPayCode.code}
              </>
            ) : (
              <>
                <Plus className="me-2" size={20} />
                Create New Pay Code
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Pay Code *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., REG001, OT150"
                  maxLength={20}
                  style={{ textTransform: 'uppercase' }}
                />
                <Form.Text className="text-muted">
                  Unique identifier for this pay code
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Display Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Regular Hours, Overtime 1.5x"
                  maxLength={100}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of when this pay code should be used"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Default Hourly Rate (R)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  placeholder="0.00"
                />
                <Form.Text className="text-muted">
                  Leave blank to use employee's rate
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3 mt-4">
                <Form.Check
                  type="checkbox"
                  id="is_overtime"
                  label={<strong>Overtime Pay Code</strong>}
                  checked={formData.is_overtime}
                  onChange={(e) => setFormData({ ...formData, is_overtime: e.target.checked })}
                />
              </Form.Group>
            </Col>
          </Row>

          {formData.is_overtime && (
            <Form.Group className="mb-3">
              <Form.Label>Overtime Multiplier</Form.Label>
              <Form.Select
                value={formData.overtime_multiplier}
                onChange={(e) => setFormData({ ...formData, overtime_multiplier: e.target.value })}
              >
                <option value="1.5">1.5x (Time and a Half)</option>
                <option value="2.0">2.0x (Double Time)</option>
                <option value="2.5">2.5x (Premium Rate)</option>
              </Form.Select>
            </Form.Group>
          )}

          {editingPayCode && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="is_active"
                label={<strong>Active Pay Code</strong>}
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Form.Text className="text-muted d-block">
                Inactive pay codes cannot be assigned to new employees
              </Form.Text>
            </Form.Group>
          )}

          <Alert variant="info">
            <strong>Pay Code Guidelines:</strong>
            <ul className="mb-0 mt-2">
              <li>Use clear, descriptive codes (REG001, OT150, SICK, etc.)</li>
              <li>Standard codes: NORMAL, OT1.5, OT2.0, SICK_PAY, VACATION</li>
              <li>Overtime codes automatically calculate enhanced pay rates</li>
              <li>Default hourly rates override employee rates when set</li>
            </ul>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            disabled={saving || !formData.code || !formData.name}
            style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="me-2" size={16} />
                {editingPayCode ? 'Update Pay Code' : 'Create Pay Code'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PayCodeConfiguration;
