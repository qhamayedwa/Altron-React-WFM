import { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Row, Col, Badge, Modal, Pagination } from 'react-bootstrap';
import { Clock, Filter, ArrowLeft, Eye, Edit, CreditCard, BarChart2, LogIn, LogOut, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface TimeEntry {
  id: number;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  total_hours: number;
  notes: string;
  clock_in_location: { lat: number; lng: number } | null;
  clock_out_location: { lat: number; lng: number } | null;
}

interface TimecardRecord {
  id: number;
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  employee_number: string;
  department: string;
  department_id: number;
  date: string;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  total_hours: number;
  hourly_rate: number;
  pay_code: string;
  amount_earned: number;
  status: string;
  notes: string;
  clock_in_location: { lat: number; lng: number } | null;
  clock_out_location: { lat: number; lng: number } | null;
  schedule?: {
    shift_type: string;
    start_time: string;
    end_time: string;
    duration_hours: number;
  };
  absence?: {
    leave_type: string;
    status: string;
  };
  time_entries?: TimeEntry[];
}

interface Employee {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

interface PayCodeSummary {
  pay_code?: string;
  rate?: number;
  employee_count?: number;
  total_hours: number;
  total_amount: number;
  user_id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  department_name?: string;
  department_id?: number;
}

interface Pagination {
  total: number;
  page: number;
  per_page: number;
  pages: number;
  has_prev: boolean;
  has_next: boolean;
}

export default function EmployeeTimecards() {
  const navigate = useNavigate();
  
  const [selectedUser, setSelectedUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summaryGroup, setSummaryGroup] = useState('pay_code');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [timecards, setTimecards] = useState<TimecardRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [summary, setSummary] = useState({
    total_records: 0,
    total_hours: 0,
    total_amount: 0,
    absences: 0
  });
  const [payCodeSummary, setPayCodeSummary] = useState<PayCodeSummary[]>([]);
  const [dateRange, setDateRange] = useState({ start_date: '', end_date: '' });
  const [loading, setLoading] = useState(false);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TimecardRecord | null>(null);

  useEffect(() => {
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
    
    loadEmployees();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadTimecards();
    }
  }, [startDate, endDate, selectedUser, currentPage, summaryGroup]);

  const loadEmployees = async () => {
    try {
      const response = await api.get('/users/team');
      setEmployees(response.data.users || response.data || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadTimecards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (selectedUser) params.append('user_id', selectedUser);
      params.append('page', currentPage.toString());
      params.append('per_page', '20');
      params.append('summary_group', summaryGroup);
      
      const response = await api.get(`/time-attendance/employee-timecards?${params.toString()}`);
      setTimecards(response.data.timecards || []);
      setPagination(response.data.pagination);
      setSummary(response.data.summary || { total_records: 0, total_hours: 0, total_amount: 0, absences: 0 });
      setPayCodeSummary(response.data.pay_code_summary || []);
      setDateRange(response.data.date_range || { start_date: '', end_date: '' });
    } catch (error) {
      console.error('Failed to load timecards:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-ZA', { weekday: 'short' });
    const fullDate = date.toLocaleDateString('en-ZA', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    return { dayName, fullDate };
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`;
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadTimecards();
  };

  const handleClearFilters = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
    setSelectedUser('');
    setCurrentPage(1);
  };

  const openDetailModal = (record: TimecardRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const renderPagination = () => {
    if (!pagination || pagination.pages <= 1) return null;
    
    const items = [];
    for (let i = 1; i <= pagination.pages; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === pagination.page}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    return (
      <Pagination className="justify-content-center mb-0">
        {pagination.has_prev && (
          <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} />
        )}
        {items}
        {pagination.has_next && (
          <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} />
        )}
      </Pagination>
    );
  };

  const getRowClass = (record: TimecardRecord) => {
    if (record.absence) return 'table-warning';
    if (!record.clock_in) return 'table-light';
    return '';
  };

  return (
    <div className="container-fluid">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Employee Time Cards</h2>
            <div className="btn-group">
              <Button variant="outline-secondary" onClick={() => navigate('/team-timecard')}>
                <Clock size={16} className="me-1" /> Team Time Card
              </Button>
              <Button variant="outline-primary" onClick={() => navigate('/time-attendance-admin')}>
                <ArrowLeft size={16} className="me-1" /> Back to Dashboard
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0"><Filter size={16} className="me-2" /> Filters</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleFilter}>
            <Row className="g-3">
              <Col md={3}>
                <Form.Label>Employee</Form.Label>
                <Form.Select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.username}{emp.full_name ? ` - ${emp.full_name}` : ''}
                    </option>
                  ))}
                </Form.Select>
              </Col>
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
              <Col md={3} className="d-flex align-items-end">
                <Button type="submit" variant="primary" className="me-2">Filter</Button>
                <Button type="button" variant="outline-secondary" onClick={handleClearFilters}>Clear</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <Card>
          <Card.Body className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading time card data...</p>
          </Card.Body>
        </Card>
      ) : timecards.length > 0 ? (
        <>
          {/* Time Card Summary */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0"><BarChart2 size={16} className="me-2" /> Summary</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-primary">{summary.total_records}</h5>
                    <small className="text-muted">Total Records</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-success">{summary.total_hours.toFixed(1)}h</h5>
                    <small className="text-muted">Total Hours</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-info">{formatCurrency(summary.total_amount)}</h5>
                    <small className="text-muted">Total Amount</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-warning">{summary.absences}</h5>
                    <small className="text-muted">Absences</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Time Cards Table */}
          <Card className="mb-4">
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover>
                  <thead className="table-dark">
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Schedule</th>
                      <th>Absence</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Pay Code</th>
                      <th>Hours Worked</th>
                      <th>Amount Earned</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timecards.map(record => {
                      const { dayName, fullDate } = formatDate(record.date);
                      return (
                        <tr key={record.id} className={getRowClass(record)}>
                          <td>
                            <div>
                              <strong>{record.username}</strong>
                              {record.full_name && (
                                <>
                                  <br /><small className="text-muted">{record.full_name}</small>
                                </>
                              )}
                              {record.department && (
                                <>
                                  <br /><Badge bg="secondary">{record.department}</Badge>
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            <strong>{dayName}</strong>
                            <br />{fullDate}
                          </td>
                          <td>
                            {record.schedule ? (
                              <div className="small">
                                <Badge bg="info">{record.schedule.shift_type || 'Custom'}</Badge>
                                {record.schedule.start_time && record.schedule.end_time && (
                                  <>
                                    <br />{record.schedule.start_time} - {record.schedule.end_time}
                                  </>
                                )}
                                {record.schedule.duration_hours && (
                                  <>
                                    <br /><small className="text-muted">{record.schedule.duration_hours.toFixed(1)}h scheduled</small>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted">No schedule</span>
                            )}
                          </td>
                          <td>
                            {record.absence ? (
                              <>
                                <Badge bg="warning">{record.absence.leave_type || 'Leave'}</Badge>
                                {record.absence.status && (
                                  <>
                                    <br /><small className="text-muted">{record.absence.status}</small>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {record.clock_in ? (
                              <span className="text-success">
                                <LogIn size={12} className="me-1" />
                                {formatTime(record.clock_in)}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {record.clock_out ? (
                              <span className="text-danger">
                                <LogOut size={12} className="me-1" />
                                {formatTime(record.clock_out)}
                              </span>
                            ) : record.clock_in ? (
                              <span className="text-warning">Still clocked in</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {record.pay_code ? (
                              <>
                                <Badge bg="primary">{record.pay_code}</Badge>
                                {record.hourly_rate > 0 && (
                                  <>
                                    <br /><small className="text-muted">{formatCurrency(record.hourly_rate)}/hr</small>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="text-muted">Not set</span>
                            )}
                          </td>
                          <td>
                            {record.total_hours > 0 ? (
                              <>
                                <strong className="text-success">{record.total_hours.toFixed(2)}h</strong>
                                {record.schedule && record.schedule.duration_hours && (
                                  <>
                                    {record.total_hours - record.schedule.duration_hours > 0.1 ? (
                                      <>
                                        <br /><small className="text-info">+{(record.total_hours - record.schedule.duration_hours).toFixed(1)}h overtime</small>
                                      </>
                                    ) : record.total_hours - record.schedule.duration_hours < -0.1 ? (
                                      <>
                                        <br /><small className="text-warning">{(record.total_hours - record.schedule.duration_hours).toFixed(1)}h under</small>
                                      </>
                                    ) : null}
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="text-muted">0h</span>
                            )}
                          </td>
                          <td>
                            {record.amount_earned > 0 ? (
                              <strong className="text-success">{formatCurrency(record.amount_earned)}</strong>
                            ) : (
                              <span className="text-muted">R 0.00</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => openDetailModal(record)}
                                title="View Details"
                              >
                                <Eye size={12} />
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/users/${record.user_id}/edit`)}
                                title="Edit Employee"
                              >
                                <Edit size={12} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {renderPagination()}
            </Card.Body>
          </Card>

          {/* Pay Code Summary Section */}
          <Card className="mt-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <CreditCard size={16} className="me-2" />
                Pay Code Summary
                {selectedUser ? (
                  ` - ${employees.find(e => e.id.toString() === selectedUser)?.full_name || 'Selected Employee'}`
                ) : (
                  ' - All Employees'
                )}
              </h5>
            </Card.Header>
            <Card.Body>
              {/* Summary Filters */}
              <Row className="mb-3">
                <Col md={6}>
                  <div className="d-flex align-items-end">
                    <div className="me-3">
                      <Form.Label className="small">Group by</Form.Label>
                      <Form.Select
                        size="sm"
                        value={summaryGroup}
                        onChange={(e) => setSummaryGroup(e.target.value)}
                      >
                        <option value="pay_code">Pay Code</option>
                        <option value="employee">Employee</option>
                        <option value="department">Department</option>
                      </Form.Select>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="text-end">
                  <small className="text-muted">
                    Period: {dateRange.start_date} to {dateRange.end_date}
                  </small>
                </Col>
              </Row>

              {/* Pay Code Summary Table */}
              {payCodeSummary.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead className="table-light">
                      {summaryGroup === 'pay_code' && (
                        <tr>
                          <th>Pay Code</th>
                          <th>Rate (R/hour)</th>
                          <th>Total Hours</th>
                          <th>Total Amount</th>
                          <th>Employees</th>
                        </tr>
                      )}
                      {summaryGroup === 'employee' && (
                        <tr>
                          <th>Employee</th>
                          <th>Department</th>
                          <th>Pay Code</th>
                          <th>Total Hours</th>
                          <th>Total Amount</th>
                        </tr>
                      )}
                      {summaryGroup === 'department' && (
                        <tr>
                          <th>Department</th>
                          <th>Employees</th>
                          <th>Total Hours</th>
                          <th>Total Amount</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {payCodeSummary.map((item, index) => (
                        <tr key={index}>
                          {summaryGroup === 'pay_code' && (
                            <>
                              <td>
                                <Badge bg="primary">{item.pay_code || 'Standard'}</Badge>
                              </td>
                              <td>{formatCurrency(item.rate || 0)}</td>
                              <td>{item.total_hours.toFixed(2)}h</td>
                              <td className="text-success fw-bold">{formatCurrency(item.total_amount)}</td>
                              <td>
                                <Badge bg="secondary">
                                  <Users size={12} className="me-1" />
                                  {item.employee_count}
                                </Badge>
                              </td>
                            </>
                          )}
                          {summaryGroup === 'employee' && (
                            <>
                              <td>
                                <strong>{item.username}</strong>
                                {item.first_name && item.last_name && (
                                  <>
                                    <br /><small className="text-muted">{item.first_name} {item.last_name}</small>
                                  </>
                                )}
                              </td>
                              <td>{item.department_name || '-'}</td>
                              <td><Badge bg="primary">{item.pay_code || 'Standard'}</Badge></td>
                              <td>{item.total_hours.toFixed(2)}h</td>
                              <td className="text-success fw-bold">{formatCurrency(item.total_amount)}</td>
                            </>
                          )}
                          {summaryGroup === 'department' && (
                            <>
                              <td>{item.department_name || 'Unassigned'}</td>
                              <td>
                                <Badge bg="secondary">
                                  <Users size={12} className="me-1" />
                                  {item.employee_count}
                                </Badge>
                              </td>
                              <td>{item.total_hours.toFixed(2)}h</td>
                              <td className="text-success fw-bold">{formatCurrency(item.total_amount)}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-primary">
                      <tr>
                        <td colSpan={summaryGroup === 'employee' ? 3 : 2} className="fw-bold">Total</td>
                        <td className="fw-bold">
                          {payCodeSummary.reduce((sum, item) => sum + item.total_hours, 0).toFixed(2)}h
                        </td>
                        <td className="fw-bold text-success">
                          {formatCurrency(payCodeSummary.reduce((sum, item) => sum + item.total_amount, 0))}
                        </td>
                        {summaryGroup !== 'employee' && <td></td>}
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted py-3">
                  No pay code summary data available for the selected period.
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <Clock size={48} className="text-muted mb-3" />
            <h5>No Time Card Data Found</h5>
            <p className="text-muted">
              No time card records found for the selected criteria. Try adjusting your filters or date range.
            </p>
            <Button variant="primary" onClick={handleClearFilters}>Reset Filters</Button>
          </Card.Body>
        </Card>
      )}

      {/* Time Entry Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Time Entries - {selectedRecord?.username} - {selectedRecord?.date ? new Date(selectedRecord.date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <div className="table-responsive">
              <Table size="sm">
                <thead>
                  <tr>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Duration</th>
                    <th>Location</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{selectedRecord.clock_in ? new Date(selectedRecord.clock_in).toLocaleTimeString('en-ZA') : '-'}</td>
                    <td>{selectedRecord.clock_out ? new Date(selectedRecord.clock_out).toLocaleTimeString('en-ZA') : 'Still active'}</td>
                    <td>
                      {selectedRecord.clock_in && selectedRecord.clock_out 
                        ? `${selectedRecord.total_hours.toFixed(2)}h`
                        : '-'
                      }
                    </td>
                    <td>
                      {selectedRecord.clock_in_location ? (
                        <small className="text-muted">
                          {selectedRecord.clock_in_location.lat.toFixed(6)}, {selectedRecord.clock_in_location.lng.toFixed(6)}
                        </small>
                      ) : '-'}
                    </td>
                    <td>
                      {selectedRecord.notes ? <small>{selectedRecord.notes}</small> : '-'}
                    </td>
                  </tr>
                </tbody>
              </Table>
              
              {/* Additional Details */}
              <hr />
              <Row>
                <Col md={6}>
                  <p><strong>Employee:</strong> {selectedRecord.full_name || selectedRecord.username}</p>
                  <p><strong>Department:</strong> {selectedRecord.department || 'Not assigned'}</p>
                  <p><strong>Pay Code:</strong> {selectedRecord.pay_code || 'Standard'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Hourly Rate:</strong> {formatCurrency(selectedRecord.hourly_rate)}</p>
                  <p><strong>Hours Worked:</strong> {selectedRecord.total_hours.toFixed(2)}h</p>
                  <p><strong>Amount Earned:</strong> {formatCurrency(selectedRecord.amount_earned)}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
