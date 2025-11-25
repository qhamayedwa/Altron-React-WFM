import { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Row, Col, ButtonGroup, InputGroup, Modal, Badge } from 'react-bootstrap';
import { Users, Calendar as CalendarIcon, AlertTriangle, Download, Filter, Search, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface TimeEntry {
  id: number;
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  department: string;
  clock_in_time: string;
  clock_out_time: string | null;
  total_hours: number;
  break_minutes: number;
  status: string;
  approved_by: string | null;
  notes: string;
}

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export default function TeamTimecard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [perPage, setPerPage] = useState('20');
  
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showExceptionsModal, setShowExceptionsModal] = useState(false);
  const [exceptions, setExceptions] = useState<TimeEntry[]>([]);

  const [summaryStats, setSummaryStats] = useState({
    totalEntries: 0,
    totalHours: 0,
    overtimeHours: 0,
    avgHoursPerDay: 0
  });

  useEffect(() => {
    // Set default date range (last 7 days)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
    
    loadDepartments();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadTimeEntries();
    }
  }, [startDate, endDate, selectedUser, selectedDepartment, selectedStatus]);

  const loadDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments || response.data || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await api.get('/users/team');
      setEmployees(response.data.users || response.data || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadTimeEntries = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        startDate: startDate,
        endDate: endDate
      };
      if (selectedUser) params.userId = selectedUser;
      if (selectedDepartment) params.departmentId = selectedDepartment;
      if (selectedStatus) params.status = selectedStatus;

      const response = await api.get('/time-attendance/team-entries', { params });
      const rawEntries = response.data.timeEntries || response.data.entries || response.data || [];
      
      // Map the response to our TimeEntry format
      const entries: TimeEntry[] = rawEntries.map((e: any) => ({
        id: e.id,
        user_id: e.userId || e.user_id,
        username: e.username || '',
        first_name: e.employeeName?.split(' ')[0] || e.first_name || '',
        last_name: e.employeeName?.split(' ').slice(1).join(' ') || e.last_name || '',
        employee_number: e.employeeNumber || e.employee_number || '',
        department: e.department || e.department_name || '',
        clock_in_time: e.clockInTime || e.clock_in_time,
        clock_out_time: e.clockOutTime || e.clock_out_time,
        total_hours: e.totalHours || e.total_hours || 0,
        break_minutes: e.breakMinutes || e.break_minutes || 0,
        status: e.status || '',
        approved_by: e.approvedBy || e.approved_by || null,
        notes: e.notes || ''
      }));
      setTimeEntries(entries);

      // Calculate summary stats
      const totalHours = entries.reduce((sum: number, e: TimeEntry) => sum + (e.total_hours || 0), 0);
      const overtimeHours = entries.reduce((sum: number, e: TimeEntry) => {
        const hours = e.total_hours || 0;
        return sum + (hours > 8 ? hours - 8 : 0);
      }, 0);
      const uniqueDays = new Set(entries.map((e: TimeEntry) => 
        new Date(e.clock_in_time).toDateString()
      )).size;

      setSummaryStats({
        totalEntries: entries.length,
        totalHours: totalHours,
        overtimeHours: overtimeHours,
        avgHoursPerDay: uniqueDays > 0 ? totalHours / uniqueDays : 0
      });

      // Find exceptions (missing clock out, overtime, etc.)
      const exceptionEntries = entries.filter((e: TimeEntry) => 
        !e.clock_out_time || e.total_hours > 10 || e.status === 'exception'
      );
      setExceptions(exceptionEntries);

    } catch (error) {
      console.error('Failed to load time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const setQuickFilter = (filter: string) => {
    const today = new Date();
    if (filter === 'today') {
      const dateStr = today.toISOString().split('T')[0];
      setStartDate(dateStr);
      setEndDate(dateStr);
    } else if (filter === 'this_week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      setStartDate(startOfWeek.toISOString().split('T')[0]);
      setEndDate(endOfWeek.toISOString().split('T')[0]);
    } else if (filter === 'this_month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(startOfMonth.toISOString().split('T')[0]);
      setEndDate(endOfMonth.toISOString().split('T')[0]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedUser('');
    setSelectedDepartment('');
    setSelectedStatus('');
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const exportToCSV = async () => {
    try {
      const response = await api.get('/time-attendance/team-entries/export', {
        params: { 
          startDate: startDate, 
          endDate: endDate,
          userId: selectedUser || undefined,
          departmentId: selectedDepartment || undefined,
          status: selectedStatus || undefined
        },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `team-timecard-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export timecard data. Please try again.');
    }
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (entry: TimeEntry) => {
    if (!entry.clock_out_time) {
      return <Badge bg="warning">Open</Badge>;
    }
    if (entry.status === 'approved') {
      return <Badge bg="success">Approved</Badge>;
    }
    if (entry.status === 'pending') {
      return <Badge bg="info">Pending</Badge>;
    }
    if (entry.status === 'exception') {
      return <Badge bg="danger">Exception</Badge>;
    }
    return <Badge bg="secondary">{entry.status}</Badge>;
  };

  // Filter entries by search query
  const filteredEntries = timeEntries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.username?.toLowerCase().includes(query) ||
      entry.first_name?.toLowerCase().includes(query) ||
      entry.last_name?.toLowerCase().includes(query) ||
      entry.employee_number?.toLowerCase().includes(query) ||
      entry.notes?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="py-4">
      {/* Header with Statistics */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <Users size={28} className="me-2" />
            Team Time Card Management
          </h2>
          <p className="text-muted mb-0">
            {summaryStats.totalEntries} entries | {summaryStats.totalHours.toFixed(2)} total hours | {summaryStats.overtimeHours.toFixed(2)} overtime hours
          </p>
        </div>
        <ButtonGroup>
          <Button variant="outline-secondary" onClick={() => navigate('/team-calendar')}>
            <CalendarIcon size={18} className="me-2" />
            Calendar View
          </Button>
          <Button 
            variant="outline-warning" 
            onClick={() => setShowExceptionsModal(true)}
          >
            <AlertTriangle size={18} className="me-2" />
            Exceptions {exceptions.length > 0 && <Badge bg="danger" className="ms-1">{exceptions.length}</Badge>}
          </Button>
          <Button variant="primary" onClick={exportToCSV}>
            <Download size={18} className="me-2" />
            Export
          </Button>
        </ButtonGroup>
      </div>

      {/* Summary Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary">{summaryStats.totalEntries}</h4>
              <small className="text-muted">Total Entries</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">{summaryStats.totalHours.toFixed(2)}</h4>
              <small className="text-muted">Total Hours</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning">{summaryStats.overtimeHours.toFixed(2)}</h4>
              <small className="text-muted">Overtime Hours</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-info">{summaryStats.avgHoursPerDay.toFixed(2)}</h4>
              <small className="text-muted">Avg Hours/Day</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Enhanced Search and Filters */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <Filter size={18} className="me-2" />
            Search & Filter Time Cards
          </h5>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* Quick Filter Buttons */}
            <div className="mb-3">
              <Form.Label>Quick Filters</Form.Label>
              <ButtonGroup>
                <Button variant="outline-primary" size="sm" onClick={() => setQuickFilter('today')}>
                  Today
                </Button>
                <Button variant="outline-primary" size="sm" onClick={() => setQuickFilter('this_week')}>
                  This Week
                </Button>
                <Button variant="outline-primary" size="sm" onClick={() => setQuickFilter('this_month')}>
                  This Month
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </ButtonGroup>
            </div>

            {/* Search Bar */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Label>Search Employees</Form.Label>
                <InputGroup>
                  <InputGroup.Text><Search size={18} /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, username, email, or notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Label>Results Per Page</Form.Label>
                <Form.Select value={perPage} onChange={(e) => setPerPage(e.target.value)}>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Form.Select>
              </Col>
            </Row>

            {/* Filter Row 1 */}
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Label>Employee</Form.Label>
                <Form.Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                  <option value="">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.username})
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Department</Form.Label>
                <Form.Select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Entry Status</Form.Label>
                <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Col>
            </Row>

            {/* Filter Row 2 - Date Range */}
            <Row className="g-3 mb-3">
              <Col md={3}>
                <Form.Label>Start Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Label>End Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <Button variant="primary" className="me-2" onClick={loadTimeEntries}>
                  <Filter size={16} className="me-1" />
                  Apply Filters
                </Button>
                <Button variant="outline-secondary" className="me-2" onClick={clearAllFilters}>
                  <X size={16} className="me-1" />
                  Clear All
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Time Entries Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Break</th>
                    <th>Total Hours</th>
                    <th>Overtime</th>
                    <th>Status</th>
                    <th>Approved By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center text-muted py-4">
                        No time entries found for the selected filters
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.slice(0, parseInt(perPage)).map(entry => (
                      <tr key={entry.id}>
                        <td>
                          <strong>{entry.first_name} {entry.last_name}</strong>
                          <br />
                          <small className="text-muted">{entry.employee_number || entry.username}</small>
                        </td>
                        <td>{entry.department || '-'}</td>
                        <td>{formatDate(entry.clock_in_time)}</td>
                        <td>{formatTime(entry.clock_in_time)}</td>
                        <td>{formatTime(entry.clock_out_time)}</td>
                        <td>{entry.break_minutes || 0} min</td>
                        <td>{(entry.total_hours || 0).toFixed(2)} hrs</td>
                        <td>
                          {entry.total_hours > 8 ? (
                            <span className="text-warning">{(entry.total_hours - 8).toFixed(2)} hrs</span>
                          ) : '-'}
                        </td>
                        <td>{getStatusBadge(entry)}</td>
                        <td>{entry.approved_by || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Exceptions Modal */}
      <Modal show={showExceptionsModal} onHide={() => setShowExceptionsModal(false)} size="lg">
        <Modal.Header closeButton style={{ backgroundColor: '#ffc107', color: '#333' }}>
          <Modal.Title>
            <AlertTriangle size={24} className="me-2" />
            Time Entry Exceptions
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {exceptions.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-success mb-3" />
              <h5>No Exceptions Found</h5>
              <p className="text-muted">All time entries are complete and within normal parameters.</p>
            </div>
          ) : (
            <>
              <div className="alert alert-warning">
                <AlertTriangle size={18} className="me-2" />
                Found {exceptions.length} entries that require attention
              </div>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Issue</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {exceptions.map(entry => (
                    <tr key={entry.id}>
                      <td>{entry.first_name} {entry.last_name}</td>
                      <td>{formatDate(entry.clock_in_time)}</td>
                      <td>
                        {!entry.clock_out_time && <Badge bg="warning">Missing Clock Out</Badge>}
                        {entry.total_hours > 10 && <Badge bg="danger">Excessive Hours</Badge>}
                        {entry.status === 'exception' && <Badge bg="secondary">Flagged</Badge>}
                      </td>
                      <td>
                        Clock In: {formatTime(entry.clock_in_time)}
                        {entry.clock_out_time && ` | Clock Out: ${formatTime(entry.clock_out_time)}`}
                        {entry.total_hours > 0 && ` | ${entry.total_hours.toFixed(2)} hrs`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExceptionsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
