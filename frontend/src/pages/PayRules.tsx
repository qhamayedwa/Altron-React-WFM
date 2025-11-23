import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  CheckCircle,
  Calculator,
  FileText,
  CreditCard
} from 'lucide-react';

interface PayRule {
  id: number;
  name: string;
  priority: number;
  description: string;
  conditions: any;
  actions: any;
  is_active: boolean;
  created_at: string;
  created_by?: {
    username: string;
  };
}

interface PayRuleFormData {
  name: string;
  priority: number;
  description: string;
  day_of_week: number[];
  start_hour: string;
  end_hour: string;
  overtime_threshold: string;
  employee_ids: string;
  roles: string[];
  pay_multiplier: string;
  component_name: string;
  flat_allowance: string;
  allowance_name: string;
  shift_differential: string;
  differential_name: string;
}

const PayRules: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<PayRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<PayRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPayRules();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rules, filterStatus]);

  const fetchPayRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pay-rules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Error fetching pay rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rules];

    if (filterStatus === 'active') {
      filtered = filtered.filter(rule => rule.is_active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(rule => !rule.is_active);
    }

    setFilteredRules(filtered);
  };

  const handleToggleRule = async (ruleId: number) => {
    try {
      const response = await fetch(`/api/pay-rules/${ruleId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchPayRules();
      }
    } catch (error) {
      console.error('Error toggling pay rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this pay rule?')) {
      return;
    }

    try {
      const response = await fetch(`/api/pay-rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchPayRules();
      }
    } catch (error) {
      console.error('Error deleting pay rule:', error);
    }
  };

  const renderConditionBadges = (conditions: any) => {
    if (!conditions) return null;

    return (
      <small className="text-muted">
        {conditions.day_of_week && (
          <span className="badge bg-info me-1">Days: {conditions.day_of_week.length}</span>
        )}
        {conditions.time_range && (
          <span className="badge bg-info me-1">
            Time: {conditions.time_range.start}h-{conditions.time_range.end}h
          </span>
        )}
        {conditions.overtime_threshold && (
          <span className="badge bg-warning me-1">OT: {conditions.overtime_threshold}h</span>
        )}
      </small>
    );
  };

  const renderActionBadges = (actions: any) => {
    if (!actions) return null;

    return (
      <small className="text-muted">
        {actions.pay_multiplier && (
          <span className="badge bg-success me-1">{actions.pay_multiplier}x</span>
        )}
        {actions.flat_allowance && (
          <span className="badge bg-primary me-1">R {actions.flat_allowance}</span>
        )}
        {actions.shift_differential && (
          <span className="badge bg-secondary me-1">R {actions.shift_differential}/h</span>
        )}
      </small>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <span className="me-2 fw-bold" style={{ color: '#28a745' }}>R</span>
          Pay Rules Engine
        </h2>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/pay-rules/create')}
            style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
          >
            <Plus size={18} className="me-2" />
            Create Rule
          </button>
          <button 
            className="btn btn-outline-info"
            onClick={() => navigate('/pay-rules/test')}
          >
            <CheckCircle size={18} className="me-2" />
            Test Rules
          </button>
          <button 
            className="btn btn-success"
            onClick={() => navigate('/pay-rules/calculate')}
          >
            <CreditCard size={18} className="me-2" />
            Calculate Pay
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label htmlFor="status" className="form-label">Status</label>
              <select 
                id="status"
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Rules</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Rules Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status" style={{ color: '#28468D' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3" style={{ fontSize: '64px', fontWeight: 'bold', color: '#28a745' }}>R</div>
              <h5>No Pay Rules Configured</h5>
              <p className="text-muted">
                {filterStatus !== 'all' 
                  ? 'No pay rules match the current filter.' 
                  : 'Create pay rules to enable automated payroll calculations.'}
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/pay-rules/create')}
                style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
              >
                <Plus size={18} className="me-2" />
                Create First Pay Rule
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Conditions</th>
                    <th>Actions</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((rule) => (
                    <tr key={rule.id}>
                      <td>
                        <span className="badge bg-secondary">{rule.priority}</span>
                      </td>
                      <td>
                        <strong>{rule.name}</strong>
                      </td>
                      <td>
                        {rule.description 
                          ? rule.description.substring(0, 50) + (rule.description.length > 50 ? '...' : '') 
                          : ''}
                      </td>
                      <td>{renderConditionBadges(rule.conditions)}</td>
                      <td>{renderActionBadges(rule.actions)}</td>
                      <td>
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`rule_${rule.id}`}
                            checked={rule.is_active}
                            onChange={() => handleToggleRule(rule.id)}
                          />
                          <label className="form-check-label" htmlFor={`rule_${rule.id}`}>
                            <span className={`badge bg-${rule.is_active ? 'success' : 'secondary'}`}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </div>
                      </td>
                      <td>
                        {formatDate(rule.created_at)}
                        {rule.created_by && (
                          <><br /><small className="text-muted">by {rule.created_by.username}</small></>
                        )}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button 
                            className="btn btn-outline-info" 
                            title="View"
                            onClick={() => navigate(`/pay-rules/view/${rule.id}`)}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="btn btn-outline-primary" 
                            title="Edit"
                            onClick={() => navigate(`/pay-rules/edit/${rule.id}`)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn btn-outline-danger" 
                            title="Delete"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 size={16} />
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

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <CheckCircle className="text-info mb-2" width={32} height={32} />
              <h6>Test Rules</h6>
              <p className="text-muted small">Validate rule logic against sample data</p>
              <button 
                className="btn btn-outline-info btn-sm"
                onClick={() => navigate('/pay-rules/test')}
              >
                Test Now
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <Calculator className="text-success mb-2" width={32} height={32} />
              <h6>Calculate Pay</h6>
              <p className="text-muted small">Run payroll calculations for employees</p>
              <button 
                className="btn btn-outline-success btn-sm"
                onClick={() => navigate('/pay-rules/calculate')}
              >
                Calculate
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <FileText className="text-secondary mb-2" width={32} height={32} />
              <h6>View Calculations</h6>
              <p className="text-muted small">Review saved payroll calculations</p>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => navigate('/pay-rules/calculations')}
              >
                View All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayRules;
