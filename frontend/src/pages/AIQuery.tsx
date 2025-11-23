import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { MessageSquare, MessageCircle, Send, ArrowLeft, HelpCircle, Download, Plus, AlertTriangle } from 'lucide-react';

interface DataPoint {
  description: string;
  value: string;
}

interface Recommendation {
  title: string;
  description: string;
}

interface AIInsights {
  summary?: string;
  data_points?: DataPoint[];
  recommendations?: Recommendation[];
}

interface AIResponse {
  success: boolean;
  error?: string;
  insights?: AIInsights;
}

const AIQuery: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  const insertSample = (type: string) => {
    const samples: { [key: string]: string } = {
      attendance: "Show me attendance patterns for the last 30 days and identify any concerning trends",
      schedules: "Analyze our current scheduling efficiency and suggest improvements",
      payroll: "Calculate overtime costs and identify departments with highest payroll expenses"
    };
    setQuery(samples[type] || '');
  };

  const setQueryText = (queryText: string) => {
    setQuery(queryText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }
    
    setLoading(true);
    setShowResponse(false);
    
    try {
      const res = await fetch('/ai/api/natural-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      
      const data = await res.json();
      setResponse(data);
      setShowResponse(true);
    } catch (error) {
      console.error('Natural query error:', error);
      setResponse({
        success: false,
        error: 'Failed to process your question. Please try again.'
      });
      setShowResponse(true);
    } finally {
      setLoading(false);
    }
  };

  const askFollowUp = () => {
    setQuery('');
    setShowResponse(false);
  };

  return (
    
      <Container className="mt-4">
        <Row>
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="mb-1">
                  <MessageSquare className="me-2" size={32} style={{ verticalAlign: 'middle' }} />
                  AI Assistant
                </h2>
                <p className="text-muted mb-0">Ask questions about your workforce data in natural language</p>
              </div>
              <Link to="/ai/dashboard" className="btn btn-outline-secondary">
                <ArrowLeft className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                Back to AI Dashboard
              </Link>
            </div>

            <Card className="mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <MessageCircle className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
                  Ask Your Question
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Your Question</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g., Show me attendance patterns for the last month, or Which employees work the most overtime?"
                      required
                    />
                    <Form.Text className="text-muted">
                      Ask questions about schedules, attendance, payroll, or employee patterns
                    </Form.Text>
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="btn-group" role="group">
                      <Button variant="outline-secondary" size="sm" onClick={() => insertSample('attendance')}>
                        Sample: Attendance
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => insertSample('schedules')}>
                        Sample: Schedules
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => insertSample('payroll')}>
                        Sample: Payroll
                      </Button>
                    </div>
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                          Ask AI
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {loading && (
              <Card>
                <Card.Body className="text-center py-5">
                  <Spinner animation="border" variant="primary" className="mb-3" />
                  <h5>Processing Your Question...</h5>
                  <p className="text-muted">AI is analyzing your workforce data</p>
                </Card.Body>
              </Card>
            )}

            {showResponse && response && (
              <Card>
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">
                    <MessageSquare className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
                    AI Response
                  </h5>
                </Card.Header>
                <Card.Body>
                  {!response.success ? (
                    <>
                      <Alert variant="warning">
                        <AlertTriangle className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                        {response.error || 'Unable to process your question'}
                      </Alert>
                      <div className="mt-3">
                        <h6>Statistical Analysis Available</h6>
                        <p className="text-muted">
                          While AI natural language processing requires additional configuration, 
                          our system can provide statistical insights through the dashboard and specific analysis tools.
                        </p>
                        <div className="d-grid gap-2 d-md-flex">
                          <Link to="/ai/dashboard" className="btn btn-primary">
                            <ArrowLeft className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                            View Analytics Dashboard
                          </Link>
                          <Link to="/ai-scheduling" className="btn btn-outline-primary">
                            Schedule Optimizer
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h6>Analysis Results</h6>
                        <Alert variant="info">
                          <p className="mb-0">{response.insights?.summary || 'Analysis completed successfully'}</p>
                        </Alert>
                      </div>
                      
                      {response.insights?.data_points && (
                        <div className="mb-4">
                          <h6>Key Data Points</h6>
                          <ul className="list-group list-group-flush">
                            {response.insights.data_points.map((point, index) => (
                              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                {point.description}
                                <span className="badge bg-primary rounded-pill">{point.value}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {response.insights?.recommendations && (
                        <div className="mb-4">
                          <h6>Recommendations</h6>
                          <Row>
                            {response.insights.recommendations.map((rec, index) => (
                              <Col md={6} key={index} className="mb-3">
                                <Card className="border-start border-primary border-4">
                                  <Card.Body>
                                    <h6 className="text-primary">{rec.title}</h6>
                                    <p className="mb-0">{rec.description}</p>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-end">
                        <Button variant="outline-primary" className="me-2">
                          <Download className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                          Export Results
                        </Button>
                        <Button variant="primary" onClick={askFollowUp}>
                          <Plus className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                          Ask Follow-up
                        </Button>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            )}

            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <HelpCircle className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
                  Example Questions
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <h6 className="text-primary">Attendance</h6>
                    <ul className="list-unstyled">
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setQueryText('Show me attendance patterns for this month'); }} className="text-decoration-none">
                          • Monthly attendance patterns
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setQueryText('Which employees are frequently late?'); }} className="text-decoration-none">
                          • Late arrival analysis
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setQueryText('What are the busiest days of the week?'); }} className="text-decoration-none">
                          • Peak attendance days
                        </a>
                      </li>
                    </ul>
                  </Col>
                  <Col md={4}>
                    <h6 className="text-success">Scheduling</h6>
                    <ul className="list-unstyled">
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setQueryText('Analyze our current scheduling efficiency'); }} className="text-decoration-none">
                          • Scheduling efficiency
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setQueryText('Which departments need more coverage?'); }} className="text-decoration-none">
                          • Coverage analysis
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setQueryText('Show schedule conflicts this week'); }} className="text-decoration-none">
                          • Schedule conflicts
                        </a>
                      </li>
                    </ul>
                  </Col>
                  <Col md={4}>
                    <h6 className="text-info">Payroll</h6>
                    <ul className="list-unstyled">
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setQueryText('Calculate overtime costs for last month'); }} className="text-decoration-none">
                          • Overtime analysis
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setQueryText('Show payroll trends by department'); }} className="text-decoration-none">
                          • Department payroll
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setQueryText('Identify unusual payroll patterns'); }} className="text-decoration-none">
                          • Payroll anomalies
                        </a>
                      </li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    
  );
};

export default AIQuery;
