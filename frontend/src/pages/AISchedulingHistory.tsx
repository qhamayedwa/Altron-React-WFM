import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Form, Button, Badge, ProgressBar } from 'react-bootstrap';
import { ArrowLeft, Cpu, Eye, Download, Edit, Calendar, Zap } from 'lucide-react';

interface Schedule {
  id: number;
  created_at?: string;
  start_time?: string;
  end_time?: string;
  department?: string;
  user_id?: number;
  ai_confidence_score?: number;
  status?: string;
}

const AISchedulingHistory: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await fetch('/api/ai-scheduling/history');
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      setSchedules([]);
    }
  };

  const viewScheduleDetails = (scheduleId: number) => {
    navigate(`/ai-scheduling/results/${scheduleId}`);
  };

  const downloadSchedule = (scheduleId: number) => {
    alert(`Download functionality for schedule #${scheduleId} would be implemented here.`);
  };

  const editSchedule = (scheduleId: number) => {
    navigate(`/ai-scheduling/edit/${scheduleId}`);
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadSchedules();
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setDepartment('');
    loadSchedules();
  };

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const activeSchedules = schedules.filter(s => s.status === 'active').length;
  const avgScore = schedules.length > 0
    ? schedules.filter(s => s.ai_confidence_score).reduce((sum, s) => sum + (s.ai_confidence_score || 0), 0) / schedules.filter(s => s.ai_confidence_score).length
    : 0;

  return (
    
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2">AI Scheduling Optimization History</h1>
            <p className="text-muted">Review past AI-generated schedules and their performance metrics</p>
          </div>
          <div>
            <Link to="/ai-scheduling" className="btn btn-outline-secondary">
              <ArrowLeft className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
              Back to AI Dashboard
            </Link>
          </div>
        </div>

        <Card className="mb-4">
          <Card.Header>
            <h5 className="card-title mb-0">Filter History</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleFilter} className="row g-3">
              <Col md={3}>
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Label>Department</Form.Label>
                <Form.Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                </Form.Select>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button type="submit" variant="primary" className="me-2">Filter</Button>
                <Button type="button" variant="outline-secondary" onClick={clearFilters}>Clear</Button>
              </Col>
            </Form>
          </Card.Body>
        </Card>

        {schedules.length > 0 ? (
          <>
            <Card>
              <Card.Header>
                <h5 className="card-title mb-0">
                  <Cpu className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
                  AI-Generated Schedules
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped>
                    <thead>
                      <tr>
                        <th>Generated Date</th>
                        <th>Schedule Period</th>
                        <th>Department</th>
                        <th>Employees</th>
                        <th>Total Shifts</th>
                        <th>AI Score</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule) => (
                        <tr key={schedule.id}>
                          <td>{schedule.created_at ? new Date(schedule.created_at).toLocaleString() : 'N/A'}</td>
                          <td>
                            {schedule.start_time && schedule.end_time
                              ? `${new Date(schedule.start_time).toLocaleDateString()} - ${new Date(schedule.end_time).toLocaleDateString()}`
                              : 'N/A'}
                          </td>
                          <td>{schedule.department || 'All Departments'}</td>
                          <td>
                            <Badge bg="info">{schedule.user_id || 'Multiple'}</Badge>
                          </td>
                          <td>
                            <Badge bg="primary">1</Badge>
                          </td>
                          <td>
                            {schedule.ai_confidence_score ? (
                              <div style={{ width: '100px' }}>
                                <ProgressBar
                                  now={schedule.ai_confidence_score}
                                  label={`${schedule.ai_confidence_score}%`}
                                  variant="success"
                                />
                              </div>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>
                            <Badge bg={getStatusVariant(schedule.status)}>
                              {schedule.status ? schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1) : 'Pending'}
                            </Badge>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => viewScheduleDetails(schedule.id)}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => downloadSchedule(schedule.id)}
                              >
                                <Download size={16} />
                              </Button>
                              {(schedule.status === 'pending' || schedule.status === 'active') && (
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => editSchedule(schedule.id)}
                                >
                                  <Edit size={16} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            <Row className="mt-4">
              <Col md={4}>
                <Card>
                  <Card.Body className="text-center">
                    <div className="h4 text-primary">{schedules.length}</div>
                    <div className="text-muted">Total AI Schedules</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card>
                  <Card.Body className="text-center">
                    <div className="h4 text-success">{activeSchedules}</div>
                    <div className="text-muted">Active Schedules</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card>
                  <Card.Body className="text-center">
                    <div className="h4 text-info">{avgScore > 0 ? avgScore.toFixed(1) : 'N/A'}%</div>
                    <div className="text-muted">Average AI Score</div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Card>
            <Card.Body className="text-center py-5">
              <Calendar size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No AI-Generated Schedules Found</h5>
              <p className="text-muted mb-4">Start by generating your first AI-optimized schedule.</p>
              <Link to="/ai-scheduling" className="btn btn-primary">
                <Zap className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                Generate AI Schedule
              </Link>
            </Card.Body>
          </Card>
        )}
      </Container>
    
  );
};

export default AISchedulingHistory;
