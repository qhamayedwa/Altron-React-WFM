import { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Row, Col, ButtonGroup, Modal, Badge } from 'react-bootstrap';
import { Calendar, List, Printer, Filter, X, ChevronLeft, ChevronRight, Clock, MessageCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface TimeEntry {
  id: number;
  user_id: number;
  clock_in_time: string;
  clock_out_time: string | null;
  total_hours: number;
  overtime_hours: number;
  status: string;
  notes: string;
  approved: boolean;
}

interface UserCalendarData {
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string;
  };
  entries: Record<string, TimeEntry[]>;
  weekly_total: number;
  overtime_hours: number;
}

interface Department {
  id: number;
  name: string;
}

export default function TeamCalendar() {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });
  
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [calendarData, setCalendarData] = useState<Record<string, UserCalendarData>>({});
  const [loading, setLoading] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);

  const getWeekDates = () => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const weekEnd = weekDates[6];

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadCalendarData();
  }, [weekStart, selectedDepartment]);

  const loadDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments || response.data || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0]
      };
      if (selectedDepartment) params.departmentId = selectedDepartment;

      const response = await api.get('/time-attendance/team-entries', { params });
      const entries = response.data.timeEntries || response.data.entries || response.data || [];

      const groupedData: Record<string, UserCalendarData> = {};

      entries.forEach((entry: any) => {
        const userId = entry.userId || entry.user_id;
        const clockInDate = new Date(entry.clockInTime || entry.clock_in_time).toISOString().split('T')[0];
        
        if (!groupedData[userId]) {
          groupedData[userId] = {
            user: {
              id: userId,
              username: entry.username || '',
              first_name: entry.employeeName?.split(' ')[0] || entry.first_name || '',
              last_name: entry.employeeName?.split(' ').slice(1).join(' ') || entry.last_name || '',
              email: entry.email || '',
              department: entry.department || entry.department_name || ''
            },
            entries: {},
            weekly_total: 0,
            overtime_hours: 0
          };
        }

        if (!groupedData[userId].entries[clockInDate]) {
          groupedData[userId].entries[clockInDate] = [];
        }

        const hours = entry.totalHours || entry.total_hours || 0;
        const overtime = hours > 8 ? hours - 8 : 0;

        groupedData[userId].entries[clockInDate].push({
          id: entry.id,
          user_id: userId,
          clock_in_time: entry.clockInTime || entry.clock_in_time,
          clock_out_time: entry.clockOutTime || entry.clock_out_time,
          total_hours: hours,
          overtime_hours: overtime,
          status: entry.status || 'pending',
          notes: entry.notes || '',
          approved: entry.status === 'approved'
        });

        groupedData[userId].weekly_total += hours;
        groupedData[userId].overtime_hours += overtime;
      });

      setCalendarData(groupedData);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() + (direction === 'prev' ? -7 : 7));
    setWeekStart(newDate);
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const formatHoursMinutes = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const formatDateHeader = (date: Date) => {
    return {
      day: date.toLocaleDateString('en-ZA', { weekday: 'short' }),
      date: date.toLocaleDateString('en-ZA', { month: '2-digit', day: '2-digit' })
    };
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const getDailyTotal = (entries: TimeEntry[]) => {
    return entries.reduce((sum, e) => sum + (e.total_hours || 0), 0);
  };

  const showEntryDetails = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowEntryModal(true);
  };

  const printCalendar = () => {
    window.print();
  };

  const clearFilters = () => {
    setSelectedDepartment('');
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    setWeekStart(new Date(today.setDate(diff)));
  };

  const summaryStats = {
    totalEmployees: Object.keys(calendarData).length,
    totalHours: Object.values(calendarData).reduce((sum, u) => sum + u.weekly_total, 0),
    overtimeHours: Object.values(calendarData).reduce((sum, u) => sum + u.overtime_hours, 0),
    avgHours: Object.keys(calendarData).length > 0 
      ? Object.values(calendarData).reduce((sum, u) => sum + u.weekly_total, 0) / Object.keys(calendarData).length 
      : 0
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <Calendar size={28} className="me-2" />
            Team Time Card Calendar
          </h2>
          <p className="text-muted mb-0">
            Week of {weekStart.toLocaleDateString('en-ZA', { month: 'long', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-ZA', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <ButtonGroup>
          <Button variant="outline-secondary" onClick={() => navigate('/team-timecard')}>
            <List size={18} className="me-2" />
            List View
          </Button>
          <Button variant="primary" onClick={printCalendar}>
            <Printer size={18} className="me-2" />
            Print
          </Button>
        </ButtonGroup>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Form className="row g-3 align-items-end">
            <Col md={3}>
              <Form.Label>Week Starting</Form.Label>
              <Form.Control 
                type="date" 
                value={weekStart.toISOString().split('T')[0]}
                onChange={(e) => setWeekStart(new Date(e.target.value))}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Department</Form.Label>
              <Form.Select 
                value={selectedDepartment} 
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button variant="primary" onClick={loadCalendarData} className="me-2">
                <Filter size={16} className="me-1" />
                Apply Filters
              </Button>
              <Button variant="outline-secondary" onClick={clearFilters}>
                <X size={16} className="me-1" />
                Clear
              </Button>
            </Col>
            <Col md={3} className="text-end">
              <ButtonGroup>
                <Button variant="outline-primary" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft size={18} /> Previous Week
                </Button>
                <Button variant="outline-primary" onClick={() => navigateWeek('next')}>
                  Next Week <ChevronRight size={18} />
                </Button>
              </ButtonGroup>
            </Col>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table bordered className="mb-0 calendar-table" id="calendar-table">
                <thead className="table-dark">
                  <tr>
                    <th style={{ width: '200px', minWidth: '200px' }}>Employee</th>
                    {weekDates.map(date => {
                      const header = formatDateHeader(date);
                      return (
                        <th key={date.toISOString()} className="text-center" style={{ width: '140px', minWidth: '140px' }}>
                          <div className="fw-bold">{header.day}</div>
                          <div className="small">{header.date}</div>
                        </th>
                      );
                    })}
                    <th className="text-center" style={{ width: '120px', minWidth: '120px', backgroundColor: '#f8f9fa', color: '#212529' }}>
                      Weekly Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(calendarData).length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-5">
                        <Users size={32} className="text-muted mb-2" />
                        <div className="text-muted">No employees found for the selected criteria</div>
                      </td>
                    </tr>
                  ) : (
                    Object.entries(calendarData).map(([userId, userData]) => (
                      <tr key={userId}>
                        <td className="employee-info" style={{ borderRight: '2px solid #dee2e6', padding: '1rem' }}>
                          <div className="d-flex align-items-center">
                            <div 
                              className="me-3 d-flex align-items-center justify-content-center text-white fw-bold"
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #28468D 0%, #54B8DF 100%)',
                                fontSize: '1.2rem'
                              }}
                            >
                              {getInitial(userData.user.username)}
                            </div>
                            <div>
                              <div className="fw-bold">{userData.user.username}</div>
                              <div className="text-muted small">
                                {userData.user.first_name} {userData.user.last_name}
                              </div>
                              {userData.user.department && (
                                <div className="text-muted small">{userData.user.department}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {weekDates.map(date => {
                          const dateKey = date.toISOString().split('T')[0];
                          const dayEntries = userData.entries[dateKey] || [];
                          const dailyTotal = getDailyTotal(dayEntries);

                          return (
                            <td key={dateKey} className="time-cell" style={{ padding: '0.5rem', verticalAlign: 'top' }}>
                              {dayEntries.length > 0 ? (
                                <>
                                  {dayEntries.map(entry => (
                                    <div 
                                      key={entry.id}
                                      className="time-entry"
                                      onClick={() => showEntryDetails(entry)}
                                      style={{
                                        background: '#f8f9fa',
                                        border: '1px solid #dee2e6',
                                        borderLeft: `4px solid ${entry.approved ? '#28a745' : '#ffc107'}`,
                                        borderRadius: '6px',
                                        padding: '0.5rem',
                                        marginBottom: '0.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      <div style={{ fontSize: '0.85rem', color: '#495057' }}>
                                        <Clock size={12} className="me-1" />
                                        {formatTime(entry.clock_in_time)}
                                        {entry.clock_out_time ? (
                                          <> - {formatTime(entry.clock_out_time)}</>
                                        ) : (
                                          <> - <span className="text-warning">Open</span></>
                                        )}
                                      </div>
                                      {entry.total_hours > 0 && (
                                        <div style={{ fontSize: '0.9rem', color: '#007bff' }}>
                                          <strong>{formatHoursMinutes(entry.total_hours)}</strong>
                                          {entry.overtime_hours > 0 && (
                                            <Badge bg="warning" className="ms-2" style={{ fontSize: '0.7rem' }}>
                                              +{formatHoursMinutes(entry.overtime_hours)} OT
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                      {entry.notes && (
                                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.25rem' }}>
                                          <MessageCircle size={10} className="me-1" />
                                          {entry.notes.length > 30 ? entry.notes.substring(0, 30) + '...' : entry.notes}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {dailyTotal > 0 && (
                                    <div style={{ 
                                      marginTop: '0.5rem', 
                                      paddingTop: '0.5rem', 
                                      borderTop: '1px solid #dee2e6',
                                      fontSize: '0.9rem',
                                      textAlign: 'center'
                                    }}>
                                      Total: <strong>{formatHoursMinutes(dailyTotal)}</strong>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-center text-muted py-3" style={{ fontSize: '0.85rem' }}>
                                  No entries
                                </div>
                              )}
                            </td>
                          );
                        })}

                        <td className="text-center" style={{ backgroundColor: '#f8f9fa', borderLeft: '2px solid #dee2e6', padding: '1rem' }}>
                          <div>
                            <strong className="h5" style={{ color: '#28468D' }}>
                              {formatHoursMinutes(userData.weekly_total)}
                            </strong>
                            {userData.overtime_hours > 0 && (
                              <div className="mt-2">
                                <Badge bg="warning">{formatHoursMinutes(userData.overtime_hours)} OT</Badge>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Row>
        <Col md={3}>
          <Card className="text-white" style={{ backgroundColor: '#28468D' }}>
            <Card.Body className="text-center">
              <h3>{summaryStats.totalEmployees}</h3>
              <p className="mb-0">Employees</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-success text-white">
            <Card.Body className="text-center">
              <h3>{summaryStats.totalHours.toFixed(1)}</h3>
              <p className="mb-0">Total Hours</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-warning text-white">
            <Card.Body className="text-center">
              <h3>{summaryStats.overtimeHours.toFixed(1)}</h3>
              <p className="mb-0">Overtime Hours</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white" style={{ backgroundColor: '#54B8DF' }}>
            <Card.Body className="text-center">
              <h3>{summaryStats.avgHours.toFixed(1)}</h3>
              <p className="mb-0">Avg Hours/Employee</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showEntryModal} onHide={() => setShowEntryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Time Entry Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEntry && (
            <>
              <Row className="mb-2">
                <Col xs={6}><strong>Time:</strong></Col>
                <Col xs={6}>
                  {formatTime(selectedEntry.clock_in_time)}
                  {selectedEntry.clock_out_time ? ` - ${formatTime(selectedEntry.clock_out_time)}` : ' - Open'}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col xs={6}><strong>Total Hours:</strong></Col>
                <Col xs={6}>{formatHoursMinutes(selectedEntry.total_hours)}</Col>
              </Row>
              {selectedEntry.overtime_hours > 0 && (
                <Row className="mb-2">
                  <Col xs={6}><strong>Overtime:</strong></Col>
                  <Col xs={6}>{formatHoursMinutes(selectedEntry.overtime_hours)}</Col>
                </Row>
              )}
              <Row className="mb-2">
                <Col xs={6}><strong>Notes:</strong></Col>
                <Col xs={6}>{selectedEntry.notes || 'No notes'}</Col>
              </Row>
              <Row className="mb-2">
                <Col xs={6}><strong>Status:</strong></Col>
                <Col xs={6}>
                  <Badge bg={selectedEntry.approved ? 'success' : 'warning'}>
                    {selectedEntry.approved ? 'Approved' : 'Pending Approval'}
                  </Badge>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEntryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        @media print {
          .btn, .card-body form, .modal, nav, .sidebar { display: none !important; }
          .calendar-table { font-size: 11px; }
          .time-entry { margin-bottom: 3px; }
        }
        
        .time-entry:hover {
          background: #e9ecef !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .time-cell:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}
