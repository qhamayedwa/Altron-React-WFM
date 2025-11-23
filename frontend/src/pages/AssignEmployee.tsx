import { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, ArrowLeft, Users, Info, Zap, Eye } from 'lucide-react';
import api from '../api/client';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  departmentId?: number;
  departmentName?: string;
  position?: string;
}

interface Department {
  id: number;
  name: string;
  code: string;
  siteName: string;
  description?: string;
}

export default function AssignEmployee() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const departmentId = searchParams.get('department_id');

  const [department, setDepartment] = useState<Department | null>(null);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [currentEmployeeCount, setCurrentEmployeeCount] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (departmentId) {
      loadData();
    }
  }, [departmentId]);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, departmentFilter, availableEmployees]);

  const loadData = async () => {
    try {
      const [deptResponse, employeesResponse, allDeptsResponse] = await Promise.all([
        api.get(`/organization/departments/${departmentId}`),
        api.get('/users/employees'),
        api.get('/organization/departments')
      ]);

      setDepartment(deptResponse.data.department);
      setCurrentEmployeeCount(deptResponse.data.employeeCount || 0);
      setAvailableEmployees(employeesResponse.data.employees || []);
      setFilteredEmployees(employeesResponse.data.employees || []);
      setAllDepartments(allDeptsResponse.data.departments || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...availableEmployees];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search) ||
        emp.employeeId.toLowerCase().includes(search) ||
        (emp.position || '').toLowerCase().includes(search)
      );
    }

    if (departmentFilter) {
      if (departmentFilter === 'unassigned') {
        filtered = filtered.filter(emp => !emp.departmentId);
      } else {
        filtered = filtered.filter(emp => emp.departmentId === parseInt(departmentFilter));
      }
    }

    setFilteredEmployees(filtered);
  };

  const handleAssignEmployee = async (employeeId: number, employeeName: string) => {
    if (!window.confirm(`Assign ${employeeName} to ${department?.name}?`)) {
      return;
    }

    try {
      await api.post(`/organization/departments/${departmentId}/assign-employee`, {
        employeeId
      });

      alert('Employee assigned successfully!');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to assign employee');
    }
  };

  if (!departmentId) {
    return (
      <div className="container py-5">
        <Card>
          <Card.Body className="text-center">
            <p className="text-muted">No department specified</p>
            <Button variant="primary" onClick={() => navigate('/organization/dashboard')}>
              Go to Organization Dashboard
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="container py-5"><div className="text-center">Loading...</div></div>;
  }

  if (!department) {
    return <div className="container py-5"><div className="text-center">Department not found</div></div>;
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0" style={{ background: 'none', padding: 0 }}>
              <li className="breadcrumb-item">
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/organization/dashboard'); }}>Organization</a>
              </li>
              <li className="breadcrumb-item">
                <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/organization/departments/view/${departmentId}`); }}>{department.name}</a>
              </li>
              <li className="breadcrumb-item active">Assign Employee</li>
            </ol>
          </nav>
          <h2>
            <UserPlus size={28} className="me-2" />
            Assign Employee to {department.name}
          </h2>
          <p className="text-muted">Select an employee to assign to this department</p>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate(`/organization/departments/view/${departmentId}`)}>
          <ArrowLeft size={18} className="me-2" />
          Back to Department
        </Button>
      </div>

      <div className="row">
        <div className="col-md-8">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <Users size={20} className="me-2" />
                Available Employees
              </h5>
            </Card.Header>
            <Card.Body>
              {availableEmployees.length > 0 ? (
                <>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <Form.Control
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <Form.Select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                      >
                        <option value="">All Departments</option>
                        <option value="unassigned">Unassigned</option>
                        {allDepartments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </Form.Select>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>ID</th>
                          <th>Current Department</th>
                          <th>Position</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map(employee => (
                          <tr key={employee.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', fontSize: '0.875rem', fontWeight: 600 }}>
                                  {employee.firstName[0]}{employee.lastName[0]}
                                </div>
                                <div>
                                  <strong>{employee.firstName} {employee.lastName}</strong>
                                  <br />
                                  <small className="text-muted">{employee.email}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <Badge bg="secondary">{employee.employeeId}</Badge>
                            </td>
                            <td>
                              {employee.departmentId ? (
                                <Badge bg="info">{employee.departmentName}</Badge>
                              ) : (
                                <Badge bg="warning">Unassigned</Badge>
                              )}
                            </td>
                            <td>{employee.position || 'Not specified'}</td>
                            <td>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAssignEmployee(employee.id, `${employee.firstName} ${employee.lastName}`)}
                              >
                                <UserPlus size={16} className="me-1" />
                                Assign
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {filteredEmployees.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center text-muted">
                              No employees match the search criteria
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <Users size={64} className="text-muted mb-3" />
                  <h5 className="text-muted">No Employees Available</h5>
                  <p className="text-muted">There are no employees available to assign to this department.</p>
                  <Button variant="primary" onClick={() => navigate('/auth/register')}>
                    <UserPlus size={18} className="me-2" />
                    Create New Employee
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <Info size={18} className="me-2" />
                Department Information
              </h6>
            </Card.Header>
            <Card.Body>
              <table className="table table-sm table-borderless">
                <tbody>
                  <tr>
                    <td><strong>Name:</strong></td>
                    <td>{department.name}</td>
                  </tr>
                  <tr>
                    <td><strong>Code:</strong></td>
                    <td><Badge bg="secondary">{department.code}</Badge></td>
                  </tr>
                  <tr>
                    <td><strong>Site:</strong></td>
                    <td>{department.siteName}</td>
                  </tr>
                  <tr>
                    <td><strong>Current Employees:</strong></td>
                    <td><Badge bg="primary">{currentEmployeeCount}</Badge></td>
                  </tr>
                </tbody>
              </table>
              {department.description && (
                <>
                  <hr />
                  <small className="text-muted">{department.description}</small>
                </>
              )}
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">
                <Zap size={18} className="me-2" />
                Quick Actions
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm" onClick={() => navigate(`/auth/register?department_id=${departmentId}`)}>
                  <UserPlus size={18} className="me-2" />
                  Create New Employee
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => navigate(`/organization/departments/view/${departmentId}`)}>
                  <Eye size={18} className="me-2" />
                  View Department
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
