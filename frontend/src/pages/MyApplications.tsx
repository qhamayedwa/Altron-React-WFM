import { Card, Button, Table } from 'react-bootstrap';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyApplications() {
  const navigate = useNavigate();

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FileText size={28} className="me-2" />
          My Leave Applications
        </h2>
        <Button variant="primary" onClick={() => navigate('/apply-leave')}>
          <Plus size={18} className="me-2" />
          Apply for Leave
        </Button>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Leave Request History</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Request Date</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    <FileText size={48} className="text-muted mb-3" />
                    <h5>No Leave Applications</h5>
                    <p className="text-muted">You haven't submitted any leave requests yet.</p>
                    <Button variant="primary" size="sm" onClick={() => navigate('/apply-leave')}>
                      Apply for Leave
                    </Button>
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
