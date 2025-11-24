import { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { ArrowLeft, Play, Eye, Settings, Calendar, Filter, Sliders, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  employee_number: string;
}

interface PayCode {
  code: string;
  description: string;
}

export default function TimecardRollupConfig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Config options
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payCodes, setPayCodes] = useState<PayCode[]>([]);

  // Form state
  const [rollupType, setRollupType] = useState('employee');
  const [rollupPeriod, setRollupPeriod] = useState('custom');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<number[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState<number[]>([]);
  const [payCodeFilter, setPayCodeFilter] = useState<string[]>([]);
  const [includeBreaks, setIncludeBreaks] = useState(true);
  const [includeOvertime, setIncludeOvertime] = useState(true);
  const [excludeIncomplete, setExcludeIncomplete] = useState(true);
  const [groupSimilar, setGroupSimilar] = useState(false);
  const [autoSendSage, setAutoSendSage] = useState(false);
  const [sageFormat, setSageFormat] = useState('standard');
  const [sageMapping, setSageMapping] = useState('default');

  useEffect(() => {
    loadConfigOptions();
    setDefaultDates();
  }, []);

  const loadConfigOptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/timecard-rollup/config-options');
      setDepartments(response.data.departments || []);
      setEmployees(response.data.employees || []);
      setPayCodes(response.data.pay_codes || []);
    } catch (error) {
      console.error('Failed to load config options:', error);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultDates = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setStartDate(oneWeekAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const setPresetDates = (period: string) => {
    const today = new Date();
    let start: Date;

    switch (period) {
      case 'daily':
        start = new Date(today);
        break;
      case 'weekly':
        const dayOfWeek = today.getDay();
        start = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        break;
      case 'biweekly':
        start = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default:
        setDefaultDates();
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const handlePeriodChange = (period: string) => {
    setRollupPeriod(period);
    if (period !== 'custom') {
      setPresetDates(period);
    }
  };

  const handlePreview = async () => {
    try {
      setGenerating(true);
      const response = await api.post('/timecard-rollup/generate', {
        rollup_type: rollupType,
        rollup_period: rollupPeriod,
        start_date: startDate,
        end_date: endDate,
        department_filter: departmentFilter.length > 0 ? departmentFilter : undefined,
        employee_filter: employeeFilter.length > 0 ? employeeFilter : undefined,
        pay_code_filter: payCodeFilter.length > 0 ? payCodeFilter : undefined,
        include_breaks: includeBreaks,
        include_overtime: includeOvertime,
        exclude_incomplete: excludeIncomplete,
        group_similar: groupSimilar
      });

      if (response.data.success) {
        setPreviewData(response.data);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
      alert('Failed to generate preview');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const response = await api.post('/timecard-rollup/generate', {
        rollup_type: rollupType,
        rollup_period: rollupPeriod,
        start_date: startDate,
        end_date: endDate,
        department_filter: departmentFilter.length > 0 ? departmentFilter : undefined,
        employee_filter: employeeFilter.length > 0 ? employeeFilter : undefined,
        pay_code_filter: payCodeFilter.length > 0 ? payCodeFilter : undefined,
        include_breaks: includeBreaks,
        include_overtime: includeOvertime,
        exclude_incomplete: excludeIncomplete,
        group_similar: groupSimilar
      });

      if (response.data.success) {
        alert('Rollup generated successfully!');
        navigate('/timecard-rollup');
      }
    } catch (error) {
      console.error('Failed to generate rollup:', error);
      alert('Failed to generate rollup');
    } finally {
      setGenerating(false);
    }
  };

  const renderPreviewContent = () => {
    if (!previewData) return null;

    const { data, config } = previewData;

    return (
      <div>
        <div className="alert alert-info">
          <h6>Preview Configuration</h6>
          <p>
            <strong>Type:</strong> {config.type} | <strong>Period:</strong> {config.start_date} to {config.end_date}
          </p>
        </div>

        {data.type === 'employee' && data.employees && (
          <div>
            <p><strong>Found {data.employees.length} employees</strong></p>
            {data.employees.length > 0 && (
              <p className="text-muted">
                Sample: {data.employees[0].full_name} - {data.employees[0].total_hours} hours
              </p>
            )}
          </div>
        )}

        {data.type === 'department' && data.departments && (
          <div>
            <p><strong>Found {data.departments.length} departments</strong></p>
            {data.departments.length > 0 && (
              <p className="text-muted">
                Sample: {data.departments[0].department_name} - {data.departments[0].total_hours} hours
              </p>
            )}
          </div>
        )}

        {data.type === 'daily' && data.periods && (
          <div>
            <p><strong>Found {data.periods.length} days</strong></p>
            {data.periods.length > 0 && (
              <p className="text-muted">
                Sample: {data.periods[0].date} - {data.periods[0].total_hours} hours
              </p>
            )}
          </div>
        )}

        {data.type === 'combined' && data.summary && (
          <div>
            <p><strong>Summary:</strong></p>
            <ul>
              <li>Total Entries: {data.summary.total_entries}</li>
              <li>Total Hours: {data.summary.total_hours.toFixed(2)}</li>
              <li>Unique Employees: {data.summary.unique_employees}</li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Configure Timecard Rollup</h2>
      </div>

      <Row>
        <Col lg={10} className="mx-auto">
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <Settings size={20} className="me-2" />
                Rollup Configuration
              </h5>
            </Card.Header>
            <Card.Body>
              {/* Basic Configuration */}
              <h6 className="mb-3">Basic Configuration</h6>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <Settings size={16} className="me-1" />
                      Rollup Type
                    </Form.Label>
                    <Form.Select value={rollupType} onChange={(e) => setRollupType(e.target.value)}>
                      <option value="employee">By Employee</option>
                      <option value="department">By Department</option>
                      <option value="pay_code">By Pay Code</option>
                      <option value="daily">By Day</option>
                      <option value="combined">Combined View</option>
                    </Form.Select>
                    <Form.Text>Choose how to aggregate timecard data</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <Calendar size={16} className="me-1" />
                      Period Type
                    </Form.Label>
                    <Form.Select value={rollupPeriod} onChange={(e) => handlePeriodChange(e.target.value)}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom Range</option>
                    </Form.Select>
                    <Form.Text>Select time period for rollup</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* Date Range */}
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Filters */}
              <h6 className="mb-3">
                <Filter size={18} className="me-2" />
                Filters (Optional)
              </h6>
              <Row className="mb-4">
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Department Filter</Form.Label>
                    <Form.Select
                      multiple
                      style={{ height: '120px' }}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                        setDepartmentFilter(selected);
                      }}
                    >
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text>Hold Ctrl/Cmd to select multiple</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Employee Filter</Form.Label>
                    <Form.Select
                      multiple
                      style={{ height: '120px' }}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                        setEmployeeFilter(selected);
                      }}
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.username} - {emp.first_name} {emp.last_name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text>Hold Ctrl/Cmd to select multiple</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Pay Code Filter</Form.Label>
                    <Form.Select
                      multiple
                      style={{ height: '120px' }}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setPayCodeFilter(selected);
                      }}
                    >
                      {payCodes.map((pc) => (
                        <option key={pc.code} value={pc.code}>
                          {pc.code} - {pc.description}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text>Hold Ctrl/Cmd to select multiple</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* Advanced Options */}
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <Sliders size={18} className="me-2" />
                    Advanced Options
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Include Break Time"
                        checked={includeBreaks}
                        onChange={(e) => setIncludeBreaks(e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Include Overtime Hours"
                        checked={includeOvertime}
                        onChange={(e) => setIncludeOvertime(e.target.checked)}
                        className="mb-2"
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Exclude Incomplete Entries"
                        checked={excludeIncomplete}
                        onChange={(e) => setExcludeIncomplete(e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Group Similar Pay Codes"
                        checked={groupSimilar}
                        onChange={(e) => setGroupSimilar(e.target.checked)}
                        className="mb-2"
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* SAGE Integration */}
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <Share2 size={18} className="me-2" />
                    SAGE Integration Options
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Form.Check
                    type="checkbox"
                    label="Automatically send to SAGE after generation"
                    checked={autoSendSage}
                    onChange={(e) => setAutoSendSage(e.target.checked)}
                    className="mb-3"
                  />
                  {autoSendSage && (
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>SAGE Data Format</Form.Label>
                          <Form.Select value={sageFormat} onChange={(e) => setSageFormat(e.target.value)}>
                            <option value="standard">Standard Format</option>
                            <option value="payroll">Payroll Format</option>
                            <option value="timesheet">Timesheet Format</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Field Mapping</Form.Label>
                          <Form.Select value={sageMapping} onChange={(e) => setSageMapping(e.target.value)}>
                            <option value="default">Default Mapping</option>
                            <option value="custom">Custom Mapping</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>

              {/* Action Buttons */}
              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate('/timecard-rollup')}>
                  <ArrowLeft size={18} className="me-2" />
                  Back to Dashboard
                </Button>
                <div className="btn-group">
                  <Button variant="outline-primary" onClick={handlePreview} disabled={generating}>
                    <Eye size={18} className="me-2" />
                    Preview
                  </Button>
                  <Button variant="primary" onClick={handleGenerate} disabled={generating}>
                    {generating ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play size={18} className="me-2" />
                        Generate Rollup
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Rollup Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderPreviewContent()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => { setShowPreview(false); handleGenerate(); }}>
            <Play size={18} className="me-2" />
            Generate Full Rollup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
