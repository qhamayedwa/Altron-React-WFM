import { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface LeaveApplication {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leave/requests');
      setApplications(response.data.leaveRequests || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <Badge bg={statusMap[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

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
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading applications...</p>
            </div>
          ) : (
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
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
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
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id}>
                        <td>{formatDate(app.createdAt)}</td>
                        <td>{app.leaveType}</td>
                        <td>{formatDate(app.startDate)}</td>
                        <td>{formatDate(app.endDate)}</td>
                        <td>{calculateDays(app.startDate, app.endDate)}</td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td>{app.reason || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
