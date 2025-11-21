import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Table } from 'react-bootstrap';
import { CheckSquare, XSquare, Filter, Clock, Calendar } from 'lucide-react';
import { api } from '../lib/api';

export default function BulkApprovalsPage() {
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [leaveApplications, setLeaveApplications] = useState<any[]>([]);
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<number[]>([]);
  const [selectedLeaveApps, setSelectedLeaveApps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'time' | 'leave'>('time');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const [timeRes, leaveRes] = await Promise.all([
        api.get('/time/pending-approvals'),
        api.get('/leave/team-applications', { params: { status: 'Pending' } })
      ]);
      
      setTimeEntries(timeRes.data || []);
      setLeaveApplications(leaveRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeToggle = (id: number) => {
    setSelectedTimeEntries(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleLeaveToggle = (id: number) => {
    setSelectedLeaveApps(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkApproveTime = async () => {
    if (selectedTimeEntries.length === 0) {
      setError('No time entries selected');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/time/approve', { entry_ids: selectedTimeEntries });
      setSuccess(`Approved ${selectedTimeEntries.length} time entries!`);
      setSelectedTimeEntries([]);
      fetchPendingApprovals();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRejectTime = async () => {
    if (selectedTimeEntries.length === 0) return;

    const reason = prompt('Rejection reason:');
    if (!reason) return;

    setLoading(true);
    try {
      await api.post('/time/reject', { entry_ids: selectedTimeEntries, reason });
      setSuccess(`Rejected ${selectedTimeEntries.length} time entries!`);
      setSelectedTimeEntries([]);
      fetchPendingApprovals();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApproveLeave = async () => {
    if (selectedLeaveApps.length === 0) return;

    setLoading(true);
    try {
      await Promise.all(
        selectedLeaveApps.map(id => api.post(`/leave/applications/${id}/approve`))
      );
      setSuccess(`Approved ${selectedLeaveApps.length} leave applications!`);
      setSelectedLeaveApps([]);
      fetchPendingApprovals();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRejectLeave = async () => {
    if (selectedLeaveApps.length === 0) return;

    const reason = prompt('Rejection reason:');
    if (!reason) return;

    setLoading(true);
    try {
      await Promise.all(
        selectedLeaveApps.map(id => api.post(`/leave/applications/${id}/reject`, { reason }))
      );
      setSuccess(`Rejected ${selectedLeaveApps.length} leave applications!`);
      setSelectedLeaveApps([]);
      fetchPendingApprovals();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1"><CheckSquare className="me-2" size={28} />Bulk Approvals</h2>
          <p className="text-muted mb-0">Approve or reject multiple items at once</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row className="mb-3">
        <Col>
          <Button
            variant={activeTab === 'time' ? 'primary' : 'outline-primary'}
            className="me-2"
            onClick={() => setActiveTab('time')}
          >
            <Clock className="me-2" size={18} />
            Time Entries ({timeEntries.length})
          </Button>
          <Button
            variant={activeTab === 'leave' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveTab('leave')}
          >
            <Calendar className="me-2" size={18} />
            Leave Applications ({leaveApplications.length})
          </Button>
        </Col>
      </Row>

      {activeTab === 'time' && (
        <>
          <Row className="mb-3">
            <Col>
              <Button
                variant="success"
                className="me-2"
                onClick={handleBulkApproveTime}
                disabled={selectedTimeEntries.length === 0 || loading}
              >
                <CheckSquare className="me-2" size={18} />
                Approve Selected ({selectedTimeEntries.length})
              </Button>
              <Button
                variant="danger"
                onClick={handleBulkRejectTime}
                disabled={selectedTimeEntries.length === 0 || loading}
              >
                <XSquare className="me-2" size={18} />
                Reject Selected ({selectedTimeEntries.length})
              </Button>
            </Col>
          </Row>

          <Card>
            <Card.Body>
              {timeEntries.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <CheckSquare size={48} className="mb-3" />
                  <p>No pending time entries to approve</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th width="50">
                        <Form.Check
                          type="checkbox"
                          checked={selectedTimeEntries.length === timeEntries.length}
                          onChange={(e) =>
                            setSelectedTimeEntries(e.target.checked ? timeEntries.map(t => t.id) : [])
                          }
                        />
                      </th>
                      <th>Employee</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Hours</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedTimeEntries.includes(entry.id)}
                            onChange={() => handleTimeToggle(entry.id)}
                          />
                        </td>
                        <td>{entry.user?.username || 'Unknown'}</td>
                        <td>{new Date(entry.clock_in_time).toLocaleString()}</td>
                        <td>{entry.clock_out_time ? new Date(entry.clock_out_time).toLocaleString() : '-'}</td>
                        <td><Badge bg="info">{entry.total_hours?.toFixed(2) || 0}h</Badge></td>
                        <td>{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}

      {activeTab === 'leave' && (
        <>
          <Row className="mb-3">
            <Col>
              <Button
                variant="success"
                className="me-2"
                onClick={handleBulkApproveLeave}
                disabled={selectedLeaveApps.length === 0 || loading}
              >
                <CheckSquare className="me-2" size={18} />
                Approve Selected ({selectedLeaveApps.length})
              </Button>
              <Button
                variant="danger"
                onClick={handleBulkRejectLeave}
                disabled={selectedLeaveApps.length === 0 || loading}
              >
                <XSquare className="me-2" size={18} />
                Reject Selected ({selectedLeaveApps.length})
              </Button>
            </Col>
          </Row>

          <Card>
            <Card.Body>
              {leaveApplications.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Calendar size={48} className="mb-3" />
                  <p>No pending leave applications to approve</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th width="50">
                        <Form.Check
                          type="checkbox"
                          checked={selectedLeaveApps.length === leaveApplications.length}
                          onChange={(e) =>
                            setSelectedLeaveApps(e.target.checked ? leaveApplications.map(l => l.id) : [])
                          }
                        />
                      </th>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveApplications.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedLeaveApps.includes(app.id)}
                            onChange={() => handleLeaveToggle(app.id)}
                          />
                        </td>
                        <td>{app.user?.username || 'Unknown'}</td>
                        <td><Badge bg="primary">{app.leave_type?.name || 'Unknown'}</Badge></td>
                        <td>{new Date(app.start_date).toLocaleDateString()}</td>
                        <td>{new Date(app.end_date).toLocaleDateString()}</td>
                        <td>{app.days_requested}</td>
                        <td>{app.reason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}
