import { useState, useEffect } from 'react';
import { Card, Button, Badge, Table, ButtonGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Tag, Edit, ArrowLeft, Info, BarChart2, Settings, Clock, Pause, Play } from 'lucide-react';

interface LeaveApplication {
  id: number;
  employee: {
    first_name: string;
    last_name: string;
    username: string;
  };
  start_date: string;
  end_date: string;
  total_days: number;
  status: string;
  created_at: string;
}

export default function ViewLeaveType() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [leaveType, setLeaveType] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [recentApplications, setRecentApplications] = useState<LeaveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaveType();
  }, [id]);

  const loadLeaveType = async () => {
    try {
      const response = await fetch(`/api/v1/leave/types/${id}`);
      if (response.ok) {
        const data = await response.json();
        setLeaveType(data);
        
        setStats({
          total: data.total_applications || 0,
          pending: data.pending_applications || 0,
          approved: data.approved_applications || 0,
          rejected: data.total_applications - data.pending_applications - data.approved_applications || 0
        });
        
        setRecentApplications(data.recent_applications || []);
      }
    } catch (err) {
      console.error('Error loading leave type:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!window.confirm(`Are you sure you want to ${leaveType.is_active ? 'deactivate' : 'activate'} this leave type?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/leave/types/${id}/toggle`, {
        method: 'POST'
      });

      if (response.ok) {
        loadLeaveType();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  if (isLoading) {
    return <div className="py-5 text-center">Loading...</div>;
  }

  if (!leaveType) {
    return <div className="py-5 text-center">Leave type not found</div>;
  }

  return (
    <div className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Tag size={28} className="me-2" />
          {leaveType.name}
        </h2>
        <ButtonGroup>
          <Button
            variant="primary"
            onClick={() => navigate(`/leave-types/edit/${id}`)}
          >
            <Edit size={18} className="me-2" />
            Edit Leave Type
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/leave-types')}
          >
            <ArrowLeft size={18} className="me-2" />
            Back to Leave Types
          </Button>
        </ButtonGroup>
      </div>

      <div className="row">
        <div className="col-md-8">
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <Info size={20} className="me-2" />
                Leave Type Details
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Name:</strong>
                </div>
                <div className="col-sm-9">
                  {leaveType.name}
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Description:</strong>
                </div>
                <div className="col-sm-9">
                  {leaveType.description || <span className="text-muted">No description provided</span>}
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Accrual Rate:</strong>
                </div>
                <div className="col-sm-9">
                  {leaveType.default_accrual_rate ? `${leaveType.default_accrual_rate} hours/year` : <span className="text-muted">No automatic accrual</span>}
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Requires Approval:</strong>
                </div>
                <div className="col-sm-9">
                  <Badge bg={leaveType.requires_approval ? 'warning' : 'success'}>
                    {leaveType.requires_approval ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Max Consecutive Days:</strong>
                </div>
                <div className="col-sm-9">
                  {leaveType.max_consecutive_days ? `${leaveType.max_consecutive_days} days` : <span className="text-muted">No limit</span>}
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Status:</strong>
                </div>
                <div className="col-sm-9">
                  <Badge bg={leaveType.is_active ? 'success' : 'secondary'}>
                    {leaveType.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Created:</strong>
                </div>
                <div className="col-sm-9">
                  {leaveType.created_at ? new Date(leaveType.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </div>
              </div>
              
              {leaveType.updated_at && leaveType.updated_at !== leaveType.created_at && (
                <div className="row mb-3">
                  <div className="col-sm-3">
                    <strong>Last Updated:</strong>
                  </div>
                  <div className="col-sm-9">
                    {new Date(leaveType.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">
                <BarChart2 size={16} className="me-2" />
                Usage Statistics
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Total Applications:</span>
                  <strong>{stats.total}</strong>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Pending:</span>
                  <Badge bg="warning">{stats.pending}</Badge>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Approved:</span>
                  <Badge bg="success">{stats.approved}</Badge>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Rejected:</span>
                  <Badge bg="danger">{stats.rejected}</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <Settings size={16} className="me-2" />
                Quick Actions
              </h6>
            </Card.Header>
            <Card.Body>
              <Button
                variant={leaveType.is_active ? 'warning' : 'success'}
                className="w-100 mb-2"
                onClick={handleToggleStatus}
              >
                {leaveType.is_active ? (
                  <><Pause size={18} className="me-2" />Deactivate</>
                ) : (
                  <><Play size={18} className="me-2" />Activate</>
                )}
              </Button>
              
              <Button
                variant="outline-primary"
                className="w-100"
                onClick={() => navigate(`/leave-types/edit/${id}`)}
              >
                <Edit size={18} className="me-2" />
                Edit Settings
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>

      {recentApplications.length > 0 && (
        <Card className="mt-4">
          <Card.Header>
            <h5 className="mb-0">
              <Clock size={20} className="me-2" />
              Recent Applications ({leaveType.name})
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table sm>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <strong>{app.employee.first_name} {app.employee.last_name}</strong>
                        <br />
                        <small className="text-muted">{app.employee.username}</small>
                      </td>
                      <td>{new Date(app.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td>{new Date(app.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td>{app.total_days} days</td>
                      <td>
                        <Badge bg={
                          app.status === 'Pending' ? 'warning' :
                          app.status === 'Approved' ? 'success' : 'danger'
                        }>
                          {app.status}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
