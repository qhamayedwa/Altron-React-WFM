import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FileText, Search, Download, Eye, Filter, RefreshCw, User, Clock, Activity } from 'lucide-react';
import api from '../api/client';

interface AuditLogEntry {
  id: number;
  tenantId: number;
  userId: number;
  username?: string;
  userFullName?: string;
  sessionId?: string;
  action: string;
  entityType: string;
  entityId?: number;
  oldValue?: string;
  newValue?: string;
  changedFields?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: string;
}

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    userId: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 50,
    total: 0
  });

  useEffect(() => {
    loadAuditLogs();
  }, [pagination.page, filters]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        per_page: pagination.perPage
      };

      if (filters.action) params.action = filters.action;
      if (filters.entityType) params.entity_type = filters.entityType;
      if (filters.userId) params.user_id = filters.userId;
      if (filters.startDate) params.start_date = filters.startDate;
      if (filters.endDate) params.end_date = filters.endDate;
      if (filters.search) params.search = filters.search;

      const response = await api.get('/organization/audit-logs', { params });
      setLogs(response.data.logs || []);
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const response = await api.get('/organization/audit-logs/export', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('Failed to export audit logs');
    }
  };

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return <Badge bg="success">Create</Badge>;
      case 'update': return <Badge bg="primary">Update</Badge>;
      case 'delete': return <Badge bg="danger">Delete</Badge>;
      case 'login': return <Badge bg="info">Login</Badge>;
      case 'logout': return <Badge bg="secondary">Logout</Badge>;
      case 'approve': return <Badge bg="success">Approve</Badge>;
      case 'reject': return <Badge bg="danger">Reject</Badge>;
      default: return <Badge bg="secondary">{action}</Badge>;
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'user': return <User size={14} />;
      case 'time_entry': return <Clock size={14} />;
      default: return <Activity size={14} />;
    }
  };

  const formatEntityType = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const parseJSON = (str?: string) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  };

  const viewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      userId: '',
      startDate: '',
      endDate: '',
      search: ''
    });
  };

  const actionOptions = ['create', 'update', 'delete', 'login', 'logout', 'approve', 'reject'];
  const entityTypeOptions = ['user', 'time_entry', 'leave_request', 'schedule', 'pay_code', 'pay_rule', 'department', 'role'];

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 d-flex align-items-center gap-2">
            <FileText className="text-primary" /> Audit Trail & Access Control
          </h2>
          <p className="text-muted mb-0">Track all system activities and user actions</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={loadAuditLogs}>
            <RefreshCw size={16} className="me-1" /> Refresh
          </Button>
          <Button variant="outline-primary" onClick={exportLogs}>
            <Download size={16} className="me-1" /> Export CSV
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <div className="d-flex align-items-center gap-2">
            <Filter size={18} />
            <span className="fw-semibold">Filters</span>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={2}>
              <Form.Group>
                <Form.Label className="small">Action</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.action}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                >
                  <option value="">All Actions</option>
                  {actionOptions.map(action => (
                    <option key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="small">Entity Type</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.entityType}
                  onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                >
                  <option value="">All Types</option>
                  {entityTypeOptions.map(type => (
                    <option key={type} value={type}>{formatEntityType(type)}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="small">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="small">End Date</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small">Search</Form.Label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text"><Search size={14} /></span>
                  <Form.Control
                    type="text"
                    placeholder="Search by user, IP..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={1} className="d-flex align-items-end">
              <Button variant="outline-secondary" size="sm" onClick={clearFilters} className="w-100">
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FileText size={48} className="mb-3 opacity-50" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>IP Address</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="text-nowrap">
                      <small>{formatDateTime(log.createdAt)}</small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <User size={16} className="text-muted" />
                        <div>
                          <div className="fw-medium">{log.userFullName || log.username || 'System'}</div>
                          {log.username && log.userFullName && (
                            <small className="text-muted">@{log.username}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        {getEntityIcon(log.entityType)}
                        <span>{formatEntityType(log.entityType)}</span>
                        {log.entityId && <small className="text-muted">#{log.entityId}</small>}
                      </div>
                    </td>
                    <td>
                      <small className="text-muted font-monospace">{log.ipAddress || '-'}</small>
                    </td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => viewDetails(log)}
                      >
                        <Eye size={16} /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
        {logs.length > 0 && (
          <Card.Footer className="bg-white d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Showing {logs.length} of {pagination.total} entries
            </small>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={logs.length < pagination.perPage}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </Card.Footer>
        )}
      </Card>

      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Activity /> Audit Log Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-1">Timestamp</h6>
                  <p>{formatDateTime(selectedLog.createdAt)}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-1">User</h6>
                  <p>{selectedLog.userFullName || selectedLog.username || 'System'}</p>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={4}>
                  <h6 className="text-muted mb-1">Action</h6>
                  <p>{getActionBadge(selectedLog.action)}</p>
                </Col>
                <Col md={4}>
                  <h6 className="text-muted mb-1">Entity Type</h6>
                  <p>{formatEntityType(selectedLog.entityType)}</p>
                </Col>
                <Col md={4}>
                  <h6 className="text-muted mb-1">Entity ID</h6>
                  <p>{selectedLog.entityId || '-'}</p>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-1">IP Address</h6>
                  <p className="font-monospace">{selectedLog.ipAddress || '-'}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-1">Session ID</h6>
                  <p className="font-monospace small">{selectedLog.sessionId || '-'}</p>
                </Col>
              </Row>

              {selectedLog.userAgent && (
                <div className="mb-4">
                  <h6 className="text-muted mb-1">User Agent</h6>
                  <p className="small text-muted">{selectedLog.userAgent}</p>
                </div>
              )}

              {selectedLog.changedFields && (
                <div className="mb-4">
                  <h6 className="text-muted mb-1">Changed Fields</h6>
                  <pre className="bg-light p-2 rounded small">
                    {JSON.stringify(parseJSON(selectedLog.changedFields), null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.oldValue && (
                <div className="mb-4">
                  <h6 className="text-muted mb-1">Previous Value</h6>
                  <pre className="bg-light p-2 rounded small" style={{ maxHeight: 200, overflow: 'auto' }}>
                    {JSON.stringify(parseJSON(selectedLog.oldValue), null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div className="mb-4">
                  <h6 className="text-muted mb-1">New Value</h6>
                  <pre className="bg-light p-2 rounded small" style={{ maxHeight: 200, overflow: 'auto' }}>
                    {JSON.stringify(parseJSON(selectedLog.newValue), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
