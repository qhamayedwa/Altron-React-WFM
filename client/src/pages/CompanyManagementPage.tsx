import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { Building2, Plus, Edit2, Trash2, Globe, Mail, Phone } from 'lucide-react';
import { api } from '../lib/api';

interface Company {
  id: number;
  name: string;
  code: string;
  legal_name?: string;
  registration_number?: string;
  tax_number?: string;
  email?: string;
  phone?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  fiscal_year_start?: number;
  is_active: boolean;
  region_count?: number;
  created_at?: string;
}

interface CompanyFormData {
  name: string;
  code: string;
  legal_name: string;
  registration_number: string;
  tax_number: string;
  email: string;
  phone: string;
  website: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  timezone: string;
  currency: string;
  fiscal_year_start: number;
  is_active: boolean;
}

export default function CompanyManagementPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialFormData: CompanyFormData = {
    name: '',
    code: '',
    legal_name: '',
    registration_number: '',
    tax_number: '',
    email: '',
    phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'South Africa',
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR',
    fiscal_year_start: 1,
    is_active: true,
  };

  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await api.get('/organization/companies');
      setCompanies(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (company: Company | null = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name || '',
        code: company.code || '',
        legal_name: company.legal_name || '',
        registration_number: company.registration_number || '',
        tax_number: company.tax_number || '',
        email: company.email || '',
        phone: company.phone || '',
        website: company.website || '',
        address_line1: company.address_line1 || '',
        address_line2: company.address_line2 || '',
        city: company.city || '',
        state_province: company.state_province || '',
        postal_code: company.postal_code || '',
        country: company.country || 'South Africa',
        timezone: company.timezone || 'Africa/Johannesburg',
        currency: company.currency || 'ZAR',
        fiscal_year_start: company.fiscal_year_start || 1,
        is_active: company.is_active,
      });
    } else {
      setEditingCompany(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCompany(null);
    setFormData(initialFormData);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        legal_name: formData.legal_name || undefined,
        registration_number: formData.registration_number || undefined,
        tax_number: formData.tax_number || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        address_line1: formData.address_line1 || undefined,
        address_line2: formData.address_line2 || undefined,
        city: formData.city || undefined,
        state_province: formData.state_province || undefined,
        postal_code: formData.postal_code || undefined,
        country: formData.country || undefined,
        timezone: formData.timezone || undefined,
        currency: formData.currency || undefined,
        fiscal_year_start: formData.fiscal_year_start || undefined,
      };

      if (editingCompany) {
        await api.put(`/organization/companies/${editingCompany.id}`, payload);
        setSuccess('Company updated successfully!');
      } else {
        await api.post('/organization/companies', payload);
        setSuccess('Company created successfully!');
      }

      fetchCompanies();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save company');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all regions, sites, and departments under this company.`)) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.delete(`/organization/companies/${id}`);
      setSuccess('Company deleted successfully!');
      fetchCompanies();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete company');
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <Building2 className="me-2" size={28} />
                Company Management
              </h2>
              <p className="text-muted mb-0">
                Manage companies at the top level of your organization hierarchy
              </p>
            </div>
            <Button variant="primary" onClick={() => handleOpenModal()} disabled={loading}>
              <Plus size={20} className="me-2" />
              Add Company
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {loading && companies.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Building2 size={48} className="mb-3" />
                  <p>No companies found. Click "Add Company" to create one.</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Legal Name</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Regions</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id}>
                        <td>
                          <code className="text-primary">{company.code}</code>
                        </td>
                        <td>
                          <strong>{company.name}</strong>
                          {company.registration_number && (
                            <div className="text-muted small">Reg: {company.registration_number}</div>
                          )}
                        </td>
                        <td>{company.legal_name || '-'}</td>
                        <td>
                          <div className="small">
                            {company.email && (
                              <div>
                                <Mail size={14} className="me-1" />
                                {company.email}
                              </div>
                            )}
                            {company.phone && (
                              <div>
                                <Phone size={14} className="me-1" />
                                {company.phone}
                              </div>
                            )}
                            {company.website && (
                              <div>
                                <Globe size={14} className="me-1" />
                                <a href={company.website} target="_blank" rel="noopener noreferrer">
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {company.city && company.country ? (
                            <div>
                              {company.city}, {company.state_province || ''} {company.country}
                            </div>
                          ) : (
                            '-'
                          )}
                          {company.timezone && (
                            <div className="text-muted small">{company.timezone}</div>
                          )}
                        </td>
                        <td>
                          <Badge bg="info">{company.region_count || 0} regions</Badge>
                        </td>
                        <td>
                          <Badge bg={company.is_active ? 'success' : 'secondary'}>
                            {company.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleOpenModal(company)}
                            disabled={loading}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(company.id, company.name)}
                            disabled={loading}
                          >
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

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCompany ? 'Edit Company' : 'Create New Company'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Company Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={100}
                    placeholder="Enter company name"
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
                    placeholder="e.g., ABC"
                  />
                  <Form.Text className="text-muted">Unique company identifier</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Legal Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.legal_name}
                onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                maxLength={150}
                placeholder="Full legal company name"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Registration Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    maxLength={50}
                    placeholder="Company registration number"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tax Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.tax_number}
                    onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                    maxLength={50}
                    placeholder="Tax identification number"
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />
            <h6 className="mb-3">Contact Information</h6>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.com"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    maxLength={20}
                    placeholder="+27 11 123 4567"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.company.com"
              />
            </Form.Group>

            <hr />
            <h6 className="mb-3">Address</h6>

            <Form.Group className="mb-3">
              <Form.Label>Address Line 1</Form.Label>
              <Form.Control
                type="text"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                maxLength={100}
                placeholder="Street address"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address Line 2</Form.Label>
              <Form.Control
                type="text"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                maxLength={100}
                placeholder="Suite, unit, building, floor, etc."
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
                    placeholder="Johannesburg"
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
                    placeholder="Gauteng"
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
                    placeholder="2000"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    maxLength={50}
                    placeholder="South Africa"
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />
            <h6 className="mb-3">Settings</h6>

            <Row>
              <Col md={4}>
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
                    <option value="UTC">UTC</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Currency</Form.Label>
                  <Form.Select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="ZAR">ZAR (South African Rand)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fiscal Year Start</Form.Label>
                  <Form.Select
                    value={formData.fiscal_year_start}
                    onChange={(e) => setFormData({ ...formData, fiscal_year_start: parseInt(e.target.value) })}
                  >
                    {monthNames.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {editingCompany && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Form.Text className="text-muted">
                  Inactive companies are hidden from most views
                </Form.Text>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingCompany ? 'Update Company' : 'Create Company'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
