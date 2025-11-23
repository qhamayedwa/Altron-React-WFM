import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, Edit, AlertCircle, Users, BarChart, CheckCircle, UserCheck, AlertTriangle, Trash2, List, Clock, Eye } from 'lucide-react';

interface PayCode {
  id: number;
  code: string;
  name: string;
  description: string;
  hourly_rate: number | null;
  is_overtime: boolean;
  overtime_multiplier: number | null;
  usage_count: number;
  is_absence_code: boolean;
  is_active: boolean;
  configuration?: string;
  created_at: string;
  updated_at: string;
}

interface Statistics {
  total_pay_codes: number;
  active_pay_codes: number;
  pay_codes_in_use: number;
  unassigned_employees: number;
}

const PayCodes: React.FC = () => {
  const navigate = useNavigate();
  const [payCodes, setPayCodes] = useState<PayCode[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [statistics, setStatistics] = useState<Statistics>({
    total_pay_codes: 0,
    active_pay_codes: 0,
    pay_codes_in_use: 0,
    unassigned_employees: 0
  });

  useEffect(() => {
    fetchPayCodes();
    fetchStatistics();
  }, []);

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

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/pay-codes/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleDeleteCode = async (code: PayCode) => {
    if (code.usage_count > 0) {
      alert('Cannot delete pay code that is assigned to employees.');
      return;
    }

    if (!confirm(`Are you sure you want to delete pay code "${code.code}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/pay-codes/${code.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchPayCodes();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting pay code:', error);
    }
  };

  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <CreditCard className="me-2" size={32} style={{ color: '#28468D', display: 'inline-block', verticalAlign: 'middle' }} />
          Pay Code Administration
        </h2>
        <div className="btn-group">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/pay-codes/create')}
            style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
          >
            <Plus size={18} className="me-2" />
            Create Pay Code
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={() => {
              alert('Pay Code Assignment page is not yet implemented. This feature will allow you to assign pay codes to employees.');
            }}
          >
            <Users size={18} className="me-2" />
            Assign to Employees
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => {
              alert('Pay Code Reports page is not yet implemented. This feature will show detailed analytics and reports for pay codes.');
            }}
          >
            <BarChart size={18} className="me-2" />
            Reports
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h4 className="mb-0">{statistics.total_pay_codes}</h4>
                  <small>Total Pay Codes</small>
                </div>
                <CreditCard size={32} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h4 className="mb-0">{statistics.active_pay_codes}</h4>
                  <small>Active Pay Codes</small>
                </div>
                <CheckCircle size={32} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h4 className="mb-0">{statistics.pay_codes_in_use}</h4>
                  <small>Pay Codes in Use</small>
                </div>
                <UserCheck size={32} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h4 className="mb-0">{statistics.unassigned_employees}</h4>
                  <small>Unassigned Employees</small>
                </div>
                <AlertTriangle size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Codes Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <List className="me-2" size={20} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
            Pay Code Management
          </h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status" style={{ color: '#28468D' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : payCodes.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <AlertCircle size={48} className="mb-3" />
              <p>No pay codes found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Hourly Rate</th>
                    <th>Overtime</th>
                    <th>Employees Assigned</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payCodes.map((code) => (
                    <tr key={code.id} className={!code.is_active ? 'table-secondary' : ''}>
                      <td>
                        <strong><span className="badge bg-secondary">{code.code}</span></strong>
                      </td>
                      <td>{code.name || code.code}</td>
                      <td>
                        <small className="text-muted">{code.description || '-'}</small>
                      </td>
                      <td>
                        {code.hourly_rate !== null ? (
                          <span className="text-success">{formatCurrency(code.hourly_rate)}</span>
                        ) : (
                          <span className="text-muted">Not set</span>
                        )}
                      </td>
                      <td>
                        {code.is_overtime ? (
                          <span className="badge bg-warning">
                            <Clock size={12} className="me-1" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                            {code.overtime_multiplier}x
                          </span>
                        ) : (
                          <span className="text-muted">Regular</span>
                        )}
                      </td>
                      <td>
                        {code.usage_count > 0 ? (
                          <span className="badge bg-info">{code.usage_count} employees</span>
                        ) : (
                          <span className="text-muted">Not assigned</span>
                        )}
                      </td>
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
                            className="btn btn-outline-info"
                            onClick={() => navigate(`/pay-codes/view/${code.id}`)}
                            title="View"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/pay-codes/edit/${code.id}`)}
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          {code.usage_count === 0 && (
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteCode(code)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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
  );
};

export default PayCodes;
