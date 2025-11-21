import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Badge } from 'react-bootstrap';
import { Bell, Settings, Save } from 'lucide-react';
import { api } from '../lib/api';

export default function NotificationPreferencesPage() {
  const [notificationTypes, setNotificationTypes] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<{[key: number]: boolean}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    setLoading(true);
    try {
      const [typesRes, prefsRes] = await Promise.all([
        api.get('/notifications/types'),
        api.get('/notifications/preferences')
      ]);

      setNotificationTypes(typesRes.data || []);
      
      const prefsMap: {[key: number]: boolean} = {};
      (prefsRes.data || []).forEach((pref: any) => {
        prefsMap[pref.notification_type_id] = pref.is_enabled;
      });
      setPreferences(prefsMap);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (typeId: number) => {
    setPreferences((prev) => ({
      ...prev,
      [typeId]: !prev[typeId],
    }));
  };

  const savePreferences = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await Promise.all(
        Object.entries(preferences).map(([typeId, enabled]) =>
          api.post(`/notifications/preferences/${typeId}`, {
            is_enabled: enabled,
          })
        )
      );

      setSuccess('Notification preferences updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const categoryColors: {[key: string]: string} = {
    'time': 'primary',
    'leave': 'success',
    'scheduling': 'info',
    'payroll': 'warning',
    'system': 'secondary',
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1"><Bell className="me-2" size={28} />Notification Preferences</h2>
          <p className="text-muted mb-0">Manage which notifications you receive</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row className="mb-3">
        <Col>
          <Button variant="primary" onClick={savePreferences} disabled={loading}>
            <Save className="me-2" size={18} />
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0"><Settings className="me-2" size={20} />Notification Types</h5>
        </Card.Header>
        <Card.Body>
          {notificationTypes.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Bell size={48} className="mb-3" />
              <p>No notification types found</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Notification Type</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th className="text-center">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {notificationTypes.map((type) => (
                  <tr key={type.id}>
                    <td>
                      <Badge bg={categoryColors[type.category] || 'secondary'}>
                        {type.category}
                      </Badge>
                    </td>
                    <td><strong>{type.name}</strong></td>
                    <td className="text-muted">{type.description}</td>
                    <td>
                      <Badge
                        bg={
                          type.priority === 'urgent' ? 'danger' :
                          type.priority === 'high' ? 'warning' :
                          type.priority === 'medium' ? 'info' : 'secondary'
                        }
                      >
                        {type.priority}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Form.Check
                        type="switch"
                        checked={preferences[type.id] !== false}
                        onChange={() => togglePreference(type.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">Notification Settings Guide</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Priority Levels</h6>
              <ul>
                <li><Badge bg="danger">Urgent</Badge> - Critical notifications requiring immediate attention</li>
                <li><Badge bg="warning">High</Badge> - Important notifications that should be reviewed soon</li>
                <li><Badge bg="info">Medium</Badge> - Standard notifications for regular updates</li>
                <li><Badge bg="secondary">Low</Badge> - Informational notifications</li>
              </ul>
            </Col>
            <Col md={6}>
              <h6>Categories</h6>
              <ul>
                <li><Badge bg="primary">Time</Badge> - Time tracking, clock in/out notifications</li>
                <li><Badge bg="success">Leave</Badge> - Leave applications and approvals</li>
                <li><Badge bg="info">Scheduling</Badge> - Shift assignments and changes</li>
                <li><Badge bg="warning">Payroll</Badge> - Payroll processing and updates</li>
                <li><Badge bg="secondary">System</Badge> - System announcements and updates</li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}
