import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

interface Employee {
  id: number;
  username: string;
  email?: string;
}

interface PayCode {
  id: number;
  code: string;
  description: string;
}

interface Absence {
  id: number;
  employee: Employee;
  clock_in_time: string;
  total_hours: number;
  absence_pay_code_id?: number;
  absence_pay_code?: PayCode;
  absence_reason?: string;
  absence_approved_at?: string;
  absence_approved_by?: Employee;
}

export default function AbsenceManagement() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [absencesRes, employeesRes] = await Promise.all([
        api.get('/time-attendance/absences', {
          params: {
            employee_id: employeeFilter || undefined,
            status: statusFilter || undefined,
            date: dateFilter || undefined
          }
        }),
        api.get('/users')
      ]);

      setAbsences(absencesRes.data.absences || absencesRes.data || []);
      setTotalCount(absencesRes.data.total || absencesRes.data.length || 0);
      setEmployees(employeesRes.data.users || employeesRes.data || []);
    } catch (error) {
      console.error('Error loading absences:', error);
      setAbsences([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setLoading(true);
    loadData();
  };

  const clearFilters = () => {
    setEmployeeFilter('');
    setStatusFilter('');
    setDateFilter('');
    setTimeout(() => {
      setLoading(true);
      loadData();
    }, 100);
  };

  const approveAbsence = async (absenceId: number) => {
    if (!confirm('Approve this absence entry?')) {
      return;
    }

    try {
      await api.post(`/time-attendance/absences/${absenceId}/approve`);
      await loadData();
    } catch (error: any) {
      alert('Error approving absence: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
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

  return (
    <div className="container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="bi bi-calendar-x me-2"></i>
          Absence Management
        </h1>
        <Link to="/time-attendance/log-absence" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Log New Absence
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Employee</label>
              <select 
                className="form-select"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.username}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select 
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Date</label>
              <input 
                type="date" 
                className="form-control"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button 
                type="button" 
                className="btn btn-outline-primary"
                onClick={applyFilters}
              >
                Filter
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary ms-2"
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Absences Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Employee Absences ({totalCount} total)</h5>
        </div>
        <div className="card-body">
          {absences.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Pay Code</th>
                    <th>Hours</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {absences.map(absence => (
                    <tr key={absence.id}>
                      <td>
                        <strong>{absence.employee.username}</strong>
                        <br />
                        <small className="text-muted">
                          {absence.employee.email || 'No email'}
                        </small>
                      </td>
                      <td>{formatDate(absence.clock_in_time)}</td>
                      <td>
                        {absence.absence_pay_code ? (
                          <>
                            <span className="badge bg-info">{absence.absence_pay_code.code}</span>
                            <br />
                            <small className="text-muted">{absence.absence_pay_code.description}</small>
                          </>
                        ) : (
                          <span className="text-muted">No code</span>
                        )}
                      </td>
                      <td>{absence.total_hours.toFixed(1)} hrs</td>
                      <td>
                        {absence.absence_reason ? (
                          <span title={absence.absence_reason}>
                            {absence.absence_reason.length > 50
                              ? absence.absence_reason.substring(0, 50) + '...'
                              : absence.absence_reason}
                          </span>
                        ) : (
                          <span className="text-muted">No reason provided</span>
                        )}
                      </td>
                      <td>
                        {absence.absence_approved_at ? (
                          <>
                            <span className="badge bg-success">Approved</span>
                            <br />
                            <small className="text-muted">
                              by {absence.absence_approved_by?.username || 'System'}
                              <br />
                              {formatDate(absence.absence_approved_at)}
                            </small>
                          </>
                        ) : (
                          <span className="badge bg-warning">Pending</span>
                        )}
                      </td>
                      <td>
                        {!absence.absence_approved_at ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => approveAbsence(absence.id)}
                          >
                            <i className="bi bi-check me-1"></i>
                            Approve
                          </button>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x text-muted mb-3" style={{ fontSize: '48px' }}></i>
              <h5 className="text-muted">No absences found</h5>
              <p className="text-muted">No employee absences match your current filters.</p>
              <Link to="/time-attendance/log-absence" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Log New Absence
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
