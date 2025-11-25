import { useState, useRef } from 'react';
import { Card, Form, Button, Alert, Row, Col, Breadcrumb, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Download, FileText, Check, Circle, AlertTriangle } from 'lucide-react';
import api from '../api/client';

interface ValidationResult {
  valid: boolean;
  validRows: any[];
  totalRows: number;
  errors: string[];
  warnings: string[];
}

export default function EmployeeImportUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setErrors(['Please select a CSV file.']);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setErrors(['File size must be less than 10MB.']);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      setSelectedFile(file);
      setErrors([]);
      setWarnings([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setErrors(['Please select a CSV file first.']);
      return;
    }

    setLoading(true);
    setErrors([]);
    setWarnings([]);

    try {
      const formData = new FormData();
      formData.append('csv_file', selectedFile);

      const response = await api.post('/employee-import/validate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const result: ValidationResult = response.data;

      if (result.valid && result.validRows.length > 0) {
        sessionStorage.setItem('importData', JSON.stringify({
          validRows: result.validRows,
          totalRows: result.totalRows,
          filename: selectedFile.name
        }));
        navigate('/employee-import/confirm');
      } else {
        setErrors(result.errors || ['Validation failed']);
        setWarnings(result.warnings || []);
      }
    } catch (err: any) {
      setErrors([err.response?.data?.error || 'Failed to validate CSV file']);
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
        <div className="col-md-8 mx-auto">
          <Breadcrumb>
            <Breadcrumb.Item onClick={() => navigate('/employee-import')}>Employee Import</Breadcrumb.Item>
            <Breadcrumb.Item active>Upload CSV</Breadcrumb.Item>
          </Breadcrumb>

          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <Upload size={20} className="me-2" />
                Upload Employee CSV File
              </h4>
            </Card.Header>
            <Card.Body>
              {errors.length > 0 && (
                <Alert variant="danger">
                  <h6><AlertTriangle size={18} className="me-2" />Validation Errors</h6>
                  <ul className="mb-0">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {warnings.length > 0 && (
                <Alert variant="warning">
                  <h6><AlertTriangle size={18} className="me-2" />Warnings</h6>
                  <ul className="mb-0">
                    {warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>
                    <FileText size={18} className="me-2" />
                    Select CSV File
                  </Form.Label>
                  <Form.Control
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    onChange={handleFileChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Choose a CSV file with employee data. Maximum file size: 10MB
                  </Form.Text>
                </Form.Group>

                {selectedFile && (
                  <Alert variant="info" className="d-flex align-items-center">
                    <FileText size={20} className="me-2" />
                    <div>
                      <strong>{selectedFile.name}</strong><br />
                      <small className="text-muted">Size: {formatFileSize(selectedFile.size)} | Type: text/csv</small>
                    </div>
                  </Alert>
                )}

                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={() => navigate('/employee-import')}>
                    <ArrowLeft size={18} className="me-2" />
                    Back to Dashboard
                  </Button>
                  <div>
                    <Button variant="outline-primary" className="me-2" onClick={handleDownloadTemplate}>
                      <Download size={18} className="me-2" />
                      Download Template
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading || !selectedFile}>
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <Upload size={18} className="me-2" />
                          Validate & Continue
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Check size={20} className="me-2" />
                CSV File Requirements
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6 className="text-primary">Required Columns</h6>
                  <ul className="list-unstyled">
                    <li><Check size={16} className="text-success me-2" /><code>employee_id</code></li>
                    <li><Check size={16} className="text-success me-2" /><code>first_name</code></li>
                    <li><Check size={16} className="text-success me-2" /><code>last_name</code></li>
                    <li><Check size={16} className="text-success me-2" /><code>email</code></li>
                    <li><Check size={16} className="text-success me-2" /><code>department_code</code></li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6 className="text-info">Optional Columns</h6>
                  <ul className="list-unstyled">
                    <li><Circle size={16} className="text-info me-2" /><code>username</code></li>
                    <li><Circle size={16} className="text-info me-2" /><code>phone_number</code></li>
                    <li><Circle size={16} className="text-info me-2" /><code>position</code></li>
                    <li><Circle size={16} className="text-info me-2" /><code>hire_date</code></li>
                    <li><Circle size={16} className="text-info me-2" /><code>employment_type</code></li>
                    <li><Circle size={16} className="text-info me-2" /><code>salary</code></li>
                    <li><Circle size={16} className="text-info me-2" /><code>hourly_rate</code></li>
                  </ul>
                </Col>
              </Row>

              <hr />

              <h6 className="text-warning">Important Notes</h6>
              <ul className="small text-muted">
                <li>Employee IDs and email addresses must be unique</li>
                <li>Department codes must exist in the system (see dashboard for available codes)</li>
                <li>Date format should be YYYY-MM-DD or MM/DD/YYYY</li>
                <li>Employment types: full_time, part_time, contract, temporary</li>
                <li>Default passwords will be generated (firstname + employee_id)</li>
                <li>All employees will be assigned the "Employee" role by default</li>
              </ul>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
