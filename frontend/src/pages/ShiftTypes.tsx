import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Badge } from 'react-bootstrap';
import { Clock, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../api/client';

interface ShiftType {
  id: number;
  name: string;
  description?: string;
  code?: string;
  defaultStartTime: string;
  defaultEndTime: string;
  duration?: number;
  color?: string;
  isActive: boolean;
}

export default function ShiftTypes() {
  const navigate = useNavigate();
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShiftTypes();
  }, []);

  const loadShiftTypes = async () => {
    try {
      const response = await api.get('/scheduling/shift-types');
      setShiftTypes(response.data.shiftTypes || []);
    } catch (err) {
      console.error('Failed to load shift types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this shift type? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/scheduling/shift-types/${id}`);
      loadShiftTypes();
    } catch (err: any) {
      alert('Failed to delete shift type: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '-';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return '-';
    
    const start = new Date(`2000-01-01 ${startTime}`);
    let end = new Date(`2000-01-01 ${endTime}`);
    
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
    
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${hours.toFixed(1)} hours`;
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Clock size={28} className="me-2" />
          Shift Types Management
        </h2>
        <Button variant="primary" onClick={() => navigate('/shift-types/create')}>
          <Plus size={18} className="me-2" />
          Create Shift Type
        </Button>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Available Shift Types</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Shift Name</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : shiftTypes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      <Clock size={48} className="text-muted mb-3" />
                      <h5>No Shift Types Found</h5>
                      <p className="text-muted">Click "Create Shift Type" to add a new shift type.</p>
                    </td>
                  </tr>
                ) : (
                  shiftTypes.map(shiftType => (
                    <tr key={shiftType.id}>
                      <td>
                        {shiftType.color && (
                          <span
                            className="badge me-2"
                            style={{ backgroundColor: shiftType.color }}
                          >
                            &nbsp;
                          </span>
                        )}
                        <strong>{shiftType.name}</strong>
                        <br />
                        {shiftType.description && (
                          <small className="text-muted">{shiftType.description}</small>
                        )}
                      </td>
                      <td>{formatTime(shiftType.defaultStartTime)}</td>
                      <td>{formatTime(shiftType.defaultEndTime)}</td>
                      <td>{calculateDuration(shiftType.defaultStartTime, shiftType.defaultEndTime)}</td>
                      <td>
                        <Badge bg={shiftType.isActive ? 'success' : 'secondary'}>
                          {shiftType.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/shift-types/edit/${shiftType.id}`)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(shiftType.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
