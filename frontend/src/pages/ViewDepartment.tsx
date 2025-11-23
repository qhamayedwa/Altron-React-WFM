import { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Breadcrumb } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Edit, UserPlus, Info, BarChart2, UserX } from 'lucide-react';

interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  position?: string;
  email: string;
  phone_number?: string;
  mobile_number?: string;
  is_active: boolean;
}

interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  manager_name?: string;
  email?: string;
  phone?: string;
  extension?: string;
  cost_center?: string;
  budget_code?: string;
  standard_hours_per_day: number;
  standard_hours_per_week: number;
  site: {
    id: number;
    name: string;
    region: {
      id: number;
      name: string;
      company: {
        id: number;
        name: string;
      };
    };
  };
}

export default function ViewDepartment() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [department, setDepartment] = useState<Department | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState({
    employees: 0,
    active_employees: 0,
    inactive_employees: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDepartment();
  }, [id]);

  const loadDepartment = async () => {
    try {
      const response = await fetch(`/api/v1/organization/departments/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDepartment(data.department);
        setEmployees(data.employees || []);
        
        const active = (data.employees || []).filter((emp: Employee) => emp.is_active).length;
        setStats({
          employees: (data.employees || []).length,
          active_employees: active,
          inactive_employees: (data.employees || []).length - active
        });
      }
    } catch (err) {
      console.error('Error loading department:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading...</div>;
  }

  if (!department) {
    return <div className="py-4 text-center">Department not found</div>;
  }

  return (
    <div className="py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <Breadcrumb>
                <Breadcrumb.Item onClick={() => navigate('/organization')}>Organization</Breadcrumb.Item>
                <Breadcrumb.Item onClick={() => navigate(`/organization/companies/view/${department.site.region.company.id}`)}>{department.site.region.company.name}</Breadcrumb.Item>
                <Breadcrumb.Item onClick={() => navigate(`/organization/regions/view/${department.site.region.id}`)}>{department.site.region.name}</Breadcrumb.Item>
                <Breadcrumb.Item onClick={() => navigate(`/organization/sites/view/${department.site.id}`)}>{department.site.name}</Breadcrumb.Item>
                <Breadcrumb.Item active>{department.name}</Breadcrumb.Item>
              </Breadcrumb>
              <h2>
                <Users size={28} className="me-2" />
                {department.name}
              </h2>
              <p className="text-muted">{department.description || 'Department operations and management'}</p>
            </div>
            <div>
              <Button variant="outline-primary" className="me-2">
                <Edit size={18} className="me-2" />
                Edit Department
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate(`/organization/departments/${id}/assign-employee`)}
              >
                <UserPlus size={18} className="me-2" />
                Add Employee
              </Button>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-8">
              <Card>
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    <Info size={20} className="me-2" />
                    Department Information
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="row">
                    <div className="col-md-6">
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <td><strong>Department Code:</strong></td>
                            <td>{department.code}</td>
                          </tr>
                          <tr>
                            <td><strong>Site:</strong></td>
                            <td>{department.site.name}</td>
                          </tr>
                          <tr>
                            <td><strong>Region:</strong></td>
                            <td>{department.site.region.name}</td>
                          </tr>
                          <tr>
                            <td><strong>Company:</strong></td>
                            <td>{department.site.region.company.name}</td>
                          </tr>
                          <tr>
                            <td><strong>Manager:</strong></td>
                            <td>{department.manager_name || 'Not assigned'}</td>
                          </tr>
                          <tr>
                            <td><strong>Email:</strong></td>
                            <td>{department.email || 'Not provided'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <td><strong>Phone:</strong></td>
                            <td>{department.phone || 'Not provided'}</td>
                          </tr>
                          <tr>
                            <td><strong>Extension:</strong></td>
                            <td>{department.extension || 'Not provided'}</td>
                          </tr>
                          <tr>
                            <td><strong>Cost Center:</strong></td>
                            <td>{department.cost_center || 'Not specified'}</td>
                          </tr>
                          <tr>
                            <td><strong>Budget Code:</strong></td>
                            <td>{department.budget_code || 'Not specified'}</td>
                          </tr>
                          <tr>
                            <td><strong>Standard Hours/Day:</strong></td>
                            <td>{department.standard_hours_per_day || 8.0} hours</td>
                          </tr>
                          <tr>
                            <td><strong>Standard Hours/Week:</strong></td>
                            <td>{department.standard_hours_per_week || 40.0} hours</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {department.description && (
                    <>
                      <hr />
                      <div className="row">
                        <div className="col-12">
                          <strong>Description:</strong><br />
                          {department.description}
                        </div>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </div>
            
            <div className="col-md-4">
              <Card>
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">
                    <BarChart2 size={20} className="me-2" />
                    Statistics
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="row text-center">
                    <div className="col-12 mb-3">
                      <div className="stat-item">
                        <h3 className="text-primary">{stats.employees}</h3>
                        <small className="text-muted">Total Employees</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="stat-item">
                        <h5 className="text-success">{stats.active_employees}</h5>
                        <small className="text-muted">Active</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="stat-item">
                        <h5 className="text-warning">{stats.inactive_employees}</h5>
                        <small className="text-muted">Inactive</small>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>

          <Card>
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">
                <Users size={20} className="me-2" />
                Employees in {department.name}
              </h5>
            </Card.Header>
            <Card.Body>
              {employees.length > 0 ? (
                <div className="table-responsive">
                  <Table striped>
                    <thead>
                      <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee.id}>
                          <td>{employee.employee_id}</td>
                          <td>{employee.first_name} {employee.last_name}</td>
                          <td>{employee.position || 'Not specified'}</td>
                          <td>{employee.email}</td>
                          <td>{employee.phone_number || employee.mobile_number || 'Not provided'}</td>
                          <td>
                            {employee.is_active ? (
                              <Badge bg="success">Active</Badge>
                            ) : (
                              <Badge bg="secondary">Inactive</Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/users/edit/${employee.id}`)}
                            >
                              <Edit size={16} className="me-1" />
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <UserX size={64} className="text-muted mb-3" />
                  <h5 className="text-muted">No Employees Yet</h5>
                  <p className="text-muted">This department doesn't have any employees assigned yet.</p>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/organization/departments/${id}/assign-employee`)}
                  >
                    <UserPlus size={18} className="me-2" />
                    Add First Employee
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <style>{`
        .stat-item h3 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0;
        }

        .stat-item h5 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
