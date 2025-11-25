import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, Settings, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../api/client';

interface RollupHistory {
  id: number;
  type: string;
  period: string;
  start_date: string;
  end_date: string;
  total_hours: number;
  total_employees: number;
  status: string;
  sage_sent: boolean;
  created_at: string;
  created_by: string;
}

const TimecardRollup: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showSageConfig, setShowSageConfig] = useState(false);
  const [sageConfig, setSageConfig] = useState({
    baseUrl: '',
    apiKey: '',
    companyDb: ''
  });
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [history, setHistory] = useState<RollupHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [rollupResult, setRollupResult] = useState<any>(null);

  useEffect(() => {
    loadHistory();
    setDefaultDates();
  }, []);

  const setDefaultDates = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setStartDate(oneWeekAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await api.get('/timecard-rollup/history');
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRollup = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'Please select both start and end dates' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      setRollupResult(null);

      const response = await api.post('/timecard-rollup/generate', {
        rollup_type: 'employee',
        start_date: startDate,
        end_date: endDate,
        exclude_incomplete: true
      });

      if (response.data.success) {
        setRollupResult(response.data.data);
        setMessage({ type: 'success', text: 'Rollup processed successfully!' });
        loadHistory();
      }
    } catch (error: any) {
      console.error('Failed to process rollup:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to process rollup' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportToSage = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'Please select date range and process rollup first' });
      return;
    }

    try {
      setExportLoading(true);
      setMessage(null);

      const response = await api.post('/timecard-rollup/export-sage', {
        start_date: startDate,
        end_date: endDate
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: `Export to SAGE completed! ${response.data.exported_count || 0} records exported.` });
        loadHistory();
      }
    } catch (error: any) {
      console.error('Failed to export to SAGE:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to export to SAGE. Please check SAGE configuration.' });
    } finally {
      setExportLoading(false);
    }
  };

  const handleDownloadExport = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'Please select date range first' });
      return;
    }

    try {
      setDownloadLoading(true);
      setMessage(null);

      const response = await api.get('/timecard-rollup/download-export', {
        params: { start_date: startDate, end_date: endDate },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timecard_export_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Export file downloaded successfully!' });
    } catch (error: any) {
      console.error('Failed to download export:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to download export file' });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await api.post('/timecard-rollup/save-sage-config', sageConfig);
      setMessage({ type: 'success', text: 'SAGE configuration saved successfully!' });
      setShowSageConfig(false);
    } catch (error: any) {
      console.error('Failed to save SAGE config:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save SAGE configuration' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FileText className="me-2" size={32} style={{ color: '#28468D' }} />
              <h2 className="mb-0">Timecard Rollup & SAGE Integration</h2>
            </div>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => setShowSageConfig(true)}
            >
              <Settings size={18} className="me-2" />
              SAGE Configuration
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.type === 'success' ? <CheckCircle size={18} className="me-2" /> : <AlertCircle size={18} className="me-2" />}
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#28468D', color: 'white' }}>
              <strong><Clock size={18} className="me-2" />Timecard Rollup Dashboard</strong>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button 
                className="btn btn-primary w-100"
                onClick={handleRollup}
                disabled={loading}
                style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText size={18} className="me-2" />
                    Process Rollup
                  </>
                )}
              </button>

              {rollupResult && (
                <div className="mt-3 p-3 bg-light rounded">
                  <h6>Rollup Summary</h6>
                  <p className="mb-1"><strong>Type:</strong> {rollupResult.type}</p>
                  {rollupResult.employees && (
                    <p className="mb-1"><strong>Employees:</strong> {rollupResult.employees.length}</p>
                  )}
                  {rollupResult.summary && (
                    <>
                      <p className="mb-1"><strong>Total Entries:</strong> {rollupResult.summary.total_entries}</p>
                      <p className="mb-1"><strong>Total Hours:</strong> {rollupResult.summary.total_hours?.toFixed(2)}</p>
                      <p className="mb-0"><strong>Unique Employees:</strong> {rollupResult.summary.unique_employees}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#198754', color: 'white' }}>
              <strong><Upload size={18} className="me-2" />SAGE VIP Payroll Export</strong>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <small>Export processed timecards to SAGE VIP Payroll system for final payroll calculations.</small>
              </div>
              <button 
                className="btn btn-success w-100 mb-2"
                onClick={handleExportToSage}
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Upload size={18} className="me-2" />
                    Export to SAGE
                  </>
                )}
              </button>
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={handleDownloadExport}
                disabled={downloadLoading}
              >
                {downloadLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={18} className="me-2" />
                    Download Export File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#1F4650', color: 'white' }}>
              <strong><Clock size={18} className="me-2" />Recent Rollup History</strong>
              <button className="btn btn-sm btn-outline-light" onClick={loadHistory} disabled={historyLoading}>
                <RefreshCw size={16} className={historyLoading ? 'spin' : ''} />
              </button>
            </div>
            <div className="card-body">
              {historyLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Period</th>
                        <th>Processed Date</th>
                        <th>Total Hours</th>
                        <th>Employees</th>
                        <th>Status</th>
                        <th>SAGE Export</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-4">
                            <Clock size={32} className="mb-2" />
                            <p className="mb-0">No rollup history available</p>
                          </td>
                        </tr>
                      ) : (
                        history.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.type}</strong>
                              <br />
                              <small className="text-muted">{formatDate(item.start_date)} - {formatDate(item.end_date)}</small>
                            </td>
                            <td>{formatDate(item.created_at)}</td>
                            <td>{item.total_hours.toFixed(2)} hrs</td>
                            <td>{item.total_employees}</td>
                            <td>
                              {item.status === 'completed' ? (
                                <span className="badge bg-success">
                                  <CheckCircle size={12} className="me-1" />
                                  Completed
                                </span>
                              ) : (
                                <span className="badge bg-warning">
                                  <Clock size={12} className="me-1" />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td>
                              {item.sage_sent ? (
                                <span className="badge bg-success">
                                  <CheckCircle size={12} className="me-1" />
                                  Sent
                                </span>
                              ) : (
                                <span className="badge bg-secondary">
                                  <XCircle size={12} className="me-1" />
                                  Not Sent
                                </span>
                              )}
                            </td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary me-1" title="View Details">
                                <FileText size={14} />
                              </button>
                              <button className="btn btn-sm btn-outline-success" title="Download">
                                <Download size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSageConfig && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#28468D', color: 'white' }}>
                <h5 className="modal-title">
                  <Settings size={20} className="me-2" />
                  SAGE VIP Configuration
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowSageConfig(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">SAGE Base URL</label>
                  <input
                    type="text"
                    className="form-control"
                    value={sageConfig.baseUrl}
                    onChange={(e) => setSageConfig({...sageConfig, baseUrl: e.target.value})}
                    placeholder="https://sage-server.com/api"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">API Key</label>
                  <input
                    type="password"
                    className="form-control"
                    value={sageConfig.apiKey}
                    onChange={(e) => setSageConfig({...sageConfig, apiKey: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Company Database</label>
                  <input
                    type="text"
                    className="form-control"
                    value={sageConfig.companyDb}
                    onChange={(e) => setSageConfig({...sageConfig, companyDb: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowSageConfig(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveConfig}
                  style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TimecardRollup;
