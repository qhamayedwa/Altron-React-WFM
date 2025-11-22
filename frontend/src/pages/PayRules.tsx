import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Plus, 
  Edit, 
  Eye, 
  Play, 
  Filter, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface PayRule {
  id: number;
  rule_name: string;
  rule_category: string;
  rule_type: string;
  calculation_method: string;
  priority: number;
  is_active: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

interface PayRuleFormData {
  rule_name: string;
  rule_category: string;
  rule_type: string;
  calculation_method: string;
  base_rate?: number;
  multiplier?: number;
  cap_amount?: number;
  priority: number;
  is_active: boolean;
  description: string;
}

const PayRules: React.FC = () => {
  const [rules, setRules] = useState<PayRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<PayRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PayRule | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  
  // Filter states
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form states
  const [formData, setFormData] = useState<PayRuleFormData>({
    rule_name: '',
    rule_category: 'overtime',
    rule_type: 'percentage',
    calculation_method: 'hours_worked',
    priority: 1,
    is_active: true,
    description: ''
  });

  // Test form states
  const [testHours, setTestHours] = useState('8');
  const [testBaseRate, setTestBaseRate] = useState('150');

  useEffect(() => {
    fetchPayRules();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rules, filterCategory, filterStatus]);

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

    if (filterCategory !== 'all') {
      filtered = filtered.filter(rule => rule.rule_category === filterCategory);
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter(rule => rule.is_active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(rule => !rule.is_active);
    }

    setFilteredRules(filtered);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/pay-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
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

  const handleEditRule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRule) return;

    try {
      const response = await fetch(`/api/pay-rules/${selectedRule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedRule(null);
        resetForm();
        fetchPayRules();
      }
    } catch (error) {
      console.error('Error updating pay rule:', error);
    }
  };

  const handleTestRule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRule) return;

    try {
      const response = await fetch(`/api/pay-rules/${selectedRule.id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          hours_worked: parseFloat(testHours),
          base_rate: parseFloat(testBaseRate)
        })
      });

      if (response.ok) {
        const results = await response.json();
        setTestResults(results);
      }
    } catch (error) {
      console.error('Error testing pay rule:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      rule_name: '',
      rule_category: 'overtime',
      rule_type: 'percentage',
      calculation_method: 'hours_worked',
      priority: 1,
      is_active: true,
      description: ''
    });
  };

  const openEditModal = (rule: PayRule) => {
    setSelectedRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      rule_category: rule.rule_category,
      rule_type: rule.rule_type,
      calculation_method: rule.calculation_method,
      priority: rule.priority,
      is_active: rule.is_active,
      description: rule.description
    });
    setShowEditModal(true);
  };

  const openViewModal = (rule: PayRule) => {
    setSelectedRule(rule);
    setShowViewModal(true);
  };

  const openTestModal = (rule: PayRule) => {
    setSelectedRule(rule);
    setTestResults(null);
    setShowTestModal(true);
  };

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Calculator className="me-2" size={32} style={{ color: '#28468D' }} />
              <h2 className="mb-0">Pay Rules Manager</h2>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
              style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
            >
              <Plus size={18} className="me-2" />
              Create New Rule
            </button>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
              <Filter size={20} className="me-2" style={{ color: '#28468D' }} />
              <strong>Filter Pay Rules</strong>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Rule Category</label>
                  <select 
                    className="form-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="overtime">Overtime</option>
                    <option value="allowance">Allowance</option>
                    <option value="bonus">Bonus</option>
                    <option value="deduction">Deduction</option>
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
      </div>

      {/* Pay Rules Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
              <strong>Pay Rules ({filteredRules.length})</strong>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status" style={{ color: '#28468D' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredRules.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <AlertCircle size={48} className="mb-3" />
                  <p>No pay rules found matching your filters.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th>Rule Name</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Calculation Method</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRules.map((rule) => (
                        <tr key={rule.id}>
                          <td>
                            <strong>{rule.rule_name}</strong>
                          </td>
                          <td>
                            <span className="badge" style={{
                              backgroundColor: 
                                rule.rule_category === 'overtime' ? '#28468D' :
                                rule.rule_category === 'allowance' ? '#54B8DF' :
                                rule.rule_category === 'bonus' ? '#28a745' :
                                '#dc3545'
                            }}>
                              {rule.rule_category}
                            </span>
                          </td>
                          <td>{rule.rule_type}</td>
                          <td>{rule.calculation_method}</td>
                          <td>
                            <span className="badge bg-secondary">{rule.priority}</span>
                          </td>
                          <td>
                            {rule.is_active ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-secondary">Inactive</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => openViewModal(rule)}
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => openEditModal(rule)}
                                title="Edit Rule"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="btn btn-outline-success"
                                onClick={() => openTestModal(rule)}
                                title="Test Rule"
                              >
                                <Play size={16} />
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

      {/* Create Rule Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#28468D', color: 'white' }}>
                <h5 className="modal-title">Create New Pay Rule</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                ></button>
              </div>
              <form onSubmit={handleCreateRule}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Rule Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.rule_name}
                        onChange={(e) => setFormData({...formData, rule_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Rule Category *</label>
                      <select
                        className="form-select"
                        value={formData.rule_category}
                        onChange={(e) => setFormData({...formData, rule_category: e.target.value})}
                        required
                      >
                        <option value="overtime">Overtime</option>
                        <option value="allowance">Allowance</option>
                        <option value="bonus">Bonus</option>
                        <option value="deduction">Deduction</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Rule Type *</label>
                      <select
                        className="form-select"
                        value={formData.rule_type}
                        onChange={(e) => setFormData({...formData, rule_type: e.target.value})}
                        required
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                        <option value="tiered">Tiered</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Calculation Method *</label>
                      <select
                        className="form-select"
                        value={formData.calculation_method}
                        onChange={(e) => setFormData({...formData, calculation_method: e.target.value})}
                        required
                      >
                        <option value="hours_worked">Hours Worked</option>
                        <option value="daily_rate">Daily Rate</option>
                        <option value="monthly_salary">Monthly Salary</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Base Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.base_rate || ''}
                        onChange={(e) => setFormData({...formData, base_rate: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Multiplier</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.multiplier || ''}
                        onChange={(e) => setFormData({...formData, multiplier: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Cap Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.cap_amount || ''}
                        onChange={(e) => setFormData({...formData, cap_amount: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Priority *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                        required
                        min="1"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.is_active ? 'active' : 'inactive'}
                        onChange={(e) => setFormData({...formData, is_active: e.target.value === 'active'})}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
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
                    Create Rule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {showEditModal && selectedRule && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#28468D', color: 'white' }}>
                <h5 className="modal-title">Edit Pay Rule</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => { setShowEditModal(false); setSelectedRule(null); resetForm(); }}
                ></button>
              </div>
              <form onSubmit={handleEditRule}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Rule Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.rule_name}
                        onChange={(e) => setFormData({...formData, rule_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Rule Category *</label>
                      <select
                        className="form-select"
                        value={formData.rule_category}
                        onChange={(e) => setFormData({...formData, rule_category: e.target.value})}
                        required
                      >
                        <option value="overtime">Overtime</option>
                        <option value="allowance">Allowance</option>
                        <option value="bonus">Bonus</option>
                        <option value="deduction">Deduction</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Rule Type *</label>
                      <select
                        className="form-select"
                        value={formData.rule_type}
                        onChange={(e) => setFormData({...formData, rule_type: e.target.value})}
                        required
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                        <option value="tiered">Tiered</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Calculation Method *</label>
                      <select
                        className="form-select"
                        value={formData.calculation_method}
                        onChange={(e) => setFormData({...formData, calculation_method: e.target.value})}
                        required
                      >
                        <option value="hours_worked">Hours Worked</option>
                        <option value="daily_rate">Daily Rate</option>
                        <option value="monthly_salary">Monthly Salary</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Base Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.base_rate || ''}
                        onChange={(e) => setFormData({...formData, base_rate: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Multiplier</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.multiplier || ''}
                        onChange={(e) => setFormData({...formData, multiplier: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Cap Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.cap_amount || ''}
                        onChange={(e) => setFormData({...formData, cap_amount: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Priority *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                        required
                        min="1"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.is_active ? 'active' : 'inactive'}
                        onChange={(e) => setFormData({...formData, is_active: e.target.value === 'active'})}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setShowEditModal(false); setSelectedRule(null); resetForm(); }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Rule Modal */}
      {showViewModal && selectedRule && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#28468D', color: 'white' }}>
                <h5 className="modal-title">Pay Rule Details</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => { setShowViewModal(false); setSelectedRule(null); }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted">Rule Name</label>
                    <p className="fw-bold">{selectedRule.rule_name}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Category</label>
                    <p>
                      <span className="badge" style={{
                        backgroundColor: 
                          selectedRule.rule_category === 'overtime' ? '#28468D' :
                          selectedRule.rule_category === 'allowance' ? '#54B8DF' :
                          selectedRule.rule_category === 'bonus' ? '#28a745' :
                          '#dc3545'
                      }}>
                        {selectedRule.rule_category}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Rule Type</label>
                    <p>{selectedRule.rule_type}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Calculation Method</label>
                    <p>{selectedRule.calculation_method}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Priority</label>
                    <p><span className="badge bg-secondary">{selectedRule.priority}</span></p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Status</label>
                    <p>
                      {selectedRule.is_active ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </p>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted">Description</label>
                    <p>{selectedRule.description || 'No description provided'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Created At</label>
                    <p>{new Date(selectedRule.created_at).toLocaleString()}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Updated At</label>
                    <p>{new Date(selectedRule.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => { setShowViewModal(false); setSelectedRule(null); }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Rule Modal */}
      {showTestModal && selectedRule && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#28468D', color: 'white' }}>
                <h5 className="modal-title">Test Pay Rule: {selectedRule.rule_name}</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => { setShowTestModal(false); setSelectedRule(null); setTestResults(null); }}
                ></button>
              </div>
              <form onSubmit={handleTestRule}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Hours Worked</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={testHours}
                        onChange={(e) => setTestHours(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Base Rate (R)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={testBaseRate}
                        onChange={(e) => setTestBaseRate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {testResults && (
                    <div className="mt-4">
                      <div className="alert alert-success d-flex align-items-center">
                        <CheckCircle className="me-2" size={24} />
                        <div>
                          <strong>Calculation Result:</strong>
                          <p className="mb-0 mt-2">
                            Total Amount: <strong>R {testResults.calculated_amount?.toFixed(2)}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setShowTestModal(false); setSelectedRule(null); setTestResults(null); }}
                  >
                    Close
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                  >
                    <Play size={16} className="me-2" />
                    Run Test
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
