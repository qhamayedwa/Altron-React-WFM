import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, ArrowLeft, Save } from 'lucide-react';
import api from '../api/client';

interface Company {
  id: number;
  name: string;
  code: string;
  timezone?: string;
}

interface Manager {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  position?: string;
  departmentName?: string;
  employeeId?: string;
}

export default function CreateRegion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('company_id');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  
  const [formData, setFormData] = useState({
    companyId: companyId || '',
    name: '',
    code: '',
    description: '',
    managerId: '',
    managerName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    timezone: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompanies();
    loadManagers();
  }, []);

  useEffect(() => {
    if (formData.companyId) {
      const company = companies.find(c => c.id === parseInt(formData.companyId));
      setSelectedCompany(company || null);
    }
  }, [formData.companyId, companies]);

  const loadCompanies = async () => {
    try {
      const response = await api.get('/organization/hierarchy');
      setCompanies(response.data.companies || []);
      if (companyId && response.data.companies) {
        const company = response.data.companies.find((c: Company) => c.id === parseInt(companyId));
        if (company) {
          setSelectedCompany(company);
        }
      }
    } catch (err) {
      console.error('Error loading companies:', err);
    }
  };

  const loadManagers = async () => {
    try {
      const response = await api.get('/users/managers');
      setManagers(response.data.managers || []);
    } catch (err) {
      console.error('Error loading managers:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'name') {
      const code = value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase();
      setFormData(prev => ({ ...prev, code }));
    }
  };

  const handleManagerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const managerId = e.target.value;
    const manager = managers.find(m => m.id === parseInt(managerId));
    
    if (manager) {
      setSelectedManager(manager);
      setFormData(prev => ({
        ...prev,
        managerId,
        managerName: `${manager.firstName} ${manager.lastName}`,
        email: manager.email || '',
        phone: manager.phoneNumber || manager.mobileNumber || ''
      }));
    } else {
      setSelectedManager(null);
      setFormData(prev => ({
        ...prev,
        managerId: '',
        managerName: '',
        email: '',
        phone: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyId || !formData.name || !formData.code) {
      setError('Please enter company, region name and code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/organization/regions', {
        companyId: parseInt(formData.companyId),
        name: formData.name,
        code: formData.code,
        description: formData.description,
        managerId: formData.managerId ? parseInt(formData.managerId) : null,
        managerName: formData.managerName,
        email: formData.email,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        stateProvince: formData.stateProvince,
        postalCode: formData.postalCode,
        timezone: formData.timezone
      });

      setSuccess('Region created successfully!');
      setTimeout(() => {
        navigate('/organization/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create region');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4>
                <MapPin size={20} className="me-2" />
                Create New Region
                {selectedCompany && <small className="d-block mt-1">Company: {selectedCompany.name} ({selectedCompany.code})</small>}
              </h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Company <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select company...</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name} ({company.code})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Region Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Region Code <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        maxLength={10}
                        style={{ textTransform: 'uppercase' }}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <hr />
                <h5>Regional Management</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Regional Manager</Form.Label>
                  <Form.Select
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleManagerSelect}
                  >
                    <option value="">Select a manager...</option>
                    {managers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName} ({manager.employeeId})
                        {manager.position && ` - ${manager.position}`}
                        {manager.departmentName && ` - ${manager.departmentName}`}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">Search by name, employee ID, or department</Form.Text>
                </Form.Group>

                {selectedManager && (
                  <Alert variant="info">
                    <h6><strong>Selected Manager Details</strong></h6>
                    <Row>
                      <Col md={6}>
                        <p className="mb-1"><strong>Name:</strong> {selectedManager.firstName} {selectedManager.lastName}</p>
                        <p className="mb-1"><strong>Position:</strong> {selectedManager.position || 'Not specified'}</p>
                      </Col>
                      <Col md={6}>
                        <p className="mb-1"><strong>Department:</strong> {selectedManager.departmentName || 'Not specified'}</p>
                        <p className="mb-0"><strong>Contact:</strong> {selectedManager.email || ''}{selectedManager.email && (selectedManager.phoneNumber || selectedManager.mobileNumber) ? ', ' : ''}{selectedManager.phoneNumber || selectedManager.mobileNumber || 'Not specified'}</p>
                      </Col>
                    </Row>
                  </Alert>
                )}

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Manager Name (Manual Entry)</Form.Label>
                      <Form.Control
                        type="text"
                        name="managerName"
                        value={formData.managerName}
                        onChange={handleInputChange}
                        placeholder="Or enter name manually if not in list"
                        readOnly={!!formData.managerId}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <hr />
                <h5>Regional Address</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Address Line 1</Form.Label>
                  <Form.Control
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address Line 2</Form.Label>
                  <Form.Control
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>State/Province</Form.Label>
                      <Form.Control
                        type="text"
                        name="stateProvince"
                        value={formData.stateProvince}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Postal Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr />
                <h5>Settings</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Timezone</Form.Label>
                  <Form.Select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                  >
                    <option value="">Inherit from Company ({selectedCompany?.timezone || 'Africa/Johannesburg'})</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Australia/Sydney">Australia/Sydney</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} className="me-2" />
                    Back
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    <Save size={18} className="me-2" />
                    {loading ? 'Creating...' : 'Create Region'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
