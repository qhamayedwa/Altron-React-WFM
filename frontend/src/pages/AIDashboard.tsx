import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Brain, Cpu, MessageSquare, Calendar, Users, TrendingUp, Clock, BarChart2, Zap, Check, ArrowRight, Activity, AlertTriangle, AlertCircle } from 'lucide-react';

interface SchedulingInsights {
  efficiency_score?: number;
  patterns?: string[];
  recommendations?: string[];
}

interface AttendanceInsights {
  patterns?: string[];
  risk_factors?: string[];
  recommendations?: string[];
}

const AIDashboard: React.FC = () => {
  const [schedulingInsights, setSchedulingInsights] = useState<SchedulingInsights | null>(null);
  const [attendanceInsights, setAttendanceInsights] = useState<AttendanceInsights | null>(null);
  const [schedulingSummary, setSchedulingSummary] = useState<string>('Loading...');
  const [attendanceSummary, setAttendanceSummary] = useState<string>('Loading...');
  const [payrollSummary, setPayrollSummary] = useState<string>('Loading...');
  const [schedulingError, setSchedulingError] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  useEffect(() => {
    loadSchedulingInsights();
    loadAttendanceInsights();
    loadPayrollSummary();
  }, []);

  const loadSchedulingInsights = async () => {
    try {
      const response = await fetch('/ai/api/analyze-scheduling');
      const data = await response.json();
      
      if (data.success && data.suggestions) {
        setSchedulingInsights(data.suggestions);
        setSchedulingSummary(`Efficiency: ${data.suggestions.efficiency_score || 'N/A'}%`);
      } else {
        setSchedulingError(data.error || 'Unable to analyze scheduling patterns');
      }
    } catch (error) {
      console.error('Scheduling insights error:', error);
      setSchedulingError('Failed to load scheduling insights');
    }
  };

  const loadAttendanceInsights = async () => {
    try {
      const response = await fetch('/ai/api/analyze-attendance');
      const data = await response.json();
      
      if (data.success && data.insights) {
        setAttendanceInsights(data.insights);
        setAttendanceSummary(data.insights.patterns?.[0] || 'No patterns detected');
      } else {
        setAttendanceError(data.error || 'Unable to analyze attendance');
      }
    } catch (error) {
      console.error('Attendance insights error:', error);
      setAttendanceError('Failed to load attendance insights');
    }
  };

  const loadPayrollSummary = async () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    try {
      const response = await fetch('/ai/api/generate-payroll-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pay_period_start: startDate.toISOString().split('T')[0],
          pay_period_end: endDate.toISOString().split('T')[0]
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.insights) {
        setPayrollSummary(data.insights.cost_analysis?.total_hours_worked || 'No data available');
      } else {
        setPayrollSummary('Analysis unavailable');
      }
    } catch (error) {
      console.error('Payroll summary error:', error);
      setPayrollSummary('Failed to load');
    }
  };

  return (
    
      <Container className="mt-4">
        <Row>
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="mb-1">
                  <Brain className="me-2" size={32} style={{ verticalAlign: 'middle' }} />
                  AI Insights Dashboard
                </h2>
                <p className="text-muted mb-0">Intelligent workforce management insights and recommendations</p>
              </div>
              <div className="btn-group">
                <Link to="/ai-scheduling" className="btn btn-primary">
                  <Cpu className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                  Schedule Optimizer
                </Link>
                <Link to="/ai/query" className="btn btn-outline-primary">
                  <MessageSquare className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                  Ask AI
                </Link>
              </div>
            </div>

            <Row className="mb-4">
              <Col md={4}>
                <Card className="bg-primary text-white">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h4 className="card-title">Scheduling Insights</h4>
                        <p className="mb-0">{schedulingSummary}</p>
                      </div>
                      <div className="align-self-center">
                        <Calendar size={48} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="bg-success text-white">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h4 className="card-title">Attendance Patterns</h4>
                        <p className="mb-0">{attendanceSummary}</p>
                      </div>
                      <div className="align-self-center">
                        <Users size={48} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="bg-info text-white">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h4 className="card-title">Payroll Analysis</h4>
                        <p className="mb-0">{payrollSummary}</p>
                      </div>
                      <div className="align-self-center">
                        <div className="fw-bold text-success" style={{ fontSize: '48px' }}>R</div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-4">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <Calendar className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
                      Scheduling Patterns
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {schedulingError ? (
                      <>
                        <Alert variant="warning">
                          <AlertTriangle className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                          {schedulingError}
                        </Alert>
                        <p className="text-muted">Statistical analysis is available using historical data patterns.</p>
                      </>
                    ) : schedulingInsights ? (
                      <>
                        <div className="mb-3">
                          <h6>Efficiency Score</h6>
                          <div className="progress mb-2" style={{ height: '8px' }}>
                            <div className="progress-bar bg-primary" style={{ width: `${schedulingInsights.efficiency_score || 0}%` }}></div>
                          </div>
                          <small className="text-muted">{schedulingInsights.efficiency_score || 0}% efficiency</small>
                        </div>
                        
                        <div className="mb-3">
                          <h6>Key Patterns</h6>
                          <ul className="list-unstyled">
                            {schedulingInsights.patterns?.map((pattern, index) => (
                              <li key={index} className="d-flex align-items-center mb-2">
                                <Check className="text-success me-2" size={18} />
                                {pattern}
                              </li>
                            )) || <li>No patterns detected</li>}
                          </ul>
                        </div>
                        
                        <div>
                          <h6>Recommendations</h6>
                          <ul className="list-unstyled">
                            {schedulingInsights.recommendations?.map((rec, index) => (
                              <li key={index} className="d-flex align-items-center mb-2">
                                <ArrowRight className="text-info me-2" size={18} />
                                {rec}
                              </li>
                            )) || <li>No recommendations available</li>}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-3">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Analyzing scheduling patterns...</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-4">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <Clock className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
                      Attendance Analysis
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {attendanceError ? (
                      <>
                        <Alert variant="warning">
                          <AlertTriangle className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                          {attendanceError}
                        </Alert>
                        <p className="text-muted">Statistical analysis is available using time tracking data.</p>
                      </>
                    ) : attendanceInsights ? (
                      <>
                        <div className="mb-3">
                          <h6>Attendance Patterns</h6>
                          <ul className="list-unstyled">
                            {attendanceInsights.patterns?.map((pattern, index) => (
                              <li key={index} className="d-flex align-items-center mb-2">
                                <Activity className="text-primary me-2" size={18} />
                                {pattern}
                              </li>
                            )) || <li>No patterns detected</li>}
                          </ul>
                        </div>
                        
                        <div className="mb-3">
                          <h6>Risk Factors</h6>
                          <ul className="list-unstyled">
                            {attendanceInsights.risk_factors?.map((risk, index) => (
                              <li key={index} className="d-flex align-items-center mb-2">
                                <AlertCircle className="text-warning me-2" size={18} />
                                {risk}
                              </li>
                            )) || <li>No risk factors detected</li>}
                          </ul>
                        </div>
                        
                        <div>
                          <h6>Recommendations</h6>
                          <ul className="list-unstyled">
                            {attendanceInsights.recommendations?.map((rec, index) => (
                              <li key={index} className="d-flex align-items-center mb-2">
                                <ArrowRight className="text-success me-2" size={18} />
                                {rec}
                              </li>
                            )) || <li>No recommendations available</li>}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-3">
                        <Spinner animation="border" variant="success" />
                        <p className="mt-2 text-muted">Analyzing attendance patterns...</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col xs={12}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <Zap className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
                      AI-Powered Actions
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={3} className="mb-3">
                        <div className="d-grid">
                          <Link to="/ai-scheduling" className="btn btn-outline-primary">
                            <Cpu className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                            Schedule Optimizer
                          </Link>
                        </div>
                      </Col>
                      <Col md={3} className="mb-3">
                        <div className="d-grid">
                          <Button variant="outline-success">
                            <span className="me-2 fw-bold text-success">R</span>
                            Payroll Insights
                          </Button>
                        </div>
                      </Col>
                      <Col md={3} className="mb-3">
                        <div className="d-grid">
                          <Button variant="outline-info">
                            <BarChart2 className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                            Attendance Analysis
                          </Button>
                        </div>
                      </Col>
                      <Col md={3} className="mb-3">
                        <div className="d-grid">
                          <Link to="/ai/query" className="btn btn-outline-warning">
                            <MessageSquare className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                            Ask AI Assistant
                          </Link>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    
  );
};

export default AIDashboard;
