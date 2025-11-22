import { Card, Button, Table, Badge } from 'react-bootstrap';
import { DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PayCodes() {
  const navigate = useNavigate();

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <DollarSign size={28} className="me-2" />
          Pay Codes Management
        </h2>
        <Button variant="primary" onClick={() => navigate('/create-pay-code')}>
          <Plus size={18} className="me-2" />
          Create Pay Code
        </Button>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Configured Pay Codes</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>REG</strong></td>
                  <td>Regular Hours</td>
                  <td><Badge bg="primary">Earning</Badge></td>
                  <td>Base Rate</td>
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
                  <td><strong>OT</strong></td>
                  <td>Overtime</td>
                  <td><Badge bg="primary">Earning</Badge></td>
                  <td>1.5x Base</td>
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
                  <td><strong>DOT</strong></td>
                  <td>Double Time</td>
                  <td><Badge bg="primary">Earning</Badge></td>
                  <td>2.0x Base</td>
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
