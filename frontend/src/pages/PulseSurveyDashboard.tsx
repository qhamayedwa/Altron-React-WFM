import { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Zap, Plus, UserCheck, BarChart2, Clock, Edit, Eye, CheckCircle, PlusCircle, Activity, Inbox } from 'lucide-react';

const PulseSurveyDashboard = () => {
  const navigate = useNavigate();
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  const availableSurveys = [
    {
      id: 1,
      title: 'Q1 Team Communication Assessment',
      description: 'Quick team communication assessment',
      ends_at: new Date('2025-11-25T17:00:00')
    },
    {
      id: 2,
      title: 'Department Feedback Survey',
      description: 'Monthly department feedback collection',
      ends_at: new Date('2025-11-26T12:00:00')
    }
  ];

  const mySurveys = [
    {
      id: 1,
      title: 'Q1 Team Communication Assessment',
      response_count: 24,
      completion_rate: 68,
      is_active: true,
      is_expired: false
    },
    {
      id: 2,
      title: 'Weekly Team Pulse',
      response_count: 15,
      completion_rate: 85,
      is_active: false,
      is_expired: true
    }
  ];

  const recentResponses = [
    { id: 1, survey_id: 1, survey_title: 'Q1 Team Communication Assessment', respondent: 'Anonymous', submitted_at: '11/23/2025 02:30 PM' },
    { id: 2, survey_id: 1, survey_title: 'Q1 Team Communication Assessment', respondent: 'Anonymous', submitted_at: '11/23/2025 01:15 PM' },
    { id: 3, survey_id: 2, survey_title: 'Weekly Team Pulse', respondent: 'John Smith', submitted_at: '11/22/2025 04:45 PM' }
  ];

  const launchOneClickSurvey = () => {
    if (window.confirm('Launch a quick team communication pulse survey? This will be sent to your department team.')) {
      setAlert({ type: 'success', message: 'Survey launched successfully!' });
      setTimeout(() => {
        navigate('/pulse-survey/view/1');
      }, 1500);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) + ' at ' + 
           date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><MessageCircle className="me-2" /> Team Communication Pulse Surveys</h2>
        <div className="btn-group">
          <Button variant="primary" onClick={launchOneClickSurvey}>
            <Zap size={16} className="me-1" /> One-Click Survey
          </Button>
          <Button variant="outline-primary" onClick={() => navigate('/pulse-survey/create')}>
            <Plus size={16} className="me-1" /> Custom Survey
          </Button>
        </div>
      </div>

      {alert && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5><UserCheck className="me-2" size={20} /> Surveys to Complete</h5>
            </Card.Header>
            <Card.Body>
              {availableSurveys.length > 0 ? (
                availableSurveys.map(survey => (
                  <Card key={survey.id} className="mb-3 border-start border-primary border-3">
                    <Card.Body>
                      <h6 className="card-title">{survey.title}</h6>
                      <p className="card-text text-muted">{survey.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <Clock size={14} className="me-1" />
                          Ends {formatDate(survey.ends_at)}
                        </small>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate(`/pulse-survey/respond/${survey.id}`)}
                        >
                          <Edit size={14} className="me-1" /> Take Survey
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <div className="text-center py-4">
                  <CheckCircle size={48} className="text-success mb-2" />
                  <p className="mt-2 mb-0">No surveys available to complete</p>
                  <small className="text-muted">Check back later for new team surveys</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5><BarChart2 className="me-2" size={20} /> My Surveys</h5>
            </Card.Header>
            <Card.Body>
              {mySurveys.length > 0 ? (
                mySurveys.map(survey => (
                  <Card key={survey.id} className="mb-3 border-start border-success border-3">
                    <Card.Body>
                      <h6 className="card-title">{survey.title}</h6>
                      <Row>
                        <Col xs={6}>
                          <small className="text-muted">Responses:</small>
                          <strong> {survey.response_count}</strong>
                        </Col>
                        <Col xs={6}>
                          <small className="text-muted">Completion:</small>
                          <strong> {survey.completion_rate}%</strong>
                        </Col>
                      </Row>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <small className="text-muted">
                          <Badge bg={survey.is_expired ? 'secondary' : survey.is_active ? 'success' : 'warning'}>
                            {survey.is_expired ? 'Ended' : survey.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </small>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => navigate(`/pulse-survey/view/${survey.id}`)}
                        >
                          <Eye size={14} className="me-1" /> View Results
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <div className="text-center py-4">
                  <PlusCircle size={48} className="text-muted mb-2" />
                  <p className="mt-2 mb-0">No surveys created yet</p>
                  <small className="text-muted">Create your first pulse survey to get team insights</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5><Activity className="me-2" size={20} /> Recent Survey Activity</h5>
            </Card.Header>
            <Card.Body>
              {recentResponses.length > 0 ? (
                <div className="table-responsive">
                  <Table size="sm">
                    <thead>
                      <tr>
                        <th>Survey</th>
                        <th>Respondent</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentResponses.map(response => (
                        <tr key={response.id}>
                          <td>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/pulse-survey/view/${response.survey_id}`);
                              }}
                            >
                              {response.survey_title}
                            </a>
                          </td>
                          <td>
                            {response.respondent === 'Anonymous' ? <em>Anonymous</em> : response.respondent}
                          </td>
                          <td>{response.submitted_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-3">
                  <Inbox size={32} className="text-muted mb-2" />
                  <p className="mt-2 mb-0">No recent activity</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PulseSurveyDashboard;
