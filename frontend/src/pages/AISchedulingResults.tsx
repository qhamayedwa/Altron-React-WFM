import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { Cpu, RefreshCw, ArrowLeft, TrendingUp, BarChart2, Calendar, Check, Edit, X, AlertTriangle } from 'lucide-react';

interface Metrics {
  optimization_score?: number;
  coverage_percentage?: number;
  cost_efficiency?: number;
  employee_satisfaction?: number;
}

interface CoverageSlot {
  time_slot?: string;
  required?: number;
  scheduled?: number;
}

interface Recommendation {
  id?: number;
  employee_name?: string;
  employee_id?: string;
  department?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  shift_type?: string;
  hours?: number;
  confidence?: number;
}

const AISchedulingResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [coverage, setCoverage] = useState<CoverageSlot[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [notifyEmployees, setNotifyEmployees] = useState(true);
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  useEffect(() => {
    loadResults();
  }, [id]);

  const loadResults = async () => {
    try {
      const response = await fetch(`/api/ai-scheduling/results/${id}`);
      const data = await response.json();
      
      setMetrics(data.metrics || {});
      setCoverage(data.coverage || []);
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Failed to load results:', error);
    }
  };

  const applySchedule = () => {
    setShowApplyModal(true);
  };

  const confirmApplySchedule = async () => {
    try {
      const response = await fetch('/ai-scheduling/apply-ai-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notify_employees: notifyEmployees,
          overwrite_existing: overwriteExisting
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Schedule applied successfully! Employees have been notified.');
        window.location.href = '/scheduling/manage';
      } else {
        alert(data.message || 'Error applying schedule');
      }
    } catch (error) {
      alert('Error applying schedule');
    }

    setShowApplyModal(false);
  };

  const approveRecommendation = async (recId: number) => {
    if (!confirm('Approve this schedule recommendation?')) return;

    try {
      const response = await fetch(`/ai-scheduling/approve-recommendation/${recId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Recommendation approved');
        loadResults();
      } else {
        alert(data.message || 'Error approving recommendation');
      }
    } catch (error) {
      alert('Error approving recommendation');
    }
  };

  const rejectRecommendation = async (recId: number) => {
    if (!confirm('Reject this schedule recommendation?')) return;

    try {
      const response = await fetch(`/ai-scheduling/reject-recommendation/${recId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Recommendation rejected');
        loadResults();
      } else {
        alert(data.message || 'Error rejecting recommendation');
      }
    } catch (error) {
      alert('Error rejecting recommendation');
    }
  };

  const modifyRecommendation = (recId: number) => {
    alert('Modification feature coming soon');
  };

  const getCoverageStatus = (slot: CoverageSlot) => {
    if (!slot.required || slot.required === 0) return { text: 'N/A', variant: 'secondary' };
    const coveragePct = (slot.scheduled || 0) / slot.required * 100;
    if (coveragePct >= 100) return { text: 'Fully Covered', variant: 'success' };
    if (coveragePct >= 80) return { text: 'Adequate', variant: 'warning' };
    return { text: 'Under-staffed', variant: 'danger' };
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return 'secondary';
    if (confidence >= 90) return 'success';
    if (confidence >= 70) return 'warning';
    return 'danger';
  };

  return (
    
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <Cpu className="me-2" size={32} style={{ verticalAlign: 'middle' }} />
            AI-Generated Schedule Results
          </h2>
          <div className="btn-group">
            <Link to="/ai-scheduling" className="btn btn-outline-primary">
              <RefreshCw className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
              Generate New Schedule
            </Link>
            <Link to="/ai-scheduling" className="btn btn-outline-secondary">
              <ArrowLeft className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {metrics && (
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <TrendingUp className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
                Optimization Metrics
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center p-3 border rounded">
                    <div className="h4 text-success mb-1">{metrics.optimization_score || 'N/A'}%</div>
                    <small className="text-muted">Optimization Score</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 border rounded">
                    <div className="h4 text-info mb-1">{metrics.coverage_percentage || 'N/A'}%</div>
                    <small className="text-muted">Coverage Rate</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 border rounded">
                    <div className="h4 text-warning mb-1">{metrics.cost_efficiency || 'N/A'}%</div>
                    <small className="text-muted">Cost Efficiency</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 border rounded">
                    <div className="h4 text-primary mb-1">{metrics.employee_satisfaction || 'N/A'}%</div>
                    <small className="text-muted">Employee Satisfaction</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {coverage && coverage.length > 0 && (
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <BarChart2 className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
                Coverage Analysis
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table size="sm">
                  <thead>
                    <tr>
                      <th>Time Slot</th>
                      <th>Required Staff</th>
                      <th>Scheduled Staff</th>
                      <th>Coverage Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverage.map((slot, index) => {
                      const status = getCoverageStatus(slot);
                      return (
                        <tr key={index}>
                          <td>{slot.time_slot || 'Unknown'}</td>
                          <td>{slot.required || 0}</td>
                          <td>{slot.scheduled || 0}</td>
                          <td>
                            <Badge bg={status.variant}>{status.text}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                    {coverage.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted">No coverage data available</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {recommendations && recommendations.length > 0 ? (
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <Calendar className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
                Schedule Recommendations
              </h5>
              <Button variant="success" size="sm" onClick={applySchedule}>
                <Check className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                Apply Schedule
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
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
                    {recommendations.map((rec, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{rec.employee_name || 'Unknown'}</strong>
                          <br /><small className="text-muted">{rec.employee_id || 'N/A'}</small>
                        </td>
                        <td>{rec.department || 'N/A'}</td>
                        <td>{rec.date || 'N/A'}</td>
                        <td>
                          {rec.start_time || 'N/A'} - {rec.end_time || 'N/A'}
                          <br /><small className="text-muted">{rec.shift_type || 'Regular'}</small>
                        </td>
                        <td>{rec.hours || 0}h</td>
                        <td>
                          <Badge bg={getConfidenceBadge(rec.confidence)}>
                            {rec.confidence || 0}%
                          </Badge>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => approveRecommendation(rec.id || 0)}
                              title="Approve"
                            >
                              <Check size={16} />
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => modifyRecommendation(rec.id || 0)}
                              title="Modify"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => rejectRecommendation(rec.id || 0)}
                              title="Reject"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Body className="text-center py-5">
              <AlertTriangle className="text-warning mb-3" size={64} />
              <h5 className="text-warning">No Schedule Generated</h5>
              <p className="text-muted">The AI scheduling system could not generate recommendations with the current parameters.</p>
              <Link to="/ai-scheduling" className="btn btn-primary">
                <RefreshCw className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                Try Again
              </Link>
            </Card.Body>
          </Card>
        )}

        <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Apply AI-Generated Schedule</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="alert alert-info">
              This will apply the AI-generated schedule recommendations to your system. Employees will be notified of their new assignments.
            </div>
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
            <Button variant="success" onClick={confirmApplySchedule}>
              <Check className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
              Apply Schedule
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    
  );
};

export default AISchedulingResults;
