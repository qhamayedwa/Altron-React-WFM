import { Container, Row, Col, Card, Badge, ProgressBar, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart2, ArrowLeft, Info, Inbox, MessageSquare } from 'lucide-react';

const ViewPulseSurvey = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const survey = {
    id: 1,
    title: 'Q1 Team Communication Assessment',
    description: 'Quick team communication assessment',
    is_active: true,
    is_expired: false,
    target_department: null,
    is_anonymous: true,
    created_at: new Date('2025-11-20T09:00:00'),
    ends_at: new Date('2025-11-25T17:00:00'),
    created_by: { first_name: 'John', last_name: 'Manager' }
  };

  const totalResponses = 24;
  const completionRate = 68;

  const results = {
    q1: {
      question: 'How clear is communication within your team?',
      type: 'scale',
      labels: ['Very Unclear', 'Unclear', 'Neutral', 'Clear', 'Very Clear'],
      scores: [2, 3, 5, 10, 4],
      total_responses: 24,
      average: 3.5
    },
    q2: {
      question: 'How often do you receive timely updates from your manager?',
      type: 'scale',
      labels: ['Rarely', 'Sometimes', 'Occasionally', 'Often', 'Very Often'],
      scores: [1, 4, 6, 9, 4],
      total_responses: 24,
      average: 3.5
    },
    q3: {
      question: 'Do you feel comfortable sharing your ideas and feedback?',
      type: 'scale',
      labels: ['Not Comfortable', 'Somewhat Uncomfortable', 'Neutral', 'Comfortable', 'Very Comfortable'],
      scores: [3, 2, 4, 11, 4],
      total_responses: 24,
      average: 3.5
    },
    q4: {
      question: 'How would you rate team collaboration?',
      type: 'scale',
      labels: ['Poor', 'Fair', 'Average', 'Good', 'Excellent'],
      scores: [1, 3, 6, 10, 4],
      total_responses: 24,
      average: 3.5
    },
    q5: {
      question: 'What suggestions do you have for improving team communication?',
      type: 'text',
      responses: [
        'More regular team meetings would be helpful',
        'Better documentation of decisions made',
        'Clearer communication channels for urgent matters',
        'Regular feedback sessions'
      ]
    }
  };

  const getStatusBadge = () => {
    if (survey.is_expired) return <Badge bg="secondary" className="fs-6">Ended</Badge>;
    if (survey.is_active) return <Badge bg="success" className="fs-6">Active</Badge>;
    return <Badge bg="secondary" className="fs-6">Inactive</Badge>;
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2><BarChart2 className="me-2" /> {survey.title}</h2>
          {survey.description && <p className="text-muted">{survey.description}</p>}
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{totalResponses}</h3>
              <p className="mb-0">Total Responses</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{completionRate}%</h3>
              <p className="mb-0">Completion Rate</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{survey.target_department || 'All'}</h3>
              <p className="mb-0">Target Audience</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{survey.is_anonymous ? 'Anonymous' : 'Named'}</h3>
              <p className="mb-0">Response Type</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {Object.entries(results).map(([questionId, result]) => (
          <Col md={6} className="mb-4" key={questionId}>
            <Card className="h-100">
              <Card.Header>
                <h6>{result.question}</h6>
              </Card.Header>
              <Card.Body>
                {result.type === 'scale' && result.total_responses > 0 && (
                  <>
                    <div className="text-center mb-3">
                      <h4 className="text-primary">{result.average}/{result.labels.length}</h4>
                      <small className="text-muted">Average Score</small>
                    </div>

                    {result.labels.map((label, i) => (
                      <div key={i} className="mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{i + 1} - {label}</span>
                          <Badge bg="secondary">{result.scores[i]}</Badge>
                        </div>
                        <ProgressBar
                          now={(result.scores[i] / result.total_responses) * 100}
                          style={{ height: '8px' }}
                        />
                      </div>
                    ))}
                  </>
                )}

                {result.type === 'scale' && result.total_responses === 0 && (
                  <div className="text-center text-muted py-3">
                    <Inbox size={32} className="mb-2" />
                    <p className="mt-2 mb-0">No responses yet</p>
                  </div>
                )}

                {result.type === 'text' && result.responses && result.responses.length > 0 && (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {result.responses.map((response, index) => (
                      <Card key={index} className="mb-2">
                        <Card.Body className="py-2">
                          <small>"{response}"</small>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}

                {result.type === 'text' && (!result.responses || result.responses.length === 0) && (
                  <div className="text-center text-muted py-3">
                    <MessageSquare size={32} className="mb-2" />
                    <p className="mt-2 mb-0">No text responses</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h6><Info className="me-2" size={16} /> Survey Details</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Created:</strong> {survey.created_at.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {survey.created_at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                  <p><strong>Ends:</strong> {survey.ends_at.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {survey.ends_at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Created by:</strong> {survey.created_by.first_name} {survey.created_by.last_name}</p>
                  <p><strong>Survey ID:</strong> {survey.id}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="mt-4">
        <Button variant="outline-primary" onClick={() => navigate('/pulse-survey/dashboard')}>
          <ArrowLeft size={16} className="me-1" /> Back to Dashboard
        </Button>
      </div>
    </Container>
  );
};

export default ViewPulseSurvey;
