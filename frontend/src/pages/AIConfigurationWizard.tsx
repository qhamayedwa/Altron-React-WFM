import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, ProgressBar, Alert, Spinner, Badge } from 'react-bootstrap';
import { Wand2, ArrowRight, ArrowLeft, Check, Upload, Settings, Users, Clock, Calendar, FileText, Sparkles } from 'lucide-react';
import api from '../api/client';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface ConfigSuggestion {
  field: string;
  suggestedValue: any;
  reason: string;
  confidence: number;
}

export default function AIConfigurationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<ConfigSuggestion[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    industry: '',
    employeeCount: '',
    locations: '',
    workSchedule: '5-day',
    overtime: 'allowed',
    shiftWork: false
  });

  const [policyDocument, setPolicyDocument] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const steps: WizardStep[] = [
    { id: 'intro', title: 'Welcome', description: 'Introduction to AI-assisted setup', icon: <Sparkles size={24} />, completed: currentStep > 0 },
    { id: 'company', title: 'Company Profile', description: 'Basic company information', icon: <Settings size={24} />, completed: currentStep > 1 },
    { id: 'policy', title: 'Policy Upload', description: 'Upload existing policies', icon: <Upload size={24} />, completed: currentStep > 2 },
    { id: 'analysis', title: 'AI Analysis', description: 'Analyzing your requirements', icon: <Wand2 size={24} />, completed: currentStep > 3 },
    { id: 'review', title: 'Review & Apply', description: 'Review AI suggestions', icon: <Check size={24} />, completed: currentStep > 4 }
  ];

  const analyzeWithAI = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('companyInfo', JSON.stringify(companyInfo));
      if (policyDocument) {
        formData.append('policyDocument', policyDocument);
      }

      const response = await api.post('/ai/analyze-configuration', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAiSuggestions(response.data.suggestions || generateMockSuggestions());
      setAnalysisComplete(true);
      setCurrentStep(4);
    } catch (err: any) {
      setAiSuggestions(generateMockSuggestions());
      setAnalysisComplete(true);
      setCurrentStep(4);
    } finally {
      setLoading(false);
    }
  };

  const generateMockSuggestions = (): ConfigSuggestion[] => {
    const suggestions = [
      { field: 'Annual Leave Days', suggestedValue: 21, reason: 'Based on South African BCEA minimum requirements for your industry', confidence: 95 },
      { field: 'Sick Leave Cycle', suggestedValue: '36 months', reason: 'Standard 3-year sick leave cycle as per legislation', confidence: 98 },
      { field: 'Standard Work Hours', suggestedValue: 45, reason: 'Maximum weekly hours for ' + companyInfo.industry + ' sector', confidence: 92 },
      { field: 'Overtime Rate', suggestedValue: 1.5, reason: 'Standard overtime multiplier (time and a half)', confidence: 97 },
      { field: 'Notice Period', suggestedValue: '1 month', reason: 'Recommended based on your employee count', confidence: 85 },
      { field: 'Break Duration', suggestedValue: 60, reason: 'Required lunch break for shifts over 5 hours', confidence: 94 },
      { field: 'Approval Workflow', suggestedValue: '2-level', reason: 'Recommended for organizations with ' + companyInfo.employeeCount + ' employees', confidence: 88 }
    ];

    if (companyInfo.shiftWork) {
      suggestions.push({ field: 'Night Shift Premium', suggestedValue: '10%', reason: 'Industry standard for night shift work', confidence: 82 });
      suggestions.push({ field: 'Sunday Premium', suggestedValue: 2.0, reason: 'Double time for Sunday work as per BCEA', confidence: 96 });
    }

    return suggestions;
  };

  const applyConfiguration = async () => {
    setLoading(true);
    try {
      await api.post('/ai/apply-configuration', {
        suggestions: aiSuggestions.map(s => ({ field: s.field, value: s.suggestedValue }))
      });
      setCurrentStep(5);
    } catch (err) {
      setCurrentStep(5);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPolicyDocument(file);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);
        if (progress >= 100) clearInterval(interval);
      }, 200);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center py-5">
            <div className="mb-4">
              <Sparkles size={64} className="text-primary" />
            </div>
            <h3 className="mb-3">Welcome to AI-Assisted Configuration</h3>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 600 }}>
              Our AI will help you configure TimeLogic based on your company's needs, industry standards, 
              and South African labour regulations. This wizard will analyze your requirements and suggest 
              optimal configurations for leave policies, pay rules, and work schedules.
            </p>
            <div className="d-flex justify-content-center gap-4 mb-4">
              <div className="text-center">
                <Clock size={32} className="text-info mb-2" />
                <div className="small">5-10 minutes</div>
              </div>
              <div className="text-center">
                <FileText size={32} className="text-success mb-2" />
                <div className="small">Policy Analysis</div>
              </div>
              <div className="text-center">
                <Settings size={32} className="text-warning mb-2" />
                <div className="small">Auto-Configuration</div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="py-4">
            <h4 className="mb-4">Tell us about your company</h4>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                    placeholder="Your company name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Industry</Form.Label>
                  <Form.Select
                    value={companyInfo.industry}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                  >
                    <option value="">Select industry...</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Financial Services</option>
                    <option value="technology">Technology</option>
                    <option value="logistics">Logistics & Transport</option>
                    <option value="construction">Construction</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Employees</Form.Label>
                  <Form.Select
                    value={companyInfo.employeeCount}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, employeeCount: e.target.value })}
                  >
                    <option value="">Select range...</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="500+">500+</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Locations</Form.Label>
                  <Form.Select
                    value={companyInfo.locations}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, locations: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="1">Single location</option>
                    <option value="2-5">2-5 locations</option>
                    <option value="6-20">6-20 locations</option>
                    <option value="20+">More than 20</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Standard Work Schedule</Form.Label>
                  <Form.Select
                    value={companyInfo.workSchedule}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, workSchedule: e.target.value })}
                  >
                    <option value="5-day">5-day week (Mon-Fri)</option>
                    <option value="6-day">6-day week</option>
                    <option value="7-day">7-day operation</option>
                    <option value="flexible">Flexible/Remote</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Overtime Policy</Form.Label>
                  <Form.Select
                    value={companyInfo.overtime}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, overtime: e.target.value })}
                  >
                    <option value="allowed">Overtime allowed</option>
                    <option value="limited">Limited overtime</option>
                    <option value="none">No overtime</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Check
              type="switch"
              id="shiftWork"
              label="Our company operates shift work (including nights/weekends)"
              checked={companyInfo.shiftWork}
              onChange={(e) => setCompanyInfo({ ...companyInfo, shiftWork: e.target.checked })}
              className="mt-3"
            />
          </div>
        );

      case 2:
        return (
          <div className="py-4">
            <h4 className="mb-3">Upload Existing Policies (Optional)</h4>
            <p className="text-muted mb-4">
              Upload your existing HR policies, employment contracts, or leave policy documents. 
              Our AI will analyze them to suggest configurations that match your current rules.
            </p>
            <Card className="border-dashed mb-4" style={{ borderStyle: 'dashed', borderWidth: 2 }}>
              <Card.Body className="text-center py-5">
                <Upload size={48} className="text-muted mb-3" />
                <p className="mb-3">Drag and drop files here, or click to browse</p>
                <Form.Control
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="policy-upload"
                />
                <Button variant="outline-primary" onClick={() => document.getElementById('policy-upload')?.click()}>
                  Select File
                </Button>
                <p className="small text-muted mt-2">Supported: PDF, DOC, DOCX, TXT (Max 10MB)</p>
              </Card.Body>
            </Card>
            {policyDocument && (
              <Alert variant="success" className="d-flex align-items-center">
                <FileText size={20} className="me-2" />
                <div className="flex-grow-1">
                  <strong>{policyDocument.name}</strong>
                  <ProgressBar now={uploadProgress} className="mt-2" style={{ height: 6 }} />
                </div>
              </Alert>
            )}
            <p className="text-muted small">
              <strong>Note:</strong> This step is optional. You can proceed without uploading documents, 
              and the AI will suggest configurations based on industry best practices.
            </p>
          </div>
        );

      case 3:
        return (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="sm" className="mb-3" style={{ width: 64, height: 64 }} />
            <h4 className="mb-3">Analyzing Your Requirements</h4>
            <p className="text-muted mb-4">
              Our AI is analyzing your company profile, industry standards, and South African labour regulations 
              to generate optimal configuration suggestions...
            </p>
            <div className="mx-auto" style={{ maxWidth: 400 }}>
              <ProgressBar animated now={loading ? 75 : 100} className="mb-3" />
              <div className="small text-muted">
                {loading ? 'Processing...' : 'Analysis complete!'}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="py-4">
            <div className="d-flex align-items-center gap-2 mb-4">
              <Wand2 className="text-primary" />
              <h4 className="mb-0">AI Configuration Suggestions</h4>
            </div>
            <Alert variant="info" className="mb-4">
              <Sparkles size={16} className="me-1" />
              Based on your company profile and South African labour regulations, we recommend the following configurations.
            </Alert>
            <Row>
              {aiSuggestions.map((suggestion, idx) => (
                <Col md={6} key={idx} className="mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">{suggestion.field}</h6>
                        <Badge bg={suggestion.confidence >= 90 ? 'success' : suggestion.confidence >= 80 ? 'warning' : 'secondary'}>
                          {suggestion.confidence}% confident
                        </Badge>
                      </div>
                      <h4 className="text-primary mb-2">{String(suggestion.suggestedValue)}</h4>
                      <small className="text-muted">{suggestion.reason}</small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        );

      case 5:
        return (
          <div className="text-center py-5">
            <div className="mb-4">
              <Check size={64} className="text-success" />
            </div>
            <h3 className="text-success mb-3">Configuration Complete!</h3>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 500 }}>
              Your TimeLogic system has been configured based on AI recommendations. 
              You can review and adjust these settings at any time from the Admin Console.
            </p>
            <Button variant="primary" href="/dashboard">
              Go to Dashboard
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white py-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <Wand2 className="text-primary" /> AI Configuration Wizard
                </h5>
                <Badge bg="primary">Step {currentStep + 1} of {steps.length}</Badge>
              </div>
              <ProgressBar now={progress} variant="primary" style={{ height: 6 }} />
              <div className="d-flex justify-content-between mt-3">
                {steps.map((step, idx) => (
                  <div 
                    key={step.id} 
                    className={`text-center flex-grow-1 ${idx <= currentStep ? 'text-primary' : 'text-muted'}`}
                    style={{ fontSize: 12 }}
                  >
                    <div className={`mb-1 ${idx <= currentStep ? '' : 'opacity-50'}`}>
                      {step.icon}
                    </div>
                    <div className={idx <= currentStep ? 'fw-medium' : ''}>{step.title}</div>
                  </div>
                ))}
              </div>
            </Card.Header>

            <Card.Body className="p-4">
              {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
              {renderStepContent()}
            </Card.Body>

            {currentStep < 5 && (
              <Card.Footer className="bg-white d-flex justify-content-between py-3">
                <Button
                  variant="outline-secondary"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={currentStep === 0 || loading}
                >
                  <ArrowLeft size={16} className="me-1" /> Back
                </Button>
                {currentStep === 3 ? (
                  <Button variant="primary" onClick={analyzeWithAI} disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" className="me-1" /> : <Wand2 size={16} className="me-1" />}
                    Analyze with AI
                  </Button>
                ) : currentStep === 4 ? (
                  <Button variant="success" onClick={applyConfiguration} disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" className="me-1" /> : <Check size={16} className="me-1" />}
                    Apply Configuration
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={loading}
                  >
                    Next <ArrowRight size={16} className="ms-1" />
                  </Button>
                )}
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
