import { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Plus, Info, BarChart2, Users, Eye, Building, Edit } from 'lucide-react';
import api from '../api/client';

interface Site {
  id: number;
  name: string;
  code: string;
  description?: string;
  regionId: number;
  regionName: string;
  companyId: number;
  companyName: string;
  managerName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  timezone?: string;
}

interface Department {
  id: number;
  name: string;
  code: string;
  managerName?: string;
  employeeCount: number;
}

interface Stats {
  departments: number;
  employees: number;
}

export default function ViewSite() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [site, setSite] = useState<Site | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<Stats>({ departments: 0, employees: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSite();
  }, [id]);

  const loadSite = async () => {
    try {
      const response = await api.get(`/organization/sites/${id}`);
      setSite(response.data.site);
      setDepartments(response.data.departments || []);
      setStats(response.data.stats || { departments: 0, employees: 0 });
    } catch (err) {
      console.error('Error loading site:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mt-4"><div className="text-center">Loading...</div></div>;
  }

  if (!site) {
    return <div className="container mt-4"><div className="text-center">Site not found</div></div>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0" style={{ background: 'none', padding: 0 }}>
                  <li className="breadcrumb-item">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/organization/dashboard'); }}>Organization</a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/organization/companies/view/${site.companyId}`); }}>{site.companyName}</a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/organization/regions/view/${site.regionId}`); }}>{site.regionName}</a>
                  </li>
                  <li className="breadcrumb-item active">{site.name}</li>
                </ol>
              </nav>
              <h2>
                <MapPin size={28} className="me-2" />
                {site.name}
              </h2>
              <p className="text-muted">{site.description || 'Site operations and management'}</p>
            </div>
            <div>
              <Button variant="outline-secondary" className="me-2" onClick={() => navigate(`/organization/sites/edit/${id}`)}>
                <Edit size={18} className="me-2" />
                Edit Site
              </Button>
              <Button variant="primary" onClick={() => navigate(`/organization/departments/create?site_id=${id}`)}>
                <Plus size={18} className="me-2" />
                Add Department
              </Button>
            </div>
          </div>

          <Row className="mb-4">
            <Col md={8}>
              <Card>
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    <Info size={20} className="me-2" />
                    Site Information
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <td><strong>Site Code:</strong></td>
                            <td>{site.code}</td>
                          </tr>
                          <tr>
                            <td><strong>Region:</strong></td>
                            <td>{site.regionName}</td>
                          </tr>
                          <tr>
                            <td><strong>Company:</strong></td>
                            <td>{site.companyName}</td>
                          </tr>
                          <tr>
                            <td><strong>Manager:</strong></td>
                            <td>{site.managerName || 'Not assigned'}</td>
                          </tr>
                          <tr>
                            <td><strong>Email:</strong></td>
                            <td>{site.email || 'Not provided'}</td>
                          </tr>
                          <tr>
                            <td><strong>Phone:</strong></td>
                            <td>{site.phone || 'Not provided'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </Col>
                    <Col md={6}>
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <td><strong>City:</strong></td>
                            <td>{site.city || 'Not specified'}</td>
                          </tr>
                          <tr>
                            <td><strong>State/Province:</strong></td>
                            <td>{site.stateProvince || 'Not specified'}</td>
                          </tr>
                          <tr>
                            <td><strong>Postal Code:</strong></td>
                            <td>{site.postalCode || 'Not specified'}</td>
                          </tr>
                          <tr>
                            <td><strong>Timezone:</strong></td>
                            <td>{site.timezone || 'Africa/Johannesburg'}</td>
                          </tr>
                          <tr>
                            <td><strong>Status:</strong></td>
                            <td><Badge bg="success">Active</Badge></td>
                          </tr>
                        </tbody>
                      </table>
                    </Col>
                  </Row>
                  {site.addressLine1 && (
                    <>
                      <hr />
                      <Row>
                        <Col>
                          <strong>Address:</strong><br />
                          {site.addressLine1}<br />
                          {site.addressLine2 && <>{site.addressLine2}<br /></>}
                          {site.city}{site.stateProvince && `, ${site.stateProvince}`}
                          {site.postalCode && ` ${site.postalCode}`}
                        </Col>
                      </Row>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card>
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">
                    <BarChart2 size={20} className="me-2" />
                    Statistics
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row className="text-center">
                    <Col xs={12} className="mb-3">
                      <div className="stat-item">
                        <h3 className="text-primary" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 0 }}>{stats.departments}</h3>
                        <small className="text-muted">Departments</small>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className="stat-item">
                        <h3 className="text-info" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 0 }}>{stats.employees}</h3>
                        <small className="text-muted">Total Employees</small>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">
                <Users size={20} className="me-2" />
                Departments in {site.name}
              </h5>
            </Card.Header>
            <Card.Body>
              {departments.length > 0 ? (
                <Row>
                  {departments.map(dept => (
                    <Col md={6} lg={4} key={dept.id} className="mb-3">
                      <Card className="h-100">
                        <Card.Body>
                          <h6>
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/organization/departments/view/${dept.id}`); }} className="text-decoration-none">
                              {dept.name}
                            </a>
                          </h6>
                          <p className="card-text text-muted small mb-2">
                            Code: {dept.code}<br />
                            {dept.managerName && <>Manager: {dept.managerName}<br /></>}
                            Employees: {dept.employeeCount || 0}
                          </p>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/organization/departments/view/${dept.id}`)}
                          >
                            <Eye size={16} className="me-1" />
                            View Details
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-5">
                  <Users size={64} className="text-muted mb-3" />
                  <h5 className="text-muted">No Departments Yet</h5>
                  <p className="text-muted">This site doesn't have any departments yet.</p>
                  <Button variant="primary" onClick={() => navigate(`/organization/departments/create?site_id=${id}`)}>
                    <Plus size={18} className="me-2" />
                    Add First Department
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
