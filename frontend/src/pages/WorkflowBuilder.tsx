import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge, Modal, Alert, Spinner } from 'react-bootstrap';
import { GitBranch, Plus, Edit2, Trash2, Play, Pause, Settings, ArrowRight, Users, CheckCircle } from 'lucide-react';
import api from '../api/client';

interface ApprovalStep {
  id: number;
  order: number;
  approverType: 'manager' | 'role' | 'user' | 'auto';
  approverId?: number;
  approverRole?: string;
  approverName?: string;
  timeoutHours: number;
  escalateOnTimeout: boolean;
  escalateTo?: string;
}

interface ApprovalWorkflow {
  id: number;
  name: string;
  description?: string;
  entityType: 'leave_request' | 'time_entry' | 'schedule_change' | 'expense';
  isActive: boolean;
  steps: ApprovalStep[];
  conditions?: string;
  createdAt: string;
}

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<ApprovalWorkflow | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entityType: 'leave_request' as const,
    isActive: true,
    steps: [{ order: 1, approverType: 'manager' as const, timeoutHours: 48, escalateOnTimeout: true }]
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organization/approval-workflows');
      setWorkflows(response.data.workflows || generateMockWorkflows());
    } catch (err) {
      setWorkflows(generateMockWorkflows());
    } finally {
      setLoading(false);
    }
  };

  const generateMockWorkflows = (): ApprovalWorkflow[] => [
    {
      id: 1,
      name: 'Standard Leave Approval',
      description: 'Manager approval required for all leave requests',
      entityType: 'leave_request',
      isActive: true,
      steps: [
        { id: 1, order: 1, approverType: 'manager', timeoutHours: 48, escalateOnTimeout: true, escalateTo: 'HR Manager' }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Extended Leave Workflow',
      description: 'Multi-level approval for leave > 5 days',
      entityType: 'leave_request',
      isActive: true,
      steps: [
        { id: 2, order: 1, approverType: 'manager', timeoutHours: 24, escalateOnTimeout: true },
        { id: 3, order: 2, approverType: 'role', approverRole: 'HR Manager', timeoutHours: 48, escalateOnTimeout: false }
      ],
      conditions: 'days_requested > 5',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Timesheet Exception Approval',
      description: 'Approval for overtime and exceptions',
      entityType: 'time_entry',
      isActive: true,
      steps: [
        { id: 4, order: 1, approverType: 'manager', timeoutHours: 24, escalateOnTimeout: true }
      ],
      createdAt: new Date().toISOString()
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingWorkflow) {
        await api.put(`/organization/approval-workflows/${editingWorkflow.id}`, formData);
        setSuccess('Workflow updated successfully');
      } else {
        await api.post('/organization/approval-workflows', formData);
        setSuccess('Workflow created successfully');
      }
      setShowModal(false);
      loadWorkflows();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save workflow');
    }
  };

  const handleToggleActive = async (workflow: ApprovalWorkflow) => {
    try {
      await api.patch(`/organization/approval-workflows/${workflow.id}`, {
        isActive: !workflow.isActive
      });
      setSuccess(`Workflow ${workflow.isActive ? 'deactivated' : 'activated'}`);
      loadWorkflows();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update workflow');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await api.delete(`/organization/approval-workflows/${id}`);
      setSuccess('Workflow deleted successfully');
      loadWorkflows();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete workflow');
    }
  };

  const openEditModal = (workflow: ApprovalWorkflow) => {
    setEditingWorkflow(workflow);
    setFormData({
      name: workflow.name,
      description: workflow.description || '',
      entityType: workflow.entityType,
      isActive: workflow.isActive,
      steps: workflow.steps.map(s => ({
        order: s.order,
        approverType: s.approverType,
        approverId: s.approverId,
        approverRole: s.approverRole,
        timeoutHours: s.timeoutHours,
        escalateOnTimeout: s.escalateOnTimeout,
        escalateTo: s.escalateTo
      }))
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingWorkflow(null);
    setFormData({
      name: '',
      description: '',
      entityType: 'leave_request',
      isActive: true,
      steps: [{ order: 1, approverType: 'manager', timeoutHours: 48, escalateOnTimeout: true }]
    });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, {
        order: formData.steps.length + 1,
        approverType: 'manager',
        timeoutHours: 48,
        escalateOnTimeout: false
      }]
    });
  };

  const removeStep = (index: number) => {
    if (formData.steps.length <= 1) return;
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      steps: newSteps.map((s, i) => ({ ...s, order: i + 1 }))
    });
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case 'leave_request': return 'Leave Requests';
      case 'time_entry': return 'Time Entries';
      case 'schedule_change': return 'Schedule Changes';
      case 'expense': return 'Expenses';
      default: return type;
    }
  };

  const getApproverTypeLabel = (type: string) => {
    switch (type) {
      case 'manager': return 'Direct Manager';
      case 'role': return 'Role';
      case 'user': return 'Specific User';
      case 'auto': return 'Auto-Approve';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading workflows...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 d-flex align-items-center gap-2">
            <GitBranch className="text-primary" /> Approval Workflow Builder
          </h2>
          <p className="text-muted mb-0">Configure multi-level approval workflows and escalation rules</p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={18} className="me-1" /> Create Workflow
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <GitBranch size={32} className="text-primary mb-2" />
              <h3>{workflows.length}</h3>
              <small className="text-muted">Total Workflows</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Play size={32} className="text-success mb-2" />
              <h3>{workflows.filter(w => w.isActive).length}</h3>
              <small className="text-muted">Active</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Users size={32} className="text-info mb-2" />
              <h3>{workflows.reduce((sum, w) => sum + w.steps.length, 0)}</h3>
              <small className="text-muted">Total Steps</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <CheckCircle size={32} className="text-warning mb-2" />
              <h3>{workflows.filter(w => w.steps.some(s => s.escalateOnTimeout)).length}</h3>
              <small className="text-muted">With Escalation</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Workflow Name</th>
                <th>Entity Type</th>
                <th>Approval Steps</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map(workflow => (
                <tr key={workflow.id}>
                  <td>
                    <div className="fw-medium">{workflow.name}</div>
                    {workflow.description && <small className="text-muted">{workflow.description}</small>}
                    {workflow.conditions && (
                      <div className="mt-1">
                        <Badge bg="info-subtle" text="info" className="font-monospace">
                          {workflow.conditions}
                        </Badge>
                      </div>
                    )}
                  </td>
                  <td>
                    <Badge bg="light" text="dark">{getEntityTypeLabel(workflow.entityType)}</Badge>
                  </td>
                  <td>
                    <div className="d-flex align-items-center flex-wrap gap-1">
                      {workflow.steps.map((step, idx) => (
                        <span key={step.id}>
                          <Badge bg="secondary" className="me-1">
                            {step.order}. {getApproverTypeLabel(step.approverType)}
                            {step.approverRole && `: ${step.approverRole}`}
                          </Badge>
                          {idx < workflow.steps.length - 1 && <ArrowRight size={14} className="text-muted" />}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {workflow.isActive ? (
                      <Badge bg="success">Active</Badge>
                    ) : (
                      <Badge bg="secondary">Inactive</Badge>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant={workflow.isActive ? 'outline-warning' : 'outline-success'}
                        size="sm"
                        onClick={() => handleToggleActive(workflow)}
                      >
                        {workflow.isActive ? <Pause size={14} /> : <Play size={14} />}
                      </Button>
                      <Button variant="outline-primary" size="sm" onClick={() => openEditModal(workflow)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(workflow.id)}>
                        <Trash2 size={14} />
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
          <Modal.Title className="d-flex align-items-center gap-2">
            <GitBranch /> {editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Workflow Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Entity Type *</Form.Label>
                  <Form.Select
                    value={formData.entityType}
                    onChange={(e) => setFormData({ ...formData, entityType: e.target.value as any })}
                  >
                    <option value="leave_request">Leave Requests</option>
                    <option value="time_entry">Time Entries</option>
                    <option value="schedule_change">Schedule Changes</option>
                    <option value="expense">Expenses</option>
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

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">Approval Steps</Form.Label>
                <Button variant="outline-primary" size="sm" onClick={addStep}>
                  <Plus size={14} className="me-1" /> Add Step
                </Button>
              </div>

              {formData.steps.map((step, idx) => (
                <Card key={idx} className="mb-2">
                  <Card.Body className="py-2">
                    <Row className="align-items-center">
                      <Col xs={1} className="text-center">
                        <Badge bg="primary">{step.order}</Badge>
                      </Col>
                      <Col xs={3}>
                        <Form.Select
                          size="sm"
                          value={step.approverType}
                          onChange={(e) => updateStep(idx, 'approverType', e.target.value)}
                        >
                          <option value="manager">Direct Manager</option>
                          <option value="role">Specific Role</option>
                          <option value="user">Specific User</option>
                          <option value="auto">Auto-Approve</option>
                        </Form.Select>
                      </Col>
                      {step.approverType === 'role' && (
                        <Col xs={2}>
                          <Form.Control
                            size="sm"
                            placeholder="Role name"
                            value={step.approverRole || ''}
                            onChange={(e) => updateStep(idx, 'approverRole', e.target.value)}
                          />
                        </Col>
                      )}
                      <Col xs={2}>
                        <Form.Control
                          type="number"
                          size="sm"
                          placeholder="Timeout (hrs)"
                          value={step.timeoutHours}
                          onChange={(e) => updateStep(idx, 'timeoutHours', parseInt(e.target.value))}
                        />
                      </Col>
                      <Col xs={2}>
                        <Form.Check
                          type="switch"
                          label="Escalate"
                          checked={step.escalateOnTimeout}
                          onChange={(e) => updateStep(idx, 'escalateOnTimeout', e.target.checked)}
                        />
                      </Col>
                      <Col xs={1}>
                        {formData.steps.length > 1 && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-0"
                            onClick={() => removeStep(idx)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>

            <Form.Check
              type="switch"
              id="isActive"
              label="Workflow is active"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
