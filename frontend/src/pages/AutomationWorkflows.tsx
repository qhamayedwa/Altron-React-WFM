import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, ArrowLeft, Save, Clock, UserCheck, Bell, Calendar, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/client';

interface WorkflowStatus {
  pending_approvals: number;
  exceptions_today: number;
  active_workflows: number;
  automation_rate: number;
}

const AutomationWorkflows: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    pending_approvals: 0,
    exceptions_today: 0,
    active_workflows: 8,
    automation_rate: 92
  });

  const [clockInSettings, setClockInSettings] = useState({
    clock_in_approval: 'late',
    late_threshold: 15,
    gps_verification: 'required',
    photo_required: true
  });

  const [clockOutSettings, setClockOutSettings] = useState({
    auto_clock_out: '10',
    overtime_threshold: 8,
    require_break_time: true,
    end_of_day_summary: false
  });

  const [timeApprovalSettings, setTimeApprovalSettings] = useState({
    late_arrivals: true,
    early_departures: true,
    overtime_hours: true,
    missed_clock_out: true,
    auto_approval: '48'
  });

  const [exceptionSettings, setExceptionSettings] = useState({
    missing_clock_in: 'flag',
    missing_clock_out: 'flag',
    weekend_alerts: true
  });

  const [escalationSettings, setEscalationSettings] = useState({
    escalation_time: '72',
    critical_escalation: 'direct_manager',
    email_escalation: true
  });

  const [employeeNotifications, setEmployeeNotifications] = useState({
    clock_in_reminder: true,
    break_reminder: true,
    clock_out_reminder: true,
    overtime_warning: true,
    timecard_approval: false
  });

  const [managerNotifications, setManagerNotifications] = useState({
    pending_approvals: true,
    exception_alerts: true,
    overtime_alerts: true,
    attendance_reports: false,
    team_dashboard: true
  });

  const [scheduleSettings, setScheduleSettings] = useState({
    schedule_lead_time: '7',
    shift_change_approval: 'manager',
    auto_schedule_conflict: true
  });

  const [coverageSettings, setCoverageSettings] = useState({
    min_coverage: 75,
    call_in_automation: true,
    overtime_offer: false
  });

  useEffect(() => {
    loadWorkflowStatus();
  }, []);

  const loadWorkflowStatus = async () => {
    try {
      const response = await api.get('/automation/workflow-status');
      if (response.data) {
        setWorkflowStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load workflow status:', error);
    }
  };

  const saveAllWorkflows = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const allData = {
        clockInForm: clockInSettings,
        clockOutForm: clockOutSettings,
        timeApprovalForm: timeApprovalSettings,
        exceptionForm: exceptionSettings,
        escalationForm: escalationSettings,
        employeeNotifications: employeeNotifications,
        managerNotifications: managerNotifications,
        scheduleForm: scheduleSettings,
        coverageForm: coverageSettings
      };

      await api.post('/automation/save-workflow-config', allData);
      setMessage({ type: 'success', text: 'Workflow configuration saved successfully!' });
    } catch (error: any) {
      console.error('Failed to save workflow config:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error saving configuration' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Settings className="me-2" size={28} style={{ verticalAlign: 'middle', color: '#28468D' }} />
          Time & Attendance Workflow Configuration
        </h2>
        <div className="d-flex gap-2">
          <Link to="/automation/dashboard" className="btn btn-outline-secondary">
            <ArrowLeft className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
            Back to Dashboard
          </Link>
          <button 
            className="btn btn-primary" 
            onClick={saveAllWorkflows}
            disabled={loading}
            style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                Save All Changes
              </>
            )}
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : message.type === 'error' ? 'danger' : 'info'} alert-dismissible fade show`}>
          {message.type === 'success' ? <CheckCircle size={18} className="me-2" /> : <AlertCircle size={18} className="me-2" />}
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      {/* Clock In/Out Workflows */}
      <div className="card mb-4">
        <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
          <h5 className="mb-0">
            <Clock className="me-2" size={20} style={{ verticalAlign: 'middle', color: '#28468D' }} />
            Clock In/Out Workflow Configuration
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>Clock In Settings</h6>
              <div className="mb-3">
                <label className="form-label">Require Manager Approval</label>
                <select 
                  className="form-select" 
                  value={clockInSettings.clock_in_approval}
                  onChange={(e) => setClockInSettings({...clockInSettings, clock_in_approval: e.target.value})}
                >
                  <option value="none">No Approval Required</option>
                  <option value="late">Only for Late Clock-ins</option>
                  <option value="always">Always Required</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Late Threshold (minutes)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={clockInSettings.late_threshold}
                  onChange={(e) => setClockInSettings({...clockInSettings, late_threshold: parseInt(e.target.value)})}
                  min={1} 
                  max={120}
                />
                <small className="text-muted">Clock-ins after this time require approval</small>
              </div>
              
              <div className="mb-3">
                <label className="form-label">GPS Location Verification</label>
                <select 
                  className="form-select" 
                  value={clockInSettings.gps_verification}
                  onChange={(e) => setClockInSettings({...clockInSettings, gps_verification: e.target.value})}
                >
                  <option value="required">Required</option>
                  <option value="optional">Optional</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={clockInSettings.photo_required}
                  onChange={(e) => setClockInSettings({...clockInSettings, photo_required: e.target.checked})}
                />
                <label className="form-check-label">
                  Require photo verification for clock-in
                </label>
              </div>
            </div>
            
            <div className="col-md-6">
              <h6>Clock Out Settings</h6>
              <div className="mb-3">
                <label className="form-label">Auto Clock-Out After</label>
                <select 
                  className="form-select" 
                  value={clockOutSettings.auto_clock_out}
                  onChange={(e) => setClockOutSettings({...clockOutSettings, auto_clock_out: e.target.value})}
                >
                  <option value="never">Never</option>
                  <option value="10">10 hours</option>
                  <option value="12">12 hours</option>
                  <option value="16">16 hours</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Overtime Approval Threshold</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={clockOutSettings.overtime_threshold}
                  onChange={(e) => setClockOutSettings({...clockOutSettings, overtime_threshold: parseFloat(e.target.value)})}
                  min={6} 
                  max={12} 
                  step={0.5}
                />
                <small className="text-muted">Hours worked before requiring overtime approval</small>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={clockOutSettings.require_break_time}
                  onChange={(e) => setClockOutSettings({...clockOutSettings, require_break_time: e.target.checked})}
                />
                <label className="form-check-label">
                  Require break time tracking
                </label>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={clockOutSettings.end_of_day_summary}
                  onChange={(e) => setClockOutSettings({...clockOutSettings, end_of_day_summary: e.target.checked})}
                />
                <label className="form-check-label">
                  Send end-of-day summary to employee
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manager Approval Workflows */}
      <div className="card mb-4">
        <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
          <h5 className="mb-0">
            <UserCheck className="me-2" size={20} style={{ verticalAlign: 'middle', color: '#28468D' }} />
            Manager Approval Workflows
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <h6>Time Entry Approvals</h6>
              <div className="mb-3">
                <label className="form-label">Approval Required For</label>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={timeApprovalSettings.late_arrivals}
                    onChange={(e) => setTimeApprovalSettings({...timeApprovalSettings, late_arrivals: e.target.checked})}
                  />
                  <label className="form-check-label">Late Arrivals</label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={timeApprovalSettings.early_departures}
                    onChange={(e) => setTimeApprovalSettings({...timeApprovalSettings, early_departures: e.target.checked})}
                  />
                  <label className="form-check-label">Early Departures</label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={timeApprovalSettings.overtime_hours}
                    onChange={(e) => setTimeApprovalSettings({...timeApprovalSettings, overtime_hours: e.target.checked})}
                  />
                  <label className="form-check-label">Overtime Hours</label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={timeApprovalSettings.missed_clock_out}
                    onChange={(e) => setTimeApprovalSettings({...timeApprovalSettings, missed_clock_out: e.target.checked})}
                  />
                  <label className="form-check-label">Missed Clock-outs</label>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Auto-Approval After</label>
                <select 
                  className="form-select" 
                  value={timeApprovalSettings.auto_approval}
                  onChange={(e) => setTimeApprovalSettings({...timeApprovalSettings, auto_approval: e.target.value})}
                >
                  <option value="never">Never</option>
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="72">72 hours</option>
                </select>
              </div>
            </div>
            
            <div className="col-md-4">
              <h6>Exception Handling</h6>
              <div className="mb-3">
                <label className="form-label">Missing Clock-in Action</label>
                <select 
                  className="form-select" 
                  value={exceptionSettings.missing_clock_in}
                  onChange={(e) => setExceptionSettings({...exceptionSettings, missing_clock_in: e.target.value})}
                >
                  <option value="flag">Flag for Review</option>
                  <option value="auto_start">Auto Start Shift</option>
                  <option value="notify_manager">Notify Manager Only</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Missing Clock-out Action</label>
                <select 
                  className="form-select" 
                  value={exceptionSettings.missing_clock_out}
                  onChange={(e) => setExceptionSettings({...exceptionSettings, missing_clock_out: e.target.value})}
                >
                  <option value="flag">Flag for Manual Entry</option>
                  <option value="auto_end">Auto End at Scheduled Time</option>
                  <option value="previous_pattern">Use Previous Day Pattern</option>
                </select>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={exceptionSettings.weekend_alerts}
                  onChange={(e) => setExceptionSettings({...exceptionSettings, weekend_alerts: e.target.checked})}
                />
                <label className="form-check-label">
                  Alert for weekend/holiday work
                </label>
              </div>
            </div>
            
            <div className="col-md-4">
              <h6>Escalation Rules</h6>
              <div className="mb-3">
                <label className="form-label">Escalate to Senior Manager After</label>
                <select 
                  className="form-select" 
                  value={escalationSettings.escalation_time}
                  onChange={(e) => setEscalationSettings({...escalationSettings, escalation_time: e.target.value})}
                >
                  <option value="never">Never</option>
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="72">72 hours</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Critical Issues Escalate To</label>
                <select 
                  className="form-select" 
                  value={escalationSettings.critical_escalation}
                  onChange={(e) => setEscalationSettings({...escalationSettings, critical_escalation: e.target.value})}
                >
                  <option value="direct_manager">Direct Manager</option>
                  <option value="department_head">Department Head</option>
                  <option value="hr_admin">HR Administrator</option>
                </select>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={escalationSettings.email_escalation}
                  onChange={(e) => setEscalationSettings({...escalationSettings, email_escalation: e.target.checked})}
                />
                <label className="form-check-label">
                  Send email notifications for escalations
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Workflows */}
      <div className="card mb-4">
        <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
          <h5 className="mb-0">
            <Bell className="me-2" size={20} style={{ verticalAlign: 'middle', color: '#28468D' }} />
            Notification Workflow Configuration
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>Employee Notifications</h6>
              <div className="form-check mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={employeeNotifications.clock_in_reminder}
                  onChange={(e) => setEmployeeNotifications({...employeeNotifications, clock_in_reminder: e.target.checked})}
                />
                <label className="form-check-label">
                  Clock-in reminder (15 min after start time)
                </label>
              </div>
              <div className="form-check mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={employeeNotifications.break_reminder}
                  onChange={(e) => setEmployeeNotifications({...employeeNotifications, break_reminder: e.target.checked})}
                />
                <label className="form-check-label">
                  Break time reminders
                </label>
              </div>
              <div className="form-check mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={employeeNotifications.clock_out_reminder}
                  onChange={(e) => setEmployeeNotifications({...employeeNotifications, clock_out_reminder: e.target.checked})}
                />
                <label className="form-check-label">
                  Clock-out reminder (end of shift)
                </label>
              </div>
              <div className="form-check mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={employeeNotifications.overtime_warning}
                  onChange={(e) => setEmployeeNotifications({...employeeNotifications, overtime_warning: e.target.checked})}
                />
                <label className="form-check-label">
                  Overtime threshold warning
                </label>
              </div>
              <div className="form-check mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={employeeNotifications.timecard_approval}
                  onChange={(e) => setEmployeeNotifications({...employeeNotifications, timecard_approval: e.target.checked})}
                />
                <label className="form-check-label">
                  Timecard approval status updates
                </label>
              </div>
            </div>
            
            <div className="col-md-6">
              <h6>Manager Notifications</h6>
              <div className="form-check mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={managerNotifications.pending_approvals}
                  onChange={(e) => setManagerNotifications({...managerNotifications, pending_approvals: e.target.checked})}
                />
                <label className="form-check-label">
                  Daily pending approval summary
                </label>
              </div>
              <div className="form-check mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={managerNotifications.exception_alerts}
                  onChange={(e) => setManagerNotifications({...managerNotifications, exception_alerts: e.target.checked})}
                />
                <label className="form-check-label">
                  Real-time exception alerts
                </label>
              </div>
              <div className="form-check mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={managerNotifications.overtime_alerts}
                  onChange={(e) => setManagerNotifications({...managerNotifications, overtime_alerts: e.target.checked})}
                />
                <label className="form-check-label">
                  Overtime threshold alerts
                </label>
              </div>
              <div className="form-check mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={managerNotifications.attendance_reports}
                  onChange={(e) => setManagerNotifications({...managerNotifications, attendance_reports: e.target.checked})}
                />
                <label className="form-check-label">
                  Weekly attendance reports
                </label>
              </div>
              <div className="form-check mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={managerNotifications.team_dashboard}
                  onChange={(e) => setManagerNotifications({...managerNotifications, team_dashboard: e.target.checked})}
                />
                <label className="form-check-label">
                  Team dashboard updates
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule & Shift Workflows */}
      <div className="card mb-4">
        <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
          <h5 className="mb-0">
            <Calendar className="me-2" size={20} style={{ verticalAlign: 'middle', color: '#28468D' }} />
            Schedule & Shift Workflow Configuration
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>Schedule Management</h6>
              <div className="mb-3">
                <label className="form-label">Schedule Publication Lead Time</label>
                <select 
                  className="form-select" 
                  value={scheduleSettings.schedule_lead_time}
                  onChange={(e) => setScheduleSettings({...scheduleSettings, schedule_lead_time: e.target.value})}
                >
                  <option value="3">3 days</option>
                  <option value="7">1 week</option>
                  <option value="14">2 weeks</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Shift Change Approval</label>
                <select 
                  className="form-select" 
                  value={scheduleSettings.shift_change_approval}
                  onChange={(e) => setScheduleSettings({...scheduleSettings, shift_change_approval: e.target.value})}
                >
                  <option value="manager">Manager Only</option>
                  <option value="mutual">Mutual + Manager</option>
                  <option value="hr">HR Approval Required</option>
                </select>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={scheduleSettings.auto_schedule_conflict}
                  onChange={(e) => setScheduleSettings({...scheduleSettings, auto_schedule_conflict: e.target.checked})}
                />
                <label className="form-check-label">
                  Auto-detect schedule conflicts
                </label>
              </div>
            </div>
            
            <div className="col-md-6">
              <h6>Shift Coverage</h6>
              <div className="mb-3">
                <label className="form-label">Minimum Coverage Alert</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={coverageSettings.min_coverage}
                  onChange={(e) => setCoverageSettings({...coverageSettings, min_coverage: parseInt(e.target.value)})}
                  min={50} 
                  max={100}
                />
                <small className="text-muted">Alert when coverage falls below %</small>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={coverageSettings.call_in_automation}
                  onChange={(e) => setCoverageSettings({...coverageSettings, call_in_automation: e.target.checked})}
                />
                <label className="form-check-label">
                  Auto-suggest call-ins for low coverage
                </label>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={coverageSettings.overtime_offer}
                  onChange={(e) => setCoverageSettings({...coverageSettings, overtime_offer: e.target.checked})}
                />
                <label className="form-check-label">
                  Auto-offer overtime for coverage gaps
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Status */}
      <div className="card">
        <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
          <h5 className="mb-0">
            <Activity className="me-2" size={20} style={{ verticalAlign: 'middle', color: '#28468D' }} />
            Current Workflow Status
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <div className="text-center">
                <div className="display-6 text-success">{workflowStatus.pending_approvals}</div>
                <small>Pending Approvals</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <div className="display-6 text-warning">{workflowStatus.exceptions_today}</div>
                <small>Exceptions Today</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <div className="display-6" style={{ color: '#54B8DF' }}>{workflowStatus.active_workflows}</div>
                <small>Active Workflows</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <div className="display-6" style={{ color: '#28468D' }}>{workflowStatus.automation_rate}%</div>
                <small>Automation Rate</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationWorkflows;
