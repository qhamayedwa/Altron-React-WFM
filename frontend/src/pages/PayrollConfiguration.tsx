import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft, Save, Info, DollarSign, MinusCircle, Clock, FastForward, Calculator, HelpCircle, Check } from 'lucide-react';
import api from '../api/client';

interface PayrollConfig {
  baseRate: number;
  deductionRate: number;
  overtimeMultiplier: number;
  doubleTimeMultiplier: number;
}

export default function PayrollConfiguration() {
  const navigate = useNavigate();
  
  const [config, setConfig] = useState<PayrollConfig>({
    baseRate: 150,
    deductionRate: 0.25,
    overtimeMultiplier: 1.5,
    doubleTimeMultiplier: 2.0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await api.get('/payroll/configuration');
      if (response.data.config) {
        setConfig(response.data.config);
      }
    } catch (err) {
      console.error('Error loading configuration:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/payroll/configuration', config);
      setSuccess('Configuration saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Payroll Configuration</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0" style={{ background: 'none', padding: 0 }}>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>Dashboard</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/payroll'); }}>Payroll</a>
                </li>
                <li className="breadcrumb-item active">Configuration</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8 col-md-10 mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h5 className="card-title mb-0">
                <Settings size={20} className="me-2" />
                Payroll System Configuration
              </h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-4">
                <Info size={18} className="me-2" />
                <strong>Important:</strong> These settings apply to all payroll calculations. Changes take effect immediately for new calculations.
              </Alert>

              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <DollarSign size={16} className="me-1" />
                        Base Hourly Rate (ZAR)
                      </Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">R</span>
                        <Form.Control
                          type="number"
                          name="baseRate"
                          value={config.baseRate}
                          onChange={handleInputChange}
                          min="0"
                          max="1000"
                          step="0.01"
                          required
                        />
                        <span className="input-group-text">/hour</span>
                      </div>
                      <Form.Text className="text-muted">Standard hourly rate for regular time (R0 - R1000)</Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <MinusCircle size={16} className="me-1" />
                        Deduction Rate
                      </Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          name="deductionRate"
                          value={config.deductionRate}
                          onChange={handleInputChange}
                          min="0"
                          max="0.5"
                          step="0.01"
                          required
                        />
                        <span className="input-group-text">%</span>
                      </div>
                      <Form.Text className="text-muted">Percentage deducted from gross pay (0% - 50%)</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <Clock size={16} className="me-1" />
                        Overtime Multiplier
                      </Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          name="overtimeMultiplier"
                          value={config.overtimeMultiplier}
                          onChange={handleInputChange}
                          min="1.0"
                          max="5.0"
                          step="0.1"
                          required
                        />
                        <span className="input-group-text">x</span>
                      </div>
                      <Form.Text className="text-muted">Multiplier for overtime hours (1.0x - 5.0x)</Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FastForward size={16} className="me-1" />
                        Double Time Multiplier
                      </Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          name="doubleTimeMultiplier"
                          value={config.doubleTimeMultiplier}
                          onChange={handleInputChange}
                          min="1.0"
                          max="5.0"
                          step="0.1"
                          required
                        />
                        <span className="input-group-text">x</span>
                      </div>
                      <Form.Text className="text-muted">Multiplier for double time hours (1.0x - 5.0x)</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                <Card className="bg-light">
                  <Card.Body>
                    <h6 className="card-title">
                      <Calculator size={18} className="me-2" />
                      Current Rate Structure
                    </h6>
                    <Row>
                      <Col md={4}>
                        <div className="text-center">
                          <div className="h4 text-success">R{config.baseRate.toFixed(2)}</div>
                          <small className="text-muted">Regular Time</small>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-center">
                          <div className="h4 text-warning">R{(config.baseRate * config.overtimeMultiplier).toFixed(2)}</div>
                          <small className="text-muted">Overtime ({config.overtimeMultiplier}x)</small>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-center">
                          <div className="h4 text-danger">R{(config.baseRate * config.doubleTimeMultiplier).toFixed(2)}</div>
                          <small className="text-muted">Double Time ({config.doubleTimeMultiplier}x)</small>
                        </div>
                      </Col>
                    </Row>
                    <div className="text-center mt-3">
                      <div className="h6 text-info">
                        Deductions: {(config.deductionRate * 100).toFixed(0)}%
                        <small className="text-muted"> (Net pay = {((1 - config.deductionRate) * 100).toFixed(0)}% of gross)</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <div className="d-flex justify-content-between mt-4">
                  <Button variant="secondary" onClick={() => navigate('/payroll')}>
                    <ArrowLeft size={18} className="me-2" />
                    Back to Payroll
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    <Save size={18} className="me-2" />
                    {loading ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-lg-8 col-md-10 mx-auto">
          <Card>
            <Card.Header>
              <h6 className="card-title mb-0">
                <HelpCircle size={18} className="me-2" />
                Configuration Guidelines
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Rate Configuration</h6>
                  <ul className="list-unstyled">
                    <li><Check size={16} className="text-success me-2" />Base rate applies to regular working hours</li>
                    <li><Check size={16} className="text-success me-2" />Overtime typically 1.5x for hours 41-48</li>
                    <li><Check size={16} className="text-success me-2" />Double time typically 2.0x for hours 49+</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Deduction Guidelines</h6>
                  <ul className="list-unstyled">
                    <li><Info size={16} className="text-info me-2" />Includes tax, UIF, and other statutory deductions</li>
                    <li><Info size={16} className="text-info me-2" />Standard South African rate is approximately 25%</li>
                    <li><Info size={16} className="text-info me-2" />Consult with HR/Finance for exact percentages</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
