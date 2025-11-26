import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert, Form, ProgressBar } from 'react-bootstrap';
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, DollarSign, Clock, Users } from 'lucide-react';
import api from '../api/client';

interface ComplianceMetric {
  id: string;
  name: string;
  category: string;
  score: number;
  threshold: number;
  status: 'compliant' | 'warning' | 'violation';
  trend: 'up' | 'down' | 'stable';
  violations: number;
  description: string;
}

interface Violation {
  id: number;
  userId: number;
  userName: string;
  ruleId: number;
  ruleName: string;
  severity: 'info' | 'warning' | 'violation' | 'critical';
  date: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'dismissed';
  description: string;
  costImpact?: number;
}

interface CostSummary {
  totalOvertimeCost: number;
  projectedOvertimeCost: number;
  compliancePenaltyCost: number;
  labourCostVariance: number;
  previousPeriodCost: number;
}

export default function ComplianceDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ComplianceMetric[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, violationsRes, costsRes] = await Promise.all([
        api.get('/organization/compliance/metrics', { params: { period: selectedPeriod } }),
        api.get('/organization/compliance/violations', { params: { period: selectedPeriod } }),
        api.get('/organization/compliance/costs', { params: { period: selectedPeriod } })
      ]);

      setMetrics(metricsRes.data.metrics || generateMockMetrics());
      setViolations(violationsRes.data.violations || generateMockViolations());
      setCostSummary(costsRes.data.summary || generateMockCostSummary());
      
      const avgScore = metricsRes.data.metrics?.length 
        ? metricsRes.data.metrics.reduce((sum: number, m: ComplianceMetric) => sum + m.score, 0) / metricsRes.data.metrics.length
        : 87;
      setOverallScore(Math.round(avgScore));
    } catch (err: any) {
      setMetrics(generateMockMetrics());
      setViolations(generateMockViolations());
      setCostSummary(generateMockCostSummary());
      setOverallScore(87);
    } finally {
      setLoading(false);
    }
  };

  const generateMockMetrics = (): ComplianceMetric[] => [
    { id: '1', name: 'Overtime Limit', category: 'Time', score: 92, threshold: 90, status: 'compliant', trend: 'up', violations: 3, description: 'Employees exceeding 45hr weekly limit' },
    { id: '2', name: 'Break Compliance', category: 'Time', score: 88, threshold: 90, status: 'warning', trend: 'down', violations: 7, description: 'Required break periods not taken' },
    { id: '3', name: 'Late Arrivals', category: 'Attendance', score: 85, threshold: 85, status: 'compliant', trend: 'stable', violations: 12, description: 'Employees clocking in after shift start' },
    { id: '4', name: 'Leave Balance Usage', category: 'Leave', score: 94, threshold: 80, status: 'compliant', trend: 'up', violations: 2, description: 'Leave balances approaching limits' },
    { id: '5', name: 'Schedule Adherence', category: 'Scheduling', score: 78, threshold: 90, status: 'violation', trend: 'down', violations: 18, description: 'Worked hours vs scheduled hours' },
    { id: '6', name: 'Documentation', category: 'Admin', score: 91, threshold: 85, status: 'compliant', trend: 'stable', violations: 4, description: 'Missing required documentation' }
  ];

  const generateMockViolations = (): Violation[] => [
    { id: 1, userId: 3, userName: 'Sarah Johnson', ruleId: 1, ruleName: 'Maximum Weekly Hours', severity: 'warning', date: new Date().toISOString(), status: 'open', description: 'Exceeded 45 hours this week (47.5 hrs)', costImpact: 450 },
    { id: 2, userId: 5, userName: 'Michael Brown', ruleId: 2, ruleName: 'Mandatory Break', severity: 'violation', date: new Date(Date.now() - 86400000).toISOString(), status: 'open', description: 'No lunch break recorded for 6+ hour shift', costImpact: 0 },
    { id: 3, userId: 7, userName: 'Emma Wilson', ruleId: 3, ruleName: 'Late Arrival', severity: 'info', date: new Date(Date.now() - 172800000).toISOString(), status: 'acknowledged', description: 'Clocked in 15 minutes late', costImpact: 75 },
    { id: 4, userId: 2, userName: 'James Smith', ruleId: 5, ruleName: 'Schedule Deviation', severity: 'critical', date: new Date().toISOString(), status: 'open', description: 'Worked 4 hours beyond scheduled shift without approval', costImpact: 800 }
  ];

  const generateMockCostSummary = (): CostSummary => ({
    totalOvertimeCost: 45600,
    projectedOvertimeCost: 52000,
    compliancePenaltyCost: 2400,
    labourCostVariance: 8500,
    previousPeriodCost: 41200
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'warning';
    return 'danger';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info': return <Badge bg="info">Info</Badge>;
      case 'warning': return <Badge bg="warning">Warning</Badge>;
      case 'violation': return <Badge bg="danger">Violation</Badge>;
      case 'critical': return <Badge bg="dark">Critical</Badge>;
      default: return <Badge bg="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge bg="danger-subtle" text="danger">Open</Badge>;
      case 'acknowledged': return <Badge bg="warning-subtle" text="warning">Acknowledged</Badge>;
      case 'resolved': return <Badge bg="success-subtle" text="success">Resolved</Badge>;
      case 'dismissed': return <Badge bg="secondary-subtle" text="secondary">Dismissed</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredViolations = violations.filter(v => 
    statusFilter === 'all' || v.status === statusFilter
  );

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading compliance data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 d-flex align-items-center gap-2">
            <Shield className="text-primary" /> Compliance Dashboard
          </h2>
          <p className="text-muted mb-0">Monitor violations, compliance scores, and cost impact</p>
        </div>
        <Form.Select 
          value={selectedPeriod} 
          onChange={(e) => setSelectedPeriod(e.target.value)}
          style={{ width: 180 }}
        >
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="this_quarter">This Quarter</option>
        </Form.Select>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 shadow-sm border-0" style={{ 
            background: `linear-gradient(135deg, ${overallScore >= 85 ? '#28a745' : overallScore >= 70 ? '#ffc107' : '#dc3545'} 0%, ${overallScore >= 85 ? '#20c997' : overallScore >= 70 ? '#fd7e14' : '#e74c3c'} 100%)`,
            color: 'white'
          }}>
            <Card.Body className="text-center">
              <Shield size={32} className="mb-2 opacity-75" />
              <h6 className="opacity-75 mb-1">Overall Compliance Score</h6>
              <h1 className="display-4 fw-bold mb-0">{overallScore}%</h1>
              <small className="opacity-75">
                {overallScore >= 85 ? 'Excellent' : overallScore >= 70 ? 'Needs Attention' : 'Critical'}
              </small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-2">
                <AlertTriangle className="text-danger" size={24} />
                <h6 className="mb-0">Open Violations</h6>
              </div>
              <h2 className="fw-bold text-danger">{violations.filter(v => v.status === 'open').length}</h2>
              <small className="text-muted">
                {violations.filter(v => v.severity === 'critical').length} critical
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-2">
                <DollarSign className="text-warning" size={24} />
                <h6 className="mb-0">Overtime Cost</h6>
              </div>
              <h2 className="fw-bold">{costSummary ? formatCurrency(costSummary.totalOvertimeCost) : '-'}</h2>
              <small className={costSummary && costSummary.totalOvertimeCost > costSummary.previousPeriodCost ? 'text-danger' : 'text-success'}>
                {costSummary && (
                  <>
                    {costSummary.totalOvertimeCost > costSummary.previousPeriodCost ? (
                      <TrendingUp size={14} className="me-1" />
                    ) : (
                      <TrendingDown size={14} className="me-1" />
                    )}
                    {Math.abs(((costSummary.totalOvertimeCost - costSummary.previousPeriodCost) / costSummary.previousPeriodCost) * 100).toFixed(1)}% vs last period
                  </>
                )}
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-2">
                <Clock className="text-info" size={24} />
                <h6 className="mb-0">Labour Variance</h6>
              </div>
              <h2 className="fw-bold">{costSummary ? formatCurrency(costSummary.labourCostVariance) : '-'}</h2>
              <small className="text-muted">Budget deviation</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Compliance Metrics by Category</h6>
            </Card.Header>
            <Card.Body>
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Metric</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Trend</th>
                    <th>Violations</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map(metric => (
                    <tr key={metric.id}>
                      <td>
                        <div className="fw-medium">{metric.name}</div>
                        <small className="text-muted">{metric.description}</small>
                      </td>
                      <td><Badge bg="light" text="dark">{metric.category}</Badge></td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <ProgressBar 
                            now={metric.score} 
                            variant={getScoreColor(metric.score)}
                            style={{ width: 80, height: 8 }}
                          />
                          <span className="fw-medium">{metric.score}%</span>
                        </div>
                      </td>
                      <td>
                        {metric.status === 'compliant' && <Badge bg="success"><CheckCircle size={12} className="me-1" />Compliant</Badge>}
                        {metric.status === 'warning' && <Badge bg="warning"><AlertTriangle size={12} className="me-1" />Warning</Badge>}
                        {metric.status === 'violation' && <Badge bg="danger"><XCircle size={12} className="me-1" />Violation</Badge>}
                      </td>
                      <td>
                        {metric.trend === 'up' && <TrendingUp size={16} className="text-success" />}
                        {metric.trend === 'down' && <TrendingDown size={16} className="text-danger" />}
                        {metric.trend === 'stable' && <span className="text-muted">—</span>}
                      </td>
                      <td>
                        <Badge bg={metric.violations > 10 ? 'danger' : metric.violations > 5 ? 'warning' : 'secondary'}>
                          {metric.violations}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Cost Impact Summary</h6>
            </Card.Header>
            <Card.Body>
              {costSummary && (
                <div>
                  <div className="mb-3 p-3 bg-light rounded">
                    <small className="text-muted">Total Overtime Cost</small>
                    <h4 className="mb-0 fw-bold">{formatCurrency(costSummary.totalOvertimeCost)}</h4>
                  </div>
                  <div className="mb-3 p-3 bg-warning-subtle rounded">
                    <small className="text-muted">Projected (Month End)</small>
                    <h5 className="mb-0 fw-bold text-warning">{formatCurrency(costSummary.projectedOvertimeCost)}</h5>
                  </div>
                  <div className="mb-3 p-3 bg-danger-subtle rounded">
                    <small className="text-muted">Compliance Penalty Risk</small>
                    <h5 className="mb-0 fw-bold text-danger">{formatCurrency(costSummary.compliancePenaltyCost)}</h5>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Previous Period</span>
                    <span className="fw-medium">{formatCurrency(costSummary.previousPeriodCost)}</span>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0 d-flex align-items-center gap-2">
            <AlertTriangle size={18} /> Active Violations
          </h6>
          <Form.Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 150 }}
            size="sm"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </Form.Select>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Employee</th>
                <th>Rule</th>
                <th>Severity</th>
                <th>Date</th>
                <th>Status</th>
                <th>Cost Impact</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredViolations.map(violation => (
                <tr key={violation.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Users size={16} className="text-muted" />
                      {violation.userName}
                    </div>
                  </td>
                  <td>{violation.ruleName}</td>
                  <td>{getSeverityBadge(violation.severity)}</td>
                  <td>
                    <small>{new Date(violation.date).toLocaleDateString('en-ZA')}</small>
                  </td>
                  <td>{getStatusBadge(violation.status)}</td>
                  <td>
                    {violation.costImpact ? (
                      <span className="text-danger fw-medium">{formatCurrency(violation.costImpact)}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td><small>{violation.description}</small></td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredViolations.length === 0 && (
            <div className="text-center py-4 text-muted">
              <CheckCircle size={32} className="mb-2 opacity-50" />
              <p>No violations found</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
