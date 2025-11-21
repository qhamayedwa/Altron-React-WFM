import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { MapPin, Plus, Edit2, Trash2, Mail, Phone, Building } from 'lucide-react';
import { api } from '../lib/api';

interface Company {
  id: number;
  name: string;
  code: string;
}

interface Region {
  id: number;
  company_id: number;
  company?: { id: number; name: string; code: string };
  name: string;
  code: string;
  description?: string;
  manager_name?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  timezone?: string;
  is_active: boolean;
  site_count?: number;
}

export default function RegionManagementPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialFormData = {
    company_id: 0,
    name: '',
    code: '',
    description: '',
    manager_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    timezone: 'Africa/Johannesburg',
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchCompanies();
    fetchRegions();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/organization/companies');
      setCompanies(response.data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const companiesRes = await api.get('/organization/companies');
      const allRegions: Region[] = [];
      
      for (const company of companiesRes.data || []) {
        const companyDetails = await api.get(`/organization/companies/${company.id}`);
        if (companyDetails.data.regions) {
          allRegions.push(...companyDetails.data.regions.map((r: any) => ({
            ...r,
            company: { id: company.id, name: company.name, code: company.code }
          })));
        }
      }
      
      setRegions(allRegions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch regions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (region: Region | null = null) => {
    if (region) {
      setEditingRegion(region);
      setFormData({
        company_id: region.company_id,
        name: region.name || '',
        code: region.code || '',
        description: region.description || '',
        manager_name: region.manager_name || '',
        email: region.email || '',
        phone: region.phone || '',
        address_line1: region.address_line1 || '',
        address_line2: region.address_line2 || '',
        city: region.city || '',
        state_province: region.state_province || '',
        postal_code: region.postal_code || '',
        timezone: region.timezone || 'Africa/Johannesburg',
      });
    } else {
      setEditingRegion(null);
      setFormData({ ...initialFormData, company_id: companies[0]?.id || 0 });
    }
    setShowModal(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingRegion) {
        await api.put(`/organization/regions/${editingRegion.id}`, formData);
        setSuccess('Region updated successfully!');
      } else {
        await api.post(`/organization/companies/${formData.company_id}/regions`, formData);
        setSuccess('Region created successfully!');
      }
      fetchRegions();
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save region');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete region "${name}"? This will delete all sites and departments.`)) return;

    setLoading(true);
    try {
      await api.delete(`/organization/regions/${id}`);
      setSuccess('Region deleted successfully!');
      fetchRegions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete region');
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
              <h2 className="mb-1"><MapPin className="me-2" size={28} />Region Management</h2>
              <p className="text-muted mb-0">Manage geographic regions across your companies</p>
            </div>
            <Button variant="primary" onClick={() => handleOpenModal()} disabled={loading || companies.length === 0}>
              <Plus size={20} className="me-2" />Add Region
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {companies.length === 0 && (
        <Alert variant="warning">No companies found. Create a company first.</Alert>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {loading && regions.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : regions.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <MapPin size={48} className="mb-3" />
                  <p>No regions found. Click "Add Region" to create one.</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Manager</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Sites</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.map((region) => (
                      <tr key={region.id}>
                        <td><Badge bg="secondary">{region.company?.code}</Badge></td>
                        <td><code className="text-primary">{region.code}</code></td>
                        <td><strong>{region.name}</strong></td>
                        <td>{region.manager_name || '-'}</td>
                        <td>
                          <div className="small">
                            {region.email && <div><Mail size={14} className="me-1" />{region.email}</div>}
                            {region.phone && <div><Phone size={14} className="me-1" />{region.phone}</div>}
                          </div>
                        </td>
                        <td>{region.city && region.state_province ? `${region.city}, ${region.state_province}` : '-'}</td>
                        <td><Badge bg="info">{region.site_count || 0} sites</Badge></td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenModal(region)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(region.id, region.name)}>
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
          <Modal.Title>{editingRegion ? 'Edit Region' : 'Create New Region'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Company *</Form.Label>
              <Form.Select
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: parseInt(e.target.value) })}
                required
                disabled={!!editingRegion}
              >
                <option value={0}>Select company...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Region Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={100}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
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
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <hr />
            <h6 className="mb-3">Contact Information</h6>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Manager Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.manager_name}
                    onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                    maxLength={100}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                maxLength={20}
              />
            </Form.Group>

            <hr />
            <h6 className="mb-3">Location</h6>

            <Form.Group className="mb-3">
              <Form.Label>Address Line 1</Form.Label>
              <Form.Control
                type="text"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                maxLength={100}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address Line 2</Form.Label>
              <Form.Control
                type="text"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                maxLength={100}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    maxLength={50}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State/Province</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.state_province}
                    onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                    maxLength={50}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    maxLength={20}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Timezone</Form.Label>
                  <Form.Select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  >
                    <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                    <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                    <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingRegion ? 'Update Region' : 'Create Region'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
