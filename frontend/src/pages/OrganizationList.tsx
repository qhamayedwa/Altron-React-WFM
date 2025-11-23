import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Plus, Building, CheckCircle, Users, Globe, Edit2, UserPlus, Eye, AlertTriangle } from 'lucide-react';

const OrganizationList = () => {
  const navigate = useNavigate();

  const tenants = [
    {
      id: 1,
      name: 'Altron Technologies',
      subdomain: 'altron',
      domain: 'altron.com',
      admin_email: 'admin@altron.com',
      user_count: 45,
      max_users: 50,
      subscription_plan: 'enterprise',
      is_active: true,
      created_at: '2025-01-15',
      is_over_limit: false
    },
    {
      id: 2,
      name: 'Tech Solutions Inc',
      subdomain: 'techsolutions',
      domain: null,
      admin_email: 'admin@techsolutions.com',
      user_count: 30,
      max_users: 50,
      subscription_plan: 'premium',
      is_active: true,
      created_at: '2025-02-20',
      is_over_limit: false
    },
    {
      id: 3,
      name: 'StartupCo',
      subdomain: 'startupco',
      domain: null,
      admin_email: 'admin@startupco.com',
      user_count: 15,
      max_users: 25,
      subscription_plan: 'basic',
      is_active: false,
      created_at: '2025-03-10',
      is_over_limit: false
    }
  ];

  const totalOrganizations = tenants.length;
  const activeOrganizations = tenants.filter(t => t.is_active).length;
  const totalUsers = tenants.reduce((sum, t) => sum + t.user_count, 0);

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'success';
      case 'premium': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Organization Management</h1>
            <Button variant="primary" onClick={() => navigate('/tenant/organizations/create')}>
              <Plus size={16} className="me-1" /> Create New Organization
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <Building className="text-primary" size={24} />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Total Organizations</h6>
                  <h4 className="mb-0">{totalOrganizations}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="text-success" size={24} />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Active Organizations</h6>
                  <h4 className="mb-0">{activeOrganizations}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <Users className="text-info" size={24} />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Total Users</h6>
                  <h4 className="mb-0">{totalUsers}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <Globe className="text-warning" size={24} />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Multi-Tenant</h6>
                  <p className="mb-0">System</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="card-title mb-0">All Organizations</h5>
        </Card.Header>
        <Card.Body>
          {tenants.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Subdomain</th>
                    <th>Admin Email</th>
                    <th>Users</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(tenant => (
                    <tr key={tenant.id}>
                      <td>
                        <div>
                          <strong>{tenant.name}</strong>
                          {tenant.domain && (
                            <>
                              <br />
                              <small className="text-muted">{tenant.domain}</small>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <code>{tenant.subdomain}</code>
                      </td>
                      <td>{tenant.admin_email}</td>
                      <td>
                        <Badge bg="secondary">{tenant.user_count}</Badge> /{' '}
                        <Badge bg="light" text="dark">{tenant.max_users}</Badge>
                        {tenant.is_over_limit && (
                          <AlertTriangle className="text-warning ms-1" size={16} />
                        )}
                      </td>
                      <td>
                        <Badge bg={getPlanBadgeVariant(tenant.subscription_plan)}>
                          {tenant.subscription_plan.charAt(0).toUpperCase() + tenant.subscription_plan.slice(1)}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={tenant.is_active ? 'success' : 'danger'}>
                          {tenant.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>{tenant.created_at}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button variant="outline-primary" size="sm">
                            <Edit2 size={14} />
                          </Button>
                          <Button variant="outline-success" size="sm" title="Create Tenant Admin">
                            <UserPlus size={14} />
                          </Button>
                          <Button variant="outline-info" size="sm">
                            <Eye size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <Building size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No Organizations Found</h5>
              <p className="text-muted">Get started by creating your first organization.</p>
              <Button variant="primary" onClick={() => navigate('/tenant/organizations/create')}>
                <Plus size={16} className="me-1" /> Create First Organization
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Multi-Tenant System Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Data Isolation</h6>
                  <p className="text-muted">Each organization has completely isolated data including:</p>
                  <ul className="text-muted">
                    <li>Users and roles</li>
                    <li>Time tracking records</li>
                    <li>Schedules and shifts</li>
                    <li>Leave applications</li>
                    <li>Payroll data</li>
                    <li>Custom settings</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Role Hierarchy</h6>
                  <ul className="text-muted">
                    <li><strong>System Super Admin:</strong> Manages all organizations</li>
                    <li><strong>Tenant Admin:</strong> Manages their organization</li>
                    <li><strong>Manager:</strong> Manages employees within organization</li>
                    <li><strong>Employee:</strong> Basic access within organization</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrganizationList;
