import { useState, useEffect } from 'react';
import { Card, Button, Alert, Row, Col, Table, Badge, Breadcrumb, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, UserPlus, Users, Info, AlertCircle, PieChart, MoreHorizontal } from 'lucide-react';
import api from '../api/client';

interface ImportData {
  validRows: any[];
  totalRows: number;
  filename: string;
}

export default function EmployeeImportConfirm() {
  const navigate = useNavigate();
  
  const [importData, setImportData] = useState<ImportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [departmentStats, setDepartmentStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const storedData = sessionStorage.getItem('importData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setImportData(data);
      calculateDepartmentStats(data.validRows);
    } else {
      navigate('/employee-import/upload');
    }
  }, [navigate]);

  const calculateDepartmentStats = (employees: any[]) => {
    const stats: Record<string, number> = {};
    employees.forEach(emp => {
      const dept = emp.department_code;
      stats[dept] = (stats[dept] || 0) + 1;
    });
    setDepartmentStats(stats);
  };

  const handleConfirmImport = async () => {
    if (!importData) return;

    if (!window.confirm('Are you sure you want to import these employees? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const response = await api.post('/employee-import/execute', {
        employees: importData.validRows
      });

      if (response.data.success) {
        sessionStorage.removeItem('importData');
        alert(`Successfully imported ${response.data.importedCount} employees!`);
        navigate('/employee-import');
      } else {
        setErrors(response.data.errors || ['Import failed']);
      }
    } catch (err: any) {
      setErrors([err.response?.data?.error || 'Failed to import employees']);
    } finally {
      setLoading(false);
    }
  };

  const colors = ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-secondary'];

  if (!importData) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-10 mx-auto">
          <Breadcrumb>
            <Breadcrumb.Item onClick={() => navigate('/employee-import')}>Employee Import</Breadcrumb.Item>
            <Breadcrumb.Item onClick={() => navigate('/employee-import/upload')}>Upload CSV</Breadcrumb.Item>
            <Breadcrumb.Item active>Confirm Import</Breadcrumb.Item>
          </Breadcrumb>

          <Card>
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0">
                <CheckCircle size={20} className="me-2" />
                Confirm Employee Import
              </h4>
              <small>Review and confirm the import of {importData.validRows.length} employees</small>
            </Card.Header>
            <Card.Body>
              {errors.length > 0 && (
                <Alert variant="danger">
                  <h6><AlertCircle size={18} className="me-2" />Import Errors</h6>
                  <ul className="mb-0">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                  <hr />
                  <Button variant="outline-danger" size="sm" onClick={() => navigate('/employee-import/upload')}>
                    <ArrowLeft size={16} className="me-2" />
                    Back to Upload
                  </Button>
                </Alert>
              )}

              <Row className="mb-4">
                <Col md={4}>
                  <Card className="bg-light">
                    <Card.Body className="text-center">
                      <h3 className="text-primary">{importData.validRows.length}</h3>
                      <small className="text-muted">Employees to Import</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="bg-light">
                    <Card.Body className="text-center">
                      <h3 className="text-info">{importData.totalRows}</h3>
                      <small className="text-muted">Total Rows Processed</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="bg-light">
                    <Card.Body className="text-center">
                      <h3 className="text-success" style={{ fontSize: '1.25rem' }}>{importData.filename}</h3>
                      <small className="text-muted">Source File</small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <Users size={18} className="me-2" />
                    Employees to be Imported
                  </h6>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table striped className="mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th>Employee ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Department</th>
                          <th>Position</th>
                          <th>Employment Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importData.validRows.slice(0, 10).map((employee, index) => (
                          <tr key={index}>
                            <td><code>{employee.employee_id}</code></td>
                            <td>{employee.first_name} {employee.last_name}</td>
                            <td>{employee.email}</td>
                            <td><Badge bg="primary">{employee.department_code}</Badge></td>
                            <td>{employee.position || 'Not specified'}</td>
                            <td>
                              <Badge bg="info">
                                {(employee.employment_type || 'full_time').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                        {importData.validRows.length > 10 && (
                          <tr>
                            <td colSpan={6} className="text-center text-muted">
                              <MoreHorizontal size={18} className="me-2" />
                              And {importData.validRows.length - 10} more employees...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <PieChart size={18} className="me-2" />
                    Department Distribution
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {Object.entries(departmentStats).map(([dept, count], index) => {
                      const percentage = ((count / importData.validRows.length) * 100).toFixed(1);
                      const color = colors[index % colors.length];
                      return (
                        <Col md={4} key={dept} className="mb-3">
                          <Card className={`${color} text-white`}>
                            <Card.Body className="text-center py-3">
                              <h5>{count}</h5>
                              <small>{dept} ({percentage}%)</small>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </Card.Body>
              </Card>

              <Alert variant="info">
                <h6><Info size={18} className="me-2" />Important Notes</h6>
                <ul className="mb-0">
                  <li>All employees will be created with default passwords (firstname + employee_id)</li>
                  <li>Employees should change their passwords on first login</li>
                  <li>All employees will be assigned the "Employee" role by default</li>
                  <li>This action cannot be undone - employees will need to be manually removed if needed</li>
                </ul>
              </Alert>

              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate('/employee-import/upload')}>
                  <ArrowLeft size={18} className="me-2" />
                  Back to Upload
                </Button>
                <Button 
                  variant="success" 
                  size="lg" 
                  onClick={handleConfirmImport}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} className="me-2" />
                      Import {importData.validRows.length} Employees
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
