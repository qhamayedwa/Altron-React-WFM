import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Plus, Edit, Eye, Filter, AlertCircle } from 'lucide-react';

interface NotificationTrigger {
  id: number;
  trigger_name: string;
  trigger_type: string;
  event_type: string;
  is_active: boolean;
  recipient_type: string;
  created_at: string;
}

const NotificationManagement: React.FC = () => {
  const [triggers, setTriggers] = useState<NotificationTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTriggers();
  }, []);

  const fetchTriggers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/triggers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTriggers(data);
      }
    } catch (error) {
      console.error('Error fetching notification triggers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTriggers = triggers.filter(trigger => {
    if (filterType !== 'all' && trigger.trigger_type !== filterType) return false;
    if (filterStatus === 'active' && !trigger.is_active) return false;
    if (filterStatus === 'inactive' && trigger.is_active) return false;
    return true;
  });

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Bell className="me-2" size={32} style={{ color: '#28468D' }} />
              <h2 className="mb-0">Notification Management</h2>
            </div>
            <button 
              className="btn btn-primary"
              style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
            >
              <Plus size={18} className="me-2" />
              Create Trigger
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
                  <label className="form-label">Trigger Type</label>
                  <select 
                    className="form-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="time_entry">Time Entry</option>
                    <option value="leave_request">Leave Request</option>
                    <option value="payroll">Payroll</option>
                    <option value="approval">Approval</option>
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
              <strong>Notification Triggers ({filteredTriggers.length})</strong>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status" style={{ color: '#28468D' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredTriggers.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <AlertCircle size={48} className="mb-3" />
                  <p>No notification triggers found matching your filters.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th>Trigger Name</th>
                        <th>Type</th>
                        <th>Event</th>
                        <th>Recipient Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTriggers.map((trigger) => (
                        <tr key={trigger.id}>
                          <td><strong>{trigger.trigger_name}</strong></td>
                          <td>
                            <span className="badge" style={{
                              backgroundColor: 
                                trigger.trigger_type === 'time_entry' ? '#28468D' :
                                trigger.trigger_type === 'leave_request' ? '#54B8DF' :
                                trigger.trigger_type === 'payroll' ? '#28a745' :
                                '#ffc107'
                            }}>
                              {trigger.trigger_type}
                            </span>
                          </td>
                          <td>{trigger.event_type}</td>
                          <td>{trigger.recipient_type}</td>
                          <td>
                            {trigger.is_active ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-secondary">Inactive</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link
                                to={`/notifications/triggers/${trigger.trigger_name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="btn btn-outline-primary"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </Link>
                              <button
                                className="btn btn-outline-secondary"
                                title="Edit"
                              >
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

export default NotificationManagement;
