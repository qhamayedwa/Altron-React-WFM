import React, { useState } from 'react';
import { LayoutDashboard, Save, RotateCcw } from 'lucide-react';

const DashboardConfiguration: React.FC = () => {
  const [config, setConfig] = useState({
    showAttendanceWidget: true,
    showLeaveWidget: true,
    showPayrollWidget: true,
    showNotificationsWidget: true,
    defaultView: 'overview',
    refreshInterval: 300,
    theme: 'light'
  });

  const handleSave = () => {
    console.log('Saving dashboard configuration...', config);
  };

  const handleReset = () => {
    setConfig({
      showAttendanceWidget: true,
      showLeaveWidget: true,
      showPayrollWidget: true,
      showNotificationsWidget: true,
      defaultView: 'overview',
      refreshInterval: 300,
      theme: 'light'
    });
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <LayoutDashboard className="me-2" size={32} style={{ color: '#28468D' }} />
              <h2 className="mb-0">Dashboard Configuration</h2>
            </div>
            <div className="btn-group">
              <button 
                className="btn btn-outline-secondary"
                onClick={handleReset}
              >
                <RotateCcw size={18} className="me-2" />
                Reset to Defaults
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSave}
                style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
              >
                <Save size={18} className="me-2" />
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
              <strong>Widget Visibility</strong>
            </div>
            <div className="card-body">
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={config.showAttendanceWidget}
                  onChange={(e) => setConfig({...config, showAttendanceWidget: e.target.checked})}
                  id="attendanceWidget"
                />
                <label className="form-check-label" htmlFor="attendanceWidget">
                  Show Attendance Widget
                </label>
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={config.showLeaveWidget}
                  onChange={(e) => setConfig({...config, showLeaveWidget: e.target.checked})}
                  id="leaveWidget"
                />
                <label className="form-check-label" htmlFor="leaveWidget">
                  Show Leave Management Widget
                </label>
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={config.showPayrollWidget}
                  onChange={(e) => setConfig({...config, showPayrollWidget: e.target.checked})}
                  id="payrollWidget"
                />
                <label className="form-check-label" htmlFor="payrollWidget">
                  Show Payroll Widget
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={config.showNotificationsWidget}
                  onChange={(e) => setConfig({...config, showNotificationsWidget: e.target.checked})}
                  id="notificationsWidget"
                />
                <label className="form-check-label" htmlFor="notificationsWidget">
                  Show Notifications Widget
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
              <strong>Display Settings</strong>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Default View</label>
                <select
                  className="form-select"
                  value={config.defaultView}
                  onChange={(e) => setConfig({...config, defaultView: e.target.value})}
                >
                  <option value="overview">Overview</option>
                  <option value="attendance">Attendance</option>
                  <option value="leave">Leave Management</option>
                  <option value="payroll">Payroll</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Auto Refresh Interval (seconds)</label>
                <select
                  className="form-select"
                  value={config.refreshInterval}
                  onChange={(e) => setConfig({...config, refreshInterval: parseInt(e.target.value)})}
                >
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                  <option value="600">10 minutes</option>
                  <option value="0">Disabled</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Theme</label>
                <select
                  className="form-select"
                  value={config.theme}
                  onChange={(e) => setConfig({...config, theme: e.target.value})}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
              <strong>Preview</strong>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <strong>Dashboard Preview</strong>
                <p className="mb-0">Your configured dashboard will display the selected widgets in the chosen layout with a {config.refreshInterval > 0 ? `${config.refreshInterval} second` : 'disabled'} refresh interval.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardConfiguration;
