import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Modal, Badge } from 'react-bootstrap';
import { ArrowLeft, Zap, Brain, Users, TrendingUp, Shield, CheckCircle, Calendar, RefreshCw, Check, X, Edit } from 'lucide-react';
import api from '../api/client';

interface Department {
  id: number;
  name: string;
}

interface Recommendation {
  id: number;
  employeeName: string;
  employeeId: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: string;
  hours: number;
  confidence: number;
}

interface Metrics {
  optimizationScore: number;
  coveragePercentage: number;
  costEfficiency: number;
  employeeSatisfaction: number;
}

interface CoverageSlot {
  timeSlot: string;
  required: number;
  scheduled: number;
}

export default function AIScheduleGenerate() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [coverage, setCoverage] = useState<CoverageSlot[]>([]);
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [notifyEmployees, setNotifyEmployees] = useState(true);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const twoWeeks = new Date(today);
  twoWeeks.setDate(today.getDate() + 14);
  
  const [formData, setFormData] = useState({
    startDate: nextWeek.toISOString().split('T')[0],
    endDate: twoWeeks.toISOString().split('T')[0],
    departmentId: '',
    availabilityOptimization: true,
    preferenceOptimization: true,
    coverageOptimization: true
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/organization/departments');
      setDepartments(response.data.departments || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/ai/generate-schedule', {
        start_date: formData.startDate,
        end_date: formData.endDate,
        department_id: formData.departmentId || null,
        availability_optimization: formData.availabilityOptimization,
        preference_optimization: formData.preferenceOptimization,
        coverage_optimization: formData.coverageOptimization
      });

      if (response.data.success) {
        setRecommendations(response.data.recommendations || []);
        setMetrics(response.data.metrics || null);
        setCoverage(response.data.coverage || []);
        setShowResults(true);
        setSuccess('AI schedule generation completed successfully!');
      } else {
        setError(response.data.message || 'Failed to generate AI schedule');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate AI schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySchedule = async () => {
    try {
      const response = await api.post('/ai/apply-schedule', {
        recommendations: recommendations.map(r => r.id),
        notify_employees: notifyEmployees,
        overwrite_existing: overwriteExisting
      });

      if (response.data.success) {
        setSuccess('Schedule applied successfully! Employees have been notified.');
        setShowApplyModal(false);
        setTimeout(() => navigate('/manage-schedules'), 2000);
      } else {
        setError(response.data.message || 'Failed to apply schedule');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to apply schedule');
    }
    setShowApplyModal(false);
  };

  const handleApproveRecommendation = async (id: number) => {
    if (!window.confirm('Approve this schedule recommendation?')) return;
    
    try {
      const response = await api.post(`/ai/approve-recommendation/${id}`);
      if (response.data.success) {
        setSuccess('Recommendation approved');
        setRecommendations(recommendations.map(r => 
          r.id === id ? { ...r, confidence: 100 } : r
        ));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve recommendation');
    }
  };

  const handleRejectRecommendation = async (id: number) => {
    if (!window.confirm('Reject this schedule recommendation?')) return;
    
    try {
      const response = await api.post(`/ai/reject-recommendation/${id}`);
      if (response.data.success) {
        setRecommendations(recommendations.filter(r => r.id !== id));
        setSuccess('Recommendation rejected');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject recommendation');
    }
  };

  const getCoverageStatus = (slot: CoverageSlot) => {
    const percentage = slot.required > 0 ? (slot.scheduled / slot.required) * 100 : 0;
    if (percentage >= 100) return <Badge bg="success">Fully Covered</Badge>;
    if (percentage >= 80) return <Badge bg="warning">Adequate</Badge>;
    return <Badge bg="danger">Under-staffed</Badge>;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return <Badge bg="success">{confidence}%</Badge>;
    if (confidence >= 70) return <Badge bg="warning">{confidence}%</Badge>;
    return <Badge bg="danger">{confidence}%</Badge>;
  };

  if (showResults) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <Zap size={24} className="me-2" />
            AI-Generated Schedule Results
          </h2>
          <div className="btn-group">
            <Button variant="outline-primary" onClick={() => setShowResults(false)}>
              <RefreshCw size={16} className="me-2" />
              Generate New Schedule
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate('/ai-scheduling')}>
              <ArrowLeft size={16} className="me-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        {metrics && (
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <TrendingUp size={18} className="me-2" />
                Optimization Metrics
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center p-3 border rounded">
                    <div className="h4 text-success mb-1">{metrics.optimizationScore}%</div>
                    <small className="text-muted">Optimization Score</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 border rounded">
                    <div className="h4 text-info mb-1">{metrics.coveragePercentage}%</div>
                    <small className="text-muted">Coverage Rate</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 border rounded">
                    <div className="h4 text-warning mb-1">{metrics.costEfficiency}%</div>
                    <small className="text-muted">Cost Efficiency</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 border rounded">
                    <div className="h4 text-primary mb-1">{metrics.employeeSatisfaction}%</div>
                    <small className="text-muted">Employee Satisfaction</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {coverage.length > 0 && (
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <Calendar size={18} className="me-2" />
                Coverage Analysis
              </h5>
            </Card.Header>
            <Card.Body>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>Time Slot</th>
                    <th>Required Staff</th>
                    <th>Scheduled Staff</th>
                    <th>Coverage Status</th>
                  </tr>
                </thead>
                <tbody>
                  {coverage.map((slot, index) => (
                    <tr key={index}>
                      <td>{slot.timeSlot}</td>
                      <td>{slot.required}</td>
                      <td>{slot.scheduled}</td>
                      <td>{getCoverageStatus(slot)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <Calendar size={18} className="me-2" />
              Schedule Recommendations
            </h5>
            {recommendations.length > 0 && (
              <Button variant="success" size="sm" onClick={() => setShowApplyModal(true)}>
                <Check size={16} className="me-2" />
                Apply Schedule
              </Button>
            )}
          </Card.Header>
          <Card.Body>
            {recommendations.length > 0 ? (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Hours</th>
                    <th>Confidence</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((rec) => (
                    <tr key={rec.id}>
                      <td>
                        <strong>{rec.employeeName}</strong>
                        <br /><small className="text-muted">{rec.employeeId}</small>
                      </td>
                      <td>{rec.department}</td>
                      <td>{rec.date}</td>
                      <td>
                        {rec.startTime} - {rec.endTime}
                        <br /><small className="text-muted">{rec.shiftType}</small>
                      </td>
                      <td>{rec.hours}h</td>
                      <td>{getConfidenceBadge(rec.confidence)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => handleApproveRecommendation(rec.id)}
                            title="Approve"
                          >
                            <Check size={14} />
                          </Button>
                          <Button 
                            variant="outline-warning" 
                            size="sm"
                            title="Modify"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRejectRecommendation(rec.id)}
                            title="Reject"
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-5">
                <Calendar size={64} className="text-warning mb-3" />
                <h5 className="text-warning">No Schedule Generated</h5>
                <p className="text-muted">The AI scheduling system could not generate recommendations with the current parameters.</p>
                <Button variant="primary" onClick={() => setShowResults(false)}>
                  <RefreshCw size={16} className="me-2" />
                  Try Again
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Apply AI-Generated Schedule</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info">
              This will apply the AI-generated schedule recommendations to your system. Employees will be notified of their new assignments.
            </Alert>
            <Form.Check
              type="checkbox"
              id="notifyEmployees"
              label="Send notifications to affected employees"
              checked={notifyEmployees}
              onChange={(e) => setNotifyEmployees(e.target.checked)}
              className="mb-2"
            />
            <Form.Check
              type="checkbox"
              id="overwriteExisting"
              label="Overwrite existing conflicting schedules"
              checked={overwriteExisting}
              onChange={(e) => setOverwriteExisting(e.target.checked)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowApplyModal(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleApplySchedule}>
              <Check size={16} className="me-2" />
              Apply Schedule
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">Generate AI-Optimized Schedule</h1>
          <p className="text-muted">Create intelligent schedules based on employee availability and preferences</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/ai-scheduling')}>
          <ArrowLeft size={16} className="me-2" />
          Back to Dashboard
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Schedule Generation Parameters</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.startDate}
                        min={today.toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.endDate}
                        min={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Department (Optional)</Form.Label>
                  <Form.Select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Leave blank to generate schedules for all employees
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>AI Optimization Options</Form.Label>
                  <Form.Check
                    type="checkbox"
                    id="availability_optimization"
                    label="Optimize based on employee availability patterns"
                    checked={formData.availabilityOptimization}
                    onChange={(e) => setFormData({ ...formData, availabilityOptimization: e.target.checked })}
                  />
                  <Form.Check
                    type="checkbox"
                    id="preference_optimization"
                    label="Consider employee shift preferences"
                    checked={formData.preferenceOptimization}
                    onChange={(e) => setFormData({ ...formData, preferenceOptimization: e.target.checked })}
                  />
                  <Form.Check
                    type="checkbox"
                    id="coverage_optimization"
                    label="Ensure optimal coverage across all shifts"
                    checked={formData.coverageOptimization}
                    onChange={(e) => setFormData({ ...formData, coverageOptimization: e.target.checked })}
                  />
                </Form.Group>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap size={16} className="me-2" />
                        Generate AI Schedule
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">AI Scheduling Features</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <Brain size={18} className="text-primary me-2" />
                  <h6 className="mb-0">Smart Analysis</h6>
                </div>
                <p className="text-muted small">Analyzes historical patterns and employee preferences to create optimal schedules.</p>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <Users size={18} className="text-success me-2" />
                  <h6 className="mb-0">Availability Matching</h6>
                </div>
                <p className="text-muted small">Considers leave applications, time-off requests, and availability constraints.</p>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <TrendingUp size={18} className="text-warning me-2" />
                  <h6 className="mb-0">Performance Optimization</h6>
                </div>
                <p className="text-muted small">Maximizes schedule efficiency while maintaining work-life balance.</p>
              </div>

              <div className="mb-0">
                <div className="d-flex align-items-center mb-2">
                  <Shield size={18} className="text-info me-2" />
                  <h6 className="mb-0">Coverage Assurance</h6>
                </div>
                <p className="text-muted small">Ensures adequate staffing across all shifts and departments.</p>
              </div>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <h5 className="card-title mb-0">Generation Tips</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  <small>Generate schedules 1-2 weeks in advance for best results</small>
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  <small>Review and approve leave applications before generating</small>
                </li>
                <li className="mb-2">
                  <CheckCircle size={16} className="text-success me-2" />
                  <small>Consider department-specific needs and requirements</small>
                </li>
                <li className="mb-0">
                  <CheckCircle size={16} className="text-success me-2" />
                  <small>Review AI recommendations before final approval</small>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
