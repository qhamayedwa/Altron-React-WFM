import { Card, Button, Table, Form, Row, Col } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';

export default function TimeExceptions() {
  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <AlertTriangle size={28} className="me-2" />
          Time Entry Exceptions
        </h2>
        <Button variant="outline-primary">View All Timecards</Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label>Exception Type</Form.Label>
                <Form.Select>
                  <option value="">All Types</option>
                  <option value="missing_clockout">Missing Clock Out</option>
                  <option value="overtime">Overtime</option>
                  <option value="late">Late Arrival</option>
                  <option value="early_departure">Early Departure</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Date Range</Form.Label>
                <Form.Control type="date" />
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Button variant="primary">Apply Filters</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Exceptions Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Exception Queue</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Exception Type</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    <AlertTriangle size={48} className="text-muted mb-3" />
                    <h5>No Exceptions Found</h5>
                    <p className="text-muted">All time entries are in order.</p>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
