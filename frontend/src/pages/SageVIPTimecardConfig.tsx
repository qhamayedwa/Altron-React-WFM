import { useState } from 'react';
import { Card, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { ArrowLeft, Save, Globe, User, Lock, Database, Wifi, CheckCircle, XCircle, Clock, Check, ArrowRight, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function SageVIPTimecardConfig() {
  const navigate = useNavigate();
  const [endpointUrl, setEndpointUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyDatabase, setCompanyDatabase] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<{
    type: 'success' | 'error' | 'testing' | null;
    message: string;
  }>({ type: null, message: '' });
  const [saving, setSaving] = useState(false);

  const handleTestConnection = async () => {
    if (!endpointUrl || !username || !password || !companyDatabase) {
      setConnectionStatus({
        type: 'error',
        message: 'Please fill all fields'
      });
      return;
    }

    setConnectionStatus({ type: 'testing', message: 'Connecting...' });

    try {
      const response = await api.post('/integrations/sage-vip/test', {
        endpoint_url: endpointUrl,
        username,
        password,
        company_database: companyDatabase
      });

      if (response.data.success) {
        setConnectionStatus({
          type: 'success',
          message: response.data.message || 'Connection successful!'
        });
      } else {
        setConnectionStatus({
          type: 'error',
          message: response.data.error || 'Connection failed'
        });
      }
    } catch (error: any) {
      setConnectionStatus({
        type: 'error',
        message: error.response?.data?.error || 'Network error occurred'
      });
    }
  };

  const handleSaveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.post('/integrations/sage-vip/config', {
        endpoint_url: endpointUrl,
        username,
        password,
        company_database: companyDatabase
      });

      if (response.data.success) {
        alert('Configuration saved successfully!');
        navigate('/timecard-rollup');
      } else {
        alert('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = () => {
    if (connectionStatus.type === 'testing') {
      return <Clock size={16} className="me-1" />;
    }
    if (connectionStatus.type === 'success') {
      return <CheckCircle size={16} className="me-1" />;
    }
    if (connectionStatus.type === 'error') {
      return <XCircle size={16} className="me-1" />;
    }
    return null;
  };

  const getStatusClass = () => {
    if (connectionStatus.type === 'success') return 'text-success';
    if (connectionStatus.type === 'error') return 'text-danger';
    return 'text-info';
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>SAGE API Configuration</h2>
      </div>

      <Row>
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">
                <Database size={20} className="me-2" />
                SAGE API Integration Settings
              </h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-4">
                <Globe size={16} className="me-2" />
                <strong>Security Notice:</strong> These credentials are stored securely and used only for
                authenticated API communications with SAGE.
              </Alert>

              <Form onSubmit={handleSaveConfiguration}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <Globe size={16} className="me-1" />
                        SAGE API Endpoint URL
                      </Form.Label>
                      <Form.Control
                        type="url"
                        placeholder="https://api.sage.com/v1"
                        value={endpointUrl}
                        onChange={(e) => setEndpointUrl(e.target.value)}
                        required
                      />
                      <Form.Text>Full URL to your SAGE API endpoint (including protocol)</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <User size={16} className="me-1" />
                        API Username
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                      <Form.Text>Your SAGE API username</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <Lock size={16} className="me-1" />
                        API Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Form.Text>Your SAGE API password or access token</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <Database size={16} className="me-1" />
                        Company Database
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="COMPANY_001"
                        value={companyDatabase}
                        onChange={(e) => setCompanyDatabase(e.target.value)}
                        required
                      />
                      <Form.Text>SAGE company database identifier</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                {/* Test Connection */}
                <h6 className="mb-3">
                  <Wifi size={18} className="me-2" />
                  Connection Test
                </h6>
                <div className="d-flex align-items-center mb-4">
                  <Button variant="outline-primary" onClick={handleTestConnection} disabled={connectionStatus.type === 'testing'}>
                    {connectionStatus.type === 'testing' ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Wifi size={18} className="me-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                  {connectionStatus.message && (
                    <span className={`ms-3 ${getStatusClass()}`}>
                      {getStatusIcon()}
                      {connectionStatus.message}
                    </span>
                  )}
                </div>

                <hr className="my-4" />

                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={() => navigate('/timecard-rollup')}>
                    <ArrowLeft size={18} className="me-2" />
                    Back to Dashboard
                  </Button>
                  <Button variant="warning" type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="me-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* API Documentation */}
          <Card className="mt-4">
            <Card.Header>
              <h6 className="mb-0">
                <Book size={18} className="me-2" />
                SAGE API Integration Details
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Supported Endpoints</h6>
                  <ul className="list-unstyled">
                    <li>
                      <Check size={16} className="text-success me-2" />
                      <code>/auth/login</code> - Authentication
                    </li>
                    <li>
                      <Check size={16} className="text-success me-2" />
                      <code>/timecard/import</code> - Data Import
                    </li>
                    <li>
                      <Check size={16} className="text-success me-2" />
                      <code>/employees/sync</code> - Employee Sync
                    </li>
                    <li>
                      <Check size={16} className="text-success me-2" />
                      <code>/departments/sync</code> - Department Sync
                    </li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Data Transformation</h6>
                  <ul className="list-unstyled">
                    <li>
                      <ArrowRight size={16} className="text-info me-2" />
                      Employee rollup → Employee records
                    </li>
                    <li>
                      <ArrowRight size={16} className="text-info me-2" />
                      Department rollup → Department summaries
                    </li>
                    <li>
                      <ArrowRight size={16} className="text-info me-2" />
                      Daily rollup → Time entries
                    </li>
                    <li>
                      <ArrowRight size={16} className="text-info me-2" />
                      Combined rollup → Multi-format data
                    </li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
