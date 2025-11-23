import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';

interface PayCode {
  id: number;
  code: string;
  name: string;
  description: string;
  is_absence_code: boolean;
  is_active: boolean;
  configuration?: string;
  created_at: string;
  updated_at: string;
  created_by_id?: number;
}

interface PayCodeConfiguration {
  is_paid?: boolean;
  requires_approval?: boolean;
  deducts_from_balance?: boolean;
  leave_type_id?: number | null;
  max_hours_per_day?: number | null;
  max_consecutive_days?: number | null;
  pay_rate_factor?: number;
}

const ViewPayCode: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [payCode, setPayCode] = useState<PayCode | null>(null);
  const [config, setConfig] = useState<PayCodeConfiguration>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayCode();
  }, [id]);

  const fetchPayCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pay-codes/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayCode(data);
        
        // Parse configuration if available
        if (data.configuration) {
          try {
            const parsedConfig = JSON.parse(data.configuration);
            setConfig(parsedConfig);
          } catch (e) {
            console.error('Failed to parse configuration:', e);
          }
        }
      } else {
        setError('Failed to load pay code');
      }
    } catch (err) {
      setError('Failed to load pay code');
      console.error('Fetch pay code error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !payCode) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error || 'Pay code not found'}</div>
        <button onClick={() => navigate('/pay-codes')} className="btn btn-secondary">
          Back to Pay Codes
        </button>
      </div>
    );
  }

  const payRateFactor = config.pay_rate_factor || 1.0;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Pay Code: {payCode.code}</h1>
        <div>
          <button 
            onClick={() => navigate(`/pay-codes/edit/${payCode.id}`)}
            className="btn btn-primary me-2"
            style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
          >
            <Edit size={18} className="me-2" />
            Edit
          </button>
          <button 
            onClick={() => navigate('/pay-codes')}
            className="btn btn-outline-secondary"
          >
            <ArrowLeft size={18} className="me-2" />
            Back to Pay Codes
          </button>
        </div>
      </div>

      <div className="row">
        {/* Pay Code Details */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Pay Code Details</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label text-muted">Code</label>
                  <div className="fw-bold">{payCode.code}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Description</label>
                  <div>{payCode.description}</div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label text-muted">Type</label>
                  <div>
                    {payCode.is_absence_code ? (
                      <span className="badge bg-info">Absence Code</span>
                    ) : (
                      <span className="badge bg-secondary">Payroll Code</span>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Status</label>
                  <div>
                    {payCode.is_active ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-warning">Inactive</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label text-muted">Pay Rate Factor</label>
                  <div>{payRateFactor}x</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Created By</label>
                  <div>{payCode.created_by_id ? `User #${payCode.created_by_id}` : 'System'}</div>
                </div>
              </div>

              {/* Absence-Specific Configuration */}
              {payCode.is_absence_code && (
                <>
                  <hr />
                  <h6 className="mb-3">Absence Configuration</h6>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted">Paid Absence</label>
                      <div>
                        {config.is_paid ? (
                          <span className="badge bg-success">Yes</span>
                        ) : (
                          <span className="badge bg-secondary">No</span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">Requires Approval</label>
                      <div>
                        {config.requires_approval ? (
                          <span className="badge bg-warning">Yes</span>
                        ) : (
                          <span className="badge bg-secondary">No</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted">Deducts from Balance</label>
                      <div>
                        {config.deducts_from_balance ? (
                          <span className="badge bg-info">Yes</span>
                        ) : (
                          <span className="badge bg-secondary">No</span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">Max Hours Per Day</label>
                      <div>
                        {config.max_hours_per_day ? (
                          `${config.max_hours_per_day} hours`
                        ) : (
                          <span className="text-muted">No limit</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted">Max Consecutive Days</label>
                      <div>
                        {config.max_consecutive_days ? (
                          `${config.max_consecutive_days} days`
                        ) : (
                          <span className="text-muted">No limit</span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">Linked Leave Type</label>
                      <div>
                        {config.leave_type_id ? (
                          <span className="badge bg-primary">Linked</span>
                        ) : (
                          <span className="text-muted">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <hr />
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label text-muted">Created Date</label>
                  <div>
                    {payCode.created_at 
                      ? new Date(payCode.created_at).toLocaleString('en-US', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      : 'N/A'}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Last Updated</label>
                  <div>
                    {payCode.updated_at 
                      ? new Date(payCode.updated_at).toLocaleString('en-US', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Usage Statistics</h6>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <h3 className="text-primary" style={{ color: '#28468D' }}>0</h3>
                <p className="text-muted">Total time entries using this code</p>
              </div>

              <div className="text-center text-muted">
                <p>No recent usage</p>
              </div>
            </div>
          </div>

          {payCode.is_absence_code && (
            <div className="card mt-3">
              <div className="card-header">
                <h6 className="mb-0">Quick Actions</h6>
              </div>
              <div className="card-body">
                <button 
                  className="btn btn-outline-primary btn-sm w-100 mb-2"
                  onClick={() => alert('Log Absence feature not yet implemented')}
                  style={{ borderColor: '#28468D', color: '#28468D' }}
                >
                  Log Absence
                </button>
                <button 
                  className="btn btn-outline-secondary btn-sm w-100"
                  onClick={() => alert('View Absences feature not yet implemented')}
                >
                  View Absences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPayCode;
