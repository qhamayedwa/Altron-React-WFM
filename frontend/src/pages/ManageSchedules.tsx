import { Card, Button, Table } from 'react-bootstrap';
import { Calendar, Plus } from 'lucide-react';

export default function ManageSchedules() {
  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Calendar size={28} className="me-2" />
          Manage Schedules
        </h2>
        <Button variant="primary">
          <Plus size={18} className="me-2" />
          Create Schedule
        </Button>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Scheduled Shifts</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Shift Type</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    <Calendar size={48} className="text-muted mb-3" />
                    <h5>No Schedules Found</h5>
                    <p className="text-muted">Click "Create Schedule" to start scheduling shifts.</p>
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
