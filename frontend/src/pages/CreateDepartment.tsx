import { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert, Breadcrumb, Dropdown } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Plus, ArrowLeft } from 'lucide-react';

interface Manager {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface Site {
  id: number;
  name: string;
  region: {
    name: string;
    company: {
      id: number;
      name: string;
    };
  };
}

export default function CreateDepartment() {
  const navigate = useNavigate();
  const { siteId } = useParams<{ siteId: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    manager_id: '',
    budget: ''
  });
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [managerSearch, setManagerSearch] = useState('');
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSite();
    loadManagers();
  }, [siteId]);

  const loadSite = async () => {
    try {
      const response = await fetch(`/api/v1/organization/sites/${siteId}`);
      if (response.ok) {
        const data = await response.json();
        setSite(data);
      }
    } catch (err) {
      console.error('Error loading site:', err);
    }
  };

  const loadManagers = async () => {
    try {
      const response = await fetch('/api/v1/users?role=Manager,Admin,Super User');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setManagers(data.users || []);
        }
      }
    } catch (err) {
      console.error('Error loading managers:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/organization/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          siteId: parseInt(siteId || '0')
        }),
      });

      if (response.ok) {
        navigate(`/organization/sites/view/${siteId}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create department');
      }
    } catch (err) {
      setError('An error occurred while creating department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const selectManager = (manager: Manager) => {
    setSelectedManager(manager);
    setFormData(prev => ({ ...prev, manager_id: manager.id.toString() }));
    setManagerSearch(manager.username);
    setShowManagerDropdown(false);
  };

  const filteredManagers = managers.filter(manager =>
    managerSearch.length >= 2 && (
      manager.username.toLowerCase().includes(managerSearch.toLowerCase()) ||
      manager.email.toLowerCase().includes(managerSearch.toLowerCase()) ||
      (manager.first_name && manager.first_name.toLowerCase().includes(managerSearch.toLowerCase())) ||
      (manager.last_name && manager.last_name.toLowerCase().includes(managerSearch.toLowerCase()))
    )
  );

  if (!site) {
    return <div className="py-4 text-center">Loading...</div>;
  }

  return (
    <div className="py-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <Breadcrumb>
            <Breadcrumb.Item onClick={() => navigate('/organization')}>Organization</Breadcrumb.Item>
            <Breadcrumb.Item onClick={() => navigate(`/organization/companies/view/${site.region.company.id}`)}>{site.region.company.name}</Breadcrumb.Item>
            <Breadcrumb.Item onClick={() => navigate(`/organization/regions/view/${site.region.id}`)}>{site.region.name}</Breadcrumb.Item>
            <Breadcrumb.Item onClick={() => navigate(`/organization/sites/view/${siteId}`)}>{site.name}</Breadcrumb.Item>
            <Breadcrumb.Item active>Create Department</Breadcrumb.Item>
          </Breadcrumb>

          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <Users size={20} className="me-2" />
                Create New Department
              </h4>
              <small>Adding department to {site.name}</small>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit} id="departmentForm">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Department Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Department Code *</Form.Label>
                      <Form.Control
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Department Manager</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      id="manager_search"
                      value={managerSearch}
                      onChange={(e) => {
                        setManagerSearch(e.target.value);
                        setShowManagerDropdown(e.target.value.length >= 2);
                      }}
                      placeholder="Search for a manager..."
                      autoComplete="off"
                    />
                    {showManagerDropdown && (
                      <Dropdown.Menu show style={{ maxHeight: '200px', overflowY: 'auto', width: '100%' }}>
                        {filteredManagers.length === 0 ? (
                          <Dropdown.ItemText className="text-muted">No managers found</Dropdown.ItemText>
                        ) : (
                          filteredManagers.map((manager) => (
                            <Dropdown.Item
                              key={manager.id}
                              onClick={() => selectManager(manager)}
                            >
                              <div>
                                <strong>{manager.username}</strong>
                                <small className="text-muted d-block">{manager.email}</small>
                              </div>
                            </Dropdown.Item>
                          ))
                        )}
                      </Dropdown.Menu>
                    )}
                  </div>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Manager Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedManager?.username || ''}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={selectedManager?.email || ''}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedManager?.phone || ''}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Budget</Form.Label>
                      <Form.Control
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        step="0.01"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-between">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/organization/sites/view/${siteId}`)}
                  >
                    <ArrowLeft size={18} className="me-2" />
                    Back to Site
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <Plus size={18} className="me-2" />
                    {isSubmitting ? 'Creating...' : 'Create Department'}
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
