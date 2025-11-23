import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageCircle, Send, ArrowLeft, Shield } from 'lucide-react';

const RespondPulseSurvey = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  const survey = {
    id: 1,
    title: 'Q1 Team Communication Assessment',
    description: 'Quick team communication assessment',
    is_anonymous: true
  };

  const questions = [
    {
      id: 'q1',
      question: 'How clear is communication within your team?',
      type: 'scale',
      scale: 5,
      labels: ['Very Unclear', 'Unclear', 'Neutral', 'Clear', 'Very Clear'],
      optional: false
    },
    {
      id: 'q2',
      question: 'How often do you receive timely updates from your manager?',
      type: 'scale',
      scale: 5,
      labels: ['Rarely', 'Sometimes', 'Occasionally', 'Often', 'Very Often'],
      optional: false
    },
    {
      id: 'q3',
      question: 'Do you feel comfortable sharing your ideas and feedback?',
      type: 'scale',
      scale: 5,
      labels: ['Not Comfortable', 'Somewhat Uncomfortable', 'Neutral', 'Comfortable', 'Very Comfortable'],
      optional: false
    },
    {
      id: 'q4',
      question: 'How would you rate team collaboration?',
      type: 'scale',
      scale: 5,
      labels: ['Poor', 'Fair', 'Average', 'Good', 'Excellent'],
      optional: false
    },
    {
      id: 'q5',
      question: 'What suggestions do you have for improving team communication?',
      type: 'text',
      optional: true
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAlert({ type: 'success', message: 'Survey submitted successfully! Thank you for your feedback.' });
      setTimeout(() => navigate('/pulse-survey/dashboard'), 1500);
    } catch (error) {
      setAlert({ type: 'danger', message: 'Failed to submit survey. Please try again.' });
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h4><MessageCircle className="me-2" size={20} /> {survey.title}</h4>
              {survey.description && (
                <p className="mb-0 text-muted">{survey.description}</p>
              )}
            </Card.Header>
            <Card.Body>
              {alert && (
                <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
                  {alert.message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {questions.map((question, index) => (
                  <Form.Group key={question.id} className="mb-4">
                    <Form.Label className="fw-bold">
                      {question.question}
                      {question.optional && <span className="text-muted"> (Optional)</span>}
                    </Form.Label>

                    {question.type === 'scale' && (
                      <div className="mt-2">
                        <div className="d-flex gap-3">
                          {Array.from({ length: question.scale }, (_, i) => i + 1).map(value => (
                            <Form.Check
                              key={value}
                              type="radio"
                              inline
                              id={`${question.id}_${value}`}
                              name={question.id}
                              label={value.toString()}
                              value={value}
                              onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
                              required={!question.optional}
                            />
                          ))}
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                          <small className="text-muted">{question.labels[0]}</small>
                          <small className="text-muted">{question.labels[question.labels.length - 1]}</small>
                        </div>
                      </div>
                    )}

                    {question.type === 'text' && (
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Your feedback (optional)..."
                        value={responses[question.id] || ''}
                        onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
                        required={!question.optional}
                      />
                    )}
                  </Form.Group>
                ))}

                <div className="d-flex justify-content-between">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/pulse-survey/dashboard')}
                  >
                    <ArrowLeft size={16} className="me-1" /> Back
                  </Button>
                  <Button variant="primary" type="submit">
                    <Send size={16} className="me-1" /> Submit Survey
                  </Button>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="text-muted">
              <small>
                <Shield size={14} className="me-1" />
                {survey.is_anonymous
                  ? 'This survey is anonymous. Your responses will not be linked to your identity.'
                  : 'Your responses will be associated with your profile.'}
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RespondPulseSurvey;
