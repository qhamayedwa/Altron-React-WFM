import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../lib/api';

interface DashboardStats {
  total_companies: number;
  total_regions: number;
  total_sites: number;
  total_departments: number;
  total_employees: number;
}

interface CompanyDetail {
  company: {
    id: number;
    name: string;
    code: string;
  };
  regions: number;
  sites: number;
  departments: number;
  employees: number;
}

export default function OrganizationDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [companies, setCompanies] = useState<CompanyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/organization/dashboard');
      setStats(response.data.stats);
      setCompanies(response.data.company_details);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Organization Management</h2>
        <div>
          <Link to="/organization/hierarchy" className="btn btn-primary me-2">
            <i className="bi bi-diagram-3"></i> View Hierarchy
          </Link>
          <Link to="/organization/companies" className="btn btn-success">
            <i className="bi bi-building"></i> Manage Companies
          </Link>
        </div>
      </div>

      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-2">
            <div className="card text-center border-primary">
              <div className="card-body">
                <h3 className="text-primary mb-0">{stats.total_companies}</h3>
                <small className="text-muted">Companies</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-info">
              <div className="card-body">
                <h3 className="text-info mb-0">{stats.total_regions}</h3>
                <small className="text-muted">Regions</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-success">
              <div className="card-body">
                <h3 className="text-success mb-0">{stats.total_sites}</h3>
                <small className="text-muted">Sites</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center border-warning">
              <div className="card-body">
                <h3 className="text-warning mb-0">{stats.total_departments}</h3>
                <small className="text-muted">Departments</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center border-danger">
              <div className="card-body">
                <h3 className="text-danger mb-0">{stats.total_employees}</h3>
                <small className="text-muted">Employees</small>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Company Overview</h5>
        </div>
        <div className="card-body">
          {companies.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-building" style={{ fontSize: '3rem', color: '#ccc' }}></i>
              <p className="text-muted mt-3">No companies found</p>
              <Link to="/organization/companies" className="btn btn-primary">
                Create First Company
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Code</th>
                    <th className="text-center">Regions</th>
                    <th className="text-center">Sites</th>
                    <th className="text-center">Departments</th>
                    <th className="text-center">Employees</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((item) => (
                    <tr key={item.company.id}>
                      <td>
                        <strong>{item.company.name}</strong>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{item.company.code}</span>
                      </td>
                      <td className="text-center">{item.regions}</td>
                      <td className="text-center">{item.sites}</td>
                      <td className="text-center">{item.departments}</td>
                      <td className="text-center">{item.employees}</td>
                      <td>
                        <Link
                          to={`/organization/hierarchy/${item.company.id}`}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          View Hierarchy
                        </Link>
                        <Link
                          to={`/organization/companies/${item.company.id}`}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="row g-3 mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Quick Actions</h6>
            </div>
            <div className="list-group list-group-flush">
              <Link to="/organization/companies" className="list-group-item list-group-item-action">
                <i className="bi bi-building me-2"></i> Manage Companies
              </Link>
              <Link to="/organization/departments" className="list-group-item list-group-item-action">
                <i className="bi bi-people me-2"></i> Manage Departments
              </Link>
              <Link to="/organization/hierarchy" className="list-group-item list-group-item-action">
                <i className="bi bi-diagram-3 me-2"></i> View Full Hierarchy
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">System Information</h6>
            </div>
            <div className="card-body">
              <p className="mb-2">
                <strong>Total Organizations:</strong> {stats?.total_companies || 0}
              </p>
              <p className="mb-2">
                <strong>Total Locations:</strong>{' '}
                {(stats?.total_regions || 0) + (stats?.total_sites || 0)}
              </p>
              <p className="mb-0">
                <strong>Total Organizational Units:</strong> {stats?.total_departments || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
