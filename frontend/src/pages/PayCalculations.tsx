import { useState, useEffect } from 'react';
import { Card, Button, Form, Table, Row, Col, Badge } from 'react-bootstrap';
import { FileText, ArrowLeft, Plus, Filter, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface Employee {
  id: number;
  full_name: string;
  username: string;
}

interface Calculation {
  id: number;
  employee: Employee;
  pay_period_start: string;
  pay_period_end: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  total_allowances: number;
  calculated_at: string;
  calculated_by: {
    username: string;
  };
}

interface PaginatedCalculations {
  items: Calculation[];
  page: number;
  pages: number;
  per_page: number;
  total: number;
  has_prev: boolean;
  has_next: boolean;
  prev_num: number | null;
  next_num: number | null;
}

export default function PayCalculations() {
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState<PaginatedCalculations>({
    items: [],
    page: 1,
    pages: 1,
    per_page: 20,
    total: 0,
    has_prev: false,
    has_next: false,
    prev_num: null,
    next_num: null
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadCalculations();
  }, [currentPage, employeeFilter]);

  const loadEmployees = async () => {
    try {
      const response = await api.get('/users');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const loadCalculations = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString()
      });
      
      if (employeeFilter) {
        params.append('employee_id', employeeFilter);
      }

      const response = await api.get(`/pay-rules/calculations?${params}`);
      
      if (Array.isArray(response.data)) {
        setCalculations({
          items: response.data,
          page: 1,
          pages: 1,
          per_page: response.data.length,
          total: response.data.length,
          has_prev: false,
          has_next: false,
          prev_num: null,
          next_num: null
        });
      } else if (response.data && typeof response.data === 'object') {
        setCalculations({
          items: response.data.items || [],
          page: response.data.page || 1,
          pages: response.data.pages || 1,
          per_page: response.data.per_page || 20,
          total: response.data.total || 0,
          has_prev: response.data.has_prev || false,
          has_next: response.data.has_next || false,
          prev_num: response.data.prev_num || null,
          next_num: response.data.next_num || null
        });
      }
    } catch (error) {
      console.error('Error fetching calculations:', error);
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCalculations();
  };

  const handleClearFilter = () => {
    setEmployeeFilter('');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderPagination = () => {
    if (!calculations || !calculations.pages || calculations.pages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= calculations.pages; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav aria-label="Calculations pagination" className="mt-4">
        <ul className="pagination justify-content-center">
          {calculations.has_prev && calculations.prev_num && (
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => setCurrentPage(calculations.prev_num!)}
              >
                Previous
              </button>
            </li>
          )}

          {pageNumbers.map((num) => (
            <li
              key={num}
              className={`page-item ${num === calculations.page ? 'active' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            </li>
          ))}

          {calculations.has_next && calculations.next_num && (
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => setCurrentPage(calculations.next_num!)}
              >
                Next
              </button>
            </li>
          )}
        </ul>
      </nav>
    );
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FileText size={32} className="me-2" style={{ color: '#28468D' }} />
          Pay Calculations
        </h2>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => navigate('/pay-rules/calculate')}>
            <Plus size={16} className="me-2" />
            New Calculation
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate('/pay-rules')}>
            <ArrowLeft size={16} className="me-2" />
            Back to Rules
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleFilter}>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                  >
                    <option value="">All Employees</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.full_name} ({employee.username})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button type="submit" variant="outline-primary" className="me-2">
                  <Filter size={16} className="me-1" />
                  Filter
                </Button>
                <Button variant="outline-secondary" onClick={handleClearFilter}>
                  <X size={16} className="me-1" />
                  Clear
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {calculations.items.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Pay Period</th>
                      <th>Total Hours</th>
                      <th>Regular Hours</th>
                      <th>Overtime Hours</th>
                      <th>Total Allowances</th>
                      <th>Calculated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.items.map((calc) => (
                      <tr key={calc.id}>
                        <td>
                          <strong>{calc.employee.full_name}</strong>
                          <br />
                          <small className="text-muted">{calc.employee.username}</small>
                        </td>
                        <td>
                          {formatDate(calc.pay_period_start)} -{' '}
                          {formatDate(calc.pay_period_end)}
                        </td>
                        <td>
                          <Badge bg="primary">{calc.total_hours.toFixed(1)}h</Badge>
                        </td>
                        <td>
                          <Badge bg="success">{calc.regular_hours.toFixed(1)}h</Badge>
                        </td>
                        <td>
                          {calc.overtime_hours > 0 ? (
                            <Badge bg="warning">{calc.overtime_hours.toFixed(1)}h</Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {calc.total_allowances > 0 ? (
                            <Badge bg="info">R{calc.total_allowances.toFixed(2)}</Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {formatDateTime(calc.calculated_at)}
                          <br />
                          <small className="text-muted">by {calc.calculated_by.username}</small>
                        </td>
                        <td>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => navigate(`/pay-rules/calculations/${calc.id}`)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {renderPagination()}
            </>
          ) : (
            <div className="text-center py-5">
              <FileText size={64} className="text-muted mb-3" />
              <h5>No Pay Calculations Found</h5>
              <p className="text-muted">
                {employeeFilter
                  ? 'No calculations found for the selected employee.'
                  : 'No pay calculations have been saved yet.'}
              </p>
              <Button variant="primary" onClick={() => navigate('/pay-rules/calculate')}>
                <Plus size={16} className="me-2" />
                Calculate Pay
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
