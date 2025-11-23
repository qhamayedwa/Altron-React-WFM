import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Form, Button, Badge, Modal, Spinner } from 'react-bootstrap';
import { Settings, Play, RefreshCw, Cpu, Sliders, Activity, Inbox } from 'lucide-react';

interface WorkflowStats {
  total_employees: number;
  pending_leave_applications: number;
  open_time_entries: number;
  active_workflows: number;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  schedule: string;
  last_run: string;
  status: string;
  enabled: boolean;
}

interface WorkflowRun {
  workflow_name: string;
  run_time: string;
  status: string;
  records_processed: number;
  duration: number;
}

const AutomationDashboard: React.FC = () => {
  const [workflowStats, setWorkflowStats] = useState<WorkflowStats>({
    total_employees: 0,
    pending_leave_applications: 0,
    open_time_entries: 0,
    active_workflows: 0
  });
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [recentHistory, setRecentHistory] = useState<WorkflowRun[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<string>('');
  const [workflowStatus, setWorkflowStatus] = useState<string>('Processing...');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/automation/dashboard');
      const data = await response.json();
      
      setWorkflowStats(data.workflow_stats || {});
      setWorkflows(data.workflows || []);
      setRecentHistory(data.recent_history || []);
    } catch (error) {
      console.error('Failed to load automation dashboard:', error);
    }
  };

  const runWorkflow = async (workflowId: string, workflowName: string) => {
    setCurrentWorkflow(workflowName);
    setWorkflowStatus(`Running ${workflowName}...`);
    setShowModal(true);
    
    let endpoint;
    switch(workflowId) {
      case 'leave_accrual':
        endpoint = '/automation/run-accrual';
        break;
      case 'notifications':
        endpoint = '/automation/run-notifications';
        break;
      case 'payroll':
        endpoint = '/automation/run-payroll';
        break;
      default:
        console.error('Unknown workflow:', workflowId);
        setShowModal(false);
        return;
    }
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      setShowModal(false);
      
      if (data.success) {
        showAlert('success', `${workflowName} completed successfully. ${data.message}`);
        setTimeout(() => loadDashboardData(), 2000);
      } else {
        showAlert('danger', `Error running ${workflowName}: ${data.message}`);
      }
    } catch (error) {
      setShowModal(false);
      showAlert('danger', `Error running ${workflowName}: ${error}`);
    }
  };

  const runAllWorkflows = () => {
    if (confirm('Are you sure you want to run all workflows? This may take several minutes.')) {
      const workflowIds = ['leave_accrual', 'notifications', 'payroll'];
      let completed = 0;
      
      setShowModal(true);
      
      workflowIds.forEach((workflowId, index) => {
        setTimeout(() => {
          setWorkflowStatus(`Running workflow ${index + 1} of ${workflowIds.length}...`);
          runWorkflow(workflowId, workflowId);
        }, index * 5000);
      });
    }
  };

  const toggleWorkflow = (workflowId: string) => {
    showAlert('info', `Workflow ${workflowId} toggled`);
  };

  const refreshStatus = () => {
    loadDashboardData();
  };

  const showAlert = (type: string, message: string) => {
    alert(message);
  };

  return (
    
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <Settings className="me-2" size={32} style={{ verticalAlign: 'middle' }} />
            Automation & Workflow Management
          </h2>
          <div className="d-flex gap-2">
            <Link to="/automation/workflows" className="btn btn-primary">
              <Settings className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
              Configure Time & Attendance Workflows
            </Link>
            <Button variant="success" onClick={runAllWorkflows}>
              <Play className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
              Run All Workflows
            </Button>
            <Button variant="outline-secondary" onClick={refreshStatus}>
              <RefreshCw className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
              Refresh Status
            </Button>
          </div>
        </div>

        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <div className="display-6 text-primary">{workflowStats.total_employees}</div>
                <h6 className="card-title">Active Employees</h6>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <div className="display-6 text-warning">{workflowStats.pending_leave_applications}</div>
                <h6 className="card-title">Pending Applications</h6>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <div className="display-6 text-info">{workflowStats.open_time_entries}</div>
                <h6 className="card-title">Open Time Entries</h6>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <div className="display-6 text-success">{workflowStats.active_workflows}</div>
                <h6 className="card-title">Active Workflows</h6>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <Cpu className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
              Automated Workflows
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {workflows.map((workflow) => (
                <Col md={4} key={workflow.id} className="mb-3">
                  <Card className={`border-${workflow.enabled ? 'success' : 'secondary'}`}>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{workflow.name}</h6>
                      <Badge bg={workflow.status === 'Ready' ? 'success' : 'warning'}>
                        {workflow.status}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <p className="card-text small">{workflow.description}</p>
                      <div className="mb-2">
                        <strong>Schedule:</strong> {workflow.schedule}
                      </div>
                      <div className="mb-3">
                        <strong>Last Run:</strong>{' '}
                        <span className="text-muted">{workflow.last_run}</span>
                      </div>
                      <div className="d-grid gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => runWorkflow(workflow.id, workflow.name)}
                          disabled={!workflow.enabled}
                        >
                          <Play className="me-1" size={18} style={{ verticalAlign: 'middle' }} />
                          Run Now
                        </Button>
                        <Form.Check
                          type="switch"
                          id={`enable_${workflow.id}`}
                          label="Auto-run Enabled"
                          checked={workflow.enabled}
                          onChange={() => toggleWorkflow(workflow.id)}
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <Sliders className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
              Workflow Configuration
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6>Leave Accrual Settings</h6>
                <Form className="mb-3">
                  <Form.Group className="mb-2">
                    <Form.Label>Target Month/Year</Form.Label>
                    <Row>
                      <Col xs={6}>
                        <Form.Select size="sm">
                          <option value="current">Current Month</option>
                          {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col xs={6}>
                        <Form.Select size="sm">
                          <option value="current">Current Year</option>
                          {[2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </Form.Group>
                  <Form.Check
                    type="checkbox"
                    id="process_all_employees"
                    label="Process All Active Employees"
                    defaultChecked
                  />
                </Form>
              </Col>

              <Col md={6}>
                <h6>Notification Settings</h6>
                <Form className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="send_leave_alerts"
                    label="Leave Expiration Alerts"
                    defaultChecked
                    className="mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="send_approval_reminders"
                    label="Approval Reminders"
                    defaultChecked
                    className="mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="send_schedule_notifications"
                    label="Schedule Change Notifications"
                    defaultChecked
                    className="mb-2"
                  />
                </Form>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h5 className="mb-0">
              <Activity className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
              Recent Automation Activity
            </h5>
          </Card.Header>
          <Card.Body>
            {recentHistory && recentHistory.length > 0 ? (
              <div className="table-responsive">
                <Table size="sm">
                  <thead>
                    <tr>
                      <th>Workflow</th>
                      <th>Run Time</th>
                      <th>Status</th>
                      <th>Records Processed</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentHistory.map((run, index) => (
                      <tr key={index}>
                        <td>{run.workflow_name}</td>
                        <td>{new Date(run.run_time).toLocaleString()}</td>
                        <td>
                          <Badge bg={run.status === 'Success' ? 'success' : 'danger'}>
                            {run.status}
                          </Badge>
                        </td>
                        <td>{run.records_processed}</td>
                        <td>{run.duration}s</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-muted py-4">
                <Inbox size={48} />
                <p className="mt-2">No automation runs recorded yet</p>
                <p className="small">Manual workflow executions will appear here</p>
              </div>
            )}
          </Card.Body>
        </Card>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header>
            <Modal.Title>Running Workflow</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p>{workflowStatus}</p>
          </Modal.Body>
        </Modal>
      </Container>
    
  );
};

export default AutomationDashboard;
