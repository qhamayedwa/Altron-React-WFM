import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Eye, Filter, AlertCircle, Users } from 'lucide-react';

interface PayCode {
  id: number;
  code: string;
  description: string;
  pay_type: string;
  rate_type: string;
  rate_value?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PayCodeFormData {
  code: string;
  description: string;
  pay_type: string;
  rate_type: string;
  rate_value?: number;
  is_active: boolean;
}

const PayCodes: React.FC = () => {
  const [payCodes, setPayCodes] = useState<PayCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<PayCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<PayCode | null>(null);
  
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState<PayCodeFormData>({
    code: '',
    description: '',
    pay_type: 'earning',
    rate_type: 'hourly',
    is_active: true
  });

  useEffect(() => {
    fetchPayCodes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payCodes, filterType, filterStatus]);

  const fetchPayCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pay-codes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayCodes(data);
      }
    } catch (error) {
      console.error('Error fetching pay codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payCodes];

    if (filterType !== 'all') {
      filtered = filtered.filter(code => code.pay_type === filterType);
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter(code => code.is_active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(code => !code.is_active);
    }

    setFilteredCodes(filtered);
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/pay-codes', {
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
        fetchPayCodes();
      }
    } catch (error) {
      console.error('Error creating pay code:', error);
    }
  };

  const handleEditCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCode) return;

    try {
      const response = await fetch(`/api/pay-codes/${selectedCode.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedCode(null);
        resetForm();
        fetchPayCodes();
      }
    } catch (error) {
      console.error('Error updating pay code:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      pay_type: 'earning',
      rate_type: 'hourly',
      is_active: true
    });
  };

  const openEditModal = (code: PayCode) => {
    setSelectedCode(code);
    setFormData({
      code: code.code,
      description: code.description,
      pay_type: code.pay_type,
      rate_type: code.rate_type,
      rate_value: code.rate_value,
      is_active: code.is_active
    });
    setShowEditModal(true);
  };

  const openViewModal = (code: PayCode) => {
    setSelectedCode(code);
    setShowViewModal(true);
  };

  const openAssignModal = (code: PayCode) => {
    setSelectedCode(code);
    setShowAssignModal(true);
  };

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <DollarSign className="me-2" size={32} style={{ color: '#28468D' }} />
              <h2 className="mb-0">Pay Codes Dashboard</h2>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
              style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
            >
              <Plus size={18} className="me-2" />
              Create Pay Code
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
              <strong>Filter Pay Codes</strong>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Pay Type</label>
                  <select 
                    className="form-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="earning">Earnings</option>
                    <option value="deduction">Deductions</option>
                    <option value="benefit">Benefits</option>
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

      {/* Pay Codes Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
              <strong>Pay Codes ({filteredCodes.length})</strong>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status" style={{ color: '#28468D' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredCodes.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <AlertCircle size={48} className="mb-3" />
                  <p>No pay codes found matching your filters.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th>Code</th>
                        <th>Description</th>
                        <th>Pay Type</th>
                        <th>Rate Type</th>
                        <th>Rate Value</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCodes.map((code) => (
                        <tr key={code.id}>
                          <td><strong>{code.code}</strong></td>
                          <td>{code.description}</td>
                          <td>
                            <span className="badge" style={{
                              backgroundColor: 
                                code.pay_type === 'earning' ? '#28468D' :
                                code.pay_type === 'deduction' ? '#dc3545' :
                                '#54B8DF'
                            }}>
                              {code.pay_type}
                            </span>
                          </td>
                          <td>{code.rate_type}</td>
                          <td>{code.rate_value ? `R ${code.rate_value.toFixed(2)}` : '-'}</td>
                          <td>
                            {code.is_active ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-secondary">Inactive</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => openViewModal(code)}
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => openEditModal(code)}
                                title="Edit Code"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="btn btn-outline-info"
                                onClick={() => openAssignModal(code)}
                                title="Assign to Users"
                              >
                                <Users size={16} />
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

      {/* Create Code Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#28468D', color: 'white' }}>
                <h5 className="modal-title">Create New Pay Code</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                ></button>
              </div>
              <form onSubmit={handleCreateCode}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        required
                        maxLength={10}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Pay Type *</label>
                      <select
                        className="form-select"
                        value={formData.pay_type}
                        onChange={(e) => setFormData({...formData, pay_type: e.target.value})}
                        required
                      >
                        <option value="earning">Earning</option>
                        <option value="deduction">Deduction</option>
                        <option value="benefit">Benefit</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Rate Type *</label>
                      <select
                        className="form-select"
                        value={formData.rate_type}
                        onChange={(e) => setFormData({...formData, rate_type: e.target.value})}
                        required
                      >
                        <option value="hourly">Hourly</option>
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Rate Value</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.rate_value || ''}
                        onChange={(e) => setFormData({...formData, rate_value: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="col-12">
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
                    Create Pay Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Code Modal */}
      {showEditModal && selectedCode && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#28468D', color: 'white' }}>
                <h5 className="modal-title">Edit Pay Code</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => { setShowEditModal(false); setSelectedCode(null); resetForm(); }}
                ></button>
              </div>
              <form onSubmit={handleEditCode}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        required
                        maxLength={10}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Pay Type *</label>
                      <select
                        className="form-select"
                        value={formData.pay_type}
                        onChange={(e) => setFormData({...formData, pay_type: e.target.value})}
                        required
                      >
                        <option value="earning">Earning</option>
                        <option value="deduction">Deduction</option>
                        <option value="benefit">Benefit</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Rate Type *</label>
                      <select
                        className="form-select"
                        value={formData.rate_type}
                        onChange={(e) => setFormData({...formData, rate_type: e.target.value})}
                        required
                      >
                        <option value="hourly">Hourly</option>
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Rate Value</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.rate_value || ''}
                        onChange={(e) => setFormData({...formData, rate_value: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="col-12">
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
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setShowEditModal(false); setSelectedCode(null); resetForm(); }}
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

      {/* View Code Modal */}
      {showViewModal && selectedCode && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#28468D', color: 'white' }}>
                <h5 className="modal-title">Pay Code Details</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => { setShowViewModal(false); setSelectedCode(null); }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label text-muted">Code</label>
                    <p className="fw-bold">{selectedCode.code}</p>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted">Description</label>
                    <p>{selectedCode.description}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Pay Type</label>
                    <p>
                      <span className="badge" style={{
                        backgroundColor: 
                          selectedCode.pay_type === 'earning' ? '#28468D' :
                          selectedCode.pay_type === 'deduction' ? '#dc3545' :
                          '#54B8DF'
                      }}>
                        {selectedCode.pay_type}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Rate Type</label>
                    <p>{selectedCode.rate_type}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Rate Value</label>
                    <p>{selectedCode.rate_value ? `R ${selectedCode.rate_value.toFixed(2)}` : 'Not set'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Status</label>
                    <p>
                      {selectedCode.is_active ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => { setShowViewModal(false); setSelectedCode(null); }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Pay Code Modal */}
      {showAssignModal && selectedCode && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#28468D', color: 'white' }}>
                <h5 className="modal-title">Assign Pay Code: {selectedCode.code}</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => { setShowAssignModal(false); setSelectedCode(null); }}
                ></button>
              </div>
              <div className="modal-body">
                <p>Select users or departments to assign this pay code to:</p>
                <div className="alert alert-info">
                  <small>This feature allows bulk assignment of pay codes to employees for automated payroll processing.</small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => { setShowAssignModal(false); setSelectedCode(null); }}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayCodes;
