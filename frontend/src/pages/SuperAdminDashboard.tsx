import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Badge, Alert, ProgressBar, ListGroup } from 'react-bootstrap';
import { 
  Shield, RefreshCw, Sliders, Activity, Building2, Users, Clock,
  TrendingUp, Cpu, Calculator, Calendar, CalendarCheck,
  Brain, AlertTriangle, CheckCircle, BarChart3, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface SuperAdminStats {
  systemStats: {
    uptime: number;
    activeUsers: number;
    pendingTasks: number;
    dataIntegrity: number;
  };
  orgStats: {
    companies: number;
    regions: number;
    sites: number;
    departments: number;
    activeEmployees: number;
    totalEmployees: number;
  };
  userStats: {
    superUsers: number;
    managers: number;
    employees: number;
    recentLogins: number;
    activeAccounts: number;
  };
  attendanceStats: {
    clockInsToday: number;
    expectedClockIns: number;
    onTimePercentage: number;
    overtimeHours: string;
    exceptions: number;
  };
  workflowStats: {
    activeWorkflows: number;
    automationRate: number;
    pendingApprovals: number;
    completedToday: number;
  };
  payrollStats: {
    totalHours: string;
    totalPayroll: string;
    overtimeCost: number;
    pendingCalculations: number;
    processedEmployees: number;
  };
  leaveStats: {
    pendingApplications: number;
    approvedMonth: number;
    balanceIssues: number;
  };
  scheduleStats: {
    shiftsToday: number;
    coverageRate: number;
    conflicts: number;
    upcomingShifts: number;
  };
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/super-admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load super admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const activeEmployeePercentage = stats.orgStats.totalEmployees > 0 
    ? (stats.orgStats.activeEmployees / stats.orgStats.totalEmployees * 100) 
    : 0;

  const clockInPercentage = stats.attendanceStats.expectedClockIns > 0
    ? (stats.attendanceStats.clockInsToday / stats.attendanceStats.expectedClockIns * 100)
    : 0;

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <Shield size={32} className="me-2" style={{ color: '#28468D' }} />
            Super Admin Dashboard
          </h2>
          <p className="text-muted mb-0">Complete system overview and management controls</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => navigate('/dashboard-configuration')}>
            <Sliders size={16} className="me-2" />
            Configure Dashboards
          </Button>
          <Button variant="primary" onClick={loadDashboardData}>
            <RefreshCw size={16} className="me-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <Activity size={20} className="me-2" />
                System Health & Performance
              </h5>
              <Badge bg="success">All Systems Operational</Badge>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col md={3}>
                  <div className="display-6 text-success">{stats.systemStats.uptime}%</div>
                  <small className="text-muted">System Uptime</small>
                </Col>
                <Col md={3}>
                  <div className="display-6" style={{ color: '#54B8DF' }}>{stats.systemStats.activeUsers}</div>
                  <small className="text-muted">Active Users Today</small>
                </Col>
                <Col md={3}>
                  <div className="display-6 text-warning">{stats.systemStats.pendingTasks}</div>
                  <small className="text-muted">Pending System Tasks</small>
                </Col>
                <Col md={3}>
                  <div className="display-6" style={{ color: '#28468D' }}>{stats.systemStats.dataIntegrity}%</div>
                  <small className="text-muted">Data Integrity Score</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Organization & User Overview */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <Building2 size={20} className="me-2" />
                Organization Structure
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={6}>
                  <div className="mb-3">
                    <div className="h4" style={{ color: '#28468D' }}>{stats.orgStats.companies}</div>
                    <small className="text-muted">Companies</small>
                  </div>
                  <div className="mb-3">
                    <div className="h4" style={{ color: '#54B8DF' }}>{stats.orgStats.regions}</div>
                    <small className="text-muted">Regions</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="mb-3">
                    <div className="h4 text-success">{stats.orgStats.sites}</div>
                    <small className="text-muted">Sites</small>
                  </div>
                  <div className="mb-3">
                    <div className="h4 text-warning">{stats.orgStats.departments}</div>
                    <small className="text-muted">Departments</small>
                  </div>
                </Col>
              </Row>
              <ProgressBar now={activeEmployeePercentage} variant="success" className="mb-2" style={{ height: '8px' }} />
              <small className="text-muted">
                {stats.orgStats.activeEmployees} of {stats.orgStats.totalEmployees} employees active
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <Users size={20} className="me-2" />
                User Management Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center mb-3">
                <Col xs={4}>
                  <div className="h4" style={{ color: '#28468D' }}>{stats.userStats.superUsers}</div>
                  <small className="text-muted">Super Users</small>
                </Col>
                <Col xs={4}>
                  <div className="h4" style={{ color: '#54B8DF' }}>{stats.userStats.managers}</div>
                  <small className="text-muted">Managers</small>
                </Col>
                <Col xs={4}>
                  <div className="h4 text-success">{stats.userStats.employees}</div>
                  <small className="text-muted">Employees</small>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col xs={6}>
                  <small className="text-muted">Last Login Activity:</small>
                  <div className="text-success">{stats.userStats.recentLogins} today</div>
                </Col>
                <Col xs={6}>
                  <small className="text-muted">Account Status:</small>
                  <div style={{ color: '#54B8DF' }}>{stats.userStats.activeAccounts} active</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Time & Attendance Analytics */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <Clock size={20} className="me-2" />
                Time & Attendance Analytics
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-5">
                <BarChart3 size={64} className="text-muted mb-3" />
                <p className="text-muted">Attendance trends and analytics chart would display here</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <TrendingUp size={20} className="me-2" />
                Today's Metrics
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <span>Clock-ins Today</span>
                  <strong className="text-success">{stats.attendanceStats.clockInsToday}</strong>
                </div>
                <ProgressBar now={clockInPercentage} variant="success" className="mt-1" style={{ height: '6px' }} />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <span>On Time Arrivals</span>
                  <strong style={{ color: '#54B8DF' }}>{stats.attendanceStats.onTimePercentage}%</strong>
                </div>
                <ProgressBar now={stats.attendanceStats.onTimePercentage} style={{ height: '6px', backgroundColor: '#54B8DF' }} className="mt-1" />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <span>Overtime Hours</span>
                  <strong className="text-warning">{stats.attendanceStats.overtimeHours}h</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Exceptions</span>
                  <strong className="text-danger">{stats.attendanceStats.exceptions}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Workflow & Payroll */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <Cpu size={20} className="me-2" />
                Automation & Workflows
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={6}>
                  <div className="mb-3">
                    <div className="h4 text-success">{stats.workflowStats.activeWorkflows}</div>
                    <small className="text-muted">Active Workflows</small>
                  </div>
                  <div className="mb-3">
                    <div className="h4" style={{ color: '#54B8DF' }}>{stats.workflowStats.automationRate}%</div>
                    <small className="text-muted">Automation Rate</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="mb-3">
                    <div className="h4 text-warning">{stats.workflowStats.pendingApprovals}</div>
                    <small className="text-muted">Pending Approvals</small>
                  </div>
                  <div className="mb-3">
                    <div className="h4" style={{ color: '#28468D' }}>{stats.workflowStats.completedToday}</div>
                    <small className="text-muted">Completed Today</small>
                  </div>
                </Col>
              </Row>
              <div className="d-grid">
                <Button variant="outline-primary" onClick={() => navigate('/automation-workflows')}>
                  Manage Workflows
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <span className="me-2 fw-bold text-success">R</span>
                Payroll & Financial Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={6}>
                  <div className="mb-3">
                    <div className="h4 text-success">R{parseFloat(stats.payrollStats.totalPayroll).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <small className="text-muted">Current Period</small>
                  </div>
                  <div className="mb-3">
                    <div className="h4" style={{ color: '#54B8DF' }}>{stats.payrollStats.overtimeCost}%</div>
                    <small className="text-muted">Overtime Cost</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="mb-3">
                    <div className="h4 text-warning">{stats.payrollStats.pendingCalculations}</div>
                    <small className="text-muted">Pending Calculations</small>
                  </div>
                  <div className="mb-3">
                    <div className="h4" style={{ color: '#28468D' }}>{stats.payrollStats.processedEmployees}</div>
                    <small className="text-muted">Processed Employees</small>
                  </div>
                </Col>
              </Row>
              <div className="d-grid">
                <Button variant="outline-success" onClick={() => navigate('/payroll/processing')}>
                  <Calculator size={16} className="me-2" />
                  View Payroll
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Leave & Scheduling */}
      <Row className="mb-4">
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <Calendar size={20} className="me-2" />
                Leave Management
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Pending Applications</span>
                  <strong className="text-warning">{stats.leaveStats.pendingApplications}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Approved This Month</span>
                  <strong className="text-success">{stats.leaveStats.approvedMonth}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Leave Balance Issues</span>
                  <strong className="text-danger">{stats.leaveStats.balanceIssues}</strong>
                </div>
              </div>
              <div className="d-grid">
                <Button variant="outline-info" onClick={() => navigate('/leave-management')}>
                  <CalendarCheck size={16} className="me-2" />
                  Manage Leave
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <Calendar size={20} className="me-2" />
                Scheduling Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col md={3}>
                  <div className="h4" style={{ color: '#28468D' }}>{stats.scheduleStats.shiftsToday}</div>
                  <small className="text-muted">Shifts Today</small>
                </Col>
                <Col md={3}>
                  <div className="h4 text-success">{stats.scheduleStats.coverageRate}%</div>
                  <small className="text-muted">Coverage Rate</small>
                </Col>
                <Col md={3}>
                  <div className="h4 text-warning">{stats.scheduleStats.conflicts}</div>
                  <small className="text-muted">Schedule Conflicts</small>
                </Col>
                <Col md={3}>
                  <div className="h4" style={{ color: '#54B8DF' }}>{stats.scheduleStats.upcomingShifts}</div>
                  <small className="text-muted">Upcoming Week</small>
                </Col>
              </Row>
              <div className="d-grid mt-3">
                <Button variant="outline-primary" onClick={() => navigate('/manage-schedules')}>
                  <Calendar size={16} className="me-2" />
                  Manage Schedules
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* AI Insights & Reports */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <Brain size={20} className="me-2" />
                AI Insights & Recommendations
              </h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-2">
                <TrendingUp size={16} className="me-2" />
                <strong>Productivity Trend:</strong> 15% increase in average productivity this month
              </Alert>
              <Alert variant="warning" className="mb-2">
                <AlertTriangle size={16} className="me-2" />
                <strong>Schedule Optimization:</strong> 3 departments could benefit from shift adjustments
              </Alert>
              <Alert variant="success" className="mb-3">
                <CheckCircle size={16} className="me-2" />
                <strong>Compliance Status:</strong> All departments meeting attendance requirements
              </Alert>
              <div className="d-grid">
                <Button variant="outline-secondary" onClick={() => navigate('/ai/dashboard')}>
                  <Brain size={16} className="me-2" />
                  View AI Dashboard
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <BarChart3 size={20} className="me-2" />
                Reports & Analytics
              </h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item action onClick={() => navigate('/reports/time-summary')} className="d-flex justify-content-between align-items-center">
                  Attendance Summary Report
                  <Badge style={{ backgroundColor: '#28468D' }}>Weekly</Badge>
                </ListGroup.Item>
                <ListGroup.Item action onClick={() => navigate('/reports/payroll')} className="d-flex justify-content-between align-items-center">
                  Payroll Analytics Report
                  <Badge bg="success">Monthly</Badge>
                </ListGroup.Item>
                <ListGroup.Item action onClick={() => navigate('/reports')} className="d-flex justify-content-between align-items-center">
                  Performance Metrics
                  <Badge style={{ backgroundColor: '#54B8DF' }}>Real-time</Badge>
                </ListGroup.Item>
                <ListGroup.Item action onClick={() => navigate('/reports')} className="d-flex justify-content-between align-items-center">
                  Compliance Report
                  <Badge bg="warning">Quarterly</Badge>
                </ListGroup.Item>
              </ListGroup>
              <div className="d-grid mt-3">
                <Button variant="outline-info" onClick={() => navigate('/reports')}>
                  <FileText size={16} className="me-2" />
                  View All Reports
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
