import { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Modal, Form, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { Settings, Database, Share2, Clock, Play, ArrowRight, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

interface RollupActivity {
  id: number;
  type: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  total_employees: number;
  status: string;
  sage_sent: boolean;
  created_at: string;
}

export default function TimecardRollupDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<RollupActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickRollup, setShowQuickRollup] = useState(false);
  const [quickRollupType, setQuickRollupType] = useState('employee');
  const [quickRollupPeriod, setQuickRollupPeriod] = useState('weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadRecentActivity();
    setDefaultDates();
  }, []);

  const loadRecentActivity = async () => {
    try {
      setLoading(true);
      const response = await api.get('/timecard-rollup/recent-activity');
      setActivities(response.data.activities || []);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultDates = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setStartDate(oneWeekAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const setPresetDates = (period: string) => {
    const today = new Date();
    let start: Date;

    if (period === 'weekly') {
      const dayOfWeek = today.getDay();
      start = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
    } else if (period === 'monthly') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else {
      setDefaultDates();
      return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const handlePeriodChange = (period: string) => {
    setQuickRollupPeriod(period);
    if (period !== 'custom') {
      setPresetDates(period);
    }
  };

  const handleGenerateQuickRollup = async () => {
    try {
      setGenerating(true);
      const response = await api.post('/timecard-rollup/generate', {
        rollup_type: quickRollupType,
        rollup_period: quickRollupPeriod,
        start_date: startDate,
        end_date: endDate,
        exclude_incomplete: true
      });

      if (response.data.success) {
        alert('Rollup generated successfully!');
        setShowQuickRollup(false);
        loadRecentActivity();
      }
    } catch (error) {
      console.error('Failed to generate rollup:', error);
      alert('Failed to generate rollup');
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSuperUser = user?.roles?.includes('Super User');

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Timecard Data Rollup & Integration</h2>
      </div>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <Settings size={48} className="mb-3" color="#0d6efd" />
              <h5 className="card-title">Configure Rollup</h5>
              <p className="card-text">Set up data aggregation rules and filters</p>
              <Button variant="primary" onClick={() => navigate('/timecard-rollup/configure')}>
                <ArrowRight size={18} className="me-2" />
                Configure
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <Database size={48} className="mb-3" color="#198754" />
              <h5 className="card-title">Generate Rollup</h5>
              <p className="card-text">Create aggregated timecard data reports</p>
              <Button variant="success" onClick={() => setShowQuickRollup(true)}>
                <Play size={18} className="me-2" />
                Generate
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <Share2 size={48} className="mb-3" color="#ffc107" />
              <h5 className="card-title">SAGE Integration</h5>
              <p className="card-text">Configure and manage SAGE API settings</p>
              {isSuperUser ? (
                <Button variant="warning" onClick={() => navigate('/timecard-rollup/sage-config')}>
                  <ArrowRight size={18} className="me-2" />
                  Configure
                </Button>
              ) : (
                <Button variant="secondary" disabled>
                  <Lock size={18} className="me-2" />
                  Restricted
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <Clock size={48} className="mb-3" color="#dc3545" />
              <h5 className="card-title">Integration History</h5>
              <p className="card-text">View past data transfers and logs</p>
              <Button variant="outline-danger" onClick={() => navigate('/timecard-rollup/history')}>
                <Clock size={18} className="me-2" />
                View History
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <Clock size={20} className="me-2" />
            Recent Rollup Activity
          </h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="d-flex justify-content-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-4">
              <Clock size={48} className="text-muted mb-3" />
              <h6>No Recent Activity</h6>
              <p className="text-muted">No recent activity found. Start by configuring and generating a rollup.</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {activities.map((activity) => (
                <ListGroup.Item key={activity.id} className="d-flex justify-content-between align-items-start">
                  <div className="ms-2 me-auto">
                    <div className="fw-bold d-flex align-items-center">
                      {activity.status === 'success' ? (
                        <CheckCircle size={16} className="text-success me-2" />
                      ) : (
                        <AlertCircle size={16} className="text-danger me-2" />
                      )}
                      {activity.type} Rollup
                    </div>
                    <small className="text-muted">
                      {formatDate(activity.period_start)} to {formatDate(activity.period_end)} •{' '}
                      {activity.total_hours.toFixed(1)} hours • {activity.total_employees} employees
                    </small>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">{formatDateTime(activity.created_at)}</small>
                    {activity.sage_sent && (
                      <div>
                        <Badge bg="warning" text="dark" className="mt-1">SAGE</Badge>
                      </div>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      {/* Quick Rollup Modal */}
      <Modal show={showQuickRollup} onHide={() => setShowQuickRollup(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Quick Rollup Generation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rollup Type</Form.Label>
                  <Form.Select
                    value={quickRollupType}
                    onChange={(e) => setQuickRollupType(e.target.value)}
                  >
                    <option value="employee">By Employee</option>
                    <option value="department">By Department</option>
                    <option value="daily">By Day</option>
                    <option value="combined">Combined View</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Period</Form.Label>
                  <Form.Select
                    value={quickRollupPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                  >
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                    <option value="custom">Custom Range</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            {quickRollupPeriod === 'custom' && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuickRollup(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleGenerateQuickRollup} disabled={generating}>
            {generating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Generating...
              </>
            ) : (
              <>
                <Play size={18} className="me-2" />
                Generate Rollup
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
