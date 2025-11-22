import { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button } from 'react-bootstrap';
import { Calendar } from 'lucide-react';

export default function MySchedule() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(twoWeeksLater.toISOString().split('T')[0]);
  }, []);

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Calendar size={28} className="me-2" />
          My Schedule
        </h2>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label>Start Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Label>End Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Button variant="primary" className="me-2">Filter</Button>
                <Button variant="outline-secondary">Clear</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Schedule Entries */}
      <Card className="mb-4">
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shift Type</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    <Calendar size={48} className="text-muted mb-3" />
                    <h5>No Scheduled Shifts</h5>
                    <p className="text-muted">You have no scheduled shifts for the selected date range.</p>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Schedule Summary */}
      <Row>
        <Col md={6}>
          <Card>
            <Card.Body className="text-center">
              <h5 className="text-primary">0</h5>
              <p className="text-muted mb-0">Total Shifts</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body className="text-center">
              <h5 className="text-success">0:00</h5>
              <p className="text-muted mb-0">Total Hours</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
