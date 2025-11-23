import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, ArrowLeft, Save } from 'lucide-react';
import api from '../api/client';

export default function EditCompany() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    legalName: '',
    registrationNumber: '',
    taxNumber: '',
    email: '',
    phone: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: 'South Africa',
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR',
    fiscalYearStart: 4
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompany();
  }, [id]);

  const loadCompany = async () => {
    try {
      const response = await api.get(`/organization/companies/${id}`);
      const company = response.data.company;
      setFormData({
        name: company.name || '',
        code: company.code || '',
        legalName: company.legalName || '',
        registrationNumber: company.registrationNumber || '',
        taxNumber: company.taxNumber || '',
        email: company.email || '',
        phone: company.phone || '',
        website: company.website || '',
        addressLine1: company.addressLine1 || '',
        addressLine2: company.addressLine2 || '',
        city: company.city || '',
        stateProvince: company.stateProvince || '',
        postalCode: company.postalCode || '',
        country: company.country || 'South Africa',
        timezone: company.timezone || 'Africa/Johannesburg',
        currency: company.currency || 'ZAR',
        fiscalYearStart: company.fiscalYearStart || 4
      });
    } catch (err) {
      console.error('Error loading company:', err);
      setError('Failed to load company details');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      setError('Please enter company name and code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put(`/organization/companies/${id}`, formData);
      setSuccess('Company updated successfully!');
      setTimeout(() => {
        navigate(`/organization/companies/view/${id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Card>
            <Card.Header>
              <h4>
                <Building2 size={20} className="me-2" />
                Edit Company - {formData.name}
              </h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Name <span className="text-danger">*</span></Form.Label>
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
                      <Form.Label>Company Code <span className="text-danger">*</span></Form.Label>
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
                  <Form.Label>Legal Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Registration Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tax Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="taxNumber"
                        value={formData.taxNumber}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr />
                <h5>Contact Information</h5>

                <Row>
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
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <hr />
                <h5>Address</h5>

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

                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="South Africa">South Africa</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </Form.Select>
                </Form.Group>

                <hr />
                <h5>Settings</h5>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Timezone</Form.Label>
                      <Form.Select
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                      >
                        <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="Australia/Sydney">Australia/Sydney</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Currency</Form.Label>
                      <Form.Select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                      >
                        <option value="ZAR">ZAR - South African Rand</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fiscal Year Start (Month)</Form.Label>
                      <Form.Select
                        name="fiscalYearStart"
                        value={formData.fiscalYearStart}
                        onChange={handleInputChange}
                      >
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={() => navigate(`/organization/companies/view/${id}`)}>
                    <ArrowLeft size={18} className="me-2" />
                    Back to Company
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    <Save size={18} className="me-2" />
                    {loading ? 'Updating...' : 'Update Company'}
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
