import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Badge, Breadcrumb } from 'react-bootstrap';
import { Bell, Play, Pause, Save, RefreshCcw, FileText, PlayCircle, Copy, Download, Activity } from 'lucide-react';

interface TriggerActivity {
  title: string;
  time: string;
  icon: string;
  color: string;
}

interface Trigger {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  enabled: boolean;
  module: string;
  default_priority: string;
  delay_minutes: number;
  batch_size: number;
  categories: string[];
  target_roles: string[];
  total_triggers: number;
  recent_triggers: number;
  success_rate: number;
  avg_processing_time: number;
  last_triggered: string | null;
  recent_activity: TriggerActivity[];
}

const NotificationTriggerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trigger, setTrigger] = useState<Trigger>({
    slug: id || '',
    name: 'Loading...',
    description: '',
    icon: 'bell',
    color: 'primary',
    enabled: true,
    module: '',
    default_priority: 'medium',
    delay_minutes: 0,
    batch_size: 50,
    categories: [],
    target_roles: [],
    total_triggers: 0,
    recent_triggers: 0,
    success_rate: 0,
    avg_processing_time: 0,
    last_triggered: null,
    recent_activity: []
  });

  useEffect(() => {
    loadTriggerDetails();
  }, [id]);

  const loadTriggerDetails = async () => {
    try {
      const response = await fetch(`/api/notifications/triggers/${id}`);
      const data = await response.json();
      if (data.trigger) {
        setTrigger(data.trigger);
      }
    } catch (error) {
      console.error('Failed to load trigger details:', error);
    }
  };

  const toggleTrigger = async () => {
    try {
      const response = await fetch(`/notifications/admin/trigger/${trigger.slug}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !trigger.enabled })
      });

      const data = await response.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert('Error toggling trigger: ' + data.message);
      }
    } catch (error) {
      alert('Error toggling trigger');
    }
  };

  const testTrigger = async () => {
    if (confirm('Run a test trigger to verify configuration?')) {
      try {
        const response = await fetch(`/notifications/admin/trigger/${trigger.slug}/test`, {
          method: 'POST'
        });

        const data = await response.json();
        if (data.success) {
          alert('Test trigger executed successfully!');
        } else {
          alert('Test failed: ' + data.message);
        }
      } catch (error) {
        alert('Error running test trigger');
      }
    }
  };

  const resetSettings = () => {
    if (confirm('Reset all settings to defaults?')) {
      setTrigger({
        ...trigger,
        default_priority: 'medium',
        delay_minutes: 0,
        batch_size: 50,
        categories: [],
        target_roles: []
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/notifications/admin/trigger/${trigger.slug}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trigger)
      });

      const data = await response.json();
      if (data.success) {
        alert('Configuration saved successfully!');
      } else {
        alert('Error saving configuration: ' + data.message);
      }
    } catch (error) {
      alert('Error saving configuration');
    }
  };

  const viewLogs = () => {
    window.open(`/notifications/admin/trigger/${trigger.slug}/logs`, '_blank');
  };

  const duplicateTrigger = () => {
    const newName = prompt('Enter name for the duplicated trigger:');
    if (newName) {
      alert('Trigger would be duplicated with name: ' + newName);
    }
  };

  const exportConfig = () => {
    window.location.href = `/notifications/admin/trigger/${trigger.slug}/export`;
  };

  return (
    
      <Container fluid className="py-4">
        <Row>
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <Breadcrumb>
                  <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/notifications/management' }}>
                    Notification Management
                  </Breadcrumb.Item>
                  <Breadcrumb.Item active>{trigger.name}</Breadcrumb.Item>
                </Breadcrumb>
                <h1 className="h3 mb-0 text-gray-800">
                  <Bell className="me-2" size={28} style={{ verticalAlign: 'middle' }} />
                  {trigger.name} Configuration
                </h1>
                <p className="text-muted">{trigger.description}</p>
              </div>
              <div className="btn-group" role="group">
                <Button variant="outline-secondary" onClick={testTrigger}>
                  <Play className="me-1" size={18} style={{ verticalAlign: 'middle' }} />
                  Test Trigger
                </Button>
                <Button
                  variant={trigger.enabled ? 'success' : 'danger'}
                  onClick={toggleTrigger}
                >
                  {trigger.enabled ? (
                    <><Pause className="me-1" size={18} style={{ verticalAlign: 'middle' }} />Disable</>
                  ) : (
                    <><Play className="me-1" size={18} style={{ verticalAlign: 'middle' }} />Enable</>
                  )}
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            <Card className="shadow mb-4">
              <Card.Header className="py-3">
                <h6 className="m-0 font-weight-bold text-primary">Trigger Settings</h6>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Trigger Name</Form.Label>
                        <Form.Control type="text" value={trigger.name} readOnly />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Module</Form.Label>
                        <Form.Control type="text" value={trigger.module} readOnly />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Check
                          type="switch"
                          id="triggerEnabled"
                          label={trigger.enabled ? 'Enabled' : 'Disabled'}
                          checked={trigger.enabled}
                          onChange={(e) => setTrigger({ ...trigger, enabled: e.target.checked })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Default Priority</Form.Label>
                        <Form.Select
                          value={trigger.default_priority}
                          onChange={(e) => setTrigger({ ...trigger, default_priority: e.target.value })}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Trigger Delay (minutes)</Form.Label>
                        <Form.Control
                          type="number"
                          value={trigger.delay_minutes}
                          onChange={(e) => setTrigger({ ...trigger, delay_minutes: parseInt(e.target.value) })}
                          min="0"
                          max="1440"
                        />
                        <Form.Text className="text-muted">Delay before sending notifications (0 = immediate)</Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Batch Size</Form.Label>
                        <Form.Control
                          type="number"
                          value={trigger.batch_size}
                          onChange={(e) => setTrigger({ ...trigger, batch_size: parseInt(e.target.value) })}
                          min="1"
                          max="1000"
                        />
                        <Form.Text className="text-muted">Maximum notifications per batch</Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={trigger.description}
                      onChange={(e) => setTrigger({ ...trigger, description: e.target.value })}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Notification Categories</Form.Label>
                        {['leave', 'timecard', 'schedule', 'system'].map((cat) => (
                          <Form.Check
                            key={cat}
                            type="checkbox"
                            id={`cat_${cat}`}
                            label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                            checked={trigger.categories.includes(cat)}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...trigger.categories, cat]
                                : trigger.categories.filter(c => c !== cat);
                              setTrigger({ ...trigger, categories: newCategories });
                            }}
                          />
                        ))}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Target Roles</Form.Label>
                        {['Employee', 'Manager', 'Admin', 'Super User'].map((role) => (
                          <Form.Check
                            key={role}
                            type="checkbox"
                            id={`role_${role}`}
                            label={role}
                            checked={trigger.target_roles.includes(role)}
                            onChange={(e) => {
                              const newRoles = e.target.checked
                                ? [...trigger.target_roles, role]
                                : trigger.target_roles.filter(r => r !== role);
                              setTrigger({ ...trigger, target_roles: newRoles });
                            }}
                          />
                        ))}
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-between">
                    <Button variant="outline-secondary" onClick={resetSettings}>
                      <RefreshCcw className="me-1" size={18} style={{ verticalAlign: 'middle' }} />
                      Reset to Defaults
                    </Button>
                    <Button type="submit" variant="primary">
                      <Save className="me-1" size={18} style={{ verticalAlign: 'middle' }} />
                      Save Configuration
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow mb-4">
              <Card.Header className="py-3">
                <h6 className="m-0 font-weight-bold text-primary">Trigger Statistics</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3 d-flex justify-content-between">
                  <span>Total Triggers</span>
                  <strong>{trigger.total_triggers}</strong>
                </div>
                <div className="mb-3 d-flex justify-content-between">
                  <span>Last 24 Hours</span>
                  <strong>{trigger.recent_triggers}</strong>
                </div>
                <div className="mb-3 d-flex justify-content-between">
                  <span>Success Rate</span>
                  <strong>{trigger.success_rate}%</strong>
                </div>
                <div className="mb-3 d-flex justify-content-between">
                  <span>Avg. Processing Time</span>
                  <strong>{trigger.avg_processing_time}ms</strong>
                </div>
                <div className="mb-3 d-flex justify-content-between">
                  <span>Last Triggered</span>
                  <strong>{trigger.last_triggered || 'Never'}</strong>
                </div>
              </Card.Body>
            </Card>

            <Card className="shadow mb-4">
              <Card.Header className="py-3">
                <h6 className="m-0 font-weight-bold text-primary">Recent Activity</h6>
              </Card.Header>
              <Card.Body>
                {trigger.recent_activity && trigger.recent_activity.length > 0 ? (
                  trigger.recent_activity.map((activity, index) => (
                    <div key={index} className="d-flex align-items-center mb-3">
                      <div className="me-3">
                        <div className={`bg-${activity.color} rounded-circle p-2`} style={{ width: '32px', height: '32px' }}>
                          <Activity className="text-white" size={16} />
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="small font-weight-bold">{activity.title}</div>
                        <div className="small text-muted">{activity.time}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-3">
                    <Activity className="mb-2" size={24} />
                    <div>No recent activity</div>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card className="shadow">
              <Card.Header className="py-3">
                <h6 className="m-0 font-weight-bold text-primary">Quick Actions</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button variant="outline-primary" size="sm" onClick={viewLogs}>
                    <FileText className="me-1" size={18} style={{ verticalAlign: 'middle' }} />
                    View Trigger Logs
                  </Button>
                  <Button variant="outline-success" size="sm" onClick={testTrigger}>
                    <PlayCircle className="me-1" size={18} style={{ verticalAlign: 'middle' }} />
                    Run Test Trigger
                  </Button>
                  <Button variant="outline-warning" size="sm" onClick={duplicateTrigger}>
                    <Copy className="me-1" size={18} style={{ verticalAlign: 'middle' }} />
                    Duplicate Trigger
                  </Button>
                  <Button variant="outline-info" size="sm" onClick={exportConfig}>
                    <Download className="me-1" size={18} style={{ verticalAlign: 'middle' }} />
                    Export Configuration
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    
  );
};

export default NotificationTriggerDetail;
