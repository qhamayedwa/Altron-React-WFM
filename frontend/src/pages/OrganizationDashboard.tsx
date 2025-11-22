import { Card, Button, Row, Col } from 'react-bootstrap';
import { Sitemap, Plus } from 'lucide-react';

export default function OrganizationDashboard() {
  const stats = {
    totalCompanies: 1,
    totalRegions: 3,
    totalSites: 8,
    totalDepartments: 15,
    totalEmployees: 247
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <Sitemap size={28} className="me-2" />
            Organizational Hierarchy
          </h2>
          <p className="text-muted">Manage your company structure across regions, sites, and departments</p>
        </div>
        <div>
          <Button variant="primary">
            <Plus size={18} className="me-2" />
            New Company
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <Row className="mb-4">
        <Col md className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <div className="display-6 text-primary">{stats.totalCompanies}</div>
              <div className="text-muted text-uppercase" style={{fontSize: '0.9rem', letterSpacing: '1px'}}>Companies</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <div className="display-6 text-primary">{stats.totalRegions}</div>
              <div className="text-muted text-uppercase" style={{fontSize: '0.9rem', letterSpacing: '1px'}}>Regions</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <div className="display-6 text-primary">{stats.totalSites}</div>
              <div className="text-muted text-uppercase" style={{fontSize: '0.9rem', letterSpacing: '1px'}}>Sites</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <div className="display-6 text-primary">{stats.totalDepartments}</div>
              <div className="text-muted text-uppercase" style={{fontSize: '0.9rem', letterSpacing: '1px'}}>Departments</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <div className="display-6 text-primary">{stats.totalEmployees}</div>
              <div className="text-muted text-uppercase" style={{fontSize: '0.9rem', letterSpacing: '1px'}}>Total Employees</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Companies Overview */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Companies Overview</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted text-center py-4">No companies found. Click "New Company" to get started.</p>
        </Card.Body>
      </Card>
    </div>
  );
}
