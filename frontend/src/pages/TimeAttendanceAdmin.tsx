import { Card, Button, Row, Col } from 'react-bootstrap';
import { Shield, Edit, Upload, Users, AlertTriangle, BarChart2, Calendar, Play, Clock } from 'lucide-react';

export default function TimeAttendanceAdmin() {
  const stats = {
    totalEntriesToday: 24,
    openEntries: 12,
    exceptionsCount: 3,
    weekTotalHours: 342.5
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Shield size={28} className="me-2" />
          Time Attendance Administration
        </h2>
        <div className="d-flex gap-2">
          <Button variant="primary">
            <Edit size={18} className="me-2" />
            Manual Entry
          </Button>
          <Button variant="outline-secondary">
            <Upload size={18} className="me-2" />
            Import Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <Calendar size={32} className="text-primary mb-2" />
              <h3 className="text-primary">{stats.totalEntriesToday}</h3>
              <p className="text-muted mb-0">Entries Today</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <Play size={32} className="text-success mb-2" />
              <h3 className="text-success">{stats.openEntries}</h3>
              <p className="text-muted mb-0">Currently Clocked In</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <AlertTriangle size={32} className="text-warning mb-2" />
              <h3 className="text-warning">{stats.exceptionsCount}</h3>
              <p className="text-muted mb-0">Exceptions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center">
            <Card.Body>
              <Clock size={32} className="text-info mb-2" />
              <h3 className="text-info">{stats.weekTotalHours.toFixed(1)}</h3>
              <p className="text-muted mb-0">Week Total Hours</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions and System Status */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary">
                  <Users size={18} className="me-2" />
                  View All Timecards
                </Button>
                <Button variant="outline-warning">
                  <AlertTriangle size={18} className="me-2" />
                  Review Exceptions
                </Button>
                <Button variant="outline-info">
                  <BarChart2 size={18} className="me-2" />
                  Generate Reports
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">System Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Time Tracking</span>
                <span className="badge bg-success">Active</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>GPS Tracking</span>
                <span className="badge bg-info">Optional</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Break Tracking</span>
                <span className="badge bg-success">Enabled</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Overtime Calculation</span>
                <span className="badge bg-success">Automatic</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
