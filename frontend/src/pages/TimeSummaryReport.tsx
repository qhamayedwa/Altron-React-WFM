import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

interface TimeSummary {
  username: string;
  email: string;
  totalEntries: number;
  totalHours: number;
}

export default function TimeSummaryReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeSummary, setTimeSummary] = useState<TimeSummary[]>([]);
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
      const response = await axios.get('/api/payroll/reports/time-summary', {
        params: { startDate, endDate }
      });
      setTimeSummary(response.data.timeSummary || []);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate time summary report');
    } finally {
      setLoading(false);
    }
  };

  const totalHours = timeSummary.reduce((sum, s) => sum + (s.totalHours || 0), 0);
  const totalEntries = timeSummary.reduce((sum, s) => sum + (s.totalEntries || 0), 0);
  const avgHours = timeSummary.length > 0 ? totalHours / timeSummary.length : 0;

  const getStatus = (hours: number) => {
    if (hours >= 40) return { label: 'Full Time', color: 'success' };
    if (hours >= 20) return { label: 'Part Time', color: 'primary' };
    return { label: 'Low Hours', color: 'warning' };
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3 mb-0">Time Summary Report</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item"><a href="/payroll">Payroll</a></li>
                  <li className="breadcrumb-item active">Time Summary</li>
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

        {timeSummary.length > 0 && (
          <>
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bi bi-people" style={{ fontSize: '32px', color: '#0d6efd' }}></i>
                    <h5 className="card-title mt-2">Total Employees</h5>
                    <h3 className="text-primary">{timeSummary.length}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bi bi-clock" style={{ fontSize: '32px', color: '#198754' }}></i>
                    <h5 className="card-title mt-2">Total Hours</h5>
                    <h3 className="text-success">{totalHours.toFixed(1)}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bi bi-calendar" style={{ fontSize: '32px', color: '#ffc107' }}></i>
                    <h5 className="card-title mt-2">Total Entries</h5>
                    <h3 className="text-warning">{totalEntries}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bi bi-graph-up" style={{ fontSize: '32px', color: '#20c997' }}></i>
                    <h5 className="card-title mt-2">Avg Hours/Employee</h5>
                    <h3 className="text-info">{avgHours.toFixed(1)}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-grid me-2"></i>Employee Time Summary
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
                            <th>Total Entries</th>
                            <th>Total Hours</th>
                            <th>Average Hours/Day</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timeSummary.map((summary, idx) => {
                            const avgHoursPerDay = summary.totalEntries > 0 ? summary.totalHours / summary.totalEntries : 0;
                            const status = getStatus(summary.totalHours || 0);
                            return (
                              <tr key={idx}>
                                <td><strong>{summary.username}</strong></td>
                                <td>{summary.email || 'N/A'}</td>
                                <td>{summary.totalEntries || 0}</td>
                                <td><strong>{(summary.totalHours || 0).toFixed(2)}</strong></td>
                                <td>{avgHoursPerDay.toFixed(2)}</td>
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

        {!loading && timeSummary.length === 0 && startDate && endDate && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="bi bi-clock" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                  <h5 className="text-muted mt-3">No Time Data Available</h5>
                  <p className="text-muted">No time entries found for the selected period.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
