import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, Users, UserCheck, Briefcase, UploadCloud, ArrowRight, Filter, Info, Building } from 'lucide-react';
import api from '../api/client';

interface Department {
  code: string;
  name: string;
  site: string;
  region: string;
  company: string;
}

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
}

export default function EmployeeImport() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<Stats>({ totalEmployees: 0, activeEmployees: 0, totalDepartments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deptResponse, statsResponse] = await Promise.all([
        api.get('/employee-import/departments'),
        api.get('/employee-import/stats')
      ]);
      setDepartments(deptResponse.data.departments || []);
      setStats(statsResponse.data.stats || { totalEmployees: 0, activeEmployees: 0, totalDepartments: 0 });
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/employee-import/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employee_import_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading template:', err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>
                <Upload size={24} className="me-2" />
                Employee Import Dashboard
              </h2>
              <p className="text-muted">Bulk import employees from CSV files</p>
            </div>
            <div>
              <Button variant="outline-primary" className="me-2" onClick={handleDownloadTemplate}>
                <Download size={18} className="me-2" />
                Download Template
              </Button>
              <Button variant="primary" onClick={() => navigate('/employee-import/upload')}>
                <Upload size={18} className="me-2" />
                Import Employees
              </Button>
            </div>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <Row className="mb-4">
            <Col md={3}>
              <Card 
                className="bg-primary text-white stat-card clickable-card" 
                onClick={() => navigate('/user-management')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Total Employees</h6>
                      <h2>{loading ? '-' : stats.totalEmployees}</h2>
                    </div>
                    <div className="align-self-center">
                      <Users size={48} />
                    </div>
                  </div>
                  <div className="mt-2" style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    <ArrowRight size={14} className="me-1" />
                    View Employee Management
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-success text-white stat-card">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Active Employees</h6>
                      <h2>{loading ? '-' : stats.activeEmployees}</h2>
                    </div>
                    <div className="align-self-center">
                      <UserCheck size={48} />
                    </div>
                  </div>
                  <div className="mt-2" style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    <Filter size={14} className="me-1" />
                    Filter Active Employees
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card 
                className="bg-info text-white stat-card clickable-card" 
                onClick={() => navigate('/organization-dashboard')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Departments</h6>
                      <h2>{loading ? '-' : stats.totalDepartments}</h2>
                    </div>
                    <div className="align-self-center">
                      <Briefcase size={48} />
                    </div>
                  </div>
                  <div className="mt-2" style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    <ArrowRight size={14} className="me-1" />
                    Manage Departments
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-warning text-white stat-card">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Recent Imports</h6>
                      <h2>0</h2>
                    </div>
                    <div className="align-self-center">
                      <UploadCloud size={48} />
                    </div>
                  </div>
                  <div className="mt-2" style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    View Import History
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Info size={20} className="me-2" />
                How Employee Import Works
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="text-center mb-3">
                  <div 
                    className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                    style={{ width: 60, height: 60 }}
                  >
                    <span className="h4 mb-0">1</span>
                  </div>
                  <h6>Download Template</h6>
                  <p className="text-muted small">Download the CSV template with all required columns and example data.</p>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div 
                    className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                    style={{ width: 60, height: 60 }}
                  >
                    <span className="h4 mb-0">2</span>
                  </div>
                  <h6>Prepare Data</h6>
                  <p className="text-muted small">Fill in employee information using the template format. Ensure department codes exist.</p>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div 
                    className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                    style={{ width: 60, height: 60 }}
                  >
                    <span className="h4 mb-0">3</span>
                  </div>
                  <h6>Upload & Import</h6>
                  <p className="text-muted small">Upload your CSV file. The system will validate and import employees automatically.</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Building size={20} className="me-2" />
                Available Departments
              </h5>
              <small className="text-muted">Use these department codes in your CSV file</small>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Loading departments...</p>
                </div>
              ) : departments.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Department Code</th>
                        <th>Department Name</th>
                        <th>Site</th>
                        <th>Region</th>
                        <th>Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((dept, index) => (
                        <tr key={index}>
                          <td><code className="bg-light px-2 py-1 rounded">{dept.code}</code></td>
                          <td>{dept.name}</td>
                          <td>{dept.site}</td>
                          <td>{dept.region}</td>
                          <td>{dept.company}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="warning">
                  No departments found. Please create departments in the Organization module first.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
