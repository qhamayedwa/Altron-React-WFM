import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Table, Alert } from 'react-bootstrap';
import { 
  MessageCircle, Zap, Plus, UserCheck, BarChart2, 
  Activity, CheckCircle, PlusCircle, Inbox, Clock, Eye, Edit 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';

interface PulseSurvey {
  id: number;
  title: string;
  description: string;
  created_by_id: number;
  created_at: string;
  ends_at: string;
  is_active: boolean;
  is_anonymous: boolean;
  target_department?: string;
  response_count?: number;
  completion_rate?: number;
  is_expired?: boolean;
}

interface SurveyResponse {
  id: number;
  survey_id: number;
  user_id: number;
  submitted_at: string;
  survey: {
    title: string;
    is_anonymous: boolean;
  };
  user?: {
    first_name: string;
    last_name: string;
  };
}

export default function TeamCommunication() {
  const { isSuperUser, hasRole } = useAuthStore();
  const [availableSurveys, setAvailableSurveys] = useState<PulseSurvey[]>([]);
  const [mySurveys, setMySurveys] = useState<PulseSurvey[]>([]);
  const [recentResponses, setRecentResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  const isManager = isSuperUser() || hasRole('Manager');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch available surveys to complete
      const availableRes = await api.get('/pulse-survey/available');
      if (availableRes.data) {
        setAvailableSurveys(availableRes.data);
      }

      // Fetch surveys created by current user (managers only)
      if (isManager) {
        const myRes = await api.get('/pulse-survey/my-surveys');
        if (myRes.data) {
          setMySurveys(myRes.data);
        }

        // Fetch recent responses
        const responsesRes = await api.get('/pulse-survey/recent-responses');
        if (responsesRes.data) {
          setRecentResponses(responsesRes.data);
        }
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const launchOneClickSurvey = async () => {
    if (!window.confirm('Launch a quick team communication pulse survey? This will be sent to your department team.')) {
      return;
    }

    try {
      const response = await api.post('/pulse-survey/one-click-survey');
      if (response.data.success) {
        setAlert({ type: 'success', message: response.data.message });
        fetchData();
      }
    } catch (error: any) {
      setAlert({ 
        type: 'danger', 
        message: error.response?.data?.message || 'Failed to launch survey. Please try again.' 
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <MessageCircle size={32} className="me-2" style={{ color: '#28468D' }} />
          <h2 className="mb-0">Team Communication Pulse Surveys</h2>
        </div>
        {isManager && (
          <div className="btn-group">
            <Button
              variant="primary"
              style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
              onClick={launchOneClickSurvey}
            >
              <Zap size={18} className="me-2" />
              One-Click Survey
            </Button>
            <Link 
              to="/pulse-survey/create"
              className="btn btn-outline-primary"
              style={{ borderColor: '#28468D', color: '#28468D' }}
            >
              <Plus size={18} className="me-2" />
              Custom Survey
            </Link>
          </div>
        )}
      </div>

      {/* Alerts */}
      {alert && (
        <Alert 
          variant={alert.type} 
          dismissible 
          onClose={() => setAlert(null)}
          className="mb-4"
        >
          {alert.message}
        </Alert>
      )}

      <div className="row">
        {/* Available Surveys */}
        <div className={isManager ? 'col-md-6' : 'col-12'}>
          <Card>
            <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
              <h5 className="mb-0">
                <UserCheck size={20} className="me-2" style={{ color: '#28468D' }} />
                Surveys to Complete
              </h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" style={{ color: '#28468D' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : availableSurveys.length > 0 ? (
                availableSurveys.map(survey => (
                  <Card 
                    key={survey.id} 
                    className="mb-3 border-start border-primary border-3"
                  >
                    <Card.Body>
                      <h6 className="card-title">{survey.title}</h6>
                      <p className="card-text text-muted">
                        {survey.description || 'Quick team communication assessment'}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <Clock size={14} className="me-1" />
                          Ends {formatDate(survey.ends_at)}
                        </small>
                        <Link 
                          to={`/pulse-survey/respond/${survey.id}`}
                          className="btn btn-sm btn-primary"
                          style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
                        >
                          <Edit size={14} className="me-1" />
                          Take Survey
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <div className="text-center py-4">
                  <CheckCircle size={48} className="text-success mb-2" />
                  <p className="mb-0">No surveys available to complete</p>
                  <small className="text-muted">Check back later for new team surveys</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* My Surveys (Managers Only) */}
        {isManager && (
          <div className="col-md-6">
            <Card>
              <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                <h5 className="mb-0">
                  <BarChart2 size={20} className="me-2" style={{ color: '#28468D' }} />
                  My Surveys
                </h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" style={{ color: '#28468D' }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : mySurveys.length > 0 ? (
                  mySurveys.map(survey => (
                    <Card 
                      key={survey.id} 
                      className="mb-3 border-start border-success border-3"
                    >
                      <Card.Body>
                        <h6 className="card-title">{survey.title}</h6>
                        <div className="row mb-2">
                          <div className="col-6">
                            <small className="text-muted">Responses:</small>
                            <br />
                            <strong>{survey.response_count || 0}</strong>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Completion:</small>
                            <br />
                            <strong>{survey.completion_rate || 0}%</strong>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            {survey.is_expired ? (
                              <Badge bg="secondary">Ended</Badge>
                            ) : survey.is_active ? (
                              <Badge bg="success">Active</Badge>
                            ) : (
                              <Badge bg="warning">Inactive</Badge>
                            )}
                          </div>
                          <Link 
                            to={`/pulse-survey/view/${survey.id}`}
                            className="btn btn-sm btn-outline-primary"
                            style={{ borderColor: '#28468D', color: '#28468D' }}
                          >
                            <Eye size={14} className="me-1" />
                            View Results
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <PlusCircle size={48} className="text-muted mb-2" />
                    <p className="mb-0">No surveys created yet</p>
                    <small className="text-muted">Create your first pulse survey to get team insights</small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        )}
      </div>

      {/* Recent Activity (Managers Only) */}
      {isManager && (
        <div className="row mt-4">
          <div className="col-12">
            <Card>
              <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                <h5 className="mb-0">
                  <Activity size={20} className="me-2" style={{ color: '#28468D' }} />
                  Recent Survey Activity
                </h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border" style={{ color: '#28468D' }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : recentResponses.length > 0 ? (
                  <div className="table-responsive">
                    <Table size="sm" className="mb-0">
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
                              <Link to={`/pulse-survey/view/${response.survey_id}`}>
                                {response.survey.title}
                              </Link>
                            </td>
                            <td>
                              {response.survey.is_anonymous ? (
                                <em>Anonymous</em>
                              ) : (
                                `${response.user?.first_name} ${response.user?.last_name}`
                              )}
                            </td>
                            <td>{formatDateTime(response.submitted_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <Inbox size={32} className="text-muted mb-2" />
                    <p className="mb-0">No recent activity</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
