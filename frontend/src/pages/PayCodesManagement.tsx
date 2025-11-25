import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert, Spinner, Pagination } from 'react-bootstrap';
import { CreditCard, Plus, Settings, Eye, Edit, Pause, Play, Save, Inbox } from 'lucide-react';
import api from '../api/client';

interface PayCode {
  id: number;
  code: string;
  description: string;
  name?: string;
  is_absence_code: boolean;
  is_active: boolean;
  created_by?: { username: string } | null;
  created_by_id?: number;
  created_at: string;
  updated_at: string;
  configuration?: string;
}

interface LeaveType {
  id: number;
  name: string;
}

const PayCodesManagement: React.FC = () => {
  const [payCodes, setPayCodes] = useState<PayCode[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [codeTypeFilter, setCodeTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;
  
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingPayCode, setEditingPayCode] = useState<PayCode | null>(null);
  const [viewingPayCode, setViewingPayCode] = useState<PayCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    is_absence_code: false,
    pay_rate_factor: '1.0',
    is_paid: true,
    requires_approval: true,
    deducts_from_balance: false,
    leave_type_id: '',
    max_hours_per_day: '',
    max_consecutive_days: ''
  });
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    loadPayCodes();
    loadLeaveTypes();
  }, [currentPage, codeTypeFilter, statusFilter]);

  const loadPayCodes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      if (codeTypeFilter) params.append('type', codeTypeFilter);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await api.get(`/pay-codes?${params.toString()}`);
      
      let codes = Array.isArray(response.data) ? response.data : (response.data.payCodes || []);
      
      if (codeTypeFilter === 'absence') {
        codes = codes.filter((c: PayCode) => c.is_absence_code);
      } else if (codeTypeFilter === 'payroll') {
        codes = codes.filter((c: PayCode) => !c.is_absence_code);
      }
      
      if (statusFilter === 'active') {
        codes = codes.filter((c: PayCode) => c.is_active);
      } else if (statusFilter === 'inactive') {
        codes = codes.filter((c: PayCode) => !c.is_active);
      }
      
      setPayCodes(codes);
      setTotalItems(codes.length);
      setTotalPages(Math.ceil(codes.length / pageSize) || 1);
    } catch (error) {
      console.error('Error loading pay codes:', error);
      setError('Failed to load pay codes');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveTypes = async () => {
    try {
      const response = await api.get('/leave-types');
      setLeaveTypes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading leave types:', error);
    }
  };

  const handleClearFilters = () => {
    setCodeTypeFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const handleShowCreate = () => {
    setEditingPayCode(null);
    setFormData({
      code: '',
      description: '',
      is_absence_code: false,
      pay_rate_factor: '1.0',
      is_paid: true,
      requires_approval: true,
      deducts_from_balance: false,
      leave_type_id: '',
      max_hours_per_day: '',
      max_consecutive_days: ''
    });
    setShowModal(true);
  };

  const handleShowEdit = (payCode: PayCode) => {
    setEditingPayCode(payCode);
    
    let config: any = {};
    try {
      if (payCode.configuration) {
        config = JSON.parse(payCode.configuration);
      }
    } catch (e) {}
    
    setFormData({
      code: payCode.code,
      description: payCode.description || payCode.name || '',
      is_absence_code: payCode.is_absence_code,
      pay_rate_factor: config.pay_rate_factor?.toString() || '1.0',
      is_paid: config.is_paid !== false,
      requires_approval: config.requires_approval !== false,
      deducts_from_balance: config.deducts_from_balance || false,
      leave_type_id: config.leave_type_id?.toString() || '',
      max_hours_per_day: config.max_hours_per_day?.toString() || '',
      max_consecutive_days: config.max_consecutive_days?.toString() || ''
    });
    setShowModal(true);
  };

  const handleShowView = (payCode: PayCode) => {
    setViewingPayCode(payCode);
    setShowViewModal(true);
  };

  const handleToggleStatus = async (payCode: PayCode) => {
    try {
      await api.put(`/pay-codes/${payCode.id}`, {
        ...payCode,
        is_active: !payCode.is_active
      });
      loadPayCodes();
      setSuccess(`Pay code ${payCode.code} has been ${payCode.is_active ? 'deactivated' : 'activated'}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling status:', error);
      setError('Failed to update pay code status');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const configuration = {
        pay_rate_factor: parseFloat(formData.pay_rate_factor) || 1.0,
        is_paid: formData.is_paid,
        requires_approval: formData.requires_approval,
        deducts_from_balance: formData.deducts_from_balance,
        leave_type_id: formData.leave_type_id ? parseInt(formData.leave_type_id) : null,
        max_hours_per_day: formData.max_hours_per_day ? parseFloat(formData.max_hours_per_day) : null,
        max_consecutive_days: formData.max_consecutive_days ? parseInt(formData.max_consecutive_days) : null
      };
      
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        is_absence_code: formData.is_absence_code,
        is_active: true,
        configuration: JSON.stringify(configuration)
      };

      if (editingPayCode) {
        await api.put(`/pay-codes/${editingPayCode.id}`, payload);
        setSuccess('Pay code updated successfully');
      } else {
        await api.post('/pay-codes', payload);
        setSuccess('Pay code created successfully');
      }

      setShowModal(false);
      loadPayCodes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error saving pay code:', error);
      setError(error.response?.data?.error || 'Failed to save pay code');
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDefaults = async () => {
    if (!confirm('This will create default pay codes. Continue?')) {
      return;
    }
    
    try {
      setInitializing(true);
      
      const defaultCodes = [
        { code: 'REG', description: 'Regular Hours', is_absence_code: false },
        { code: 'OT', description: 'Overtime', is_absence_code: false },
        { code: 'DOT', description: 'Double Time', is_absence_code: false },
        { code: 'SICK', description: 'Sick Leave', is_absence_code: true },
        { code: 'VAC', description: 'Vacation', is_absence_code: true },
        { code: 'PTO', description: 'Paid Time Off', is_absence_code: true },
        { code: 'UNPD', description: 'Unpaid Leave', is_absence_code: true }
      ];
      
      for (const code of defaultCodes) {
        try {
          await api.post('/pay-codes', {
            ...code,
            is_active: true,
            configuration: JSON.stringify({ pay_rate_factor: 1.0 })
          });
        } catch (e) {
          console.log(`Code ${code.code} may already exist`);
        }
      }
      
      setSuccess('Default pay codes initialized');
      loadPayCodes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error initializing defaults:', error);
      setError('Failed to initialize default codes');
    } finally {
      setInitializing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getPayRateFactor = (payCode: PayCode) => {
    try {
      if (payCode.configuration) {
        const config = JSON.parse(payCode.configuration);
        return config.pay_rate_factor || 1.0;
      }
    } catch (e) {}
    return 1.0;
  };

  if (loading && payCodes.length === 0) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <CreditCard className="me-2" size={32} style={{ color: '#28468D' }} />
          Pay Codes Management
        </h1>
        <div>
          <Button 
            variant="primary" 
            onClick={handleShowCreate}
            className="me-2"
            style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
          >
            <Plus className="me-2" size={16} />
            Create Pay Code
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={handleInitializeDefaults}
            disabled={initializing}
          >
            {initializing ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <Settings className="me-2" size={16} />
            )}
            Initialize Defaults
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row className="g-3">
              <Col md={3}>
                <Form.Label>Code Type</Form.Label>
                <Form.Select
                  value={codeTypeFilter}
                  onChange={(e) => { setCodeTypeFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">All Types</option>
                  <option value="absence">Absence Codes</option>
                  <option value="payroll">Payroll Codes</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button variant="outline-primary" onClick={() => loadPayCodes()} className="me-2">
                  Filter
                </Button>
                <Button variant="outline-secondary" onClick={handleClearFilters}>
                  Clear
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Pay Codes Table */}
      <Card>
        <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
          <h5 className="mb-0">Pay Codes ({totalItems} total)</h5>
        </Card.Header>
        <Card.Body>
          {payCodes.length === 0 ? (
            <div className="text-center py-5">
              <Inbox size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No pay codes found</h5>
              <p className="text-muted">Create your first pay code or initialize with default codes.</p>
              <Button 
                variant="primary" 
                onClick={handleShowCreate}
                style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
              >
                <Plus className="me-2" size={16} />
                Create Pay Code
              </Button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th>Code</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Created By</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payCodes.map((payCode) => (
                      <tr key={payCode.id}>
                        <td>
                          <strong>{payCode.code}</strong>
                        </td>
                        <td>{payCode.description || payCode.name}</td>
                        <td>
                          {payCode.is_absence_code ? (
                            <Badge bg="info">Absence</Badge>
                          ) : (
                            <Badge bg="secondary">Payroll</Badge>
                          )}
                        </td>
                        <td>
                          {payCode.is_active ? (
                            <Badge bg="success">Active</Badge>
                          ) : (
                            <Badge bg="warning">Inactive</Badge>
                          )}
                        </td>
                        <td>{payCode.created_by?.username || 'System'}</td>
                        <td>{formatDate(payCode.created_at)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              title="View Details"
                              onClick={() => handleShowView(payCode)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              title="Edit"
                              onClick={() => handleShowEdit(payCode)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              title="Toggle Status"
                              onClick={() => handleToggleStatus(payCode)}
                            >
                              {payCode.is_active ? <Pause size={16} /> : <Play size={16} />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPayCode ? `Edit Pay Code: ${editingPayCode.code}` : 'Create Pay Code'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Pay Code Details</h6>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Pay Code *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                          placeholder="e.g., SICK, VAC, OT"
                          style={{ textTransform: 'uppercase' }}
                        />
                        <Form.Text className="text-muted">
                          Short code identifier (uppercase letters only)
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Description *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="e.g., Sick Leave"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="is_absence_code"
                      label="This is an absence code"
                      checked={formData.is_absence_code}
                      onChange={(e) => setFormData({ ...formData, is_absence_code: e.target.checked })}
                    />
                    <Form.Text className="text-muted">
                      Check if this code is used for tracking employee absences
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Pay Rate Factor</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.pay_rate_factor}
                        onChange={(e) => setFormData({ ...formData, pay_rate_factor: e.target.value })}
                        placeholder="1.0"
                      />
                      <span className="input-group-text">x</span>
                    </div>
                    <Form.Text className="text-muted">
                      Multiplier for base pay rate (e.g., 1.5 for overtime, 0.0 for unpaid)
                    </Form.Text>
                  </Form.Group>

                  {formData.is_absence_code && (
                    <>
                      <hr />
                      <h6 className="mb-3">Absence Settings</h6>

                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Check
                            type="checkbox"
                            id="is_paid"
                            label="Paid absence"
                            checked={formData.is_paid}
                            onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Check
                            type="checkbox"
                            id="requires_approval"
                            label="Requires approval"
                            checked={formData.requires_approval}
                            onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                          />
                        </Col>
                      </Row>

                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Check
                            type="checkbox"
                            id="deducts_from_balance"
                            label="Deducts from leave balance"
                            checked={formData.deducts_from_balance}
                            onChange={(e) => setFormData({ ...formData, deducts_from_balance: e.target.checked })}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Linked Leave Type</Form.Label>
                            <Form.Select
                              value={formData.leave_type_id}
                              onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
                            >
                              <option value="">Select leave type...</option>
                              {leaveTypes.map((lt) => (
                                <option key={lt.id} value={lt.id}>{lt.name}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Max Hours Per Day</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.5"
                              min="0"
                              max="24"
                              value={formData.max_hours_per_day}
                              onChange={(e) => setFormData({ ...formData, max_hours_per_day: e.target.value })}
                              placeholder="8.0"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Max Consecutive Days</Form.Label>
                            <Form.Control
                              type="number"
                              min="1"
                              value={formData.max_consecutive_days}
                              onChange={(e) => setFormData({ ...formData, max_consecutive_days: e.target.value })}
                              placeholder="5"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Pay Code Examples</h6>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>Common Absence Codes:</strong>
                    <ul className="list-unstyled mt-2">
                      <li><code>SICK</code> - Sick Leave</li>
                      <li><code>VAC</code> - Vacation</li>
                      <li><code>PTO</code> - Paid Time Off</li>
                      <li><code>UNPD</code> - Unpaid Leave</li>
                    </ul>
                  </div>

                  <div className="mb-3">
                    <strong>Common Payroll Codes:</strong>
                    <ul className="list-unstyled mt-2">
                      <li><code>OT</code> - Overtime (1.5x)</li>
                      <li><code>DT</code> - Double Time (2.0x)</li>
                      <li><code>HOL</code> - Holiday Pay (1.5x)</li>
                      <li><code>CALL</code> - Call-out Pay</li>
                    </ul>
                  </div>

                  <Alert variant="info" className="small">
                    <strong>Tip:</strong> Use short, descriptive codes that are easy to remember and type.
                    Absence codes should be linked to leave types when they deduct from balances.
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={saving || !formData.code || !formData.description}
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

      {/* View Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Pay Code: {viewingPayCode?.code}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewingPayCode && (
            <Row>
              <Col lg={8}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Pay Code Details</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={6}>
                        <label className="form-label text-muted">Code</label>
                        <div className="fw-bold">{viewingPayCode.code}</div>
                      </Col>
                      <Col md={6}>
                        <label className="form-label text-muted">Description</label>
                        <div>{viewingPayCode.description}</div>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={6}>
                        <label className="form-label text-muted">Type</label>
                        <div>
                          {viewingPayCode.is_absence_code ? (
                            <Badge bg="info">Absence Code</Badge>
                          ) : (
                            <Badge bg="secondary">Payroll Code</Badge>
                          )}
                        </div>
                      </Col>
                      <Col md={6}>
                        <label className="form-label text-muted">Status</label>
                        <div>
                          {viewingPayCode.is_active ? (
                            <Badge bg="success">Active</Badge>
                          ) : (
                            <Badge bg="warning">Inactive</Badge>
                          )}
                        </div>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={6}>
                        <label className="form-label text-muted">Pay Rate Factor</label>
                        <div>{getPayRateFactor(viewingPayCode)}x</div>
                      </Col>
                      <Col md={6}>
                        <label className="form-label text-muted">Created By</label>
                        <div>{viewingPayCode.created_by?.username || 'System'}</div>
                      </Col>
                    </Row>

                    <hr />

                    <Row>
                      <Col md={6}>
                        <label className="form-label text-muted">Created Date</label>
                        <div>{formatDate(viewingPayCode.created_at)}</div>
                      </Col>
                      <Col md={6}>
                        <label className="form-label text-muted">Last Updated</label>
                        <div>{formatDate(viewingPayCode.updated_at)}</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Quick Actions</h6>
                  </Card.Header>
                  <Card.Body>
                    <Button 
                      variant="outline-primary" 
                      className="w-100 mb-2"
                      onClick={() => {
                        setShowViewModal(false);
                        handleShowEdit(viewingPayCode);
                      }}
                    >
                      <Edit className="me-2" size={16} />
                      Edit Pay Code
                    </Button>
                    <Button 
                      variant="outline-warning" 
                      className="w-100"
                      onClick={() => {
                        handleToggleStatus(viewingPayCode);
                        setShowViewModal(false);
                      }}
                    >
                      {viewingPayCode.is_active ? (
                        <>
                          <Pause className="me-2" size={16} />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Play className="me-2" size={16} />
                          Activate
                        </>
                      )}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PayCodesManagement;
