import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../lib/api';

interface PayRule {
  id: number;
  name: string;
  description: string;
  priority: number;
  conditions: string;
  actions: string;
  is_active: boolean;
  created_at: string;
}

interface RuleConditions {
  day_of_week?: number[];
  time_range?: { start: number; end: number };
  overtime_threshold?: number;
  employee_ids?: number[];
  roles?: string[];
}

interface RuleActions {
  pay_multiplier?: number;
  flat_allowance?: number;
  shift_differential?: number;
  component_name?: string;
  allowance_name?: string;
  differential_name?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const AVAILABLE_ROLES = ['Super User', 'Manager', 'Employee', 'Admin', 'HR', 'Payroll'];

export default function PayRulesPage() {
  const [payRules, setPayRules] = useState<PayRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPayRule, setEditingPayRule] = useState<PayRule | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: '100',
    day_of_week: [] as number[],
    time_range_enabled: false,
    time_start: '0',
    time_end: '23',
    overtime_threshold: '',
    employee_ids: '',
    roles: [] as string[],
    pay_multiplier: '',
    flat_allowance: '',
    shift_differential: '',
    component_name: '',
    allowance_name: '',
    differential_name: '',
  });

  useEffect(() => {
    loadPayRules();
  }, [filterStatus]);

  const loadPayRules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page: 1, per_page: 100 };
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      const response = await api.get('/payroll/pay-rules', { params });
      setPayRules(response.data.data.pay_rules);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pay rules');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (payRule: PayRule | null = null) => {
    if (payRule) {
      setEditingPayRule(payRule);
      const conditions: RuleConditions = JSON.parse(payRule.conditions);
      const actions: RuleActions = JSON.parse(payRule.actions);
      
      setFormData({
        name: payRule.name,
        description: payRule.description,
        priority: payRule.priority.toString(),
        day_of_week: conditions.day_of_week || [],
        time_range_enabled: !!conditions.time_range,
        time_start: conditions.time_range?.start.toString() || '0',
        time_end: conditions.time_range?.end.toString() || '23',
        overtime_threshold: conditions.overtime_threshold?.toString() || '',
        employee_ids: conditions.employee_ids?.join(', ') || '',
        roles: conditions.roles || [],
        pay_multiplier: actions.pay_multiplier?.toString() || '',
        flat_allowance: actions.flat_allowance?.toString() || '',
        shift_differential: actions.shift_differential?.toString() || '',
        component_name: actions.component_name || '',
        allowance_name: actions.allowance_name || '',
        differential_name: actions.differential_name || '',
      });
    } else {
      setEditingPayRule(null);
      setFormData({
        name: '',
        description: '',
        priority: '100',
        day_of_week: [],
        time_range_enabled: false,
        time_start: '0',
        time_end: '23',
        overtime_threshold: '',
        employee_ids: '',
        roles: [],
        pay_multiplier: '',
        flat_allowance: '',
        shift_differential: '',
        component_name: '',
        allowance_name: '',
        differential_name: '',
      });
    }
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPayRule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const conditions: RuleConditions = {};
      if (formData.day_of_week.length > 0) {
        conditions.day_of_week = formData.day_of_week;
      }
      if (formData.time_range_enabled) {
        conditions.time_range = {
          start: parseInt(formData.time_start),
          end: parseInt(formData.time_end),
        };
      }
      if (formData.overtime_threshold) {
        conditions.overtime_threshold = parseFloat(formData.overtime_threshold);
      }
      if (formData.employee_ids.trim()) {
        conditions.employee_ids = formData.employee_ids.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
      }
      if (formData.roles.length > 0) {
        conditions.roles = formData.roles;
      }

      const actions: RuleActions = {};
      if (formData.pay_multiplier) {
        actions.pay_multiplier = parseFloat(formData.pay_multiplier);
        if (formData.component_name) {
          actions.component_name = formData.component_name;
        }
      }
      if (formData.flat_allowance) {
        actions.flat_allowance = parseFloat(formData.flat_allowance);
        if (formData.allowance_name) {
          actions.allowance_name = formData.allowance_name;
        }
      }
      if (formData.shift_differential) {
        actions.shift_differential = parseFloat(formData.shift_differential);
        if (formData.differential_name) {
          actions.differential_name = formData.differential_name;
        }
      }

      if (Object.keys(conditions).length === 0) {
        setError('At least one condition must be specified');
        return;
      }

      if (Object.keys(actions).length === 0) {
        setError('At least one action must be specified');
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        priority: parseInt(formData.priority),
        conditions,
        actions,
      };

      if (editingPayRule) {
        await api.patch(`/payroll/pay-rules/${editingPayRule.id}`, payload);
        setSuccess(`Pay rule "${formData.name}" updated successfully`);
      } else {
        await api.post('/payroll/pay-rules', payload);
        setSuccess(`Pay rule "${formData.name}" created successfully`);
      }

      handleCloseModal();
      loadPayRules();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save pay rule');
    }
  };

  const handleToggleStatus = async (payRule: PayRule) => {
    try {
      setError(null);
      const response = await api.post(`/payroll/pay-rules/${payRule.id}/toggle`);
      setSuccess(response.data.message);
      loadPayRules();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle pay rule status');
    }
  };

  const handleDelete = async (payRule: PayRule) => {
    if (!confirm(`Are you sure you want to delete rule "${payRule.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/payroll/pay-rules/${payRule.id}`);
      setSuccess(`Pay rule "${payRule.name}" deleted successfully`);
      loadPayRules();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete pay rule');
    }
  };

  const handleMovePriority = async (payRule: PayRule, direction: 'up' | 'down') => {
    const currentIndex = payRules.findIndex((r) => r.id === payRule.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= payRules.length) return;

    const reordered = [...payRules];
    [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];

    const ruleOrders = reordered.map((rule, index) => ({
      id: rule.id,
      priority: index * 10,
    }));

    try {
      setError(null);
      await api.post('/payroll/pay-rules/reorder', { rule_orders: ruleOrders });
      setSuccess('Rule priorities updated successfully');
      loadPayRules();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reorder rules');
    }
  };

  const renderConditionsSummary = (conditionsJson: string) => {
    const conditions: RuleConditions = JSON.parse(conditionsJson);
    const parts: string[] = [];

    if (conditions.day_of_week && conditions.day_of_week.length > 0) {
      const days = conditions.day_of_week.map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label || d).join(', ');
      parts.push(`Days: ${days}`);
    }
    if (conditions.time_range) {
      parts.push(`Time: ${conditions.time_range.start}:00-${conditions.time_range.end}:00`);
    }
    if (conditions.overtime_threshold !== undefined) {
      parts.push(`OT > ${conditions.overtime_threshold}h`);
    }
    if (conditions.employee_ids && conditions.employee_ids.length > 0) {
      parts.push(`Employees: ${conditions.employee_ids.length}`);
    }
    if (conditions.roles && conditions.roles.length > 0) {
      parts.push(`Roles: ${conditions.roles.join(', ')}`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'No conditions';
  };

  const renderActionsSummary = (actionsJson: string) => {
    const actions: RuleActions = JSON.parse(actionsJson);
    const parts: string[] = [];

    if (actions.pay_multiplier) {
      parts.push(`${actions.pay_multiplier}x multiplier`);
    }
    if (actions.flat_allowance) {
      parts.push(`R${actions.flat_allowance} allowance`);
    }
    if (actions.shift_differential) {
      parts.push(`R${actions.shift_differential}/h differential`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'No actions';
  };

  const handleDayToggle = (day: number) => {
    if (formData.day_of_week.includes(day)) {
      setFormData({ ...formData, day_of_week: formData.day_of_week.filter((d) => d !== day) });
    } else {
      setFormData({ ...formData, day_of_week: [...formData.day_of_week, day] });
    }
  };

  const handleRoleToggle = (role: string) => {
    if (formData.roles.includes(role)) {
      setFormData({ ...formData, roles: formData.roles.filter((r) => r !== role) });
    } else {
      setFormData({ ...formData, roles: [...formData.roles, role] });
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2>Pay Rules Management</h2>
          <p className="text-muted">Configure automated payroll calculation rules with conditions and actions</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <i className="bi bi-plus-circle me-2"></i>
            Create Pay Rule
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Alert variant="info" className="mb-0">
                <small>
                  <strong>Rules are applied in priority order (top to bottom).</strong> Lower priority numbers execute first.
                </small>
              </Alert>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : payRules.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox display-1"></i>
              <p className="mt-3">No pay rules found</p>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Priority</th>
                  <th>Rule Name</th>
                  <th>Conditions</th>
                  <th>Actions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payRules.map((payRule, index) => (
                  <tr key={payRule.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <Badge bg="secondary" className="me-2">{payRule.priority}</Badge>
                        <div className="btn-group-vertical btn-group-sm">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled={index === 0}
                            onClick={() => handleMovePriority(payRule, 'up')}
                            style={{ padding: '0 4px', fontSize: '10px' }}
                          >
                            <i className="bi bi-chevron-up"></i>
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled={index === payRules.length - 1}
                            onClick={() => handleMovePriority(payRule, 'down')}
                            style={{ padding: '0 4px', fontSize: '10px' }}
                          >
                            <i className="bi bi-chevron-down"></i>
                          </Button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{payRule.name}</strong>
                      <br />
                      <small className="text-muted">{payRule.description}</small>
                    </td>
                    <td>
                      <small>{renderConditionsSummary(payRule.conditions)}</small>
                    </td>
                    <td>
                      <small>{renderActionsSummary(payRule.actions)}</small>
                    </td>
                    <td>
                      <Badge bg={payRule.is_active ? 'success' : 'secondary'}>
                        {payRule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleOpenModal(payRule)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant={payRule.is_active ? 'outline-warning' : 'outline-success'}
                        size="sm"
                        className="me-2"
                        onClick={() => handleToggleStatus(payRule)}
                      >
                        <i className={`bi bi-${payRule.is_active ? 'pause' : 'play'}-circle`}></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(payRule)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{editingPayRule ? 'Edit Pay Rule' : 'Create Pay Rule'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Rule Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Weekend Overtime, Night Shift Differential"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="1000"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    required
                  />
                  <Form.Text>Lower number = higher priority</Form.Text>
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
                placeholder="Describe when this rule should apply"
              />
            </Form.Group>

            <hr />
            <h6>Conditions (at least one required)</h6>

            <Form.Group className="mb-3">
              <Form.Label>Days of Week</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Form.Check
                    key={day.value}
                    type="checkbox"
                    id={`day-${day.value}`}
                    label={day.label}
                    checked={formData.day_of_week.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Time Range"
                checked={formData.time_range_enabled}
                onChange={(e) => setFormData({ ...formData, time_range_enabled: e.target.checked })}
              />
            </Form.Group>

            {formData.time_range_enabled && (
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Start Hour (0-23)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="23"
                      value={formData.time_start}
                      onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>End Hour (0-23)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="23"
                      value={formData.time_end}
                      onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Overtime Threshold (hours)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.overtime_threshold}
                    onChange={(e) => setFormData({ ...formData, overtime_threshold: e.target.value })}
                    placeholder="e.g., 8"
                  />
                  <Form.Text>Apply if hours exceed this threshold</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employee IDs (comma-separated)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.employee_ids}
                    onChange={(e) => setFormData({ ...formData, employee_ids: e.target.value })}
                    placeholder="e.g., 1, 5, 12"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Employee Roles</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {AVAILABLE_ROLES.map((role) => (
                  <Form.Check
                    key={role}
                    type="checkbox"
                    id={`role-${role}`}
                    label={role}
                    checked={formData.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                  />
                ))}
              </div>
            </Form.Group>

            <hr />
            <h6>Actions (at least one required)</h6>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Pay Multiplier</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.pay_multiplier}
                    onChange={(e) => setFormData({ ...formData, pay_multiplier: e.target.value })}
                    placeholder="e.g., 1.5 for time-and-a-half"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Component Name (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.component_name}
                    onChange={(e) => setFormData({ ...formData, component_name: e.target.value })}
                    placeholder="e.g., overtime_hours"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Flat Allowance (ZAR)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.flat_allowance}
                    onChange={(e) => setFormData({ ...formData, flat_allowance: e.target.value })}
                    placeholder="e.g., 150"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Allowance Name (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.allowance_name}
                    onChange={(e) => setFormData({ ...formData, allowance_name: e.target.value })}
                    placeholder="e.g., transport_allowance"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Shift Differential (ZAR/hour)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.shift_differential}
                    onChange={(e) => setFormData({ ...formData, shift_differential: e.target.value })}
                    placeholder="e.g., 25"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Differential Name (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.differential_name}
                    onChange={(e) => setFormData({ ...formData, differential_name: e.target.value })}
                    placeholder="e.g., night_shift_diff"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingPayRule ? 'Update' : 'Create'} Pay Rule
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
