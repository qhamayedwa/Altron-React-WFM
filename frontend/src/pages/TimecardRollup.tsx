import React, { useState } from 'react';
import { FileText, Download, Upload, Settings } from 'lucide-react';

const TimecardRollup: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showSageConfig, setShowSageConfig] = useState(false);
  const [sageConfig, setSageConfig] = useState({
    baseUrl: '',
    apiKey: '',
    companyDb: ''
  });

  const handleRollup = () => {
    console.log('Processing timecard rollup...');
  };

  const handleExportToSage = () => {
    console.log('Exporting to SAGE VIP...');
  };

  const handleSaveConfig = () => {
    console.log('Saving SAGE configuration...');
    setShowSageConfig(false);
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

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
              <strong>Timecard Rollup Dashboard</strong>
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
                style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
              >
                <FileText size={18} className="me-2" />
                Process Rollup
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
              <strong>SAGE VIP Payroll Export</strong>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <small>Export processed timecards to SAGE VIP Payroll system for final payroll calculations.</small>
              </div>
              <button 
                className="btn btn-success w-100 mb-2"
                onClick={handleExportToSage}
              >
                <Upload size={18} className="me-2" />
                Export to SAGE
              </button>
              <button className="btn btn-outline-secondary w-100">
                <Download size={18} className="me-2" />
                Download Export File
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
              <strong>Recent Rollup History</strong>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th>Period</th>
                      <th>Processed Date</th>
                      <th>Total Hours</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="text-center text-muted">
                        No rollup history available
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSageConfig && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#28468D', color: 'white' }}>
                <h5 className="modal-title">SAGE VIP Configuration</h5>
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
    </div>
  );
};

export default TimecardRollup;
