import { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Edit, Plus, Info, BarChart2, Eye, MapPin } from 'lucide-react';
import api from '../api/client';

interface Company {
  id: number;
  name: string;
  code: string;
  legalName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  fiscalYearStart?: number;
}

interface Region {
  id: number;
  name: string;
  code: string;
  description?: string;
  city?: string;
  manager_name?: string;
  siteCount: number;
}

interface Stats {
  regions: number;
  sites: number;
  departments: number;
  employees: number;
}

export default function ViewCompany() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [stats, setStats] = useState<Stats>({ regions: 0, sites: 0, departments: 0, employees: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompany();
  }, [id]);

  const loadCompany = async () => {
    try {
      const response = await api.get(`/organization/companies/${id}`);
      setCompany(response.data.company);
      setRegions(response.data.regions || []);
      setStats(response.data.stats || { regions: 0, sites: 0, departments: 0, employees: 0 });
    } catch (err) {
      console.error('Error loading company:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mt-4"><div className="text-center">Loading...</div></div>;
  }

  if (!company) {
    return <div className="container mt-4"><div className="text-center">Company not found</div></div>;
  }

  return (
    <div className="container-fluid mt-4">
      <div className="bg-light border rounded p-3 mb-3" style={{ fontFamily: 'monospace' }}>
        <i className="fas fa-sitemap"></i>{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/organization-dashboard'); }} className="text-decoration-none">Organization</a>
        {' → '}
        <strong>{company.name}</strong>
      </div>

      <div className="p-4 rounded mb-4 text-white" style={{ background: 'linear-gradient(135deg, #27C1E3 0%, #1a8ca8 100%)' }}>
        <Row className="align-items-center">
          <Col md={8}>
            <h1 className="mb-2">{company.name}</h1>
            <Badge bg="light" text="dark" className="me-2">{company.code}</Badge>
            {company.legalName && <p className="mb-2 opacity-75">{company.legalName}</p>}
            <Row className="mt-3">
              <Col md={6}>
                {company.city && (
                  <p className="mb-1">
                    <i className="fas fa-map-marker-alt"></i> {company.city}, {company.country}
                  </p>
                )}
                {company.timezone && (
                  <p className="mb-1">
                    <i className="fas fa-clock"></i> {company.timezone}
                  </p>
                )}
              </Col>
              <Col md={6}>
                {company.currency && (
                  <p className="mb-1">
                    <i className="fas fa-coins"></i> {company.currency}
                  </p>
                )}
                {company.email && (
                  <p className="mb-1">
                    <i className="fas fa-envelope"></i> {company.email}
                  </p>
                )}
              </Col>
            </Row>
          </Col>
          <Col md={4} className="text-end">
            <Button variant="light" className="me-2" onClick={() => navigate(`/organization/companies/edit/${id}`)}>
              <Edit size={18} className="me-2" />
              Edit Company
            </Button>
            <Button variant="success" onClick={() => navigate(`/organization/regions/create?company_id=${id}`)}>
              <Plus size={18} className="me-2" />
              Add Region
            </Button>
          </Col>
        </Row>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <div className="bg-white rounded p-3 text-center shadow-sm" style={{ borderLeft: '4px solid #27C1E3' }}>
            <div className="text-primary" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.regions}</div>
            <div className="text-muted">Regions</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="bg-white rounded p-3 text-center shadow-sm" style={{ borderLeft: '4px solid #27C1E3' }}>
            <div className="text-primary" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.sites}</div>
            <div className="text-muted">Sites</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="bg-white rounded p-3 text-center shadow-sm" style={{ borderLeft: '4px solid #27C1E3' }}>
            <div className="text-primary" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.departments}</div>
            <div className="text-muted">Departments</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="bg-white rounded p-3 text-center shadow-sm" style={{ borderLeft: '4px solid #27C1E3' }}>
            <div className="text-primary" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.employees}</div>
            <div className="text-muted">Employees</div>
          </div>
        </Col>
      </Row>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <MapPin size={20} className="me-2" />
            Regions
          </h5>
          <Button variant="primary" size="sm" onClick={() => navigate(`/organization/regions/create?company_id=${id}`)}>
            <Plus size={18} className="me-2" />
            Add Region
          </Button>
        </Card.Header>
        <Card.Body>
          {regions.length > 0 ? (
            regions.map(region => (
              <div key={region.id} className="border rounded p-3 mb-3" style={{ transition: 'all 0.3s ease' }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                     e.currentTarget.style.transform = 'translateY(-2px)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.boxShadow = '';
                     e.currentTarget.style.transform = '';
                   }}>
                <Row className="align-items-center">
                  <Col md={6}>
                    <h6 className="mb-1">
                      <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/organization/regions/view/${region.id}`); }} className="text-decoration-none">
                        {region.name}
                      </a>
                      <Badge bg="secondary" className="ms-2">{region.code}</Badge>
                    </h6>
                    {region.description && <p className="text-muted mb-1">{region.description}</p>}
                    {region.city && <small className="text-muted"><i className="fas fa-map-marker-alt"></i> {region.city}</small>}
                  </Col>
                  <Col md={3}>
                    {region.manager_name && (
                      <>
                        <strong>Manager:</strong><br />
                        <span className="text-muted">{region.manager_name}</span>
                      </>
                    )}
                  </Col>
                  <Col md={3} className="text-end">
                    <div className="btn-group">
                      <Button variant="outline-primary" size="sm" onClick={() => navigate(`/organization/regions/view/${region.id}`)}>
                        <Eye size={16} className="me-1" />
                        View
                      </Button>
                      <Button variant="outline-success" size="sm" onClick={() => navigate(`/organization/sites/create?region_id=${region.id}`)}>
                        <Plus size={16} className="me-1" />
                        Add Site
                      </Button>
                    </div>
                  </Col>
                </Row>
                {region.siteCount > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">
                      <Building2 size={14} className="me-1" />
                      {region.siteCount} site{region.siteCount !== 1 ? 's' : ''}
                    </small>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-5">
              <MapPin size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No Regions Yet</h5>
              <p className="text-muted">This company doesn't have any regions yet.</p>
              <Button variant="primary" onClick={() => navigate(`/organization/regions/create?company_id=${id}`)}>
                <Plus size={18} className="me-2" />
                Add First Region
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
