import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Cpu, Users, Activity, TrendingUp, Shield, Brain, Zap, BarChart2, Clock, Settings, CheckCircle } from 'lucide-react';
import api from '../api/client';

interface SchedulingInsights {
  total_employees: number;
  peak_hours: string[];
  schedule_adherence: number;
  coverage_score: number;
  departments_analyzed: number;
  recommendations: string[];
}

interface AttendanceInsights {
  attendance_rate: number;
  avg_hours_per_day: number;
  punctuality_rate: number;
  employees_analyzed: number;
}

export default function AIScheduling() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schedulingInsights, setSchedulingInsights] = useState<SchedulingInsights | null>(null);
  const [attendanceInsights, setAttendanceInsights] = useState<AttendanceInsights | null>(null);
  const [optimizationScore, setOptimizationScore] = useState<number | null>(null);
  const [coverageEfficiency, setCoverageEfficiency] = useState<number | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API calls
      setSchedulingInsights({
        total_employees: 42,
        peak_hours: ['09:00-11:00', '14:00-16:00'],
        schedule_adherence: 0.87,
        coverage_score: 0.92,
        departments_analyzed: 5,
        recommendations: [
          'Consider adding 2 more employees during peak hours (09:00-11:00)',
          'Schedule adherence can be improved by 8% with better shift distribution',
          'Department "Sales" shows optimal coverage with current schedule'
        ]
      });

      setAttendanceInsights({
        attendance_rate: 0.94,
        avg_hours_per_day: 8.2,
        punctuality_rate: 0.89,
        employees_analyzed: 42
      });

      setOptimizationScore(85);
      setCoverageEfficiency(92);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading AI Scheduling Dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">AI Scheduling Dashboard</h1>
          <p className="text-muted">Intelligent workforce scheduling and optimization</p>
        </div>
        <div>
          <Button variant="primary" onClick={() => navigate('/ai-scheduling/generate')}>
            <Zap size={18} className="me-2" />
            Generate AI Schedule
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col xl={3} md={6} className="mb-4">
          <Card className="border-start border-primary border-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-muted small">Active Employees</div>
                  <div className="h4 mb-0">{schedulingInsights?.total_employees || 0}</div>
                </div>
                <div style={{ color: '#28468D' }}>
                  <Users size={48} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-start border-success border-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-muted small">Average Attendance Rate</div>
                  <div className="h4 mb-0">
                    {attendanceInsights?.attendance_rate 
                      ? `${(attendanceInsights.attendance_rate * 100).toFixed(1)}%` 
                      : '0%'}
                  </div>
                </div>
                <div className="text-success">
                  <Activity size={48} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-start border-warning border-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-muted small">Optimization Score</div>
                  <div className="h4 mb-0">{optimizationScore !== null ? `${optimizationScore}%` : 'N/A'}</div>
                </div>
                <div className="text-warning">
                  <TrendingUp size={48} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-start border-info border-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-muted small">Coverage Efficiency</div>
                  <div className="h4 mb-0">{coverageEfficiency !== null ? `${coverageEfficiency}%` : 'N/A'}</div>
                </div>
                <div className="text-info">
                  <Shield size={48} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* AI Insights Section */}
      {(schedulingInsights || attendanceInsights) && (
        <Row className="mb-4">
          <Col xs={12}>
            <Card>
              <Card.Header>
                <h5 className="mb-0" style={{ color: '#28468D' }}>
                  <Brain size={20} className="me-2" />
                  AI Workforce Insights
                </h5>
                <small className="text-muted">Statistical analysis of workforce patterns</small>
              </Card.Header>
              <Card.Body>
                <Row>
                  {schedulingInsights && (
                    <Col md={6}>
                      <h6 style={{ color: '#28468D' }}>Scheduling Analysis</h6>
                      <ul className="list-unstyled">
                        <li>
                          <strong>Peak Hours:</strong>{' '}
                          {schedulingInsights.peak_hours?.join(', ') || 'N/A'}
                        </li>
                        <li>
                          <strong>Schedule Adherence:</strong>{' '}
                          {schedulingInsights.schedule_adherence
                            ? `${(schedulingInsights.schedule_adherence * 100).toFixed(1)}%`
                            : 'N/A'}
                        </li>
                        <li>
                          <strong>Coverage Score:</strong>{' '}
                          {schedulingInsights.coverage_score
                            ? `${(schedulingInsights.coverage_score * 100).toFixed(1)}%`
                            : 'N/A'}
                        </li>
                        <li>
                          <strong>Active Departments:</strong>{' '}
                          {schedulingInsights.departments_analyzed || 0}
                        </li>
                      </ul>
                    </Col>
                  )}

                  {attendanceInsights && (
                    <Col md={6}>
                      <h6 className="text-success">Attendance Patterns</h6>
                      <ul className="list-unstyled">
                        <li>
                          <strong>Attendance Rate:</strong>{' '}
                          {attendanceInsights.attendance_rate
                            ? `${(attendanceInsights.attendance_rate * 100).toFixed(1)}%`
                            : 'N/A'}
                        </li>
                        <li>
                          <strong>Average Hours/Day:</strong>{' '}
                          {attendanceInsights.avg_hours_per_day
                            ? `${attendanceInsights.avg_hours_per_day.toFixed(1)} hrs`
                            : 'N/A'}
                        </li>
                        <li>
                          <strong>Punctuality Rate:</strong>{' '}
                          {attendanceInsights.punctuality_rate
                            ? `${(attendanceInsights.punctuality_rate * 100).toFixed(1)}%`
                            : 'N/A'}
                        </li>
                        <li>
                          <strong>Employees Analyzed:</strong>{' '}
                          {attendanceInsights.employees_analyzed || 0}
                        </li>
                      </ul>
                    </Col>
                  )}
                </Row>

                {schedulingInsights?.recommendations && schedulingInsights.recommendations.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-info">AI Recommendations</h6>
                    <Alert variant="info">
                      {schedulingInsights.recommendations.slice(0, 3).map((rec, idx) => (
                        <div key={idx}>
                          <CheckCircle size={16} className="me-1" />
                          {rec}
                        </div>
                      ))}
                    </Alert>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* AI Scheduling Tools */}
      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0" style={{ color: '#28468D' }}>AI Scheduling Tools</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Card className="bg-light h-100">
                    <Card.Body className="text-center">
                      <Zap size={48} style={{ color: '#28468D' }} className="mb-2" />
                      <h6>Generate Optimized Schedule</h6>
                      <p className="text-muted small">
                        Create AI-powered schedules based on availability and preferences
                      </p>
                      <Button 
                        size="sm" 
                        variant="primary"
                        onClick={() => navigate('/ai-scheduling/generate')}
                      >
                        Generate
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} className="mb-3">
                  <Card className="bg-light h-100">
                    <Card.Body className="text-center">
                      <BarChart2 size={48} className="text-success mb-2" />
                      <h6>Employee Analysis</h6>
                      <p className="text-muted small">
                        Analyze individual employee availability patterns
                      </p>
                      <Button 
                        size="sm" 
                        variant="success"
                        onClick={() => alert('Employee selector coming soon')}
                      >
                        Analyze
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} className="mb-3">
                  <Card className="bg-light h-100">
                    <Card.Body className="text-center">
                      <Clock size={48} className="text-warning mb-2" />
                      <h6>Optimization History</h6>
                      <p className="text-muted small">
                        View past AI scheduling decisions and performance
                      </p>
                      <Button 
                        size="sm" 
                        variant="warning"
                        onClick={() => navigate('/ai-scheduling/history')}
                      >
                        View History
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} className="mb-3">
                  <Card className="bg-light h-100">
                    <Card.Body className="text-center">
                      <Settings size={48} className="text-info mb-2" />
                      <h6>AI Configuration</h6>
                      <p className="text-muted small">
                        Configure AI scheduling parameters and preferences
                      </p>
                      <Button size="sm" variant="info" disabled>
                        Coming Soon
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0" style={{ color: '#28468D' }}>Recent AI Activity</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                <Cpu size={48} className="text-muted mb-2" />
                <p className="text-muted">AI scheduling module ready</p>
                <p className="text-muted small">Generate your first AI schedule to see activity here</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
