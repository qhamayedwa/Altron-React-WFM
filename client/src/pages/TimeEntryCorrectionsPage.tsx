import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import apiClient from '../lib/api';

export const TimeEntryCorrectionsPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'all' | 'missing_clock_out' | 'long_shifts' | 'no_break'>('all');

  useEffect(() => {
    fetchProblemEntries();
  }, []);

  const fetchProblemEntries = async () => {
    try {
      const response = await apiClient.get('/time/entries', {
        params: {
          per_page: 1000,
          start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        },
      });
      setEntries(response.data.entries || []);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    }
  };

  const identifyIssues = (entry: any) => {
    const issues: string[] = [];
    
    if (!entry.clock_out_time && entry.status !== 'clocked_in') {
      issues.push('Missing Clock Out');
    }
    
    if (entry.total_hours && entry.total_hours > 12) {
      issues.push('Shift > 12 hours');
    }
    
    if (entry.total_hours && entry.total_hours > 6 && (!entry.break_time || entry.break_time === 0)) {
      issues.push('No Break Recorded');
    }
    
    if (entry.status === 'clocked_in' && new Date(entry.clock_in_time) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      issues.push('Still Clocked In (>24h)');
    }
    
    return issues;
  };

  const filterEntries = () => {
    let filtered = entries;
    
    switch (filter) {
      case 'missing_clock_out':
        filtered = entries.filter(e => !e.clock_out_time && e.status !== 'clocked_in');
        break;
      case 'long_shifts':
        filtered = entries.filter(e => e.total_hours && e.total_hours > 12);
        break;
      case 'no_break':
        filtered = entries.filter(e => e.total_hours && e.total_hours > 6 && (!e.break_time || e.break_time === 0));
        break;
      default:
        filtered = entries.filter(e => identifyIssues(e).length > 0);
    }
    
    return filtered;
  };

  const handleCorrect = (entry: any) => {
    setSelectedEntry(entry);
    
    const clockInTime = new Date(entry.clock_in_time);
    const clockOutTime = entry.clock_out_time ? new Date(entry.clock_out_time) : new Date();
    
    setFormData({
      clock_in_date: clockInTime.toISOString().split('T')[0],
      clock_in_time: clockInTime.toTimeString().slice(0, 5),
      clock_out_date: clockOutTime.toISOString().split('T')[0],
      clock_out_time: clockOutTime.toTimeString().slice(0, 5),
      break_time: entry.break_time || 30,
      notes: entry.notes || '',
      correction_reason: '',
    });
    
    setShowModal(true);
  };

  const handleSaveCorrection = async () => {
    if (!formData.correction_reason) {
      setError('Please provide a reason for this correction');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const clockInDateTime = new Date(`${formData.clock_in_date}T${formData.clock_in_time}:00`);
      const clockOutDateTime = new Date(`${formData.clock_out_date}T${formData.clock_out_time}:00`);

      await apiClient.patch(`/time/entries/${selectedEntry.id}`, {
        clock_in_time: clockInDateTime.toISOString(),
        clock_out_time: clockOutDateTime.toISOString(),
        break_time: parseInt(formData.break_time) || 0,
        notes: `${formData.notes || ''}\n[CORRECTION] ${formData.correction_reason}`,
      });

      setSuccess('Time entry corrected successfully!');
      setShowModal(false);
      fetchProblemEntries();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to correct time entry');
    } finally {
      setLoading(false);
    }
  };

  const handleForceClockOut = async (entryId: number) => {
    if (!confirm('Force clock out by correcting this entry?')) return;

    try {
      await apiClient.patch(`/time/entries/${entryId}`, {
        clock_out_time: new Date().toISOString(),
        notes: '[FORCED CLOCK OUT]',
      });
      setSuccess('Employee clocked out successfully!');
      fetchProblemEntries();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clock out');
    }
  };

  const filteredEntries = filterEntries();

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold" style={{ color: '#0057A8' }}>
            Time Entry Corrections
          </h2>
          <p className="text-muted">Review and fix timecard exceptions and errors</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Filter Tabs */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="btn-group w-100" role="group">
                <Button
                  variant={filter === 'all' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('all')}
                >
                  All Issues ({entries.filter(e => identifyIssues(e).length > 0).length})
                </Button>
                <Button
                  variant={filter === 'missing_clock_out' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('missing_clock_out')}
                >
                  Missing Clock Out ({entries.filter(e => !e.clock_out_time && e.status !== 'clocked_in').length})
                </Button>
                <Button
                  variant={filter === 'long_shifts' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('long_shifts')}
                >
                  Long Shifts ({entries.filter(e => e.total_hours && e.total_hours > 12).length})
                </Button>
                <Button
                  variant={filter === 'no_break' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('no_break')}
                >
                  No Break ({entries.filter(e => e.total_hours && e.total_hours > 6 && (!e.break_time || e.break_time === 0)).length})
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Problem Entries Table */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#F36E21', color: 'white' }}>
              <h5 className="mb-0">⚠️ Entries Requiring Attention</h5>
            </Card.Header>
            <Card.Body>
              {filteredEntries.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Hours</th>
                      <th>Break</th>
                      <th>Issues</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => {
                      const issues = identifyIssues(entry);
                      return (
                        <tr key={entry.id}>
                          <td>
                            <strong>{entry.user?.first_name} {entry.user?.last_name}</strong>
                            <br />
                            <small className="text-muted">{entry.user?.username}</small>
                          </td>
                          <td>{new Date(entry.clock_in_time).toLocaleDateString()}</td>
                          <td>{new Date(entry.clock_in_time).toLocaleTimeString()}</td>
                          <td>
                            {entry.clock_out_time ? (
                              new Date(entry.clock_out_time).toLocaleTimeString()
                            ) : (
                              <Badge bg="danger">Missing</Badge>
                            )}
                          </td>
                          <td>
                            {entry.total_hours ? (
                              <span className={entry.total_hours > 12 ? 'text-danger fw-bold' : ''}>
                                {entry.total_hours.toFixed(2)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            {entry.break_time ? (
                              `${entry.break_time} min`
                            ) : (
                              <Badge bg="warning">None</Badge>
                            )}
                          </td>
                          <td>
                            {issues.map((issue, idx) => (
                              <Badge key={idx} bg="danger" className="me-1 mb-1">
                                {issue}
                              </Badge>
                            ))}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="me-2"
                              onClick={() => handleCorrect(entry)}
                            >
                              Correct
                            </Button>
                            {entry.status === 'clocked_in' && (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleForceClockOut(entry.id)}
                              >
                                Force Clock Out
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="success" className="text-center">
                  <h5>✓ No issues found!</h5>
                  <p className="mb-0">All time entries are valid.</p>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Correction Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Correct Time Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEntry && (
            <>
              <Alert variant="info">
                <strong>Employee:</strong> {selectedEntry.user?.first_name} {selectedEntry.user?.last_name}
                <br />
                <strong>Original Date:</strong> {new Date(selectedEntry.clock_in_time).toLocaleString()}
              </Alert>

              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Clock In Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.clock_in_date || ''}
                        onChange={(e) => setFormData({ ...formData, clock_in_date: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Clock In Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={formData.clock_in_time || ''}
                        onChange={(e) => setFormData({ ...formData, clock_in_time: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Clock Out Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.clock_out_date || ''}
                        onChange={(e) => setFormData({ ...formData, clock_out_date: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Clock Out Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={formData.clock_out_time || ''}
                        onChange={(e) => setFormData({ ...formData, clock_out_time: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Break Time (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.break_time || ''}
                    onChange={(e) => setFormData({ ...formData, break_time: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Correction Reason *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.correction_reason || ''}
                    onChange={(e) => setFormData({ ...formData, correction_reason: e.target.value })}
                    placeholder="Required: Explain why this correction is being made..."
                    required
                  />
                  <Form.Text className="text-danger">
                    This will be appended to the entry notes for audit purposes
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Additional Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveCorrection} disabled={loading}>
            {loading ? 'Saving...' : 'Save Correction'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
