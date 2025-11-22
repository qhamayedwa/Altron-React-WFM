import { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Upload, ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ImportTimeData() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('');
  const [validateOnly, setValidateOnly] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileSizeMB = selectedFile.size / 1024 / 1024;
      
      if (fileSizeMB > 10) {
        alert(`File size (${fileSizeMB.toFixed(2)} MB) exceeds maximum limit of 10 MB`);
        e.target.value = '';
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !importType) {
      alert('Please select a file and import type');
      return;
    }

    setUploading(true);
    
    // Simulate processing
    setTimeout(() => {
      alert('Import functionality will be implemented in future updates');
      setUploading(false);
    }, 2000);
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Upload size={28} className="me-2" />
          Import Clock Data
        </h2>
        <Button variant="outline-secondary" onClick={() => navigate('/time-attendance-admin')}>
          <ArrowLeft size={18} className="me-2" />
          Back to Dashboard
        </Button>
      </div>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Upload Time Data</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Select File</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    required
                    disabled={uploading}
                  />
                  <small className="text-muted">Supported formats: CSV, Excel (.xlsx, .xls)</small>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Import Type</Form.Label>
                  <Form.Select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value)}
                    required
                    disabled={uploading}
                  >
                    <option value="">Select import type</option>
                    <option value="time_entries">Time Entries</option>
                    <option value="schedule">Employee Schedule</option>
                    <option value="corrections">Time Corrections</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    id="validate-only"
                    checked={validateOnly}
                    onChange={(e) => setValidateOnly(e.target.checked)}
                    label="Validate only (don't import)"
                    disabled={uploading}
                  />
                  <small className="text-muted">Check this to validate the file without importing the data</small>
                </Form.Group>

                <Alert variant="info">
                  <Info size={18} className="me-2" />
                  <strong>Note:</strong> This is a placeholder for future import functionality. 
                  The system will be designed to support importing from external time clock systems, 
                  payroll systems, and CSV exports.
                </Alert>

                <div className="d-grid">
                  <Button type="submit" variant="primary" disabled={!file || uploading}>
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="me-2" />
                        {file ? 'Import Data' : 'Import Data (Coming Soon)'}
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Import Requirements</h6>
            </Card.Header>
            <Card.Body>
              <h6>CSV Format Requirements:</h6>
              <ul className="small">
                <li>Employee ID or Username</li>
                <li>Clock In DateTime</li>
                <li>Clock Out DateTime (optional)</li>
                <li>Date (YYYY-MM-DD format)</li>
                <li>Notes (optional)</li>
              </ul>

              <h6 className="mt-3">Sample CSV Header:</h6>
              <code className="small d-block p-2 bg-light">
                username,date,clock_in,clock_out,notes
              </code>

              <h6 className="mt-3">Supported Systems:</h6>
              <ul className="small">
                <li>External time clocks</li>
                <li>Payroll system exports</li>
                <li>Manual CSV data</li>
                <li>Biometric systems</li>
              </ul>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">Recent Imports</h6>
            </Card.Header>
            <Card.Body>
              <p className="text-muted text-center mb-0">No recent imports</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
