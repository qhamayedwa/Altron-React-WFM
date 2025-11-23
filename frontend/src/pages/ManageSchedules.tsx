import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Badge, Form, Row, Col } from 'react-bootstrap';
import { Calendar, Plus, Edit, Trash2, Filter } from 'lucide-react';
import api from '../api/client';

interface Schedule {
  id: number;
  userId: number;
  employeeName: string;
  employeeNumber?: string;
  department?: string;
  date: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  status: string;
  color?: string;
}

export default function ManageSchedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    departmentId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadSchedules();
  }, [filters]);

  const loadSchedules = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/scheduling/team-schedule?${params.toString()}`);
      setSchedules(response.data.schedules || []);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      await api.delete(`/scheduling/${id}`);
      loadSchedules();
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      scheduled: 'primary',
      completed: 'success',
      cancelled: 'danger',
      in_progress: 'info'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Calendar size={28} className="me-2" />
          Manage Schedules
        </h2>
        <Button variant="primary" onClick={() => navigate('/scheduling/create')}>
          <Plus size={18} className="me-2" />
          Create Schedule
        </Button>
      </div>

      <Card className="mb-3">
        <Card.Header>
          <h6 className="mb-0">
            <Filter size={18} className="me-2" />
            Filters
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                onClick={() => setFilters({ departmentId: '', startDate: '', endDate: '' })}
                className="mb-3"
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

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
                  <th>Department</th>
                  <th>Date</th>
                  <th>Shift Type</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : schedules.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      <Calendar size={48} className="text-muted mb-3" />
                      <h5>No Schedules Found</h5>
                      <p className="text-muted">Click "Create Schedule" to start scheduling shifts.</p>
                    </td>
                  </tr>
                ) : (
                  schedules.map(schedule => (
                    <tr key={schedule.id}>
                      <td>
                        <div className="fw-medium">{schedule.employeeName}</div>
                        {schedule.employeeNumber && (
                          <small className="text-muted">#{schedule.employeeNumber}</small>
                        )}
                      </td>
                      <td>{schedule.department || '-'}</td>
                      <td>{formatDate(schedule.date)}</td>
                      <td>
                        {schedule.color && (
                          <span
                            className="badge me-2"
                            style={{ backgroundColor: schedule.color }}
                          >
                            &nbsp;
                          </span>
                        )}
                        {schedule.shiftName}
                      </td>
                      <td>{formatTime(schedule.startTime)}</td>
                      <td>{formatTime(schedule.endTime)}</td>
                      <td>{getStatusBadge(schedule.status)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/scheduling/edit/${schedule.id}`)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
