import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { Smartphone, Plus, Edit2, Trash2, Wifi, WifiOff, RefreshCw, Settings, MapPin, Clock, AlertTriangle } from 'lucide-react';
import api from '../api/client';

interface Device {
  id: number;
  deviceId: string;
  name: string;
  type: 'biometric' | 'kiosk' | 'mobile' | 'tablet';
  siteId?: number;
  siteName?: string;
  location?: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastHeartbeat?: string;
  firmwareVersion?: string;
  ipAddress?: string;
  macAddress?: string;
  totalClocks: number;
  todayClocks: number;
  isActive: boolean;
  createdAt: string;
}

export default function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    deviceId: '',
    name: '',
    type: 'biometric' as const,
    siteId: '',
    location: '',
    ipAddress: ''
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organization/devices');
      setDevices(response.data.devices || generateMockDevices());
    } catch (err) {
      setDevices(generateMockDevices());
    } finally {
      setLoading(false);
    }
  };

  const generateMockDevices = (): Device[] => [
    { id: 1, deviceId: 'BIO-001', name: 'Main Entrance Biometric', type: 'biometric', siteName: 'Head Office', location: 'Reception', status: 'online', lastHeartbeat: new Date(Date.now() - 60000).toISOString(), firmwareVersion: 'v2.3.1', ipAddress: '192.168.1.101', macAddress: 'AA:BB:CC:DD:EE:01', totalClocks: 15420, todayClocks: 45, isActive: true, createdAt: new Date().toISOString() },
    { id: 2, deviceId: 'BIO-002', name: 'Warehouse Entry', type: 'biometric', siteName: 'Warehouse A', location: 'Gate 1', status: 'online', lastHeartbeat: new Date(Date.now() - 120000).toISOString(), firmwareVersion: 'v2.3.1', ipAddress: '192.168.2.101', macAddress: 'AA:BB:CC:DD:EE:02', totalClocks: 8230, todayClocks: 28, isActive: true, createdAt: new Date().toISOString() },
    { id: 3, deviceId: 'KIO-001', name: 'Cafeteria Kiosk', type: 'kiosk', siteName: 'Head Office', location: 'Level 2', status: 'offline', lastHeartbeat: new Date(Date.now() - 3600000).toISOString(), firmwareVersion: 'v1.8.5', ipAddress: '192.168.1.102', macAddress: 'AA:BB:CC:DD:EE:03', totalClocks: 5610, todayClocks: 0, isActive: true, createdAt: new Date().toISOString() },
    { id: 4, deviceId: 'TAB-001', name: 'Reception Tablet', type: 'tablet', siteName: 'Branch A', location: 'Front Desk', status: 'online', lastHeartbeat: new Date(Date.now() - 30000).toISOString(), firmwareVersion: 'Android 12', ipAddress: '192.168.3.50', totalClocks: 2340, todayClocks: 12, isActive: true, createdAt: new Date().toISOString() },
    { id: 5, deviceId: 'BIO-003', name: 'Loading Bay', type: 'biometric', siteName: 'Warehouse A', location: 'Dock 3', status: 'error', lastHeartbeat: new Date(Date.now() - 7200000).toISOString(), firmwareVersion: 'v2.2.0', ipAddress: '192.168.2.102', macAddress: 'AA:BB:CC:DD:EE:05', totalClocks: 3120, todayClocks: 5, isActive: true, createdAt: new Date().toISOString() }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingDevice) {
        await api.put(`/organization/devices/${editingDevice.id}`, formData);
        setSuccess('Device updated successfully');
      } else {
        await api.post('/organization/devices', formData);
        setSuccess('Device registered successfully');
      }
      setShowModal(false);
      loadDevices();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save device');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this device?')) return;

    try {
      await api.delete(`/organization/devices/${id}`);
      setSuccess('Device removed successfully');
      loadDevices();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove device');
    }
  };

  const handleRestart = async (id: number) => {
    try {
      await api.post(`/organization/devices/${id}/restart`);
      setSuccess('Restart command sent');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send restart command');
    }
  };

  const openEditModal = (device: Device) => {
    setEditingDevice(device);
    setFormData({
      deviceId: device.deviceId,
      name: device.name,
      type: device.type,
      siteId: device.siteId?.toString() || '',
      location: device.location || '',
      ipAddress: device.ipAddress || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingDevice(null);
    setFormData({
      deviceId: '',
      name: '',
      type: 'biometric',
      siteId: '',
      location: '',
      ipAddress: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return <Badge bg="success" className="d-flex align-items-center gap-1"><Wifi size={12} /> Online</Badge>;
      case 'offline': return <Badge bg="secondary" className="d-flex align-items-center gap-1"><WifiOff size={12} /> Offline</Badge>;
      case 'maintenance': return <Badge bg="warning" className="d-flex align-items-center gap-1"><Settings size={12} /> Maintenance</Badge>;
      case 'error': return <Badge bg="danger" className="d-flex align-items-center gap-1"><AlertTriangle size={12} /> Error</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'biometric': return '🔐';
      case 'kiosk': return '🖥️';
      case 'mobile': return '📱';
      case 'tablet': return '📲';
      default: return '📟';
    }
  };

  const formatLastSeen = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - new Date(timestamp).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const filteredDevices = devices.filter(d => 
    statusFilter === 'all' || d.status === statusFilter
  );

  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;
  const errorCount = devices.filter(d => d.status === 'error').length;

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading devices...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 d-flex align-items-center gap-2">
            <Smartphone className="text-primary" /> Device Management
          </h2>
          <p className="text-muted mb-0">Manage biometric devices, kiosks, and clock terminals</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={loadDevices}>
            <RefreshCw size={16} className="me-1" /> Refresh
          </Button>
          <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={18} className="me-1" /> Register Device
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100 border-success" style={{ borderWidth: 2 }}>
            <Card.Body className="text-center">
              <Wifi size={32} className="text-success mb-2" />
              <h2 className="text-success">{onlineCount}</h2>
              <small className="text-muted">Online</small>
              <ProgressBar now={(onlineCount / devices.length) * 100} variant="success" className="mt-2" style={{ height: 6 }} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-secondary" style={{ borderWidth: 2 }}>
            <Card.Body className="text-center">
              <WifiOff size={32} className="text-secondary mb-2" />
              <h2 className="text-secondary">{offlineCount}</h2>
              <small className="text-muted">Offline</small>
              <ProgressBar now={(offlineCount / devices.length) * 100} variant="secondary" className="mt-2" style={{ height: 6 }} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-danger" style={{ borderWidth: 2 }}>
            <Card.Body className="text-center">
              <AlertTriangle size={32} className="text-danger mb-2" />
              <h2 className="text-danger">{errorCount}</h2>
              <small className="text-muted">Errors</small>
              <ProgressBar now={(errorCount / devices.length) * 100} variant="danger" className="mt-2" style={{ height: 6 }} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100" style={{ background: 'linear-gradient(135deg, #28468D, #54B8DF)', color: 'white' }}>
            <Card.Body className="text-center">
              <Clock size={32} className="opacity-75 mb-2" />
              <h2>{devices.reduce((sum, d) => sum + d.todayClocks, 0)}</h2>
              <small className="opacity-75">Today's Clocks</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Registered Devices</h6>
          <Form.Select 
            size="sm" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 150 }}
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="error">Error</option>
            <option value="maintenance">Maintenance</option>
          </Form.Select>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Device</th>
                <th>Location</th>
                <th>Status</th>
                <th>Last Seen</th>
                <th>Today</th>
                <th>Firmware</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map(device => (
                <tr key={device.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: 24 }}>{getDeviceIcon(device.type)}</span>
                      <div>
                        <div className="fw-medium">{device.name}</div>
                        <small className="text-muted font-monospace">{device.deviceId}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <MapPin size={14} className="text-muted" />
                      <div>
                        <div>{device.siteName}</div>
                        {device.location && <small className="text-muted">{device.location}</small>}
                      </div>
                    </div>
                  </td>
                  <td>{getStatusBadge(device.status)}</td>
                  <td>
                    <small className={device.status === 'online' ? 'text-success' : 'text-muted'}>
                      {formatLastSeen(device.lastHeartbeat)}
                    </small>
                  </td>
                  <td>
                    <Badge bg="light" text="dark">{device.todayClocks}</Badge>
                  </td>
                  <td>
                    <small className="font-monospace">{device.firmwareVersion}</small>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => handleRestart(device.id)}
                        title="Restart"
                      >
                        <RefreshCw size={14} />
                      </Button>
                      <Button variant="outline-primary" size="sm" onClick={() => openEditModal(device)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(device.id)}>
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

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingDevice ? 'Edit Device' : 'Register Device'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Device ID *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    required
                    placeholder="e.g., BIO-004"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Device Type *</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="biometric">Biometric Reader</option>
                    <option value="kiosk">Kiosk Terminal</option>
                    <option value="tablet">Tablet</option>
                    <option value="mobile">Mobile Device</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Device Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Main Entrance Scanner"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Building A, Floor 1"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>IP Address</Form.Label>
              <Form.Control
                type="text"
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                placeholder="e.g., 192.168.1.100"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editingDevice ? 'Update Device' : 'Register Device'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
