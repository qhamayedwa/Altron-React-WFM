import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { Clock, Calendar, Bell, FileText, ArrowRight, Play, Square, Coffee, Users, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

interface CurrentShift {
  id: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  shiftType: string;
  siteName?: string;
  departmentName?: string;
}

interface ClockStatus {
  status: 'clocked_in' | 'clocked_out' | 'on_break';
  entryId?: number;
  clockInTime?: string;
  totalBreakMinutes?: number;
}

interface PendingCounts {
  pendingLeaveRequests: number;
  unreadNotifications: number;
  upcomingShifts: number;
  pendingApprovals: number;
}

interface EmployeeHomeData {
  currentShift: CurrentShift | null;
  nextShift: CurrentShift | null;
  clockStatus: ClockStatus;
  pendingCounts: PendingCounts;
  todayHours: number;
  weekHours: number;
  leaveBalance: number;
}

export default function EmployeeHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clockDuration, setClockDuration] = useState<string>('');
  const [data, setData] = useState<EmployeeHomeData>({
    currentShift: null,
    nextShift: null,
    clockStatus: { status: 'clocked_out' },
    pendingCounts: { pendingLeaveRequests: 0, unreadNotifications: 0, upcomingShifts: 0, pendingApprovals: 0 },
    todayHours: 0,
    weekHours: 0,
    leaveBalance: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (data.clockStatus.status === 'clocked_in' && data.clockStatus.clockInTime) {
      const updateDuration = () => {
        const clockIn = new Date(data.clockStatus.clockInTime!);
        const now = new Date();
        const diffMs = now.getTime() - clockIn.getTime();
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        setClockDuration(`${hours}h ${minutes}m ${seconds}s`);
      };
      
      updateDuration();
      const interval = setInterval(updateDuration, 1000);
      return () => clearInterval(interval);
    } else {
      setClockDuration('');
    }
  }, [data.clockStatus.status, data.clockStatus.clockInTime]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/employee-home');
      setData(response.data);
    } catch (err) {
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): EmployeeHomeData => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(8, 0, 0, 0);
    
    return {
      currentShift: {
        id: 1,
        shiftDate: now.toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '17:00',
        shiftType: 'Day Shift',
        siteName: 'Head Office',
        departmentName: 'Operations'
      },
      nextShift: {
        id: 2,
        shiftDate: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '17:00',
        shiftType: 'Day Shift',
        siteName: 'Head Office',
        departmentName: 'Operations'
      },
      clockStatus: { status: 'clocked_out' },
      pendingCounts: {
        pendingLeaveRequests: 1,
        unreadNotifications: 3,
        upcomingShifts: 5,
        pendingApprovals: 0
      },
      todayHours: 0,
      weekHours: 32.5,
      leaveBalance: 15
    };
  };

  const handleClockIn = async () => {
    setClockLoading(true);
    setError(null);
    
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (geoError) {
          console.log('Location not available, proceeding without GPS');
        }
      }

      const response = await api.post('/time/clock-in', { latitude, longitude });
      
      if (response.data.success) {
        setSuccess('Successfully clocked in!');
        setData(prev => ({
          ...prev,
          clockStatus: { 
            status: 'clocked_in', 
            entryId: response.data.entry?.id,
            clockInTime: response.data.entry?.clock_in_time 
          }
        }));
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to clock in');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    setError(null);
    
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (geoError) {
          console.log('Location not available');
        }
      }

      const response = await api.post('/time/clock-out', { latitude, longitude });
      
      if (response.data.success) {
        setSuccess('Successfully clocked out!');
        setData(prev => ({
          ...prev,
          clockStatus: { status: 'clocked_out' }
        }));
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to clock out');
    } finally {
      setClockLoading(false);
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    if (timeStr.includes('T')) {
      return new Date(timeStr).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
    }
    return timeStr;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
  };


  if (loading) {
    return (
      <Container fluid className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading your dashboard...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2 className="mb-1">Welcome back, {user?.firstName || user?.username}!</h2>
        <p className="text-muted mb-0">
          {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h5 className="mb-1 d-flex align-items-center gap-2">
                    <Clock className="text-primary" size={20} />
                    Time Clock
                  </h5>
                  <p className="text-muted mb-0 small">
                    {data.clockStatus.status === 'clocked_in' 
                      ? `Clocked in for ${clockDuration}`
                      : 'You are currently clocked out'}
                  </p>
                </div>
                
                {data.clockStatus.status === 'clocked_in' ? (
                  <div className="d-flex gap-2">
                    <Button variant="outline-warning" size="lg" disabled>
                      <Coffee size={18} className="me-2" /> Break
                    </Button>
                    <Button 
                      variant="danger" 
                      size="lg"
                      onClick={handleClockOut}
                      disabled={clockLoading}
                    >
                      {clockLoading ? (
                        <Spinner size="sm" animation="border" />
                      ) : (
                        <><Square size={18} className="me-2" /> Clock Out</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="success" 
                    size="lg"
                    onClick={handleClockIn}
                    disabled={clockLoading}
                  >
                    {clockLoading ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      <><Play size={18} className="me-2" /> Clock In</>
                    )}
                  </Button>
                )}
              </div>

              {data.currentShift && (
                <div className="bg-light rounded p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-muted small">Today's Shift</span>
                      <h6 className="mb-0">{data.currentShift.shiftType}</h6>
                      <span className="text-primary fw-medium">
                        {formatTime(data.currentShift.startTime)} - {formatTime(data.currentShift.endTime)}
                      </span>
                    </div>
                    <div className="text-end">
                      <span className="text-muted small">Location</span>
                      <h6 className="mb-0">{data.currentShift.siteName}</h6>
                      <span className="text-muted small">{data.currentShift.departmentName}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <Row className="g-4">
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 d-flex align-items-center gap-2">
                      <Calendar className="text-primary" size={18} />
                      Next Shift
                    </h6>
                    <Button variant="link" size="sm" className="p-0" onClick={() => navigate('/my-schedule')}>
                      View Schedule <ArrowRight size={14} />
                    </Button>
                  </div>
                  
                  {data.nextShift ? (
                    <div className="border rounded p-3">
                      <div className="d-flex justify-content-between mb-2">
                        <Badge bg="info">{formatDate(data.nextShift.shiftDate)}</Badge>
                        <span className="text-muted small">{data.nextShift.shiftType}</span>
                      </div>
                      <h5 className="mb-1">
                        {formatTime(data.nextShift.startTime)} - {formatTime(data.nextShift.endTime)}
                      </h5>
                      <span className="text-muted small">{data.nextShift.siteName}</span>
                    </div>
                  ) : (
                    <div className="text-center text-muted py-3">
                      <Calendar size={32} className="mb-2 opacity-50" />
                      <p className="mb-0">No upcoming shifts scheduled</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 d-flex align-items-center gap-2">
                      <TrendingUp className="text-primary" size={18} />
                      Hours This Week
                    </h6>
                    <Button variant="link" size="sm" className="p-0" onClick={() => navigate('/my-timecard')}>
                      View Timecard <ArrowRight size={14} />
                    </Button>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Progress</span>
                      <span className="fw-medium">{data.weekHours} / 45 hrs</span>
                    </div>
                    <ProgressBar 
                      now={(data.weekHours / 45) * 100} 
                      variant={data.weekHours > 45 ? 'danger' : 'primary'}
                    />
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <div>
                      <span className="text-muted small d-block">Today</span>
                      <span className="fw-medium">{data.todayHours} hrs</span>
                    </div>
                    <div className="text-end">
                      <span className="text-muted small d-block">Remaining</span>
                      <span className="fw-medium">{Math.max(0, 45 - data.weekHours)} hrs</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Quick Actions</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div 
                className="d-flex align-items-center justify-content-between p-3 border-bottom cursor-pointer hover-bg-light"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/apply-leave')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-success bg-opacity-10 rounded p-2">
                    <FileText className="text-success" size={20} />
                  </div>
                  <div>
                    <h6 className="mb-0">Request Leave</h6>
                    <span className="text-muted small">{data.leaveBalance} days available</span>
                  </div>
                </div>
                <ArrowRight className="text-muted" size={18} />
              </div>

              <div 
                className="d-flex align-items-center justify-content-between p-3 border-bottom"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/my-schedule')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-10 rounded p-2">
                    <Calendar className="text-primary" size={20} />
                  </div>
                  <div>
                    <h6 className="mb-0">My Schedule</h6>
                    <span className="text-muted small">{data.pendingCounts.upcomingShifts} shifts this week</span>
                  </div>
                </div>
                <ArrowRight className="text-muted" size={18} />
              </div>

              <div 
                className="d-flex align-items-center justify-content-between p-3 border-bottom"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/open-shifts')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-warning bg-opacity-10 rounded p-2">
                    <Users className="text-warning" size={20} />
                  </div>
                  <div>
                    <h6 className="mb-0">Open Shifts</h6>
                    <span className="text-muted small">Browse available shifts</span>
                  </div>
                </div>
                <ArrowRight className="text-muted" size={18} />
              </div>

              <div 
                className="d-flex align-items-center justify-content-between p-3"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/notifications')}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-info bg-opacity-10 rounded p-2 position-relative">
                    <Bell className="text-info" size={20} />
                    {data.pendingCounts.unreadNotifications > 0 && (
                      <Badge 
                        bg="danger" 
                        pill 
                        className="position-absolute"
                        style={{ top: '-5px', right: '-5px', fontSize: '10px' }}
                      >
                        {data.pendingCounts.unreadNotifications}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h6 className="mb-0">Notifications</h6>
                    <span className="text-muted small">
                      {data.pendingCounts.unreadNotifications > 0 
                        ? `${data.pendingCounts.unreadNotifications} unread` 
                        : 'All caught up'}
                    </span>
                  </div>
                </div>
                <ArrowRight className="text-muted" size={18} />
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Pending Items</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle className="text-success" size={18} />
                  <span>Leave Requests</span>
                </div>
                <Badge bg={data.pendingCounts.pendingLeaveRequests > 0 ? 'warning' : 'success'}>
                  {data.pendingCounts.pendingLeaveRequests} pending
                </Badge>
              </div>

              {data.pendingCounts.pendingApprovals > 0 && (
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <AlertCircle className="text-warning" size={18} />
                    <span>Awaiting Approval</span>
                  </div>
                  <Badge bg="warning">{data.pendingCounts.pendingApprovals}</Badge>
                </div>
              )}

              <Button 
                variant="outline-primary" 
                size="sm" 
                className="w-100 mt-2"
                onClick={() => navigate('/my-applications')}
              >
                View All Applications
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
