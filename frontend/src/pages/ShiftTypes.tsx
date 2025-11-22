import { Card, Button, Table, Badge } from 'react-bootstrap';
import { Clock, Plus, Edit, Trash2 } from 'lucide-react';

export default function ShiftTypes() {
  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Clock size={28} className="me-2" />
          Shift Types Management
        </h2>
        <Button variant="primary">
          <Plus size={18} className="me-2" />
          Create Shift Type
        </Button>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Available Shift Types</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Shift Name</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Morning Shift</strong>
                    <br />
                    <small className="text-muted">Standard morning hours</small>
                  </td>
                  <td>08:00 AM</td>
                  <td>04:00 PM</td>
                  <td>8.0 hours</td>
                  <td>
                    <Badge bg="success">Active</Badge>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <Button variant="outline-primary" size="sm">
                        <Edit size={16} />
                      </Button>
                      <Button variant="outline-danger" size="sm">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Night Shift</strong>
                    <br />
                    <small className="text-muted">Standard night hours</small>
                  </td>
                  <td>10:00 PM</td>
                  <td>06:00 AM</td>
                  <td>8.0 hours</td>
                  <td>
                    <Badge bg="success">Active</Badge>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <Button variant="outline-primary" size="sm">
                        <Edit size={16} />
                      </Button>
                      <Button variant="outline-danger" size="sm">
                        <Trash2 size={16} />
                      </Button>
                    </div>
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
