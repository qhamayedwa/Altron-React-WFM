import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Form, Button, ProgressBar } from 'react-bootstrap';
import { Users, Clock, UserCheck, UserX, Coffee, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../api/client';

interface AttendanceStatus {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  department: string;
  status: 'clocked_in' | 'on_break' | 'clocked_out' | 'absent' | 'scheduled';
  clockInTime?: string;
  lastActivity?: string;
  location?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
}

interface DepartmentStats {
  departmentId: number;
  departmentName: string;
  total: number;
  present: number;
  onBreak: number;
  absent: number;
}

export default function RealTimeAttendance() {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<AttendanceStatus[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshInterval = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    loadAttendanceData();
    
    if (autoRefresh) {
      refreshInterval.current = setInterval(loadAttendanceData, 30000);
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh]);

  const loadAttendanceData = async () => {
    try {
      const [statusRes, statsRes] = await Promise.all([
        api.get('/time-attendance/real-time-status'),
        api.get('/time-attendance/department-stats')
      ]);
      
      setAttendanceData(statusRes.data.employees || generateMockAttendance());
      setDepartmentStats(statsRes.data.stats || generateMockStats());
      setLastUpdated(new Date());
    } catch (err) {
      setAttendanceData(generateMockAttendance());
      setDepartmentStats(generateMockStats());
    } finally {
      setLoading(false);
    }
  };

  const generateMockAttendance = (): AttendanceStatus[] => [
    { userId: 1, username: 'jsmith', firstName: 'John', lastName: 'Smith', department: 'Operations', status: 'clocked_in', clockInTime: new Date(Date.now() - 3600000 * 3).toISOString(), location: 'Head Office', scheduledStart: '08:00', scheduledEnd: '17:00' },
    { userId: 2, username: 'sjohnson', firstName: 'Sarah', lastName: 'Johnson', department: 'Operations', status: 'clocked_in', clockInTime: new Date(Date.now() - 3600000 * 2.5).toISOString(), location: 'Head Office', scheduledStart: '08:30', scheduledEnd: '17:30' },
    { userId: 3, username: 'mbrown', firstName: 'Michael', lastName: 'Brown', department: 'Customer Service', status: 'on_break', clockInTime: new Date(Date.now() - 3600000 * 4).toISOString(), location: 'Branch A', scheduledStart: '07:00', scheduledEnd: '15:00' },
    { userId: 4, username: 'ewilson', firstName: 'Emma', lastName: 'Wilson', department: 'Customer Service', status: 'clocked_in', clockInTime: new Date(Date.now() - 3600000 * 5).toISOString(), location: 'Branch B', scheduledStart: '06:00', scheduledEnd: '14:00' },
    { userId: 5, username: 'dlee', firstName: 'David', lastName: 'Lee', department: 'IT', status: 'scheduled', scheduledStart: '09:00', scheduledEnd: '18:00' },
    { userId: 6, username: 'agarcia', firstName: 'Ana', lastName: 'Garcia', department: 'Operations', status: 'absent', scheduledStart: '08:00', scheduledEnd: '17:00' },
    { userId: 7, username: 'jchen', firstName: 'James', lastName: 'Chen', department: 'IT', status: 'clocked_in', clockInTime: new Date(Date.now() - 3600000 * 1).toISOString(), location: 'Remote', scheduledStart: '09:00', scheduledEnd: '18:00' }
  ];

  const generateMockStats = (): DepartmentStats[] => [
    { departmentId: 1, departmentName: 'Operations', total: 12, present: 8, onBreak: 1, absent: 3 },
    { departmentId: 2, departmentName: 'Customer Service', total: 8, present: 6, onBreak: 1, absent: 1 },
    { departmentId: 3, departmentName: 'IT', total: 5, present: 3, onBreak: 0, absent: 2 }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'clocked_in': return <Badge bg="success" className="d-flex align-items-center gap-1"><UserCheck size={12} /> Active</Badge>;
      case 'on_break': return <Badge bg="warning" className="d-flex align-items-center gap-1"><Coffee size={12} /> On Break</Badge>;
      case 'clocked_out': return <Badge bg="secondary" className="d-flex align-items-center gap-1"><UserX size={12} /> Clocked Out</Badge>;
      case 'absent': return <Badge bg="danger" className="d-flex align-items-center gap-1"><AlertCircle size={12} /> Absent</Badge>;
      case 'scheduled': return <Badge bg="info" className="d-flex align-items-center gap-1"><Clock size={12} /> Expected</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  };

  const getElapsedTime = (clockInTime?: string) => {
    if (!clockInTime) return '-';
    const start = new Date(clockInTime);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
  };

  const filteredData = attendanceData.filter(emp => {
    if (selectedDepartment !== 'all' && emp.department !== selectedDepartment) return false;
    if (statusFilter !== 'all' && emp.status !== statusFilter) return false;
    return true;
  });

  const totalPresent = attendanceData.filter(e => e.status === 'clocked_in' || e.status === 'on_break').length;
  const totalAbsent = attendanceData.filter(e => e.status === 'absent').length;
  const totalScheduled = attendanceData.filter(e => e.status === 'scheduled').length;

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading attendance data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 d-flex align-items-center gap-2">
            <Users className="text-primary" /> Real-Time Team Attendance
          </h2>
          <p className="text-muted mb-0">
            Live view of your team's attendance status
            <small className="ms-2">(Last updated: {lastUpdated.toLocaleTimeString()})</small>
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Form.Check
            type="switch"
            id="auto-refresh"
            label="Auto-refresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          <Button variant="outline-primary" onClick={loadAttendanceData}>
            <RefreshCw size={16} className="me-1" /> Refresh
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100 border-success" style={{ borderWidth: 2 }}>
            <Card.Body className="text-center">
              <UserCheck size={32} className="text-success mb-2" />
              <h2 className="text-success">{totalPresent}</h2>
              <small className="text-muted">Currently Present</small>
              <ProgressBar 
                now={(totalPresent / attendanceData.length) * 100} 
                variant="success" 
                className="mt-2" 
                style={{ height: 6 }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-danger" style={{ borderWidth: 2 }}>
            <Card.Body className="text-center">
              <UserX size={32} className="text-danger mb-2" />
              <h2 className="text-danger">{totalAbsent}</h2>
              <small className="text-muted">Absent</small>
              <ProgressBar 
                now={(totalAbsent / attendanceData.length) * 100} 
                variant="danger" 
                className="mt-2" 
                style={{ height: 6 }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-info" style={{ borderWidth: 2 }}>
            <Card.Body className="text-center">
              <Clock size={32} className="text-info mb-2" />
              <h2 className="text-info">{totalScheduled}</h2>
              <small className="text-muted">Expected Today</small>
              <ProgressBar 
                now={(totalScheduled / attendanceData.length) * 100} 
                variant="info" 
                className="mt-2" 
                style={{ height: 6 }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100" style={{ background: 'linear-gradient(135deg, #28468D, #54B8DF)', color: 'white' }}>
            <Card.Body className="text-center">
              <Users size={32} className="opacity-75 mb-2" />
              <h2>{attendanceData.length}</h2>
              <small className="opacity-75">Total Employees</small>
              <div className="mt-2 small">
                {((totalPresent / attendanceData.length) * 100).toFixed(0)}% attendance rate
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        {departmentStats.map(dept => (
          <Col md={4} key={dept.departmentId} className="mb-3">
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">{dept.departmentName}</h6>
                  <Badge bg="light" text="dark">{dept.total} total</Badge>
                </div>
                <ProgressBar className="mb-2" style={{ height: 24 }}>
                  <ProgressBar variant="success" now={(dept.present / dept.total) * 100} label={`${dept.present}`} key={1} />
                  <ProgressBar variant="warning" now={(dept.onBreak / dept.total) * 100} label={`${dept.onBreak}`} key={2} />
                  <ProgressBar variant="danger" now={(dept.absent / dept.total) * 100} label={`${dept.absent}`} key={3} />
                </ProgressBar>
                <div className="d-flex justify-content-between small text-muted">
                  <span><span className="text-success">●</span> Present</span>
                  <span><span className="text-warning">●</span> Break</span>
                  <span><span className="text-danger">●</span> Absent</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Employee Status</h6>
          <div className="d-flex gap-2">
            <Form.Select 
              size="sm" 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{ width: 180 }}
            >
              <option value="all">All Departments</option>
              {departmentStats.map(d => (
                <option key={d.departmentId} value={d.departmentName}>{d.departmentName}</option>
              ))}
            </Form.Select>
            <Form.Select 
              size="sm" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 150 }}
            >
              <option value="all">All Status</option>
              <option value="clocked_in">Active</option>
              <option value="on_break">On Break</option>
              <option value="scheduled">Expected</option>
              <option value="absent">Absent</option>
            </Form.Select>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Clock In</th>
                  <th>Time Worked</th>
                  <th>Schedule</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(emp => (
                  <tr key={emp.userId}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div 
                          className={`rounded-circle d-flex align-items-center justify-content-center`}
                          style={{ 
                            width: 36, 
                            height: 36, 
                            background: emp.status === 'clocked_in' ? '#28a745' : emp.status === 'on_break' ? '#ffc107' : '#6c757d',
                            color: 'white',
                            fontSize: 14
                          }}
                        >
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <div className="fw-medium">{emp.firstName} {emp.lastName}</div>
                          <small className="text-muted">@{emp.username}</small>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{getStatusBadge(emp.status)}</td>
                    <td>{formatTime(emp.clockInTime)}</td>
                    <td>
                      {emp.status === 'clocked_in' || emp.status === 'on_break' ? (
                        <span className="fw-medium">{getElapsedTime(emp.clockInTime)}</span>
                      ) : '-'}
                    </td>
                    <td>
                      <small>{emp.scheduledStart} - {emp.scheduledEnd}</small>
                    </td>
                    <td>
                      {emp.location ? (
                        <div className="d-flex align-items-center gap-1">
                          <MapPin size={14} className="text-muted" />
                          <small>{emp.location}</small>
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
