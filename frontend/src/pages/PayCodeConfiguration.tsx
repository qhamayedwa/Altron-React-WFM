import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit, Eye, Filter, AlertCircle } from 'lucide-react';

interface PayCodeConfig {
  id: number;
  pay_code_id: number;
  pay_code: string;
  user_id?: number;
  username?: string;
  department_id?: number;
  department_name?: string;
  default_rate?: number;
  effective_date: string;
  end_date?: string;
  is_active: boolean;
}

const PayCodeConfiguration: React.FC = () => {
  const [configs, setConfigs] = useState<PayCodeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPayCode, setFilterPayCode] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pay-code-configurations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfigs(data);
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConfigs = configs.filter(config => {
    if (filterPayCode !== 'all' && config.pay_code !== filterPayCode) return false;
    if (filterStatus === 'active' && !config.is_active) return false;
    if (filterStatus === 'inactive' && config.is_active) return false;
    return true;
  });

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Settings className="me-2" size={32} style={{ color: '#28468D' }} />
              <h2 className="mb-0">Pay Code Configuration</h2>
            </div>
            <button 
              className="btn btn-primary"
              style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
            >
              <Plus size={18} className="me-2" />
              Add Configuration
            </button>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
              <Filter size={20} className="me-2" style={{ color: '#28468D' }} />
              <strong>Filters</strong>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Pay Code</label>
                  <select 
                    className="form-select"
                    value={filterPayCode}
                    onChange={(e) => setFilterPayCode(e.target.value)}
                  >
                    <option value="all">All Pay Codes</option>
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

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
              <strong>Configurations ({filteredConfigs.length})</strong>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status" style={{ color: '#28468D' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredConfigs.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <AlertCircle size={48} className="mb-3" />
                  <p>No configurations found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th>Pay Code</th>
                        <th>User/Department</th>
                        <th>Default Rate</th>
                        <th>Effective Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConfigs.map((config) => (
                        <tr key={config.id}>
                          <td><strong>{config.pay_code}</strong></td>
                          <td>{config.username || config.department_name || 'N/A'}</td>
                          <td>{config.default_rate ? `R ${config.default_rate.toFixed(2)}` : '-'}</td>
                          <td>{new Date(config.effective_date).toLocaleDateString()}</td>
                          <td>{config.end_date ? new Date(config.end_date).toLocaleDateString() : '-'}</td>
                          <td>
                            {config.is_active ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-secondary">Inactive</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" title="View">
                                <Eye size={16} />
                              </button>
                              <button className="btn btn-outline-secondary" title="Edit">
                                <Edit size={16} />
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
    </div>
  );
};

export default PayCodeConfiguration;
