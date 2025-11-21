import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { Building, Plus, Edit2, Trash2, MapPin, Clock } from 'lucide-react';
import { api } from '../lib/api';

interface Site {
  id: number;
  region_id: number;
  region?: { name: string; code: string };
  name: string;
  code: string;
  site_type?: string;
  description?: string;
  manager_name?: string;
  email?: string;
  phone?: string;
  address_line1: string;
  city: string;
  latitude?: number;
  longitude?: number;
  geo_fence_radius?: number;
  operating_hours_start?: string;
  operating_hours_end?: string;
  timezone?: string;
  allow_remote_work?: boolean;
  is_active: boolean;
  department_count?: number;
}

export default function SiteManagementPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialFormData = {
    region_id: 0,
    name: '',
    code: '',
    site_type: 'office',
    description: '',
    manager_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    latitude: 0,
    longitude: 0,
    geo_fence_radius: 100,
    operating_hours_start: '08:00',
    operating_hours_end: '17:00',
    timezone: 'Africa/Johannesburg',
    allow_remote_work: false,
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchRegions();
    fetchSites();
  }, []);

  const fetchRegions = async () => {
    try {
      const companiesRes = await api.get('/organization/companies');
      const allRegions: any[] = [];
      
      for (const company of companiesRes.data || []) {
        const companyDetails = await api.get(`/organization/companies/${company.id}`);
        if (companyDetails.data.regions) {
          allRegions.push(...companyDetails.data.regions.map((r: any) => ({
            ...r,
            company_name: company.name
          })));
        }
      }
      
      setRegions(allRegions);
    } catch (err) {
      console.error('Failed to fetch regions:', err);
    }
  };

  const fetchSites = async () => {
    setLoading(true);
    try {
      const regionsRes = await api.get('/organization/companies');
      const allSites: Site[] = [];
      
      for (const company of regionsRes.data || []) {
        const companyDetails = await api.get(`/organization/companies/${company.id}`);
        if (companyDetails.data.regions) {
          for (const region of companyDetails.data.regions) {
            if (region.sites) {
              allSites.push(...region.sites.map((s: any) => ({
                ...s,
                region: { name: region.name, code: region.code }
              })));
            }
          }
        }
      }
      
      setSites(allSites);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sites');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (site: Site | null = null) => {
    if (site) {
      setEditingSite(site);
      setFormData({
        region_id: site.region_id,
        name: site.name || '',
        code: site.code || '',
        site_type: site.site_type || 'office',
        description: site.description || '',
        manager_name: site.manager_name || '',
        email: site.email || '',
        phone: site.phone || '',
        address_line1: site.address_line1 || '',
        address_line2: '',
        city: site.city || '',
        state_province: '',
        postal_code: '',
        latitude: site.latitude || 0,
        longitude: site.longitude || 0,
        geo_fence_radius: site.geo_fence_radius || 100,
        operating_hours_start: site.operating_hours_start || '08:00',
        operating_hours_end: site.operating_hours_end || '17:00',
        timezone: site.timezone || 'Africa/Johannesburg',
        allow_remote_work: site.allow_remote_work || false,
      });
    } else {
      setEditingSite(null);
      setFormData({ ...initialFormData, region_id: regions[0]?.id || 0 });
    }
    setShowModal(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingSite) {
        await api.put(`/organization/sites/${editingSite.id}`, formData);
        setSuccess('Site updated successfully!');
      } else {
        await api.post(`/organization/regions/${formData.region_id}/sites`, formData);
        setSuccess('Site created successfully!');
      }
      fetchSites();
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save site');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete site "${name}"? This will delete all departments.`)) return;

    setLoading(true);
    try {
      await api.delete(`/organization/sites/${id}`);
      setSuccess('Site deleted successfully!');
      fetchSites();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1"><Building className="me-2" size={28} />Site Management</h2>
              <p className="text-muted mb-0">Manage physical locations and facilities</p>
            </div>
            <Button variant="primary" onClick={() => handleOpenModal()} disabled={loading || regions.length === 0}>
              <Plus size={20} className="me-2" />Add Site
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {regions.length === 0 && (
        <Alert variant="warning">No regions found. Create a region first.</Alert>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {loading && sites.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : sites.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Building size={48} className="mb-3" />
                  <p>No sites found. Click "Add Site" to create one.</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Operating Hours</th>
                      <th>Departments</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sites.map((site) => (
                      <tr key={site.id}>
                        <td><Badge bg="secondary">{site.region?.code}</Badge></td>
                        <td><code className="text-primary">{site.code}</code></td>
                        <td><strong>{site.name}</strong></td>
                        <td><Badge bg="info">{site.site_type}</Badge></td>
                        <td>
                          <div><MapPin size={14} className="me-1" />{site.city}</div>
                          {site.latitude && site.longitude && (
                            <div className="text-muted small">GPS: {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}</div>
                          )}
                        </td>
                        <td>
                          <Clock size={14} className="me-1" />
                          {site.operating_hours_start} - {site.operating_hours_end}
                        </td>
                        <td><Badge bg="success">{site.department_count || 0} depts</Badge></td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenModal(site)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(site.id, site.name)}>
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingSite ? 'Edit Site' : 'Create New Site'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Region *</Form.Label>
              <Form.Select
                value={formData.region_id}
                onChange={(e) => setFormData({ ...formData, region_id: parseInt(e.target.value) })}
                required
                disabled={!!editingSite}
              >
                <option value={0}>Select region...</option>
                {regions.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Site Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={100}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    maxLength={10}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={formData.site_type}
                    onChange={(e) => setFormData({ ...formData, site_type: e.target.value })}
                  >
                    <option value="office">Office</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="retail">Retail</option>
                    <option value="factory">Factory</option>
                    <option value="remote">Remote</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Form.Control
                type="text"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                required
                maxLength={100}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>City *</Form.Label>
              <Form.Control
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                maxLength={50}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Operating Hours Start</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.operating_hours_start}
                    onChange={(e) => setFormData({ ...formData, operating_hours_start: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Operating Hours End</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.operating_hours_end}
                    onChange={(e) => setFormData({ ...formData, operating_hours_end: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Latitude</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Longitude</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Geo-fence Radius (meters)</Form.Label>
              <Form.Control
                type="number"
                value={formData.geo_fence_radius}
                onChange={(e) => setFormData({ ...formData, geo_fence_radius: parseInt(e.target.value) })}
              />
              <Form.Text className="text-muted">For GPS-based clock in/out validation</Form.Text>
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Allow Remote Work"
              checked={formData.allow_remote_work}
              onChange={(e) => setFormData({ ...formData, allow_remote_work: e.target.checked })}
              className="mb-3"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingSite ? 'Update Site' : 'Create Site'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
