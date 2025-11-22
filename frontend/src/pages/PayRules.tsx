import { Card, Button, Table, Badge } from 'react-bootstrap';
import { Settings, Plus, Edit, Trash2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PayRules() {
  const navigate = useNavigate();

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Settings size={28} className="me-2" />
          Pay Rules Management
        </h2>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => navigate('/test-pay-rules')}>
            <Play size={18} className="me-2" />
            Test Rules
          </Button>
          <Button variant="primary" onClick={() => navigate('/create-pay-rule')}>
            <Plus size={18} className="me-2" />
            Create Rule
          </Button>
        </div>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Configured Pay Rules</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Conditions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Overtime Rule</strong></td>
                  <td>Applies 1.5x rate for hours over 8 per day</td>
                  <td><Badge bg="warning">High (1)</Badge></td>
                  <td>Hours &gt; 8</td>
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
                  <td><strong>Double Time Rule</strong></td>
                  <td>Applies 2.0x rate for hours over 12 per day</td>
                  <td><Badge bg="danger">Critical (0)</Badge></td>
                  <td>Hours &gt; 12</td>
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
