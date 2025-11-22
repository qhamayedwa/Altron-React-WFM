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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState<PayRuleFormData>({
    name: '',
    priority: 100,
    description: '',
    day_of_week: [],
    start_hour: '',
    end_hour: '',
    overtime_threshold: '',
    employee_ids: '',
    roles: [],
    pay_multiplier: '',
    component_name: '',
    flat_allowance: '',
    allowance_name: '',
    shift_differential: '',
    differential_name: ''
  });

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

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const conditions: any = {};
    const actions: any = {};

    if (formData.day_of_week.length > 0) {
      conditions.day_of_week = formData.day_of_week;
    }
    if (formData.start_hour && formData.end_hour) {
      conditions.time_range = { 
        start: parseInt(formData.start_hour), 
        end: parseInt(formData.end_hour) 
      };
    }
    if (formData.overtime_threshold) {
      conditions.overtime_threshold = parseFloat(formData.overtime_threshold);
    }
    if (formData.employee_ids) {
      conditions.employee_ids = formData.employee_ids.split(',').map(id => parseInt(id.trim()));
    }
    if (formData.roles.length > 0) {
      conditions.roles = formData.roles;
    }

    if (formData.pay_multiplier) {
      actions.pay_multiplier = parseFloat(formData.pay_multiplier);
      if (formData.component_name) {
        actions.component_name = formData.component_name;
      }
    }
    if (formData.flat_allowance) {
      actions.flat_allowance = parseFloat(formData.flat_allowance);
      if (formData.allowance_name) {
        actions.allowance_name = formData.allowance_name;
      }
    }
    if (formData.shift_differential) {
      actions.shift_differential = parseFloat(formData.shift_differential);
      if (formData.differential_name) {
        actions.differential_name = formData.differential_name;
      }
    }

    if (Object.keys(conditions).length === 0) {
      alert('Please specify at least one condition.');
      return;
    }
    if (Object.keys(actions).length === 0) {
      alert('Please specify at least one action.');
      return;
    }

    try {
      const response = await fetch('/api/pay-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          priority: formData.priority,
          description: formData.description,
          conditions,
          actions
        })
      });

      if (response.ok) {
        setShowCreateModal(false);
        resetForm();
        fetchPayRules();
      }
    } catch (error) {
      console.error('Error creating pay rule:', error);
    }
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

  const resetForm = () => {
    setFormData({
      name: '',
      priority: 100,
      description: '',
      day_of_week: [],
      start_hour: '',
      end_hour: '',
      overtime_threshold: '',
      employee_ids: '',
      roles: [],
      pay_multiplier: '',
      component_name: '',
      flat_allowance: '',
      allowance_name: '',
      shift_differential: '',
      differential_name: ''
    });
  };

  const loadExample = (exampleType: string) => {
    if (exampleType === 'weekend_overtime') {
      setFormData({
        name: 'Weekend Overtime',
        priority: 150,
        description: '1.5x pay for weekend work',
        day_of_week: [5, 6], // Saturday and Sunday
        start_hour: '',
        end_hour: '',
        overtime_threshold: '',
        employee_ids: '',
        roles: [],
        pay_multiplier: '1.5',
        component_name: 'weekend_ot',
        flat_allowance: '',
        allowance_name: '',
        shift_differential: '',
        differential_name: ''
      });
    } else if (exampleType === 'night_shift') {
      setFormData({
        name: 'Night Shift Differential',
        priority: 200,
        description: 'R2/hour for night shifts (18:00-06:00)',
        day_of_week: [],
        start_hour: '18',
        end_hour: '6',
        overtime_threshold: '',
        employee_ids: '',
        roles: [],
        pay_multiplier: '',
        component_name: '',
        flat_allowance: '',
        allowance_name: '',
        shift_differential: '2.00',
        differential_name: 'night_shift'
      });
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      day_of_week: prev.day_of_week.includes(day)
        ? prev.day_of_week.filter(d => d !== day)
        : [...prev.day_of_week, day]
    }));
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
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
            onClick={() => setShowCreateModal(true)}
            style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
          >
            <Plus size={18} className="me-2" />
            Create Rule
          </button>
          <button className="btn btn-outline-info">
            <CheckCircle size={18} className="me-2" />
            Test Rules
          </button>
          <button className="btn btn-success">
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
                onClick={() => setShowCreateModal(true)}
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
                          <button className="btn btn-outline-info" title="View">
                            <Eye size={16} />
                          </button>
                          <button className="btn btn-outline-primary" title="Edit">
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

      {/* Create Rule Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#28468D', color: 'white' }}>
                <h5 className="modal-title">
                  <Plus size={20} className="me-2" />
                  Create Pay Rule
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                ></button>
              </div>
              <form onSubmit={handleCreateRule}>
                <div className="modal-body">
                  <div className="row">
                    {/* Form Column */}
                    <div className="col-md-8">
                      {/* Basic Information */}
                      <div className="card mb-4">
                        <div className="card-header">
                          <h5 className="mb-0">Basic Information</h5>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label htmlFor="name" className="form-label">Rule Name *</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  id="name"
                                  value={formData.name}
                                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                                  required
                                />
                                <div className="form-text">Unique name for this pay rule</div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label htmlFor="priority" className="form-label">Priority</label>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  id="priority"
                                  value={formData.priority}
                                  onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                                  min="1" 
                                  max="999"
                                />
                                <div className="form-text">Lower numbers = higher priority</div>
                              </div>
                            </div>
                          </div>
                          <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea 
                              className="form-control" 
                              id="description"
                              rows={3}
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                            ></textarea>
                            <div className="form-text">Optional description of the rule purpose</div>
                          </div>
                        </div>
                      </div>

                      {/* Conditions */}
                      <div className="card mb-4">
                        <div className="card-header">
                          <h5 className="mb-0">Conditions (When to Apply)</h5>
                        </div>
                        <div className="card-body">
                          {/* Days of Week */}
                          <div className="mb-4">
                            <label className="form-label">Days of Week</label>
                            <div className="btn-group d-flex flex-wrap" role="group">
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                                <React.Fragment key={index}>
                                  <input 
                                    type="checkbox" 
                                    className="btn-check" 
                                    id={`day_${index}`}
                                    checked={formData.day_of_week.includes(index)}
                                    onChange={() => toggleDay(index)}
                                  />
                                  <label className="btn btn-outline-primary" htmlFor={`day_${index}`}>
                                    {day}
                                  </label>
                                </React.Fragment>
                              ))}
                            </div>
                            <div className="form-text">Select specific days when this rule applies (leave blank for all days)</div>
                          </div>

                          {/* Time Range */}
                          <div className="mb-4">
                            <label className="form-label">Time Range</label>
                            <div className="row">
                              <div className="col-md-6">
                                <label htmlFor="start_hour" className="form-label">Start Hour</label>
                                <select 
                                  className="form-select" 
                                  id="start_hour"
                                  value={formData.start_hour}
                                  onChange={(e) => setFormData({...formData, start_hour: e.target.value})}
                                >
                                  <option value="">Any time</option>
                                  {Array.from({length: 24}, (_, i) => (
                                    <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-6">
                                <label htmlFor="end_hour" className="form-label">End Hour</label>
                                <select 
                                  className="form-select" 
                                  id="end_hour"
                                  value={formData.end_hour}
                                  onChange={(e) => setFormData({...formData, end_hour: e.target.value})}
                                >
                                  <option value="">Any time</option>
                                  {Array.from({length: 24}, (_, i) => (
                                    <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="form-text">Time range when shifts must start to apply this rule</div>
                          </div>

                          {/* Overtime Threshold */}
                          <div className="mb-4">
                            <label htmlFor="overtime_threshold" className="form-label">Overtime Threshold (Hours)</label>
                            <input 
                              type="number" 
                              className="form-control" 
                              id="overtime_threshold"
                              value={formData.overtime_threshold}
                              onChange={(e) => setFormData({...formData, overtime_threshold: e.target.value})}
                              min="0" 
                              max="24" 
                              step="0.5" 
                              placeholder="e.g., 8.0"
                            />
                            <div className="form-text">Apply rule only when daily hours exceed this threshold</div>
                          </div>

                          {/* Employee IDs */}
                          <div className="mb-4">
                            <label htmlFor="employee_ids" className="form-label">Specific Employees</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              id="employee_ids"
                              value={formData.employee_ids}
                              onChange={(e) => setFormData({...formData, employee_ids: e.target.value})}
                              placeholder="e.g., 1,2,3"
                            />
                            <div className="form-text">Comma-separated employee IDs (leave blank for all employees)</div>
                          </div>

                          {/* Roles */}
                          <div className="mb-4">
                            <label className="form-label">Employee Roles</label>
                            <div className="row">
                              <div className="col-md-12">
                                {['Employee', 'Manager', 'Admin', 'Super User'].map((role) => (
                                  <div className="form-check" key={role}>
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox" 
                                      id={`role_${role.replace(' ', '_').toLowerCase()}`}
                                      checked={formData.roles.includes(role)}
                                      onChange={() => toggleRole(role)}
                                    />
                                    <label className="form-check-label" htmlFor={`role_${role.replace(' ', '_').toLowerCase()}`}>
                                      {role}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="form-text">Apply rule only to employees with these roles (leave blank for all roles)</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="card mb-4">
                        <div className="card-header">
                          <h5 className="mb-0">Actions (What to Calculate)</h5>
                        </div>
                        <div className="card-body">
                          {/* Pay Multiplier */}
                          <div className="mb-4">
                            <label className="form-label">Pay Multiplier</label>
                            <div className="row">
                              <div className="col-md-6">
                                <label htmlFor="pay_multiplier" className="form-label">Multiplier</label>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  id="pay_multiplier"
                                  value={formData.pay_multiplier}
                                  onChange={(e) => setFormData({...formData, pay_multiplier: e.target.value})}
                                  min="0.1" 
                                  max="10" 
                                  step="0.1" 
                                  placeholder="e.g., 1.5"
                                />
                                <div className="form-text">Multiply applicable hours by this factor</div>
                              </div>
                              <div className="col-md-6">
                                <label htmlFor="component_name" className="form-label">Component Name</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  id="component_name"
                                  value={formData.component_name}
                                  onChange={(e) => setFormData({...formData, component_name: e.target.value})}
                                  placeholder="e.g., overtime_1_5"
                                />
                                <div className="form-text">Name for this pay component</div>
                              </div>
                            </div>
                          </div>

                          {/* Flat Allowance */}
                          <div className="mb-4">
                            <label className="form-label">Flat Allowance</label>
                            <div className="row">
                              <div className="col-md-6">
                                <label htmlFor="flat_allowance" className="form-label">Amount (R)</label>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  id="flat_allowance"
                                  value={formData.flat_allowance}
                                  onChange={(e) => setFormData({...formData, flat_allowance: e.target.value})}
                                  min="0" 
                                  step="0.01" 
                                  placeholder="e.g., 25.00"
                                />
                                <div className="form-text">Fixed dollar amount per occurrence</div>
                              </div>
                              <div className="col-md-6">
                                <label htmlFor="allowance_name" className="form-label">Allowance Name</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  id="allowance_name"
                                  value={formData.allowance_name}
                                  onChange={(e) => setFormData({...formData, allowance_name: e.target.value})}
                                  placeholder="e.g., meal_allowance"
                                />
                                <div className="form-text">Name for this allowance</div>
                              </div>
                            </div>
                          </div>

                          {/* Shift Differential */}
                          <div className="mb-4">
                            <label className="form-label">Shift Differential</label>
                            <div className="row">
                              <div className="col-md-6">
                                <label htmlFor="shift_differential" className="form-label">Differential (R/hour)</label>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  id="shift_differential"
                                  value={formData.shift_differential}
                                  onChange={(e) => setFormData({...formData, shift_differential: e.target.value})}
                                  min="0" 
                                  step="0.01" 
                                  placeholder="e.g., 2.00"
                                />
                                <div className="form-text">Additional amount per hour worked</div>
                              </div>
                              <div className="col-md-6">
                                <label htmlFor="differential_name" className="form-label">Differential Name</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  id="differential_name"
                                  value={formData.differential_name}
                                  onChange={(e) => setFormData({...formData, differential_name: e.target.value})}
                                  placeholder="e.g., night_differential"
                                />
                                <div className="form-text">Name for this differential</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="col-md-4">
                      {/* Example Rules */}
                      <div className="card mb-3">
                        <div className="card-header">
                          <h6 className="mb-0">Example Rules</h6>
                        </div>
                        <div className="card-body">
                          <div className="card mb-3">
                            <div className="card-body p-3">
                              <h6 className="card-title">Weekend Overtime</h6>
                              <p className="card-text small">1.5x pay for weekend work</p>
                              <button 
                                type="button" 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => loadExample('weekend_overtime')}
                              >
                                Use This Example
                              </button>
                            </div>
                          </div>
                          <div className="card mb-3">
                            <div className="card-body p-3">
                              <h6 className="card-title">Night Shift</h6>
                              <p className="card-text small">R2/hour for night shifts (18:00-06:00)</p>
                              <button 
                                type="button" 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => loadExample('night_shift')}
                              >
                                Use This Example
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Help Card */}
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">Rule Configuration Help</h6>
                        </div>
                        <div className="card-body">
                          <h6>Conditions</h6>
                          <ul className="small">
                            <li><strong>Days:</strong> Rule applies only on selected days</li>
                            <li><strong>Time:</strong> Rule applies to shifts starting in time range</li>
                            <li><strong>Overtime:</strong> Rule applies when daily hours exceed threshold</li>
                            <li><strong>Employees:</strong> Rule applies to specific employee IDs</li>
                            <li><strong>Roles:</strong> Rule applies to employees with specific roles</li>
                          </ul>
                          
                          <h6 className="mt-3">Actions</h6>
                          <ul className="small">
                            <li><strong>Multiplier:</strong> Multiply hours by factor (e.g., 1.5x for overtime)</li>
                            <li><strong>Allowance:</strong> Add fixed dollar amount</li>
                            <li><strong>Differential:</strong> Add amount per hour worked</li>
                          </ul>
                          
                          <div className="alert alert-info small mt-3 mb-0">
                            <strong>Note:</strong> At least one condition and one action must be specified. Rules are processed in priority order (lower number = higher priority).
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
                  >
                    Create Pay Rule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayRules;
