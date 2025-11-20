import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../lib/api';

interface HierarchyDepartment {
  id: number;
  name: string;
  code: string;
  employee_count: number;
}

interface HierarchySite {
  id: number;
  name: string;
  code: string;
  departments: HierarchyDepartment[];
}

interface HierarchyRegion {
  id: number;
  name: string;
  code: string;
  sites: HierarchySite[];
}

interface Hierarchy {
  company: {
    id: number;
    name: string;
    code: string;
  };
  regions: HierarchyRegion[];
}

export default function OrgHierarchyPage() {
  const { companyId } = useParams<{ companyId?: string }>();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companyId || '');
  const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadHierarchy(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (companyId) {
      setSelectedCompanyId(companyId);
    }
  }, [companyId]);

  const loadCompanies = async () => {
    try {
      const response = await apiClient.get('/organization/companies');
      setCompanies(response.data.companies);
      if (response.data.companies.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(response.data.companies[0].id.toString());
      }
    } catch (err: any) {
      console.error('Failed to load companies:', err);
    }
  };

  const loadHierarchy = async (compId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/organization/hierarchy/${compId}`);
      setHierarchy(response.data.hierarchy);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load hierarchy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Organization Hierarchy</h2>
        <Link to="/organization" className="btn btn-secondary">
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <label className="form-label">Select Company:</label>
          <select
            className="form-select"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
          >
            <option value="">-- Select a company --</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} ({company.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && hierarchy && (
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-building me-2"></i>
              {hierarchy.company.name} ({hierarchy.company.code})
            </h5>
          </div>
          <div className="card-body">
            {hierarchy.regions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No regions found for this company</p>
              </div>
            ) : (
              hierarchy.regions.map((region) => (
                <div key={region.id} className="mb-4 border rounded p-3 bg-light">
                  <h5 className="text-info">
                    <i className="bi bi-geo-alt me-2"></i>
                    {region.name} ({region.code})
                  </h5>
                  {region.sites.length === 0 ? (
                    <p className="text-muted ms-4">No sites in this region</p>
                  ) : (
                    region.sites.map((site) => (
                      <div key={site.id} className="ms-4 mb-3 border rounded p-3 bg-white">
                        <h6 className="text-success">
                          <i className="bi bi-pin-map me-2"></i>
                          {site.name} ({site.code})
                        </h6>
                        {site.departments.length === 0 ? (
                          <p className="text-muted ms-4">No departments at this site</p>
                        ) : (
                          <div className="ms-4">
                            {site.departments.map((dept) => (
                              <div key={dept.id} className="p-2 mb-2 border rounded bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                  <span>
                                    <i className="bi bi-people me-2 text-warning"></i>
                                    <strong>{dept.name}</strong> ({dept.code})
                                  </span>
                                  <span className="badge bg-primary">
                                    {dept.employee_count} employees
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
