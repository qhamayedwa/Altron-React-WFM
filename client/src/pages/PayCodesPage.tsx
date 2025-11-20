import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../lib/api';

interface PayCode {
  id: number;
  code: string;
  description: string;
  is_absence_code: boolean;
  is_active: boolean;
  created_at: string;
  configuration: string | null;
  usage_count?: number;
}

interface PayCodeConfig {
  pay_rate_factor?: number;
  is_paid?: boolean;
  requires_approval?: boolean;
  max_hours_per_day?: number;
  max_consecutive_days?: number;
  leave_type_id?: number;
}

export default function PayCodesPage() {
  const [payCodes, setPayCodes] = useState<PayCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPayCode, setEditingPayCode] = useState<PayCode | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'absence' | 'payroll'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    is_absence_code: false,
    pay_rate_factor: '',
    is_paid: true,
    requires_approval: false,
    max_hours_per_day: '',
    max_consecutive_days: '',
  });

  useEffect(() => {
    loadPayCodes();
  }, [filterType, filterStatus]);

  const loadPayCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page: 1, per_page: 100 };
      if (filterType !== 'all') {
        params.type = filterType;
      }
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      const response = await api.get('/payroll/pay-codes', { params });
      setPayCodes(response.data.data.pay_codes);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pay codes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (payCode: PayCode | null = null) => {
    if (payCode) {
      setEditingPayCode(payCode);
      const config: PayCodeConfig = payCode.configuration ? JSON.parse(payCode.configuration) : {};
      setFormData({
        code: payCode.code,
        description: payCode.description,
        is_absence_code: payCode.is_absence_code,
        pay_rate_factor: config.pay_rate_factor?.toString() || '',
        is_paid: config.is_paid !== undefined ? config.is_paid : true,
        requires_approval: config.requires_approval || false,
        max_hours_per_day: config.max_hours_per_day?.toString() || '',
        max_consecutive_days: config.max_consecutive_days?.toString() || '',
      });
    } else {
      setEditingPayCode(null);
      setFormData({
        code: '',
        description: '',
        is_absence_code: false,
        pay_rate_factor: '',
        is_paid: true,
        requires_approval: false,
        max_hours_per_day: '',
        max_consecutive_days: '',
      });
    }
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPayCode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const configuration: PayCodeConfig = {};
      if (formData.pay_rate_factor) {
        configuration.pay_rate_factor = parseFloat(formData.pay_rate_factor);
      }
      if (formData.is_absence_code) {
        configuration.is_paid = formData.is_paid;
        configuration.requires_approval = formData.requires_approval;
        if (formData.max_hours_per_day) {
          configuration.max_hours_per_day = parseFloat(formData.max_hours_per_day);
        }
        if (formData.max_consecutive_days) {
          configuration.max_consecutive_days = parseInt(formData.max_consecutive_days);
        }
      }

      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        is_absence_code: formData.is_absence_code,
        configuration: Object.keys(configuration).length > 0 ? configuration : null,
      };

      if (editingPayCode) {
        const updatePayload = {
          description: formData.description,
          is_active: editingPayCode.is_active,
          configuration: Object.keys(configuration).length > 0 ? configuration : null,
        };
        await api.patch(`/payroll/pay-codes/${editingPayCode.id}`, updatePayload);
        setSuccess(`Pay code "${formData.code}" updated successfully`);
      } else {
        await api.post('/payroll/pay-codes', payload);
        setSuccess(`Pay code "${formData.code}" created successfully`);
      }

      handleCloseModal();
      loadPayCodes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save pay code');
    }
  };

  const handleToggleStatus = async (payCode: PayCode) => {
    try {
      setError(null);
      const response = await api.post(`/payroll/pay-codes/${payCode.id}/toggle`);
      setSuccess(response.data.message);
      loadPayCodes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle pay code status');
    }
  };

  const handleDelete = async (payCode: PayCode) => {
    if (!confirm(`Are you sure you want to delete pay code "${payCode.code}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/payroll/pay-codes/${payCode.id}`);
      setSuccess(`Pay code "${payCode.code}" deleted successfully`);
      loadPayCodes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete pay code');
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2>Pay Code Management</h2>
          <p className="text-muted">Manage pay codes for absence tracking and payroll calculations</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <i className="bi bi-plus-circle me-2"></i>
            Create Pay Code
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
                <Form.Label>Filter by Type</Form.Label>
                <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                  <option value="all">All Types</option>
                  <option value="absence">Absence Codes</option>
                  <option value="payroll">Payroll Codes</option>
                </Form.Select>
              </Form.Group>
            </Col>
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
          ) : payCodes.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox display-1"></i>
              <p className="mt-3">No pay codes found</p>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Configuration</th>
                  <th>Usage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payCodes.map((payCode) => {
                  const config: PayCodeConfig = payCode.configuration ? JSON.parse(payCode.configuration) : {};
                  return (
                    <tr key={payCode.id}>
                      <td>
                        <strong>{payCode.code}</strong>
                      </td>
                      <td>{payCode.description}</td>
                      <td>
                        <Badge bg={payCode.is_absence_code ? 'warning' : 'info'}>
                          {payCode.is_absence_code ? 'Absence' : 'Payroll'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={payCode.is_active ? 'success' : 'secondary'}>
                          {payCode.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <small>
                          {config.pay_rate_factor && <div>Rate: {config.pay_rate_factor}x</div>}
                          {config.is_paid !== undefined && <div>{config.is_paid ? 'Paid' : 'Unpaid'}</div>}
                          {config.requires_approval && <div>Requires Approval</div>}
                          {config.max_hours_per_day && <div>Max: {config.max_hours_per_day}h/day</div>}
                        </small>
                      </td>
                      <td>{payCode.usage_count !== undefined ? payCode.usage_count : '-'}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenModal(payCode)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant={payCode.is_active ? 'outline-warning' : 'outline-success'}
                          size="sm"
                          className="me-2"
                          onClick={() => handleToggleStatus(payCode)}
                        >
                          <i className={`bi bi-${payCode.is_active ? 'pause' : 'play'}-circle`}></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(payCode)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingPayCode ? 'Edit Pay Code' : 'Create Pay Code'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Code *</Form.Label>
              <Form.Control
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                disabled={!!editingPayCode}
                placeholder="e.g., SICK, VAC, OT"
                maxLength={10}
              />
              <Form.Text>Short code (automatically converted to uppercase)</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe what this pay code is used for"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Absence Code"
                checked={formData.is_absence_code}
                onChange={(e) => setFormData({ ...formData, is_absence_code: e.target.checked })}
                disabled={!!editingPayCode}
              />
              <Form.Text>Check if this code is used for tracking absences/leave</Form.Text>
            </Form.Group>

            <hr />

            <h6>Configuration</h6>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Pay Rate Factor</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pay_rate_factor}
                    onChange={(e) => setFormData({ ...formData, pay_rate_factor: e.target.value })}
                    placeholder="e.g., 1.5 for overtime"
                  />
                  <Form.Text>Multiplier for hourly rate (1.0 = regular, 1.5 = time-and-a-half)</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {formData.is_absence_code && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Paid Absence"
                        checked={formData.is_paid}
                        onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Requires Approval"
                        checked={formData.requires_approval}
                        onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Max Hours Per Day</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.5"
                        min="0"
                        value={formData.max_hours_per_day}
                        onChange={(e) => setFormData({ ...formData, max_hours_per_day: e.target.value })}
                        placeholder="e.g., 8"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Max Consecutive Days</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.max_consecutive_days}
                        onChange={(e) => setFormData({ ...formData, max_consecutive_days: e.target.value })}
                        placeholder="e.g., 5"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingPayCode ? 'Update' : 'Create'} Pay Code
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
