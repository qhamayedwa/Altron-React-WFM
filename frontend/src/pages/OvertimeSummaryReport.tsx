import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

interface OvertimeData {
  username: string;
  email: string;
  regularHours: number;
  ot15Hours: number;
  ot20Hours: number;
  totalOtHours: number;
  totalHours: number;
}

export default function OvertimeSummaryReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [overtimeData, setOvertimeData] = useState<OvertimeData[]>([]);
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
      const response = await axios.get('/api/payroll/reports/overtime-summary', {
        params: { startDate, endDate }
      });
      setOvertimeData(response.data.overtimeData || []);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate overtime summary report');
    } finally {
      setLoading(false);
    }
  };

  const totalOt15 = overtimeData.reduce((sum, d) => sum + (d.ot15Hours || 0), 0);
  const totalOt20 = overtimeData.reduce((sum, d) => sum + (d.ot20Hours || 0), 0);
  const totalOt = totalOt15 + totalOt20;

  const getOtPercentage = (data: OvertimeData) => {
    if (!data.totalHours || data.totalHours === 0) return 0;
    return (data.totalOtHours / data.totalHours) * 100;
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3 mb-0">Overtime Summary Report</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item"><a href="/payroll">Payroll</a></li>
                  <li className="breadcrumb-item active">Overtime Summary</li>
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

        {overtimeData.length > 0 && (
          <>
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bi bi-people" style={{ fontSize: '32px', color: '#0d6efd' }}></i>
                    <h5 className="card-title mt-2">Employees with OT</h5>
                    <h3 className="text-primary">{overtimeData.length}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bi bi-clock" style={{ fontSize: '32px', color: '#ffc107' }}></i>
                    <h5 className="card-title mt-2">Total OT 1.5x Hours</h5>
                    <h3 className="text-warning">{totalOt15.toFixed(1)}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bi bi-graph-up" style={{ fontSize: '32px', color: '#dc3545' }}></i>
                    <h5 className="card-title mt-2">Total OT 2.0x Hours</h5>
                    <h3 className="text-danger">{totalOt20.toFixed(1)}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bi bi-exclamation-triangle" style={{ fontSize: '32px', color: '#20c997' }}></i>
                    <h5 className="card-title mt-2">Total OT Hours</h5>
                    <h3 className="text-info">{totalOt.toFixed(1)}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-grid me-2"></i>Employee Overtime Breakdown
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
                            <th>Regular Hours</th>
                            <th>OT 1.5x Hours</th>
                            <th>OT 2.0x Hours</th>
                            <th>Total OT Hours</th>
                            <th>Total Hours</th>
                            <th>OT Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overtimeData.map((employee, idx) => {
                            const otPercentage = getOtPercentage(employee);
                            return (
                              <tr key={idx}>
                                <td><strong>{employee.username}</strong></td>
                                <td>{employee.email || 'N/A'}</td>
                                <td>{employee.regularHours}</td>
                                <td className="text-warning">
                                  <strong>{employee.ot15Hours}</strong>
                                </td>
                                <td className="text-danger">
                                  <strong>{employee.ot20Hours}</strong>
                                </td>
                                <td className="text-info">
                                  <strong>{employee.totalOtHours}</strong>
                                </td>
                                <td>{employee.totalHours}</td>
                                <td>
                                  <span className={`badge bg-${otPercentage >= 25 ? 'danger' : otPercentage >= 15 ? 'warning' : 'info'}`}>
                                    {otPercentage.toFixed(1)}%
                                  </span>
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

        {!loading && overtimeData.length === 0 && startDate && endDate && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="bi bi-clock" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                  <h5 className="text-muted mt-3">No Overtime Data Available</h5>
                  <p className="text-muted">No employees worked overtime during the selected period.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
