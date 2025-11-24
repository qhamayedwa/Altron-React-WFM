import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Plus, Edit, Play, Pause, Filter, AlertCircle, BarChart } from 'lucide-react';
import { Modal, Button, Form } from 'react-bootstrap';

interface Workflow {
  id: number;
  name: string;
  workflow_type: string;
  trigger: string;
  schedule?: string;
  is_active: boolean;
  last_run?: string;
  next_run?: string;
}

const AutomationWorkflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    workflow_type: 'leave_accrual',
    trigger: 'scheduled',
    schedule: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/automation/workflows', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    if (filterType !== 'all' && workflow.workflow_type !== filterType) return false;
    if (filterStatus === 'active' && !workflow.is_active) return false;
    if (filterStatus === 'inactive' && workflow.is_active) return false;
    return true;
  });

  const toggleWorkflow = async (id: number, isActive: boolean) => {
    try {
      await fetch(`/api/automation/workflows/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ is_active: !isActive })
      });
      fetchWorkflows();
    } catch (error) {
      console.error('Error toggling workflow:', error);
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/automation/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          workflow_type: 'leave_accrual',
          trigger: 'scheduled',
          schedule: '',
          description: '',
          is_active: true
        });
        fetchWorkflows();
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Zap className="me-2" size={32} style={{ color: '#28468D' }} />
              <h2 className="mb-0">Automation & Workflows</h2>
            </div>
            <div className="d-flex gap-2">
              <Link 
                to="/automation/dashboard"
                className="btn btn-info"
                style={{ backgroundColor: '#54B8DF', borderColor: '#54B8DF' }}
              >
                <BarChart size={18} className="me-2" />
                Dashboard
              </Link>
              <button 
                className="btn btn-primary"
                style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={18} className="me-2" />
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
              <Filter size={20} className="me-2" style={{ color: '#28468D' }} />
              <strong>Filters</strong>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Workflow Type</label>
                  <select 
                    className="form-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="leave_accrual">Leave Accrual</option>
                    <option value="payroll">Payroll Processing</option>
                    <option value="notification">Notifications</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
              <strong>Quick Stats</strong>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Total Workflows:</span>
                <strong>{workflows.length}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Active:</span>
                <strong className="text-success">{workflows.filter(w => w.is_active).length}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Inactive:</span>
                <strong className="text-secondary">{workflows.filter(w => !w.is_active).length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
              <strong>Configured Workflows ({filteredWorkflows.length})</strong>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status" style={{ color: '#28468D' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredWorkflows.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <AlertCircle size={48} className="mb-3" />
                  <p>No workflows found matching your filters.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th>Workflow Name</th>
                        <th>Type</th>
                        <th>Trigger</th>
                        <th>Schedule</th>
                        <th>Last Run</th>
                        <th>Next Run</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkflows.map((workflow) => (
                        <tr key={workflow.id}>
                          <td><strong>{workflow.name}</strong></td>
                          <td>
                            <span className="badge" style={{
                              backgroundColor: 
                                workflow.workflow_type === 'leave_accrual' ? '#28468D' :
                                workflow.workflow_type === 'payroll' ? '#54B8DF' :
                                '#28a745'
                            }}>
                              {workflow.workflow_type}
                            </span>
                          </td>
                          <td>{workflow.trigger}</td>
                          <td>{workflow.schedule || '-'}</td>
                          <td>{workflow.last_run ? new Date(workflow.last_run).toLocaleString() : 'Never'}</td>
                          <td>{workflow.next_run ? new Date(workflow.next_run).toLocaleString() : '-'}</td>
                          <td>
                            {workflow.is_active ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-secondary">Inactive</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-secondary"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className={`btn ${workflow.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                onClick={() => toggleWorkflow(workflow.id, workflow.is_active)}
                                title={workflow.is_active ? 'Pause' : 'Activate'}
                              >
                                {workflow.is_active ? <Pause size={16} /> : <Play size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Workflow Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa' }}>
          <Modal.Title>
            <Plus size={24} className="me-2" style={{ color: '#28468D' }} />
            Create New Workflow
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateWorkflow}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Workflow Name *</Form.Label>
              <Form.Control
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter workflow name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Workflow Type *</Form.Label>
              <Form.Select
                required
                value={formData.workflow_type}
                onChange={(e) => setFormData({ ...formData, workflow_type: e.target.value })}
              >
                <option value="leave_accrual">Leave Accrual</option>
                <option value="payroll">Payroll Processing</option>
                <option value="notification">Notifications</option>
                <option value="time_tracking">Time Tracking</option>
                <option value="custom">Custom</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trigger Type *</Form.Label>
              <Form.Select
                required
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
              >
                <option value="scheduled">Scheduled (Cron)</option>
                <option value="event">Event-Based</option>
                <option value="manual">Manual</option>
              </Form.Select>
            </Form.Group>

            {formData.trigger === 'scheduled' && (
              <Form.Group className="mb-3">
                <Form.Label>Schedule (Cron Expression)</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="e.g., 0 0 1 * * (Monthly at midnight)"
                />
                <Form.Text className="text-muted">
                  Examples: 0 0 * * * (Daily), 0 0 1 * * (Monthly), 0 9 * * 1 (Weekly Monday 9am)
                </Form.Text>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this workflow does"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Activate workflow immediately"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
            >
              <Plus size={18} className="me-2" />
              Create Workflow
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AutomationWorkflows;
