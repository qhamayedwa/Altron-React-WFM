import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, ArrowLeft, Save } from 'lucide-react';
import api from '../api/client';

interface Region {
  id: number;
  name: string;
  code: string;
  description?: string;
  companyId: number;
  companyName: string;
  companyCode: string;
  managerId?: number;
  managerName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  timezone?: string;
  isActive: boolean;
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

export default function EditRegion() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [region, setRegion] = useState<Region | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  
  const [formData, setFormData] = useState({
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
    timezone: '',
    isActive: true
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRegion();
    loadManagers();
  }, [id]);

  const loadRegion = async () => {
    try {
      const response = await api.get(`/organization/regions/${id}`);
      const data = response.data.region;
      setRegion(data);
      setFormData({
        name: data.name || '',
        code: data.code || '',
        description: data.description || '',
        managerId: data.managerId || '',
        managerName: data.managerName || '',
        email: data.email || '',
        phone: data.phone || '',
        addressLine1: data.addressLine1 || '',
        addressLine2: data.addressLine2 || '',
        city: data.city || '',
        stateProvince: data.stateProvince || '',
        postalCode: data.postalCode || '',
        timezone: data.timezone || '',
        isActive: data.isActive !== false
      });
    } catch (err) {
      console.error('Error loading region:', err);
      setError('Failed to load region');
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
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));

    if (name === 'code') {
      setFormData(prev => ({ ...prev, code: value.toUpperCase() }));
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
        email: manager.email || prev.email,
        phone: manager.phoneNumber || manager.mobileNumber || prev.phone
      }));
    } else {
      setSelectedManager(null);
      setFormData(prev => ({
        ...prev,
        managerId: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      setError('Please enter region name and code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put(`/organization/regions/${id}`, {
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
        timezone: formData.timezone,
        isActive: formData.isActive
      });

      setSuccess('Region updated successfully!');
      setTimeout(() => {
        navigate(`/organization/regions/view/${id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update region');
    } finally {
      setLoading(false);
    }
  };

  if (!region) {
    return <div className="container mt-4"><div className="text-center">Loading...</div></div>;
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4>
                <Edit size={20} className="me-2" />
                Edit Region - {region.name}
                <small className="d-block mt-1">Company: {region.companyName} ({region.companyCode})</small>
              </h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
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
                  <div className="manager-details-card bg-light border-start border-4 border-primary p-3 rounded mb-3">
                    <h6><strong>Manager Details</strong></h6>
                    <Row>
                      <Col md={6}>
                        <strong>Name:</strong> {selectedManager.firstName} {selectedManager.lastName}<br />
                        {selectedManager.position && <><strong>Position:</strong> {selectedManager.position}<br /></>}
                        {selectedManager.departmentName && <><strong>Department:</strong> {selectedManager.departmentName}<br /></>}
                      </Col>
                      <Col md={6}>
                        {selectedManager.email && <><strong>Email:</strong> {selectedManager.email}<br /></>}
                        {(selectedManager.phoneNumber || selectedManager.mobileNumber) && <><strong>Phone:</strong> {selectedManager.phoneNumber || selectedManager.mobileNumber}<br /></>}
                      </Col>
                    </Row>
                  </div>
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
                <h5>Address Information</h5>

                <Row>
                  <Col md={6}>
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
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State/Province</Form.Label>
                      <Form.Control
                        type="text"
                        name="stateProvince"
                        value={formData.stateProvince}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Postal Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Timezone</Form.Label>
                      <Form.Select
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                      >
                        <option value="Africa/Johannesburg">South Africa Standard Time (SAST)</option>
                        <option value="Africa/Cairo">Central Africa Time (CAT)</option>
                        <option value="Africa/Lagos">West Africa Time (WAT)</option>
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <hr />
                <h5>Status</h5>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isActive"
                    label="Region is Active"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted d-block">Inactive regions will be hidden from most views</Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={() => navigate(`/organization/regions/view/${id}`)}>
                    <ArrowLeft size={18} className="me-2" />
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    <Save size={18} className="me-2" />
                    {loading ? 'Updating...' : 'Update Region'}
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
