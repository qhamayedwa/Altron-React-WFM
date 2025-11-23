import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

interface LeaveSummary {
  username: string;
  email: string;
  totalApplications: number;
  totalDaysRequested: number;
  approvedDays: number;
}

export default function LeaveSummaryReport() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveSummary, setLeaveSummary] = useState<LeaveSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.get('/api/payroll/reports/leave-summary', {
        params: { startDate, endDate }
      });
      setLeaveSummary(response.data.leaveSummary || []);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate leave summary report');
    } finally {
      setLoading(false);
    }
  };

  const totalApplications = leaveSummary.reduce((sum, s) => sum + (s.totalApplications || 0), 0);
  const totalDaysRequested = leaveSummary.reduce((sum, s) => sum + (s.totalDaysRequested || 0), 0);
  const approvedDays = leaveSummary.reduce((sum, s) => sum + (s.approvedDays || 0), 0);

  const getApprovalRate = (summary: LeaveSummary) => {
    if (!summary.totalDaysRequested || summary.totalDaysRequested === 0) return 0;
    return ((summary.approvedDays || 0) / summary.totalDaysRequested) * 100;
  };

  const getUsageStatus = (approvedDays: number) => {
    if (approvedDays >= 10) return { label: 'High Usage', color: 'info' };
    if (approvedDays >= 5) return { label: 'Normal Usage', color: 'primary' };
    if (approvedDays > 0) return { label: 'Low Usage', color: 'warning' };
    return { label: 'No Leave', color: 'secondary' };
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3 mb-0">Leave Usage Summary</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item"><a href="/payroll">Payroll</a></li>
                  <li className="breadcrumb-item active">Leave Summary</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <form onSubmit={handleGenerate} className="row g-3">
                  <div className="col-md-4">
                    <label htmlFor="startDate" className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="endDate" className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        <i className="bi bi-search me-2"></i>
                        {loading ? 'Generating...' : 'Generate Report'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {leaveSummary.length > 0 && (
          <>
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bi bi-people" style={{ fontSize: '32px', color: '#0d6efd' }}></i>
                    <h5 className="card-title mt-2">Employees with Leave</h5>
                    <h3 className="text-primary">{leaveSummary.length}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bi bi-file-text" style={{ fontSize: '32px', color: '#198754' }}></i>
                    <h5 className="card-title mt-2">Total Applications</h5>
                    <h3 className="text-success">{totalApplications}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bi bi-calendar" style={{ fontSize: '32px', color: '#ffc107' }}></i>
                    <h5 className="card-title mt-2">Total Days Requested</h5>
                    <h3 className="text-warning">{totalDaysRequested}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bi bi-check-circle" style={{ fontSize: '32px', color: '#20c997' }}></i>
                    <h5 className="card-title mt-2">Approved Days</h5>
                    <h3 className="text-info">{approvedDays}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-grid me-2"></i>Employee Leave Summary
                    </h5>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => window.print()}>
                      <i className="bi bi-printer me-1"></i>Print
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Email</th>
                            <th>Total Applications</th>
                            <th>Days Requested</th>
                            <th>Days Approved</th>
                            <th>Approval Rate</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaveSummary.map((summary, idx) => {
                            const rate = getApprovalRate(summary);
                            const status = getUsageStatus(summary.approvedDays || 0);
                            return (
                              <tr key={idx}>
                                <td><strong>{summary.username}</strong></td>
                                <td>{summary.email || 'N/A'}</td>
                                <td>{summary.totalApplications || 0}</td>
                                <td>{summary.totalDaysRequested || 0}</td>
                                <td>{summary.approvedDays || 0}</td>
                                <td>
                                  {summary.totalDaysRequested > 0 ? (
                                    <span className={`badge bg-${rate >= 80 ? 'success' : rate >= 50 ? 'warning' : 'danger'}`}>
                                      {rate.toFixed(0)}%
                                    </span>
                                  ) : (
                                    <span className="badge bg-secondary">N/A</span>
                                  )}
                                </td>
                                <td>
                                  <span className={`badge bg-${status.color}`}>{status.label}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && leaveSummary.length === 0 && startDate && endDate && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="bi bi-file-text" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                  <h5 className="text-muted mt-3">No Leave Data Available</h5>
                  <p className="text-muted">No leave applications found for the selected period.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
