import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Row, Col, Alert, Badge, InputGroup } from 'react-bootstrap';
import { Calendar, Plus, ArrowLeft, Save, Users, Search, CheckSquare, Square, X, Info } from 'lucide-react';
import api from '../api/client';

interface Employee {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  departmentName?: string;
}

interface ShiftType {
  id: number;
  name: string;
  defaultStartTime: string;
  defaultEndTime: string;
}

export default function CreateSchedule() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    shiftTypeId: '',
    startDateTime: '',
    endDateTime: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    setDefaultTimes();
  }, []);

  const loadData = async () => {
    try {
      const [employeesRes, shiftTypesRes] = await Promise.all([
        api.get('/users'),
        api.get('/scheduling/shift-types')
      ]);
      setEmployees(employeesRes.data.users || []);
      setShiftTypes(shiftTypesRes.data.shiftTypes || []);
    } catch (err: any) {
      setError('Failed to load data: ' + (err.response?.data?.error || err.message));
    }
  };

  const setDefaultTimes = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const defaultStart = tomorrow.toISOString().slice(0, 16);
    
    tomorrow.setHours(17, 0, 0, 0);
    const defaultEnd = tomorrow.toISOString().slice(0, 16);
    
    setFormData(prev => ({
      ...prev,
      startDateTime: defaultStart,
      endDateTime: defaultEnd
    }));
  };

  const toggleEmployee = (empId: number) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(empId)) {
      newSelected.delete(empId);
    } else {
      newSelected.add(empId);
    }
    setSelectedEmployees(newSelected);
  };

  const selectAll = () => {
    const filtered = getFilteredEmployees();
    setSelectedEmployees(new Set(filtered.map(e => e.id)));
  };

  const clearSelection = () => {
    setSelectedEmployees(new Set());
  };

  const getFilteredEmployees = () => {
    return employees.filter(emp => {
      const name = emp.fullName || emp.username || '';
      const dept = emp.departmentName || '';
      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             dept.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const handleShiftTypeChange = (shiftTypeId: string) => {
    setFormData(prev => ({ ...prev, shiftTypeId }));
    
    if (shiftTypeId) {
      const shiftType = shiftTypes.find(st => st.id === parseInt(shiftTypeId));
      if (shiftType && formData.startDateTime) {
        const currentDate = formData.startDateTime.split('T')[0];
        setFormData(prev => ({
          ...prev,
          startDateTime: `${currentDate}T${shiftType.defaultStartTime}`,
          endDateTime: `${currentDate}T${shiftType.defaultEndTime}`
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEmployees.size === 0) {
      setError('Please select at least one employee for scheduling.');
      return;
    }

    const startDate = new Date(formData.startDateTime);
    const endDate = new Date(formData.endDateTime);
    
    if (endDate <= startDate) {
      setError('End time must be after start time.');
      return;
    }

    const hoursDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      if (!window.confirm('This schedule is longer than 24 hours. Are you sure this is correct?')) {
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const promises = Array.from(selectedEmployees).map(userId => {
        const date = formData.startDateTime.split('T')[0];
        const startTime = formData.startDateTime.split('T')[1];
        const endTime = formData.endDateTime.split('T')[1];

        return api.post('/scheduling/create', {
          userId,
          shiftTypeId: formData.shiftTypeId ? parseInt(formData.shiftTypeId) : null,
          date,
          startTime,
          endTime,
          notes: formData.notes
        });
      });

      await Promise.all(promises);
      navigate('/manage-schedules');
    } catch (err: any) {
      setError('Failed to create schedule: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (emp: Employee) => {
    const first = emp.firstName?.charAt(0) || emp.username?.charAt(0) || '?';
    const last = emp.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const filteredEmployees = getFilteredEmployees();

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Plus size={28} className="me-2" />
          Create Employee Schedule
        </h2>
        <Button variant="outline-secondary" onClick={() => navigate('/manage-schedules')}>
          <ArrowLeft size={18} className="me-2" />
          Back to Schedules
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">
                <Users size={18} className="me-2" />
                Department Employees
              </h6>
            </Card.Header>
            <Card.Body>
              {employees.length > 0 ? (
                <>
                  <InputGroup size="sm" className="mb-3">
                    <InputGroup.Text>
                      <Search size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>

                  <div className="d-flex gap-2 mb-3">
                    <Button size="sm" variant="outline-primary" onClick={selectAll}>
                      <CheckSquare size={14} className="me-1" />
                      Select All
                    </Button>
                    <Button size="sm" variant="outline-secondary" onClick={clearSelection}>
                      <Square size={14} className="me-1" />
                      Clear All
                    </Button>
                  </div>
                  <small className="text-muted d-block mb-3">
                    Click employees to select multiple for batch scheduling
                  </small>

                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {filteredEmployees.map(emp => (
                      <div
                        key={emp.id}
                        className={`mb-2 p-2 border rounded ${selectedEmployees.has(emp.id) ? 'border-primary border-2' : ''}`}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: selectedEmployees.has(emp.id) ? '#e3f2fd' : '#f8f9fa',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => toggleEmployee(emp.id)}
                      >
                        <div className="d-flex align-items-center">
                          <Form.Check
                            type="checkbox"
                            checked={selectedEmployees.has(emp.id)}
                            onChange={() => toggleEmployee(emp.id)}
                            className="me-2"
                          />
                          <div
                            className="me-2 d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                            style={{
                              width: '40px',
                              height: '40px',
                              background: 'linear-gradient(135deg, #28468D, #1F4650)',
                              fontSize: '0.875rem'
                            }}
                          >
                            {getInitials(emp)}
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-medium">{emp.fullName || emp.username}</div>
                            <small className="text-muted">{emp.departmentName || 'Unassigned'}</small>
                            <div className="small text-success">
                              <span className="me-1">✓</span>
                              Available
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-3">
                  <Users size={32} className="mb-2" />
                  <p className="mb-0">No employees found in your department</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <Calendar size={20} className="me-2" />
                Schedule Details
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {selectedEmployees.size > 0 && (
                  <Alert variant="info" className="mb-3">
                    <div className="d-flex align-items-center">
                      <Users size={18} className="me-2" />
                      <div className="flex-grow-1">
                        <strong>Selected Employees ({selectedEmployees.size}):</strong>
                        <div className="mt-1">
                          {Array.from(selectedEmployees).map(id => {
                            const emp = employees.find(e => e.id === id);
                            return emp ? (
                              <Badge key={id} bg="primary" className="me-1 mb-1">
                                {emp.fullName || emp.username}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <Button size="sm" variant="outline-secondary" onClick={clearSelection}>
                        <X size={14} />
                      </Button>
                    </div>
                  </Alert>
                )}

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Batch Schedule Creation</Form.Label>
                    <div className="form-control-plaintext">
                      <Badge bg={selectedEmployees.size > 0 ? (selectedEmployees.size === 1 ? 'primary' : 'success') : 'secondary'}>
                        {selectedEmployees.size === 0
                          ? 'Select employees from the left panel'
                          : selectedEmployees.size === 1
                          ? '1 employee selected'
                          : `${selectedEmployees.size} employees selected for batch scheduling`}
                      </Badge>
                    </div>
                    <Form.Text>Multiple employees can be scheduled with the same time parameters</Form.Text>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Shift Type</Form.Label>
                    <Form.Select
                      value={formData.shiftTypeId}
                      onChange={(e) => handleShiftTypeChange(e.target.value)}
                    >
                      <option value="">Custom Schedule</option>
                      {shiftTypes.map(st => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.defaultStartTime} - {st.defaultEndTime})
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Start Date & Time *</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      required
                      value={formData.startDateTime}
                      onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>End Date & Time *</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      required
                      value={formData.endDateTime}
                      onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                    />
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Any special instructions or notes for this schedule..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </Form.Group>

                <Alert variant="info">
                  <Info size={18} className="me-2" />
                  <strong>Note:</strong> The system will check for scheduling conflicts before creating the schedule.
                  Employees will be notified of new schedule assignments.
                </Alert>

                <div className="d-flex justify-content-between">
                  <Button variant="outline-secondary" onClick={() => navigate('/manage-schedules')}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={loading}>
                    <Save size={18} className="me-2" />
                    {loading ? 'Creating...' : 'Create Schedule'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
