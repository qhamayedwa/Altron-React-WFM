import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, ArrowLeft, Plus } from 'lucide-react';
import api from '../api/client';

interface Region {
  id: number;
  name: string;
  companyName: string;
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
}

export default function CreateSite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const regionId = searchParams.get('region_id');

  const [regions, setRegions] = useState<Region[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  
  const [formData, setFormData] = useState({
    regionId: regionId || '',
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
    loadRegions();
    loadManagers();
  }, []);

  useEffect(() => {
    if (formData.regionId) {
      const region = regions.find(r => r.id === parseInt(formData.regionId));
      setSelectedRegion(region || null);
    }
  }, [formData.regionId, regions]);

  const loadRegions = async () => {
    try {
      const response = await api.get('/organization/hierarchy');
      setRegions(response.data.regions || []);
      if (regionId && response.data.regions) {
        const region = response.data.regions.find((r: Region) => r.id === parseInt(regionId));
        if (region) {
          setSelectedRegion(region);
        }
      }
    } catch (err) {
      console.error('Error loading regions:', err);
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
    
    if (!formData.regionId || !formData.name || !formData.code) {
      setError('Please enter region, site name and code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/organization/sites', {
        regionId: parseInt(formData.regionId),
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

      setSuccess('Site created successfully!');
      setTimeout(() => {
        if (regionId) {
          navigate(`/organization/regions/view/${regionId}`);
        } else {
          navigate('/organization-dashboard');
        }
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <MapPin size={20} className="me-2" />
                Create New Site
              </h4>
              {selectedRegion && <p className="mb-0 mt-2">Adding site to <strong>{selectedRegion.name}</strong> ({selectedRegion.companyName})</p>}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Region <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="regionId"
                    value={formData.regionId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select region...</option>
                    {regions.map(region => (
                      <option key={region.id} value={region.id}>
                        {region.name} ({region.companyName})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Site Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                      <Form.Text className="text-muted">
                        Enter the full name of the site (e.g., "Main Office", "Manufacturing Plant")
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Site Code <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        maxLength={10}
                        required
                      />
                      <Form.Text className="text-muted">
                        Unique identifier (auto-generated from name)
                      </Form.Text>
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
                    placeholder="Brief description of this site's purpose and operations"
                  />
                </Form.Group>

                <hr />
                <h5>Site Manager</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Select Manager from System</Form.Label>
                  <Form.Select
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleManagerSelect}
                  >
                    <option value="">Select a manager...</option>
                    {managers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName}
                        {manager.position && ` (${manager.position})`}
                        {manager.departmentName && ` - ${manager.departmentName}`}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">Search and select an existing employee as site manager</Form.Text>
                </Form.Group>

                {selectedManager && (
                  <div className="manager-details-card bg-light border-start border-4 border-info p-3 rounded mb-3">
                    <h6><strong>Selected Manager Details</strong></h6>
                    <Row>
                      <Col md={4}>
                        <strong>Name:</strong><br />
                        <span>{selectedManager.firstName} {selectedManager.lastName}</span>
                      </Col>
                      <Col md={4}>
                        <strong>Position:</strong><br />
                        <span>{selectedManager.position || 'Not specified'}</span>
                      </Col>
                      <Col md={4}>
                        <strong>Department:</strong><br />
                        <span>{selectedManager.departmentName || 'Not specified'}</span>
                      </Col>
                    </Row>
                    <div className="mt-2">
                      <strong>Contact:</strong><br />
                      <span>{selectedManager.email || ''}{selectedManager.email && (selectedManager.phoneNumber || selectedManager.mobileNumber) ? ', ' : ''}{selectedManager.phoneNumber || selectedManager.mobileNumber || 'Not specified'}</span>
                    </div>
                  </div>
                )}

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Manager Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="managerName"
                        value={formData.managerName}
                        onChange={handleInputChange}
                        placeholder="Or enter manually"
                        readOnly={!!formData.managerId}
                      />
                      <Form.Text className="text-muted">Enter manager name if not found in dropdown</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="manager@company.com"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+27 11 123 4567"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr />
                <h5>Address</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Address Line 1</Form.Label>
                  <Form.Control
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Street address"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address Line 2</Form.Label>
                  <Form.Control
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, etc. (optional)"
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
                    <option value="">Inherit from Region ({selectedRegion?.timezone || 'Africa/Johannesburg'})</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                    <option value="UTC">UTC</option>
                    <option value="Africa/Cairo">Africa/Cairo</option>
                    <option value="Africa/Lagos">Africa/Lagos</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} className="me-2" />
                    Back to Region
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    <Plus size={18} className="me-2" />
                    {loading ? 'Creating...' : 'Create Site'}
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
