import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Send, ArrowLeft } from 'lucide-react';

const CreatePulseSurvey = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_hours: '24',
    target_department: '',
    is_anonymous: true
  });
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations'];

  const predefinedQuestions = [
    { id: 'q1', question: 'How clear is communication within your team?', type: 'scale', scale: 5, labels: ['Very Unclear', 'Clear', 'Very Clear'] },
    { id: 'q2', question: 'How often do you receive timely updates from your manager?', type: 'scale', scale: 5, labels: ['Rarely', 'Sometimes', 'Very Often'] },
    { id: 'q3', question: 'Do you feel comfortable sharing your ideas and feedback?', type: 'scale', scale: 5, labels: ['Not Comfortable', 'Neutral', 'Very Comfortable'] },
    { id: 'q4', question: 'How would you rate team collaboration?', type: 'scale', scale: 5, labels: ['Poor', 'Average', 'Excellent'] },
    { id: 'q5', question: 'What suggestions do you have for improving team communication?', type: 'text', optional: true }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAlert({ type: 'success', message: 'Survey created successfully!' });
      setTimeout(() => navigate('/pulse-survey/dashboard'), 1500);
    } catch (error) {
      setAlert({ type: 'danger', message: 'Failed to create survey. Please try again.' });
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h4><PlusCircle className="me-2" size={20} /> Create Team Communication Pulse Survey</h4>
            </Card.Header>
            <Card.Body>
              {alert && (
                <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
                  {alert.message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Survey Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Team Communication Assessment"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Brief description of the survey purpose"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Survey Duration (Hours)</Form.Label>
                      <Form.Select
                        value={formData.duration_hours}
                        onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                      >
                        <option value="24">24 hours</option>
                        <option value="48">48 hours</option>
                        <option value="72">72 hours</option>
                        <option value="168">1 week</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Target Department</Form.Label>
                      <Form.Select
                        value={formData.target_department}
                        onChange={(e) => setFormData({ ...formData, target_department: e.target.value })}
                      >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="is_anonymous"
                    label="Anonymous Survey (Recommended for honest feedback)"
                    checked={formData.is_anonymous}
                    onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                  />
                </Form.Group>

                <Card className="mb-3">
                  <Card.Header>
                    <h6><i className="bi bi-list"></i> Survey Questions (Predefined)</h6>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-muted mb-3">This survey includes the following predefined questions:</p>
                    {predefinedQuestions.map((question, index) => (
                      <div key={question.id} className="mb-2">
                        <strong>{index + 1}.</strong> {question.question}
                        {question.type === 'scale' && (
                          <small className="text-muted"> (1-{question.scale} scale)</small>
                        )}
                        {question.type === 'text' && (
                          <small className="text-muted"> (Text response{question.optional && ', optional'})</small>
                        )}
                      </div>
                    ))}
                  </Card.Body>
                </Card>

                <div className="d-flex justify-content-between">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/pulse-survey/dashboard')}
                  >
                    <ArrowLeft size={16} className="me-1" /> Back to Dashboard
                  </Button>
                  <Button variant="primary" type="submit">
                    <Send size={16} className="me-1" /> Create Survey
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreatePulseSurvey;
