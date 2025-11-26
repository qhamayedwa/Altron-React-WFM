import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Badge, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import { Calendar, Plus, Edit2, Trash2, Copy, Globe, Building, MapPin } from 'lucide-react';
import api from '../api/client';

interface Holiday {
  id: number;
  name: string;
  date: string;
  holidayType: 'public' | 'company' | 'regional';
  isRecurring: boolean;
  recurringDay?: number;
  recurringMonth?: number;
  appliesToAll: boolean;
  departmentIds?: string;
  isPaid: boolean;
  description?: string;
  isActive: boolean;
}

export default function HolidayManagement() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    holidayType: 'public' as 'public' | 'company' | 'regional',
    isRecurring: false,
    recurringDay: 1,
    recurringMonth: 1,
    appliesToAll: true,
    departmentIds: '',
    isPaid: true,
    description: ''
  });

  useEffect(() => {
    loadHolidays();
  }, [selectedYear]);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organization/holidays', {
        params: { year: selectedYear }
      });
      setHolidays(response.data.holidays || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingHoliday) {
        await api.put(`/organization/holidays/${editingHoliday.id}`, formData);
        setSuccess('Holiday updated successfully');
      } else {
        await api.post('/organization/holidays', formData);
        setSuccess('Holiday created successfully');
      }
      setShowModal(false);
      loadHolidays();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save holiday');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;

    try {
      await api.delete(`/organization/holidays/${id}`);
      setSuccess('Holiday deleted successfully');
      loadHolidays();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete holiday');
    }
  };

  const handleCopyToNextYear = async () => {
    if (!window.confirm(`Copy all ${selectedYear} holidays to ${selectedYear + 1}?`)) return;

    try {
      await api.post('/organization/holidays/copy-year', {
        fromYear: selectedYear,
        toYear: selectedYear + 1
      });
      setSuccess(`Holidays copied to ${selectedYear + 1}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to copy holidays');
    }
  };

  const openEditModal = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date.split('T')[0],
      holidayType: holiday.holidayType,
      isRecurring: holiday.isRecurring,
      recurringDay: holiday.recurringDay || 1,
      recurringMonth: holiday.recurringMonth || 1,
      appliesToAll: holiday.appliesToAll,
      departmentIds: holiday.departmentIds || '',
      isPaid: holiday.isPaid,
      description: holiday.description || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingHoliday(null);
    setFormData({
      name: '',
      date: '',
      holidayType: 'public',
      isRecurring: false,
      recurringDay: 1,
      recurringMonth: 1,
      appliesToAll: true,
      departmentIds: '',
      isPaid: true,
      description: ''
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'public': return <Globe size={16} className="text-primary" />;
      case 'company': return <Building size={16} className="text-success" />;
      case 'regional': return <MapPin size={16} className="text-warning" />;
      default: return <Calendar size={16} />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'public': return <Badge bg="primary">Public</Badge>;
      case 'company': return <Badge bg="success">Company</Badge>;
      case 'regional': return <Badge bg="warning">Regional</Badge>;
      default: return <Badge bg="secondary">{type}</Badge>;
    }
  };

  const filteredHolidays = holidays.filter(h => {
    if (activeTab === 'all') return true;
    return h.holidayType === activeTab;
  });

  const groupByMonth = (holidays: Holiday[]) => {
    const grouped: { [key: string]: Holiday[] } = {};
    holidays.forEach(h => {
      const month = new Date(h.date).toLocaleString('default', { month: 'long' });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(h);
    });
    return grouped;
  };

  const monthlyGroups = groupByMonth(filteredHolidays);

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 d-flex align-items-center gap-2">
            <Calendar className="text-primary" /> Holiday & Calendar Setup
          </h2>
          <p className="text-muted mb-0">Manage public holidays, company holidays, and regional observances</p>
        </div>
        <div className="d-flex gap-2">
          <Form.Select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ width: 120 }}
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Form.Select>
          <Button variant="outline-secondary" onClick={handleCopyToNextYear}>
            <Copy size={16} className="me-1" /> Copy to {selectedYear + 1}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => { resetForm(); setShowModal(true); }}
          >
            <Plus size={18} className="me-1" /> Add Holiday
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'all')} className="mb-0">
            <Tab eventKey="all" title={`All (${holidays.length})`} />
            <Tab eventKey="public" title={`Public (${holidays.filter(h => h.holidayType === 'public').length})`} />
            <Tab eventKey="company" title={`Company (${holidays.filter(h => h.holidayType === 'company').length})`} />
            <Tab eventKey="regional" title={`Regional (${holidays.filter(h => h.holidayType === 'regional').length})`} />
          </Tabs>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : filteredHolidays.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Calendar size={48} className="mb-3 opacity-50" />
              <p>No holidays found for {selectedYear}</p>
              <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
                Add First Holiday
              </Button>
            </div>
          ) : (
            Object.entries(monthlyGroups).map(([month, monthHolidays]) => (
              <div key={month}>
                <div className="px-3 py-2 bg-light border-bottom">
                  <h6 className="mb-0 fw-semibold">{month} {selectedYear}</h6>
                </div>
                <Table hover className="mb-0">
                  <tbody>
                    {monthHolidays.map(holiday => (
                      <tr key={holiday.id}>
                        <td style={{ width: 120 }}>
                          <div className="fw-semibold">
                            {new Date(holiday.date).toLocaleDateString('en-ZA', { 
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {getTypeIcon(holiday.holidayType)}
                            <span className="fw-medium">{holiday.name}</span>
                          </div>
                          {holiday.description && (
                            <small className="text-muted d-block">{holiday.description}</small>
                          )}
                        </td>
                        <td style={{ width: 100 }}>
                          {getTypeBadge(holiday.holidayType)}
                        </td>
                        <td style={{ width: 80 }}>
                          {holiday.isPaid ? (
                            <Badge bg="success-subtle" text="success">Paid</Badge>
                          ) : (
                            <Badge bg="secondary-subtle" text="secondary">Unpaid</Badge>
                          )}
                        </td>
                        <td style={{ width: 80 }}>
                          {holiday.isRecurring && (
                            <Badge bg="info-subtle" text="info">Recurring</Badge>
                          )}
                        </td>
                        <td style={{ width: 100 }} className="text-end">
                          <Button
                            variant="link"
                            size="sm"
                            className="p-1"
                            onClick={() => openEditModal(holiday)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-1 text-danger"
                            onClick={() => handleDelete(holiday.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ))
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Holiday Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., New Year's Day"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Holiday Type</Form.Label>
                  <Form.Select
                    value={formData.holidayType}
                    onChange={(e) => setFormData({ ...formData, holidayType: e.target.value as any })}
                  >
                    <option value="public">Public Holiday</option>
                    <option value="company">Company Holiday</option>
                    <option value="regional">Regional Observance</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="isPaid"
                  label="Paid Holiday"
                  checked={formData.isPaid}
                  onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                  className="mb-3"
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="isRecurring"
                  label="Recurring Annually"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="mb-3"
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="appliesToAll"
                  label="Applies to All Employees"
                  checked={formData.appliesToAll}
                  onChange={(e) => setFormData({ ...formData, appliesToAll: e.target.checked })}
                  className="mb-3"
                />
              </Col>
            </Row>

            {formData.isRecurring && (
              <Alert variant="info">
                <small>
                  This holiday will automatically appear on {formData.date ? new Date(formData.date).toLocaleDateString('en-ZA', { month: 'long', day: 'numeric' }) : 'the selected date'} every year.
                </small>
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingHoliday ? 'Update Holiday' : 'Create Holiday'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
