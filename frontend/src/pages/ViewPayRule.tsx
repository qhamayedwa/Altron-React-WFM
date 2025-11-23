import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, CheckCircle, Trash2, Play, Pause, Calendar, Clock, TrendingUp, Users, Shield, X, Plus, Minus } from 'lucide-react';

interface PayRule {
  id: number;
  name: string;
  description: string;
  priority: number;
  conditions: string;
  actions: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ViewPayRule: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [payRule, setPayRule] = useState<PayRule | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchPayRule();
  }, [id]);

  const fetchPayRule = async () => {
    try {
      const response = await fetch(`/api/pay-rules/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayRule(data);
      }
    } catch (error) {
      console.error('Error fetching pay rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async () => {
    if (!payRule) return;

    const action = payRule.is_active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this pay rule?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/pay-rules/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchPayRule();
      }
    } catch (error) {
      console.error('Error toggling pay rule:', error);
      alert('Failed to update rule status');
    }
  };

  const handleDeleteRule = async () => {
    try {
      const response = await fetch(`/api/pay-rules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        navigate('/pay-rules');
      } else {
        alert('Failed to delete pay rule');
      }
    } catch (error) {
      console.error('Error deleting pay rule:', error);
      alert('An error occurred while deleting the pay rule');
    }
  };

  const getDayName = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || '';
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!payRule) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">Pay rule not found</div>
      </div>
    );
  }

  const conditions = typeof payRule.conditions === 'string' 
    ? JSON.parse(payRule.conditions) 
    : payRule.conditions;
  const actions = typeof payRule.actions === 'string' 
    ? JSON.parse(payRule.actions) 
    : payRule.actions;

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <span className="me-2 fw-bold" style={{ color: '#28468D' }}>R</span>
                {payRule.name}
              </h2>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/">Dashboard</a></li>
                  <li className="breadcrumb-item"><a href="/pay-rules">Pay Rules</a></li>
                  <li className="breadcrumb-item active">{payRule.name}</li>
                </ol>
              </nav>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={() => navigate(`/pay-rules/edit/${id}`)}
                className="btn"
                style={{ backgroundColor: '#28468D', color: 'white' }}
              >
                <Edit className="me-2" size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
                Edit Rule
              </button>
              <button onClick={() => navigate('/pay-rules')} className="btn btn-outline-secondary">
                <ArrowLeft className="me-2" size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
                Back to Rules
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rule Details */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Rule Details</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Basic Information</h6>
                  <table className="table table-borderless table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Name:</strong></td>
                        <td>{payRule.name}</td>
                      </tr>
                      <tr>
                        <td><strong>Description:</strong></td>
                        <td>{payRule.description || 'No description provided'}</td>
                      </tr>
                      <tr>
                        <td><strong>Priority:</strong></td>
                        <td><span className="badge bg-secondary">{payRule.priority}</span></td>
                      </tr>
                      <tr>
                        <td><strong>Status:</strong></td>
                        <td>
                          {payRule.is_active ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-danger">Inactive</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Created:</strong></td>
                        <td>
                          {payRule.created_at 
                            ? new Date(payRule.created_at).toLocaleString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })
                            : 'Unknown'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h6>Rule Configuration</h6>

                  <div className="mb-3">
                    <strong>Conditions:</strong>
                    {conditions && Object.keys(conditions).length > 0 ? (
                      <ul className="list-unstyled mt-2">
                        {conditions.day_of_week && conditions.day_of_week.length > 0 && (
                          <li className="mb-2">
                            <Calendar className="me-2" size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            Days: {conditions.day_of_week.map((day: number) => getDayName(day)).join(', ')}
                          </li>
                        )}
                        {conditions.time_range && (
                          <li className="mb-2">
                            <Clock className="me-2" size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            Time: {conditions.time_range.start.toString().padStart(2, '0')}:00 - {conditions.time_range.end.toString().padStart(2, '0')}:00
                          </li>
                        )}
                        {conditions.overtime_threshold && (
                          <li className="mb-2">
                            <TrendingUp className="me-2" size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            Overtime Threshold: {conditions.overtime_threshold} hours
                          </li>
                        )}
                        {conditions.employee_ids && conditions.employee_ids.length > 0 && (
                          <li className="mb-2">
                            <Users className="me-2" size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            Specific Employees: {conditions.employee_ids.length} employee(s)
                          </li>
                        )}
                        {conditions.roles && conditions.roles.length > 0 && (
                          <li className="mb-2">
                            <Shield className="me-2" size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            Roles: {conditions.roles.join(', ')}
                          </li>
                        )}
                      </ul>
                    ) : (
                      <span className="text-muted"> No conditions specified</span>
                    )}
                  </div>

                  <div>
                    <strong>Actions:</strong>
                    {actions && Object.keys(actions).length > 0 ? (
                      <ul className="list-unstyled mt-2">
                        {actions.multiplier && (
                          <li className="mb-2">
                            <X className="me-2" size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            Rate Multiplier: {actions.multiplier}x
                          </li>
                        )}
                        {actions.pay_multiplier && (
                          <li className="mb-2">
                            <X className="me-2" size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            Pay Multiplier: {actions.pay_multiplier}x
                            {actions.component_name && <span className="text-muted"> ({actions.component_name})</span>}
                          </li>
                        )}
                        {actions.bonus_amount && (
                          <li className="mb-2">
                            <Plus className="me-2" size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            Bonus Amount: R{parseFloat(actions.bonus_amount).toFixed(2)}
                          </li>
                        )}
                        {actions.flat_allowance && (
                          <li className="mb-2">
                            <Plus className="me-2" size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            Flat Allowance: R{parseFloat(actions.flat_allowance).toFixed(2)}
                            {actions.allowance_name && <span className="text-muted"> ({actions.allowance_name})</span>}
                          </li>
                        )}
                        {actions.hourly_rate && (
                          <li className="mb-2">
                            <span className="me-2 fw-bold" style={{ color: '#28468D', fontSize: '16px' }}>R</span>
                            Fixed Hourly Rate: R{parseFloat(actions.hourly_rate).toFixed(2)}
                          </li>
                        )}
                        {actions.shift_differential && (
                          <li className="mb-2">
                            <Plus className="me-2" size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            Shift Differential: R{parseFloat(actions.shift_differential).toFixed(2)}/hour
                            {actions.differential_name && <span className="text-muted"> ({actions.differential_name})</span>}
                          </li>
                        )}
                        {actions.deduction_amount && (
                          <li className="mb-2">
                            <Minus className="me-2" size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            Deduction: R{parseFloat(actions.deduction_amount).toFixed(2)}
                          </li>
                        )}
                      </ul>
                    ) : (
                      <span className="text-muted"> No actions specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">Rule Actions</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  onClick={() => navigate(`/pay-rules/edit/${id}`)}
                  className="btn"
                  style={{ backgroundColor: '#28468D', color: 'white' }}
                >
                  <Edit className="me-2" size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  Edit Rule
                </button>
                {payRule.is_active ? (
                  <button onClick={handleToggleRule} className="btn btn-warning">
                    <Pause className="me-2" size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    Deactivate Rule
                  </button>
                ) : (
                  <button onClick={handleToggleRule} className="btn btn-success">
                    <Play className="me-2" size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    Activate Rule
                  </button>
                )}
                <button
                  onClick={() => navigate(`/pay-rules/test?rule_id=${id}`)}
                  className="btn btn-outline-info"
                >
                  <CheckCircle className="me-2" size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  Test Rule
                </button>
                <button onClick={() => setShowDeleteModal(true)} className="btn btn-outline-danger">
                  <Trash2 className="me-2" size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  Delete Rule
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Rule Usage</h6>
            </div>
            <div className="card-body">
              <div className="text-center">
                <h4 style={{ color: '#28468D' }}>0</h4>
                <small className="text-muted">Recent calculations using this rule</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the pay rule "<strong>{payRule.name}</strong>"?</p>
                <p className="text-danger"><small>This action cannot be undone.</small></p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteRule}
                >
                  Delete Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPayRule;
