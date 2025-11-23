import { useState, useEffect } from 'react';
import { Card, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Edit, Eye } from 'lucide-react';

interface LeaveType {
  id: number;
  name: string;
  code?: string;
  description?: string;
  default_accrual_rate?: number;
  max_consecutive_days?: number;
  requires_approval: boolean;
  is_active: boolean;
}

export default function LeaveTypes() {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      const response = await fetch('/api/v1/leave/types');
      if (response.ok) {
        const data = await response.json();
        setLeaveTypes(data);
      }
    } catch (err) {
      console.error('Error loading leave types:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Briefcase size={28} className="me-2" />
          Leave Types Management
        </h2>
        <Button variant="primary" onClick={() => navigate('/leave-types/create')}>
          <Plus size={18} className="me-2" />
          Create Leave Type
        </Button>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Configured Leave Types</h5>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : leaveTypes.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No leave types configured yet.</p>
              <Button variant="primary" onClick={() => navigate('/leave-types/create')}>
                <Plus size={18} className="me-2" />
                Create First Leave Type
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Accrual Rate</th>
                    <th>Max Consecutive Days</th>
                    <th>Requires Approval</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveTypes.map((leaveType) => (
                    <tr key={leaveType.id}>
                      <td>
                        <strong>{leaveType.name}</strong>
                        {leaveType.description && (
                          <>
                            <br />
                            <small className="text-muted">{leaveType.description}</small>
                          </>
                        )}
                      </td>
                      <td>{leaveType.code || '-'}</td>
                      <td>
                        {leaveType.default_accrual_rate
                          ? `${leaveType.default_accrual_rate} hours/year`
                          : '-'}
                      </td>
                      <td>
                        {leaveType.max_consecutive_days
                          ? `${leaveType.max_consecutive_days} days`
                          : 'No limit'}
                      </td>
                      <td>
                        <Badge bg={leaveType.requires_approval ? 'warning' : 'info'}>
                          {leaveType.requires_approval ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={leaveType.is_active ? 'success' : 'secondary'}>
                          {leaveType.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => navigate(`/leave-types/view/${leaveType.id}`)}
                            title="View"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/leave-types/edit/${leaveType.id}`)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
