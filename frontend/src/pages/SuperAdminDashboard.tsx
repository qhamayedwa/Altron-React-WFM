import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Badge, Alert, ProgressBar, ListGroup } from 'react-bootstrap';
import { 
  Shield, RefreshCw, Sliders, Activity, Building2, Users, Clock,
  TrendingUp, Cpu, Calculator, Calendar, CalendarCheck,
  Brain, AlertTriangle, CheckCircle, BarChart3, FileText, ArrowRight
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
        <div className="spinner-border" role="status" style={{ color: '#28468D' }}>
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
      {/* Hero Header with Gradient */}
      <div className="welcome-banner mb-4">
        <Row className="align-items-center">
          <Col lg={8}>
            <div className="d-flex align-items-center gap-3 mb-2">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{ 
                  width: 56, 
                  height: 56, 
                  background: 'linear-gradient(135deg, rgba(84, 218, 223, 0.3), rgba(235, 249, 130, 0.3))'
                }}
              >
                <Shield size={28} />
              </div>
              <div>
                <h2 className="fw-bold mb-0">Super Admin Dashboard</h2>
                <p className="mb-0" style={{ opacity: 0.9 }}>Complete system overview and management controls</p>
              </div>
            </div>
          </Col>
          <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
            <Button 
              variant="light" 
              onClick={() => navigate('/dashboard-configuration')}
              className="me-2"
              style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#28468D',
                border: 'none'
              }}
            >
              <Sliders size={16} className="me-2" />
              Configure
            </Button>
            <Button 
              variant="light" 
              onClick={loadDashboardData}
              style={{ 
                background: 'linear-gradient(135deg, rgba(84, 218, 223, 0.9), rgba(192, 242, 215, 0.9))',
                color: '#1F4650',
                border: 'none'
              }}
            >
              <RefreshCw size={16} className="me-2" />
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      {/* System Health Overview */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="border-0">
            <Card.Header className="gradient-blue py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">
                <Activity size={20} className="me-2" />
                System Health & Performance
              </h5>
              <Badge style={{ 
                background: 'linear-gradient(135deg, #C0F2D7, #28A745)',
                color: '#1F4650',
                fontWeight: 600
              }}>All Systems Operational</Badge>
            </Card.Header>
            <Card.Body className="py-4">
              <Row className="text-center">
                <Col md={3}>
                  <div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      background: 'linear-gradient(135deg, #C0F2D7, #28A745)'
                    }}
                  >
                    <CheckCircle size={24} color="#fff" />
                  </div>
                  <div className="display-6 fw-bold" style={{ color: '#28A745' }}>{stats.systemStats.uptime}%</div>
                  <small className="text-muted fw-medium">System Uptime</small>
                </Col>
                <Col md={3}>
                  <div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      background: 'linear-gradient(135deg, #54B8DF, #28468D)'
                    }}
                  >
                    <Users size={24} color="#fff" />
                  </div>
                  <div className="display-6 fw-bold" style={{ color: '#54B8DF' }}>{stats.systemStats.activeUsers}</div>
                  <small className="text-muted fw-medium">Active Users Today</small>
                </Col>
                <Col md={3}>
                  <div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      background: 'linear-gradient(135deg, #EF865B, #EBF982)'
                    }}
                  >
                    <Clock size={24} color="#1F4650" />
                  </div>
                  <div className="display-6 fw-bold" style={{ color: '#EF865B' }}>{stats.systemStats.pendingTasks}</div>
                  <small className="text-muted fw-medium">Pending System Tasks</small>
                </Col>
                <Col md={3}>
                  <div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      background: 'linear-gradient(135deg, #28468D, #1F4650)'
                    }}
                  >
                    <Shield size={24} color="#fff" />
                  </div>
                  <div className="display-6 fw-bold" style={{ color: '#28468D' }}>{stats.systemStats.dataIntegrity}%</div>
                  <small className="text-muted fw-medium">Data Integrity Score</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Organization & User Overview */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="h-100 border-0">
            <Card.Header className="gradient-teal py-3">
              <h5 className="mb-0 fw-semibold">
                <Building2 size={20} className="me-2" />
                Organization Structure
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={6}>
                  <div className="mb-3">
                    <div className="h4 fw-bold" style={{ color: '#28468D' }}>{stats.orgStats.companies}</div>
                    <small className="text-muted">Companies</small>
                  </div>
                  <div className="mb-3">
                    <div className="h4 fw-bold" style={{ color: '#54B8DF' }}>{stats.orgStats.regions}</div>
                    <small className="text-muted">Regions</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="mb-3">
                    <div className="h4 fw-bold" style={{ color: '#C0F2D7' }}>{stats.orgStats.sites}</div>
                    <small className="text-muted">Sites</small>
                  </div>
                  <div className="mb-3">
                    <div className="h4 fw-bold" style={{ color: '#EF865B' }}>{stats.orgStats.departments}</div>
                    <small className="text-muted">Departments</small>
                  </div>
                </Col>
              </Row>
              <ProgressBar 
                now={activeEmployeePercentage} 
                className="mb-2" 
                style={{ height: '8px', background: 'rgba(84, 218, 223, 0.2)' }}
              />
              <small className="text-muted">
                {stats.orgStats.activeEmployees} of {stats.orgStats.totalEmployees} employees active
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100 border-0">
            <Card.Header className="gradient-mint py-3">
              <h5 className="mb-0 fw-semibold">
                <Users size={20} className="me-2" />
                User Management Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center mb-3">
                <Col xs={4}>
                  <div className="h4 fw-bold" style={{ color: '#28468D' }}>{stats.userStats.superUsers}</div>
                  <small className="text-muted">Super Users</small>
                </Col>
                <Col xs={4}>
                  <div className="h4 fw-bold" style={{ color: '#54B8DF' }}>{stats.userStats.managers}</div>
                  <small className="text-muted">Managers</small>
                </Col>
                <Col xs={4}>
                  <div className="h4 fw-bold" style={{ color: '#C0F2D7' }}>{stats.userStats.employees}</div>
                  <small className="text-muted">Employees</small>
                </Col>
              </Row>
              <hr className="section-divider my-3" />
              <Row>
                <Col xs={6}>
                  <small className="text-muted">Last Login Activity:</small>
                  <div style={{ color: '#28A745' }} className="fw-semibold">{stats.userStats.recentLogins} today</div>
                </Col>
                <Col xs={6}>
                  <small className="text-muted">Account Status:</small>
                  <div style={{ color: '#54B8DF' }} className="fw-semibold">{stats.userStats.activeAccounts} active</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Time & Attendance Analytics */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="h-100 border-0">
            <Card.Header className="gradient-blue py-3">
              <h5 className="mb-0 fw-semibold">
                <Clock size={20} className="me-2" />
                Time & Attendance Analytics
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-5">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ 
                    width: 80, 
                    height: 80, 
                    background: 'linear-gradient(135deg, rgba(84, 184, 223, 0.2), rgba(40, 70, 141, 0.2))'
                  }}
                >
                  <BarChart3 size={40} style={{ color: '#28468D' }} />
                </div>
                <p className="text-muted mb-0">Attendance trends and analytics chart</p>
                <small className="text-muted">Real-time data visualization coming soon</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="h-100 border-0">
            <Card.Header className="gradient-orange py-3">
              <h5 className="mb-0 fw-semibold">
                <TrendingUp size={20} className="me-2" />
                Today's Metrics
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Clock-ins Today</span>
                  <strong style={{ color: '#28A745' }}>{stats.attendanceStats.clockInsToday}</strong>
                </div>
                <ProgressBar 
                  now={clockInPercentage} 
                  style={{ height: '6px', background: 'rgba(192, 242, 215, 0.3)' }}
                />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">On Time Arrivals</span>
                  <strong style={{ color: '#54B8DF' }}>{stats.attendanceStats.onTimePercentage}%</strong>
                </div>
                <ProgressBar 
                  now={stats.attendanceStats.onTimePercentage} 
                  style={{ height: '6px', background: 'rgba(84, 184, 223, 0.3)' }}
                />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Overtime Hours</span>
                  <strong style={{ color: '#EF865B' }}>{stats.attendanceStats.overtimeHours}h</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Exceptions</span>
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
          <Card className="h-100 border-0">
            <Card.Header className="py-3" style={{ background: 'linear-gradient(135deg, #54DADF, #C0F2D7)', color: '#1F4650' }}>
              <h5 className="mb-0 fw-semibold">
                <Cpu size={20} className="me-2" />
                Automation & Workflows
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={6}>
                  <div className="mb-3">
                    <div className="h4 fw-bold" style={{ color: '#28A745' }}>{stats.workflowStats.activeWorkflows}</div>
                    <small className="text-muted">Active Workflows</small>
                  </div>
                  <div className="mb-3">
                    <div className="h4 fw-bold" style={{ color: '#54B8DF' }}>{stats.workflowStats.automationRate}%</div>
                    <small className="text-muted">Automation Rate</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="mb-3">
                    <div className="h4 fw-bold" style={{ color: '#EF865B' }}>{stats.workflowStats.pendingApprovals}</div>
                    <small className="text-muted">Pending Approvals</small>
                  </div>
                  <div className="mb-3">
                    <div className="h4 fw-bold" style={{ color: '#28468D' }}>{stats.workflowStats.completedToday}</div>
                    <small className="text-muted">Completed Today</small>
                  </div>
                </Col>
              </Row>
              <div className="d-grid">
                <Button variant="outline-primary" onClick={() => navigate('/automation/workflows')}>
                  Manage Workflows <ArrowRight size={16} className="ms-2" />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100 border-0">
            <Card.Header className="py-3" style={{ background: 'linear-gradient(135deg, #C0F2D7, #28A745)', color: '#1F4650' }}>
              <h5 className="mb-0 fw-semibold">
                <span className="me-2 fw-bold">R</span>
                Payroll & Financial Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={6}>
                  <div className="mb-3">
                    <div className="h4 fw-bold" style={{ color: '#28A745' }}>R{parseFloat(stats.payrollStats.totalPayroll).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <small className="text-muted">Current Period</small>
                  </div>
                  <div className="mb-3">
                    <div className="h4 fw-bold" style={{ color: '#54B8DF' }}>{stats.payrollStats.overtimeCost}%</div>
                    <small className="text-muted">Overtime Cost</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="mb-3">
                    <div className="h4 fw-bold" style={{ color: '#EF865B' }}>{stats.payrollStats.pendingCalculations}</div>
                    <small className="text-muted">Pending Calculations</small>
                  </div>
                  <div className="mb-3">
                    <div className="h4 fw-bold" style={{ color: '#28468D' }}>{stats.payrollStats.processedEmployees}</div>
                    <small className="text-muted">Processed Employees</small>
                  </div>
                </Col>
              </Row>
              <div className="d-grid">
                <Button variant="outline-primary" onClick={() => navigate('/payroll/processing')} style={{ borderColor: '#C0F2D7', color: '#1F4650' }}>
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
          <Card className="h-100 border-0">
            <Card.Header className="gradient-blue py-3">
              <h5 className="mb-0 fw-semibold">
                <Calendar size={20} className="me-2" />
                Leave Management
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Pending Applications</span>
                  <strong style={{ color: '#EF865B' }}>{stats.leaveStats.pendingApplications}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Approved This Month</span>
                  <strong style={{ color: '#28A745' }}>{stats.leaveStats.approvedMonth}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Leave Balance Issues</span>
                  <strong className="text-danger">{stats.leaveStats.balanceIssues}</strong>
                </div>
              </div>
              <div className="d-grid">
                <Button variant="outline-primary" onClick={() => navigate('/leave-management')}>
                  <CalendarCheck size={16} className="me-2" />
                  Manage Leave
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card className="h-100 border-0">
            <Card.Header className="gradient-teal py-3">
              <h5 className="mb-0 fw-semibold">
                <Calendar size={20} className="me-2" />
                Scheduling Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col md={3}>
                  <div className="h4 fw-bold" style={{ color: '#28468D' }}>{stats.scheduleStats.shiftsToday}</div>
                  <small className="text-muted">Shifts Today</small>
                </Col>
                <Col md={3}>
                  <div className="h4 fw-bold" style={{ color: '#28A745' }}>{stats.scheduleStats.coverageRate}%</div>
                  <small className="text-muted">Coverage Rate</small>
                </Col>
                <Col md={3}>
                  <div className="h4 fw-bold" style={{ color: '#EF865B' }}>{stats.scheduleStats.conflicts}</div>
                  <small className="text-muted">Schedule Conflicts</small>
                </Col>
                <Col md={3}>
                  <div className="h4 fw-bold" style={{ color: '#54B8DF' }}>{stats.scheduleStats.upcomingShifts}</div>
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
          <Card className="h-100 border-0">
            <Card.Header className="py-3" style={{ background: 'linear-gradient(135deg, #EF865B, #EBF982)', color: '#1F4650' }}>
              <h5 className="mb-0 fw-semibold">
                <Brain size={20} className="me-2" />
                AI Insights & Recommendations
              </h5>
            </Card.Header>
            <Card.Body>
              <Alert className="mb-2 border-0" style={{ background: 'linear-gradient(135deg, rgba(84, 218, 223, 0.2), rgba(235, 249, 130, 0.2))', borderLeft: '4px solid #54DADF' }}>
                <TrendingUp size={16} className="me-2" style={{ color: '#54DADF' }} />
                <strong>Productivity Trend:</strong> 15% increase in average productivity this month
              </Alert>
              <Alert className="mb-2 border-0" style={{ background: 'linear-gradient(135deg, rgba(239, 134, 91, 0.2), rgba(235, 249, 130, 0.2))', borderLeft: '4px solid #EF865B' }}>
                <AlertTriangle size={16} className="me-2" style={{ color: '#EF865B' }} />
                <strong>Schedule Optimization:</strong> 3 departments could benefit from shift adjustments
              </Alert>
              <Alert className="mb-3 border-0" style={{ background: 'linear-gradient(135deg, rgba(192, 242, 215, 0.3), rgba(40, 167, 69, 0.2))', borderLeft: '4px solid #28A745' }}>
                <CheckCircle size={16} className="me-2" style={{ color: '#28A745' }} />
                <strong>Compliance Status:</strong> All departments meeting attendance requirements
              </Alert>
              <div className="d-grid">
                <Button variant="outline-primary" onClick={() => navigate('/ai/dashboard')}>
                  <Brain size={16} className="me-2" />
                  View AI Dashboard
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100 border-0">
            <Card.Header className="gradient-blue py-3">
              <h5 className="mb-0 fw-semibold">
                <BarChart3 size={20} className="me-2" />
                Reports & Analytics
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                <ListGroup.Item action onClick={() => navigate('/reports/time-summary')} className="d-flex justify-content-between align-items-center py-3 px-4">
                  Attendance Summary Report
                  <Badge style={{ background: 'linear-gradient(135deg, #54B8DF, #28468D)', color: '#fff' }}>Weekly</Badge>
                </ListGroup.Item>
                <ListGroup.Item action onClick={() => navigate('/reports/payroll')} className="d-flex justify-content-between align-items-center py-3 px-4">
                  Payroll Analytics Report
                  <Badge style={{ background: 'linear-gradient(135deg, #C0F2D7, #28A745)', color: '#1F4650' }}>Monthly</Badge>
                </ListGroup.Item>
                <ListGroup.Item action onClick={() => navigate('/reports')} className="d-flex justify-content-between align-items-center py-3 px-4">
                  Performance Metrics
                  <Badge style={{ background: 'linear-gradient(135deg, #54DADF, #EBF982)', color: '#1F4650' }}>Real-time</Badge>
                </ListGroup.Item>
                <ListGroup.Item action onClick={() => navigate('/reports')} className="d-flex justify-content-between align-items-center py-3 px-4">
                  Compliance Report
                  <Badge style={{ background: 'linear-gradient(135deg, #EF865B, #EBF982)', color: '#1F4650' }}>Quarterly</Badge>
                </ListGroup.Item>
              </ListGroup>
              <div className="d-grid p-3">
                <Button variant="outline-primary" onClick={() => navigate('/reports')}>
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
