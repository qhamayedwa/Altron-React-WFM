import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, ProgressBar } from 'react-bootstrap';
import apiClient from '../lib/api';

export const EmployeeImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'validate' | 'confirm' | 'complete'>('upload');
  const [validationResults, setValidationResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUploadAndValidate = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/employees/import/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setValidationResults(response.data);
      setStep('validate');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to validate file');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/employees/import/confirm', {
        employees: validationResults.valid,
      });

      setSuccess(`Successfully imported ${response.data.imported} employees!`);
      setStep('complete');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to import employees');
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setStep('upload');
    setValidationResults(null);
    setError('');
    setSuccess('');
  };

  const downloadTemplate = () => {
    const template = `username,email,first_name,last_name,employee_number,department_id,job_title,hire_date
jdoe,jdoe@example.com,John,Doe,EMP001,1,Software Engineer,2024-01-15
jsmith,jsmith@example.com,Jane,Smith,EMP002,1,Manager,2024-02-01`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    a.click();
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold" style={{ color: '#0057A8' }}>
            Employee Import
          </h2>
          <p className="text-muted">Bulk import employees from CSV file</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Progress Steps */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <div className={`text-center ${step === 'upload' ? 'text-primary fw-bold' : 'text-muted'}`}>
                  <div className="mb-2">1</div>
                  <small>Upload File</small>
                </div>
                <div className={`text-center ${step === 'validate' ? 'text-primary fw-bold' : 'text-muted'}`}>
                  <div className="mb-2">2</div>
                  <small>Validate Data</small>
                </div>
                <div className={`text-center ${step === 'confirm' ? 'text-primary fw-bold' : 'text-muted'}`}>
                  <div className="mb-2">3</div>
                  <small>Confirm Import</small>
                </div>
                <div className={`text-center ${step === 'complete' ? 'text-success fw-bold' : 'text-muted'}`}>
                  <div className="mb-2">4</div>
                  <small>Complete</small>
                </div>
              </div>
              <ProgressBar 
                now={step === 'upload' ? 25 : step === 'validate' ? 50 : step === 'confirm' ? 75 : 100} 
                variant={step === 'complete' ? 'success' : 'primary'}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Row>
          <Col md={8}>
            <Card className="shadow-sm border-0">
              <Card.Header style={{ backgroundColor: '#0057A8', color: 'white' }}>
                <h5 className="mb-0">Step 1: Upload CSV File</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Select CSV File</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                  />
                  <Form.Text className="text-muted">
                    Upload a CSV file with employee data. Download the template below for the correct format.
                  </Form.Text>
                </Form.Group>

                {file && (
                  <Alert variant="info">
                    <strong>Selected File:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </Alert>
                )}

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleUploadAndValidate}
                    disabled={!file || loading}
                  >
                    {loading ? 'Validating...' : 'Upload and Validate'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm border-0">
              <Card.Header style={{ backgroundColor: '#00A9E0', color: 'white' }}>
                <h5 className="mb-0">Template & Instructions</h5>
              </Card.Header>
              <Card.Body>
                <p><strong>Required Fields:</strong></p>
                <ul className="small">
                  <li>username</li>
                  <li>email</li>
                  <li>first_name</li>
                  <li>last_name</li>
                </ul>
                <p><strong>Optional Fields:</strong></p>
                <ul className="small">
                  <li>employee_number</li>
                  <li>department_id</li>
                  <li>job_title</li>
                  <li>hire_date (YYYY-MM-DD)</li>
                  <li>phone_number</li>
                  <li>hourly_rate</li>
                </ul>
                <div className="d-grid">
                  <Button variant="outline-primary" onClick={downloadTemplate}>
                    Download Template
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Step 2: Validate */}
      {step === 'validate' && validationResults && (
        <Row>
          <Col>
            <Card className="shadow-sm border-0 mb-3">
              <Card.Header style={{ backgroundColor: '#008C95', color: 'white' }}>
                <h5 className="mb-0">Step 2: Validation Results</h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={4}>
                    <Card className="text-center">
                      <Card.Body>
                        <h3 className="text-success">{validationResults.valid?.length || 0}</h3>
                        <small className="text-muted">Valid Records</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="text-center">
                      <Card.Body>
                        <h3 className="text-danger">{validationResults.invalid?.length || 0}</h3>
                        <small className="text-muted">Invalid Records</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="text-center">
                      <Card.Body>
                        <h3 className="text-primary">{validationResults.total || 0}</h3>
                        <small className="text-muted">Total Records</small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {validationResults.invalid && validationResults.invalid.length > 0 && (
                  <Alert variant="warning">
                    <strong>Warning:</strong> {validationResults.invalid.length} records have errors. These will not be imported.
                  </Alert>
                )}

                <div className="d-flex gap-2">
                  <Button variant="secondary" onClick={resetImport}>
                    Start Over
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setStep('confirm')}
                    disabled={!validationResults.valid || validationResults.valid.length === 0}
                  >
                    Continue to Review
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Invalid Records */}
            {validationResults.invalid && validationResults.invalid.length > 0 && (
              <Card className="shadow-sm border-0">
                <Card.Header style={{ backgroundColor: '#dc3545', color: 'white' }}>
                  <h5 className="mb-0">Invalid Records</h5>
                </Card.Header>
                <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table striped hover size="sm">
                    <thead>
                      <tr>
                        <th>Row</th>
                        <th>Data</th>
                        <th>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResults.invalid.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td>{item.row}</td>
                          <td><small>{JSON.stringify(item.data)}</small></td>
                          <td><small className="text-danger">{item.error}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && validationResults && (
        <Row>
          <Col>
            <Card className="shadow-sm border-0">
              <Card.Header style={{ backgroundColor: '#62237A', color: 'white' }}>
                <h5 className="mb-0">Step 3: Review and Confirm</h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="info">
                  <strong>Ready to import {validationResults.valid.length} employees</strong>
                  <p className="mb-0 mt-2">Please review the data below and click "Confirm Import" to proceed.</p>
                </Alert>

                <div style={{ maxHeight: '500px', overflowY: 'auto' }} className="mb-3">
                  <Table striped hover size="sm">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Employee #</th>
                        <th>Job Title</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResults.valid.map((emp: any, idx: number) => (
                        <tr key={idx}>
                          <td>{emp.username}</td>
                          <td>{emp.email}</td>
                          <td>{emp.first_name} {emp.last_name}</td>
                          <td>{emp.employee_number || '-'}</td>
                          <td>{emp.job_title || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="d-flex gap-2">
                  <Button variant="secondary" onClick={() => setStep('validate')}>
                    Back
                  </Button>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleConfirmImport}
                    disabled={loading}
                  >
                    {loading ? 'Importing...' : 'Confirm Import'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && (
        <Row>
          <Col md={{ span: 6, offset: 3 }}>
            <Card className="shadow-sm border-0 text-center">
              <Card.Body className="py-5">
                <div className="mb-4">
                  <div className="display-1 text-success">✓</div>
                </div>
                <h3 className="mb-3">Import Complete!</h3>
                <p className="text-muted mb-4">{success}</p>
                <div className="d-flex gap-2 justify-content-center">
                  <Button variant="primary" onClick={resetImport}>
                    Import More Employees
                  </Button>
                  <Button variant="outline-secondary" href="/organization">
                    View Employees
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};
