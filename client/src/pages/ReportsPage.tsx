import { useState } from 'react';
import apiClient from '../lib/api';

type ReportType = 'time-entries' | 'leave' | 'attendance' | 'payroll-summary';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('time-entries');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    try {
      setLoading(true);
      const params = `?start_date=${startDate}&end_date=${endDate}`;
      const response = await apiClient.get(`/reports/${reportType}${params}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    const params = `?start_date=${startDate}&end_date=${endDate}`;
    const url = `/reports/${reportType}/csv${params}`;
    window.open(url, '_blank');
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h2>
            <i className="bi bi-file-earmark-bar-graph me-2"></i>
            Reports
          </h2>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Generate Report</h5>
          
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Report Type</label>
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
              >
                <option value="time-entries">Time Entries</option>
                <option value="leave">Leave Applications</option>
                <option value="attendance">Attendance Summary</option>
                <option value="payroll-summary">Payroll Summary</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-primary me-2"
                onClick={generateReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
              <button
                className="btn btn-outline-success"
                onClick={downloadCSV}
                disabled={loading || !reportData}
              >
                <i className="bi bi-download me-1"></i>
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {reportData && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Report Results</h5>
            
            {reportData.summary && (
              <div className="alert alert-info">
                <h6>Summary</h6>
                <pre className="mb-0">{JSON.stringify(reportData.summary, null, 2)}</pre>
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    {reportType === 'time-entries' && (
                      <>
                        <th>User</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Status</th>
                      </>
                    )}
                    {reportType === 'leave' && (
                      <>
                        <th>User</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Type</th>
                      </>
                    )}
                    {reportType === 'attendance' && (
                      <>
                        <th>User</th>
                        <th>Total Days</th>
                        <th>Total Hours</th>
                      </>
                    )}
                    {reportType === 'payroll-summary' && (
                      <>
                        <th>User</th>
                        <th>Period Start</th>
                        <th>Period End</th>
                        <th>Total Hours</th>
                        <th>Allowances</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportType === 'time-entries' && reportData.entries?.map((entry: any, i: number) => (
                    <tr key={i}>
                      <td>{entry.users_time_entries_user_idTousers?.username || entry.user_id}</td>
                      <td>{new Date(entry.clock_in_time).toLocaleString()}</td>
                      <td>{entry.clock_out_time ? new Date(entry.clock_out_time).toLocaleString() : '-'}</td>
                      <td>{entry.status}</td>
                    </tr>
                  ))}
                  {reportType === 'leave' && reportData.applications?.map((app: any, i: number) => (
                    <tr key={i}>
                      <td>{app.users_leave_applications_user_idTousers?.username || app.user_id}</td>
                      <td>{new Date(app.start_date).toLocaleDateString()}</td>
                      <td>{new Date(app.end_date).toLocaleDateString()}</td>
                      <td>{app.status}</td>
                      <td>{app.leave_types?.name || '-'}</td>
                    </tr>
                  ))}
                  {reportType === 'attendance' && reportData.attendance?.map((att: any, i: number) => (
                    <tr key={i}>
                      <td>{att.user?.username || 'Unknown'}</td>
                      <td>{att.total_days}</td>
                      <td>{att.total_hours?.toFixed(2) || 0}</td>
                    </tr>
                  ))}
                  {reportType === 'payroll-summary' && reportData.calculations?.map((calc: any, i: number) => (
                    <tr key={i}>
                      <td>{calc.users_pay_calculations_user_idTousers?.username || calc.user_id}</td>
                      <td>{new Date(calc.pay_period_start).toLocaleDateString()}</td>
                      <td>{new Date(calc.pay_period_end).toLocaleDateString()}</td>
                      <td>{calc.total_hours?.toFixed(2) || 0}</td>
                      <td>R {calc.total_allowances?.toFixed(2) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
