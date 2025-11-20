import { useState, useEffect } from 'react';
import apiClient from '../lib/api';

interface SyncStatus {
  configured: boolean;
  last_sync: string | null;
  status: string;
  message: string;
}

export default function SageVipPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/sage-vip/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching SAGE VIP status:', error);
      setMessage('Error loading SAGE VIP status');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setSyncing(true);
      setMessage('');
      const response = await apiClient.post('/sage-vip/test-connection');
      setMessage(response.data.message);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Connection test failed');
    } finally {
      setSyncing(false);
    }
  };

  const syncEmployees = async () => {
    try {
      setSyncing(true);
      setMessage('');
      const response = await apiClient.post('/sage-vip/sync-employees');
      setMessage(response.data.message);
      fetchStatus();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Employee sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const pushTimesheets = async () => {
    if (!startDate || !endDate) {
      setMessage('Please select start and end dates');
      return;
    }
    
    try {
      setSyncing(true);
      setMessage('');
      const response = await apiClient.post(`/sage-vip/push-timesheets?start_date=${startDate}&end_date=${endDate}`);
      setMessage(response.data.message + ` (${response.data.entries_processed} entries)`);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Timesheet push failed');
    } finally {
      setSyncing(false);
    }
  };

  const transferLeave = async () {
    if (!startDate || !endDate) {
      setMessage('Please select start and end dates');
      return;
    }
    
    try {
      setSyncing(true);
      setMessage('');
      const response = await apiClient.post(`/sage-vip/transfer-leave?start_date=${startDate}&end_date=${endDate}`);
      setMessage(response.data.message + ` (${response.data.leave_transferred} leave records)`);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Leave transfer failed');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h2>
            <i className="bi bi-link-45deg me-2"></i>
            SAGE VIP Payroll Integration
          </h2>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Integration Status</h5>
              {status && (
                <>
                  <div className="mb-3">
                    <span className={`badge bg-${status.configured ? 'success' : 'warning'} fs-6`}>
                      {status.configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  <p className="card-text">{status.message}</p>
                  {status.last_sync && (
                    <p className="text-muted">Last sync: {new Date(status.last_sync).toLocaleString()}</p>
                  )}
                </>
              )}
              
              <button
                className="btn btn-primary mt-2"
                onClick={testConnection}
                disabled={syncing}
              >
                {syncing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Quick Actions</h5>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={syncEmployees}
                  disabled={syncing || !status?.configured}
                >
                  <i className="bi bi-people me-2"></i>
                  Sync Employees from SAGE VIP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Data Transfer</h5>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-success"
                  onClick={pushTimesheets}
                  disabled={syncing || !status?.configured || !startDate || !endDate}
                >
                  <i className="bi bi-clock-history me-2"></i>
                  Push Timesheets to SAGE VIP
                </button>
                
                <button
                  className="btn btn-info"
                  onClick={transferLeave}
                  disabled={syncing || !status?.configured || !startDate || !endDate}
                >
                  <i className="bi bi-calendar-check me-2"></i>
                  Transfer Leave to SAGE VIP
                </button>
              </div>

              {message && (
                <div className={`alert ${message.includes('Error') || message.includes('failed') ? 'alert-danger' : 'alert-info'} mt-3`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!status?.configured && (
        <div className="alert alert-warning mt-4">
          <h6>Configuration Required</h6>
          <p>To enable SAGE VIP integration, set the following environment variables:</p>
          <ul className="mb-0">
            <li>SAGE_VIP_BASE_URL</li>
            <li>SAGE_VIP_API_KEY</li>
            <li>SAGE_VIP_USERNAME</li>
            <li>SAGE_VIP_PASSWORD</li>
            <li>SAGE_VIP_COMPANY_DB</li>
          </ul>
        </div>
      )}
    </div>
  );
}
