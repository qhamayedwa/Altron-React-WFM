import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Form } from 'react-bootstrap';
import { Calendar as CalendarIcon, Users } from 'lucide-react';
import { api } from '../lib/api';

export default function LeaveCalendarPage() {
  const [leaveApplications, setLeaveApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState({ department_id: '', status: 'Approved' });

  useEffect(() => {
    fetchLeaveApplications();
  }, [selectedMonth, selectedYear, filter]);

  const fetchLeaveApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);

      const response = await api.get('/leave/team-applications', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: filter.status,
        },
      });

      setLeaveApplications(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch leave applications');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(selectedYear, selectedMonth, 1).getDay();
  };

  const isLeaveOnDate = (date: number) => {
    const currentDate = new Date(selectedYear, selectedMonth, date);
    return leaveApplications.filter((app) => {
      const start = new Date(app.start_date);
      const end = new Date(app.end_date);
      return currentDate >= start && currentDate <= end;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const leavesOnDate = isLeaveOnDate(day);
      days.push(
        <div key={day} className="calendar-day">
          <div className="day-number">{day}</div>
          {leavesOnDate.length > 0 && (
            <div className="leave-indicators">
              {leavesOnDate.slice(0, 3).map((leave, idx) => (
                <Badge
                  key={idx}
                  bg="primary"
                  className="leave-badge"
                  title={`${leave.user?.username} - ${leave.leave_type?.name}`}
                >
                  {leave.user?.username?.substring(0, 2).toUpperCase()}
                </Badge>
              ))}
              {leavesOnDate.length > 3 && (
                <Badge bg="secondary" className="leave-badge">
                  +{leavesOnDate.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1"><CalendarIcon className="me-2" size={28} />Leave Calendar</h2>
          <p className="text-muted mb-0">Visual calendar showing employee leave across the organization</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Month</Form.Label>
            <Form.Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {monthNames.map((month, idx) => (
                <option key={idx} value={idx}>{month}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Year</Form.Label>
            <Form.Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <div>
            <Badge bg="info" className="me-2"><Users size={16} className="me-1" />{leaveApplications.length} leaves</Badge>
          </div>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <>
              <div className="calendar-header">
                <div className="calendar-day-name">Sun</div>
                <div className="calendar-day-name">Mon</div>
                <div className="calendar-day-name">Tue</div>
                <div className="calendar-day-name">Wed</div>
                <div className="calendar-day-name">Thu</div>
                <div className="calendar-day-name">Fri</div>
                <div className="calendar-day-name">Sat</div>
              </div>
              <div className="calendar-grid">
                {renderCalendar()}
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      <style>{`
        .calendar-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
          margin-bottom: 10px;
        }
        .calendar-day-name {
          text-align: center;
          font-weight: bold;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
        }
        .calendar-day {
          min-height: 80px;
          padding: 5px;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          position: relative;
        }
        .calendar-day.empty {
          background: #f8f9fa;
        }
        .day-number {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .leave-indicators {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
        }
        .leave-badge {
          font-size: 0.7rem;
          padding: 2px 4px;
          margin: 1px;
        }
      `}</style>
    </Container>
  );
}
