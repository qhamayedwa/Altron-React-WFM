import { Card, Button, Table, Badge } from 'react-bootstrap';
import { Briefcase, Plus, Edit, Trash2 } from 'lucide-react';

export default function LeaveTypes() {
  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Briefcase size={28} className="me-2" />
          Leave Types Management
        </h2>
        <Button variant="primary">
          <Plus size={18} className="me-2" />
          Create Leave Type
        </Button>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Configured Leave Types</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Accrual Rate</th>
                  <th>Max Balance</th>
                  <th>Requires Approval</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Annual Leave</strong>
                    <br />
                    <small className="text-muted">Standard paid annual leave</small>
                  </td>
                  <td>AL</td>
                  <td>1.67 days/month</td>
                  <td>20 days</td>
                  <td><Badge bg="warning">Yes</Badge></td>
                  <td><Badge bg="success">Active</Badge></td>
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
                    <strong>Sick Leave</strong>
                    <br />
                    <small className="text-muted">Paid sick leave</small>
                  </td>
                  <td>SL</td>
                  <td>1.0 day/month</td>
                  <td>12 days</td>
                  <td><Badge bg="info">No</Badge></td>
                  <td><Badge bg="success">Active</Badge></td>
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
