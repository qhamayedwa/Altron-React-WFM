import { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Eye, Plus, MapPin, Globe } from 'lucide-react';

interface Department {
  id: number;
  name: string;
  code: string;
  siteName?: string;
  managerName?: string;
  costCenter?: string;
}

export default function OrganizationManagement() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await fetch('/api/v1/organization/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error('Error loading departments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Building2 size={28} className="me-2" />
          Organization Management
        </h2>
        <div>
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={() => navigate('/organization/my-department')}
          >
            <Users size={18} className="me-2" />
            My Department
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/organization/departments/create')}
          >
            <Plus size={18} className="me-2" />
            Create Department
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <Building2 size={20} className="me-2" />
                Companies
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Manage companies and corporate structure</p>
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => navigate('/organization/companies')}
                >
                  <Eye size={18} className="me-2" />
                  View Companies
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <Globe size={20} className="me-2" />
                Regions
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Manage geographic regions for your organization</p>
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => navigate('/organization/regions/create')}
                >
                  <Plus size={18} className="me-2" />
                  Create Region
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <MapPin size={20} className="me-2" />
                Sites
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Manage physical locations and sites</p>
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => navigate('/organization/sites/create')}
                >
                  <Plus size={18} className="me-2" />
                  Create Site
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <Users size={20} className="me-2" />
            Employee Assignment
          </h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted">Assign employees to departments and sites</p>
          <Button
            variant="primary"
            onClick={() => navigate('/organization/assign-employee')}
          >
            <Users size={18} className="me-2" />
            Assign Employee
          </Button>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <Users size={20} className="me-2" />
            Departments
          </h5>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : departments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No departments configured yet.</p>
              <Button variant="primary" onClick={() => navigate('/organization/departments/create')}>
                <Plus size={18} className="me-2" />
                Create First Department
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Code</th>
                    <th>Site</th>
                    <th>Manager</th>
                    <th>Cost Center</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.id}>
                      <td>
                        <strong>{dept.name}</strong>
                      </td>
                      <td>
                        <Badge bg="secondary">{dept.code}</Badge>
                      </td>
                      <td>{dept.siteName || '-'}</td>
                      <td>{dept.managerName || 'Not assigned'}</td>
                      <td>{dept.costCenter || '-'}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/organization/departments/view/${dept.id}`)}
                        >
                          <Eye size={16} className="me-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
