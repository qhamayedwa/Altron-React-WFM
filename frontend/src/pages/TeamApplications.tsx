import { Card, Table } from 'react-bootstrap';
import { Users } from 'lucide-react';

export default function TeamApplications() {
  return (
    <div className="py-4">
      <div className="mb-4">
        <h2>
          <Users size={28} className="me-2" />
          Team Leave Applications
        </h2>
        <p className="text-muted">Review and approve leave requests from your team members</p>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Pending Approvals</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    <Users size={48} className="text-muted mb-3" />
                    <h5>No Pending Applications</h5>
                    <p className="text-muted">All team leave requests have been processed.</p>
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
