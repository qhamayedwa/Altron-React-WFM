import { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col, Modal, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Edit, Trash2, Plus, Building, Info, BarChart2, Eye, AlertTriangle, X } from 'lucide-react';
import api from '../api/client';

interface Region {
  id: number;
  name: string;
  code: string;
  description?: string;
  companyId: number;
  companyName: string;
  companyCode: string;
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

interface Site {
  id: number;
  name: string;
  code: string;
  managerName?: string;
  departmentCount: number;
}

interface Stats {
  sites: number;
  departments: number;
  employees: number;
}

export default function ViewRegion() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [region, setRegion] = useState<Region | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [stats, setStats] = useState<Stats>({ sites: 0, departments: 0, employees: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegion();
  }, [id]);

  const loadRegion = async () => {
    try {
      const response = await api.get(`/organization/regions/${id}`);
      setRegion(response.data.region);
      setSites(response.data.sites || []);
      setStats(response.data.stats || { sites: 0, departments: 0, employees: 0 });
    } catch (err) {
      console.error('Error loading region:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/organization/regions/${id}`);
      navigate('/organization-dashboard');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete region');
    }
    setShowDeleteModal(false);
  };

  if (loading) {
    return <div className="container mt-4"><div className="text-center">Loading...</div></div>;
  }

  if (!region) {
    return <div className="container mt-4"><div className="text-center">Region not found</div></div>;
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
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/organization-dashboard'); }}>Organization</a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/organization/companies/view/${region.companyId}`); }}>{region.companyName}</a>
                  </li>
                  <li className="breadcrumb-item active">{region.name}</li>
                </ol>
              </nav>
              <h2>
                <MapPin size={28} className="me-2" />
                {region.name}
              </h2>
              <p className="text-muted">{region.description || 'Regional operations and management'}</p>
            </div>
            <div>
              <div className="btn-group me-2">
                <Button variant="outline-secondary" onClick={() => navigate(`/organization/regions/edit/${id}`)}>
                  <Edit size={18} className="me-2" />
                  Edit Region
                </Button>
                <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
                  <Trash2 size={18} className="me-2" />
                  Delete Region
                </Button>
              </div>
              <Button variant="primary" onClick={() => navigate(`/organization/sites/create?region_id=${id}`)}>
                <Plus size={18} className="me-2" />
                Add Site
              </Button>
            </div>
          </div>

          <Row className="mb-4">
            <Col md={8}>
              <Card>
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    <Info size={20} className="me-2" />
                    Region Information
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <td><strong>Region Code:</strong></td>
                            <td>{region.code}</td>
                          </tr>
                          <tr>
                            <td><strong>Company:</strong></td>
                            <td>{region.companyName}</td>
                          </tr>
                          <tr>
                            <td><strong>Manager:</strong></td>
                            <td>{region.managerName || 'Not assigned'}</td>
                          </tr>
                          <tr>
                            <td><strong>Email:</strong></td>
                            <td>{region.email || 'Not provided'}</td>
                          </tr>
                          <tr>
                            <td><strong>Phone:</strong></td>
                            <td>{region.phone || 'Not provided'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </Col>
                    <Col md={6}>
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <td><strong>City:</strong></td>
                            <td>{region.city || 'Not specified'}</td>
                          </tr>
                          <tr>
                            <td><strong>State/Province:</strong></td>
                            <td>{region.stateProvince || 'Not specified'}</td>
                          </tr>
                          <tr>
                            <td><strong>Postal Code:</strong></td>
                            <td>{region.postalCode || 'Not specified'}</td>
                          </tr>
                          <tr>
                            <td><strong>Timezone:</strong></td>
                            <td>{region.timezone || 'Africa/Johannesburg'}</td>
                          </tr>
                          <tr>
                            <td><strong>Status:</strong></td>
                            <td><Badge bg="success">Active</Badge></td>
                          </tr>
                        </tbody>
                      </table>
                    </Col>
                  </Row>
                  {region.addressLine1 && (
                    <>
                      <hr />
                      <Row>
                        <Col>
                          <strong>Address:</strong><br />
                          {region.addressLine1}<br />
                          {region.addressLine2 && <>{region.addressLine2}<br /></>}
                          {region.city}{region.stateProvince && `, ${region.stateProvince}`}
                          {region.postalCode && ` ${region.postalCode}`}
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
                    <Col xs={6} className="mb-3">
                      <div className="stat-item">
                        <h3 className="text-primary" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 0 }}>{stats.sites}</h3>
                        <small className="text-muted">Sites</small>
                      </div>
                    </Col>
                    <Col xs={6} className="mb-3">
                      <div className="stat-item">
                        <h3 className="text-success" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 0 }}>{stats.departments}</h3>
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
                <Building size={20} className="me-2" />
                Sites in {region.name}
              </h5>
            </Card.Header>
            <Card.Body>
              {sites.length > 0 ? (
                <Row>
                  {sites.map(site => (
                    <Col md={6} lg={4} key={site.id} className="mb-3">
                      <Card className="h-100">
                        <Card.Body>
                          <h6>
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/organization/sites/view/${site.id}`); }} className="text-decoration-none">
                              {site.name}
                            </a>
                          </h6>
                          <p className="card-text text-muted small mb-2">
                            Code: {site.code}<br />
                            {site.managerName && <>Manager: {site.managerName}<br /></>}
                            Departments: {site.departmentCount || 0}
                          </p>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/organization/sites/view/${site.id}`)}
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
                  <Building size={64} className="text-muted mb-3" />
                  <h5 className="text-muted">No Sites Yet</h5>
                  <p className="text-muted">This region doesn't have any sites yet.</p>
                  <Button variant="primary" onClick={() => navigate(`/organization/sites/create?region_id=${id}`)}>
                    <Plus size={18} className="me-2" />
                    Add First Site
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <AlertTriangle size={20} className="me-2" />
            Delete Region
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Are you sure you want to delete this region?</strong></p>
          <div className="alert alert-warning">
            <AlertTriangle size={16} className="me-2" />
            <strong>Warning:</strong> This action will deactivate the region "{region.name}" and make it unavailable for future use.
          </div>
          <p>Region details:</p>
          <ul>
            <li><strong>Name:</strong> {region.name}</li>
            <li><strong>Code:</strong> {region.code}</li>
            <li><strong>Company:</strong> {region.companyName}</li>
            <li><strong>Sites:</strong> {stats.sites}</li>
          </ul>
          {stats.sites > 0 && (
            <div className="alert alert-danger">
              <X size={16} className="me-2" />
              <strong>Cannot Delete:</strong> This region has {stats.sites} active site(s). Please deactivate or move all sites before deleting this region.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            <X size={18} className="me-2" />
            Cancel
          </Button>
          {stats.sites === 0 ? (
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 size={18} className="me-2" />
              Delete Region
            </Button>
          ) : (
            <Button variant="danger" disabled>
              <Trash2 size={18} className="me-2" />
              Cannot Delete
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
