import { useState } from 'react';
import { Card, Button, Table, Form, Row, Col, ButtonGroup, InputGroup } from 'react-bootstrap';
import { Users, Calendar as CalendarIcon, AlertTriangle, Download, Filter, Search, X, Bookmark } from 'lucide-react';

export default function TeamTimecard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [perPage, setPerPage] = useState('20');

  const summaryStats = {
    totalEntries: 142,
    totalHours: 1248.50,
    overtimeHours: 87.25,
    avgHoursPerDay: 8.8
  };

  const setQuickFilter = (filter: string) => {
    const today = new Date();
    if (filter === 'today') {
      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (filter === 'this_week') {
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
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
    setSelectedRole('');
    setSelectedDepartment('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
  };

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
          <Button variant="outline-secondary">
            <CalendarIcon size={18} className="me-2" />
            Calendar View
          </Button>
          <Button variant="outline-warning">
            <AlertTriangle size={18} className="me-2" />
            Exceptions
          </Button>
          <Button variant="primary">
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
              <Col md={3}>
                <Form.Label>Employee</Form.Label>
                <Form.Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                  <option value="">All Employees</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Employee Role</Form.Label>
                <Form.Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  <option value="">All Roles</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Department</Form.Label>
                <Form.Select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                  <option value="">All Departments</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Entry Status</Form.Label>
                <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                  <option value="Exception">Exception</option>
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
                <Button variant="primary" className="me-2">
                  <Filter size={16} className="me-1" />
                  Apply Filters
                </Button>
                <Button variant="outline-secondary" className="me-2" onClick={clearAllFilters}>
                  <X size={16} className="me-1" />
                  Clear All
                </Button>
                <Button variant="outline-info">
                  <Bookmark size={16} className="me-1" />
                  Save Filter
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Time Entries Table */}
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Break Time</th>
                  <th>Total Hours</th>
                  <th>Overtime</th>
                  <th>Status</th>
                  <th>Approved By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={11} className="text-center text-muted py-4">
                    No time entries found for the selected filters
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
