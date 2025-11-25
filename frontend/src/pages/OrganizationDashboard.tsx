import { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { Building2, Plus, MapPin, Clock, DollarSign, Eye, Edit, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface CompanyDetail {
  company: {
    id: number;
    name: string;
    code: string;
    legalName: string;
    city: string;
    country: string;
    timezone: string;
    currency: string;
  };
  regions: number;
  sites: number;
  departments: number;
  employees: number;
}

interface Stats {
  totalCompanies: number;
  totalRegions: number;
  totalSites: number;
  totalDepartments: number;
  totalEmployees: number;
}

export default function OrganizationDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats>({
    totalCompanies: 0,
    totalRegions: 0,
    totalSites: 0,
    totalDepartments: 0,
    totalEmployees: 0
  });
  const [companyDetails, setCompanyDetails] = useState<CompanyDetail[]>([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organization/dashboard-stats');
      setStats(response.data.stats);
      setCompanyDetails(response.data.companyDetails || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <Building2 size={28} className="me-2" />
            Organizational Hierarchy
          </h2>
          <p className="text-muted">Manage your company structure across regions, sites, and departments</p>
        </div>
        <div>
          <Button variant="primary" onClick={() => navigate('/create-company')}>
            <Plus size={18} className="me-2" />
            New Company
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="mb-4">
        <Col md className="mb-3">
          <Card className="text-center h-100" style={{ borderLeft: '4px solid #54B8DF' }}>
            <Card.Body>
              <div className="display-6" style={{ color: '#54B8DF', fontWeight: 'bold' }}>{stats.totalCompanies}</div>
              <div className="text-muted text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>Companies</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md className="mb-3">
          <Card className="text-center h-100" style={{ borderLeft: '4px solid #54B8DF' }}>
            <Card.Body>
              <div className="display-6" style={{ color: '#54B8DF', fontWeight: 'bold' }}>{stats.totalRegions}</div>
              <div className="text-muted text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>Regions</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md className="mb-3">
          <Card className="text-center h-100" style={{ borderLeft: '4px solid #54B8DF' }}>
            <Card.Body>
              <div className="display-6" style={{ color: '#54B8DF', fontWeight: 'bold' }}>{stats.totalSites}</div>
              <div className="text-muted text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>Sites</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md className="mb-3">
          <Card className="text-center h-100" style={{ borderLeft: '4px solid #54B8DF' }}>
            <Card.Body>
              <div className="display-6" style={{ color: '#54B8DF', fontWeight: 'bold' }}>{stats.totalDepartments}</div>
              <div className="text-muted text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>Departments</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md className="mb-3">
          <Card className="text-center h-100" style={{ borderLeft: '4px solid #54B8DF' }}>
            <Card.Body>
              <div className="display-6" style={{ color: '#54B8DF', fontWeight: 'bold' }}>{stats.totalEmployees}</div>
              <div className="text-muted text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>Total Employees</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <Building2 size={18} className="me-2" />
            Companies Overview
          </h5>
        </Card.Header>
        <Card.Body>
          {companyDetails.length > 0 ? (
            companyDetails.map((detail) => (
              <div 
                key={detail.company.id} 
                className="border rounded p-3 mb-3"
                style={{ 
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="mb-1">
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); navigate(`/organization/companies/view/${detail.company.id}`); }}
                        className="text-decoration-none"
                      >
                        {detail.company.name}
                      </a>
                      <span 
                        className="ms-2 px-2 py-1 rounded-pill" 
                        style={{ 
                          backgroundColor: '#f8f9fa', 
                          fontFamily: 'monospace', 
                          fontSize: '0.8rem', 
                          color: '#666' 
                        }}
                      >
                        {detail.company.code}
                      </span>
                    </h5>
                    {detail.company.legalName && (
                      <p className="text-muted mb-0">{detail.company.legalName}</p>
                    )}
                  </div>
                  <Badge bg="success">Active</Badge>
                </div>

                <Row>
                  <Col md={6}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#666' }}>
                      <div className="mb-1">
                        <MapPin size={14} className="me-1" />
                        {detail.company.city || 'Not specified'}, {detail.company.country || 'South Africa'}
                      </div>
                      {detail.company.timezone && (
                        <div className="mb-1">
                          <Clock size={14} className="me-1" />
                          {detail.company.timezone}
                        </div>
                      )}
                      {detail.company.currency && (
                        <div>
                          <DollarSign size={14} className="me-1" />
                          {detail.company.currency}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col md={6}>
                    <Row className="text-center">
                      <Col xs={3}>
                        <strong>{detail.regions}</strong>
                        <br /><small className="text-muted">Regions</small>
                      </Col>
                      <Col xs={3}>
                        <strong>{detail.sites}</strong>
                        <br /><small className="text-muted">Sites</small>
                      </Col>
                      <Col xs={3}>
                        <strong>{detail.departments}</strong>
                        <br /><small className="text-muted">Departments</small>
                      </Col>
                      <Col xs={3}>
                        <strong>{detail.employees}</strong>
                        <br /><small className="text-muted">Employees</small>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <div className="mt-3">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => navigate(`/organization/companies/view/${detail.company.id}`)}
                  >
                    <Eye size={14} className="me-1" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => navigate(`/organization/companies/edit/${detail.company.id}`)}
                  >
                    <Edit size={14} className="me-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={() => navigate(`/organization/regions/create?companyId=${detail.company.id}`)}
                  >
                    <PlusCircle size={14} className="me-1" />
                    Add Region
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5">
              <Building2 size={64} className="text-muted mb-3" />
              <h4 className="text-muted">No Companies Found</h4>
              <p className="text-muted">Create your first company to start building your organizational hierarchy.</p>
              <Button variant="primary" onClick={() => navigate('/create-company')}>
                <Plus size={18} className="me-2" />
                Create First Company
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
