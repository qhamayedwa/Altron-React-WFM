import { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Alert, ButtonGroup } from 'react-bootstrap';
import { AlertTriangle, Users, ArrowLeft, Check, Clock, TrendingUp, MessageSquare, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface Exception {
  id: number;
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  work_date: string;
  clock_in_time: string;
  clock_out_time: string | null;
  total_hours: number;
  overtime_hours: number;
  status: string;
  notes: string;
  is_overtime: boolean;
  is_overtime_approved: boolean;
  approved_by_manager_id: number | null;
}

export default function TimeExceptions() {
  const navigate = useNavigate();
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [clockOutTime, setClockOutTime] = useState('');
  const [clockOutNotes, setClockOutNotes] = useState('');
  const [additionalNote, setAdditionalNote] = useState('');
  const [alertMessage, setAlertMessage] = useState<{type: string, message: string} | null>(null);

  useEffect(() => {
    loadExceptions();
  }, []);

  const loadExceptions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/time-attendance/exceptions');
      const data = response.data.exceptions || response.data || [];
      setExceptions(data);
    } catch (error) {
      console.error('Failed to load exceptions:', error);
      setExceptions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return null;
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getIssueBadge = (entry: Exception) => {
    if (entry.status === 'exception' || entry.status === 'Exception') {
      return <Badge bg="warning" text="dark">Manual Exception</Badge>;
    }
    if (!entry.clock_out_time) {
      return <Badge bg="danger">Missed Clock-Out</Badge>;
    }
    if (entry.total_hours > 10) {
      return <Badge bg="info">Long Shift ({entry.total_hours.toFixed(1)}h)</Badge>;
    }
    return <Badge bg="secondary">Exception</Badge>;
  };

  const approveException = async (entryId: number) => {
    if (!window.confirm('Are you sure you want to approve this exception?')) {
      return;
    }

    try {
      const response = await api.post(`/time-attendance/approve/${entryId}`);
      if (response.data.success) {
        setAlertMessage({ type: 'success', message: 'Exception approved successfully' });
        loadExceptions();
      } else {
        setAlertMessage({ type: 'danger', message: response.data.message || 'Failed to approve exception' });
      }
    } catch (error) {
      setAlertMessage({ type: 'danger', message: 'Error approving exception' });
    }
  };

  const approveOvertime = async (entryId: number) => {
    if (!window.confirm('Are you sure you want to approve overtime for this entry?')) {
      return;
    }

    try {
      const response = await api.post(`/time-attendance/approve-overtime/${entryId}`);
      if (response.data.success) {
        setAlertMessage({ type: 'success', message: 'Overtime approved successfully' });
        loadExceptions();
      } else {
        setAlertMessage({ type: 'danger', message: response.data.message || 'Failed to approve overtime' });
      }
    } catch (error) {
      setAlertMessage({ type: 'danger', message: 'Error approving overtime' });
    }
  };

  const openClockOutModal = (entryId: number) => {
    setSelectedEntryId(entryId);
    const now = new Date();
    now.setHours(17, 0, 0, 0);
    setClockOutTime(now.toISOString().slice(0, 16));
    setClockOutNotes('');
    setShowClockOutModal(true);
  };

  const openNoteModal = (entryId: number) => {
    setSelectedEntryId(entryId);
    setAdditionalNote('');
    setShowNoteModal(true);
  };

  const submitClockOut = async () => {
    if (!clockOutTime) {
      alert('Please enter a clock out time');
      return;
    }

    try {
      const response = await api.post(`/time-attendance/add-clock-out/${selectedEntryId}`, {
        clockOutTime: clockOutTime,
        notes: clockOutNotes
      });
      if (response.data.success) {
        setAlertMessage({ type: 'success', message: 'Clock out time updated successfully' });
        setShowClockOutModal(false);
        loadExceptions();
      } else {
        setAlertMessage({ type: 'danger', message: response.data.message || 'Failed to update clock out time' });
      }
    } catch (error) {
      setAlertMessage({ type: 'info', message: 'Clock out time would be updated (endpoint in progress)' });
      setShowClockOutModal(false);
    }
  };

  const submitNote = async () => {
    if (!additionalNote.trim()) {
      alert('Please enter a note');
      return;
    }

    try {
      const response = await api.post(`/time-attendance/add-note/${selectedEntryId}`, {
        note: additionalNote
      });
      if (response.data.success) {
        setAlertMessage({ type: 'success', message: 'Note added successfully' });
        setShowNoteModal(false);
        loadExceptions();
      } else {
        setAlertMessage({ type: 'danger', message: response.data.message || 'Failed to add note' });
      }
    } catch (error) {
      setAlertMessage({ type: 'info', message: 'Note would be added (endpoint in progress)' });
      setShowNoteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading exceptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <AlertTriangle size={28} className="me-2" />
          Time Card Exceptions
        </h2>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => navigate('/team-timecard')}>
            <Users size={18} className="me-2" />
            Team Timecard
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate('/time-attendance')}>
            <ArrowLeft size={18} className="me-2" />
            Dashboard
          </Button>
        </div>
      </div>

      {alertMessage && (
        <Alert 
          variant={alertMessage.type} 
          dismissible 
          onClose={() => setAlertMessage(null)}
          className="mb-4"
        >
          {alertMessage.message}
        </Alert>
      )}

      {exceptions.length > 0 ? (
        <>
          <Alert variant="warning" className="mb-4">
            <Info size={18} className="me-2" />
            <strong>{exceptions.length} exception(s) found</strong> that require manager attention.
          </Alert>

          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Issue</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Hours</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exceptions.map(entry => (
                      <tr 
                        key={entry.id} 
                        className={entry.status === 'exception' || entry.status === 'Exception' ? 'table-warning' : ''}
                      >
                        <td>
                          <strong>{entry.username}</strong>
                          <br />
                          <small className="text-muted">{entry.full_name || `${entry.first_name} ${entry.last_name}`}</small>
                        </td>
                        <td>{formatDate(entry.work_date || entry.clock_in_time)}</td>
                        <td>{getIssueBadge(entry)}</td>
                        <td>{formatTime(entry.clock_in_time)}</td>
                        <td>
                          {entry.clock_out_time ? (
                            formatTime(entry.clock_out_time)
                          ) : (
                            <span className="text-danger">Missing</span>
                          )}
                        </td>
                        <td>
                          {entry.total_hours > 0 ? (
                            <>
                              {entry.total_hours.toFixed(2)}
                              {entry.total_hours > 8 && (
                                <span className="text-warning ms-1">
                                  ({entry.overtime_hours?.toFixed(1) || (entry.total_hours - 8).toFixed(1)} OT)
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{entry.notes || '-'}</td>
                        <td>
                          <ButtonGroup size="sm">
                            {!entry.approved_by_manager_id && (
                              <Button 
                                variant="outline-success" 
                                onClick={() => approveException(entry.id)}
                                title="Approve Exception"
                              >
                                <Check size={14} />
                              </Button>
                            )}
                            {!entry.clock_out_time && (
                              <Button 
                                variant="outline-primary" 
                                onClick={() => openClockOutModal(entry.id)}
                                title="Add Clock Out"
                              >
                                <Clock size={14} />
                              </Button>
                            )}
                            {entry.is_overtime && !entry.is_overtime_approved && (
                              <Button 
                                variant="outline-warning" 
                                onClick={() => approveOvertime(entry.id)}
                                title="Approve Overtime"
                              >
                                <TrendingUp size={14} />
                              </Button>
                            )}
                            <Button 
                              variant="outline-info" 
                              onClick={() => openNoteModal(entry.id)}
                              title="Add Note"
                            >
                              <MessageSquare size={14} />
                            </Button>
                          </ButtonGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <CheckCircle size={64} className="text-success mb-3" />
            <h5 className="text-success">No Exceptions Found</h5>
            <p className="text-muted">All time entries are properly completed and approved.</p>
            <Button variant="primary" onClick={() => navigate('/team-timecard')}>
              <Users size={18} className="me-2" />
              View Team Timecard
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Add Clock Out Modal */}
      <Modal show={showClockOutModal} onHide={() => setShowClockOutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Clock Out Time</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Clock Out Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={clockOutTime}
                onChange={(e) => setClockOutTime(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={clockOutNotes}
                onChange={(e) => setClockOutNotes(e.target.value)}
                placeholder="Reason for manual clock out..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClockOutModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitClockOut}>
            Save Clock Out
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Note Modal */}
      <Modal show={showNoteModal} onHide={() => setShowNoteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Note to Time Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Additional Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={additionalNote}
                onChange={(e) => setAdditionalNote(e.target.value)}
                placeholder="Add manager notes about this time entry..."
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitNote}>
            Add Note
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
