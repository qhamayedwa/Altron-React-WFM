import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

interface Employee {
  id: number;
  username: string;
  fullName: string;
  department: string;
}

interface ShiftType {
  id: number;
  name: string;
  defaultStartTime: string;
  defaultEndTime: string;
  durationHours: number;
}

interface BatchSchedule {
  id: number;
  employee: Employee;
}

export default function EditBatchSchedules() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get('batchId');

  const [batchSchedules, setBatchSchedules] = useState<BatchSchedule[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '',
    endTime: '',
    shiftTypeId: '',
    notes: ''
  });
  const [duration, setDuration] = useState('0.0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBatchData();
    fetchShiftTypes();
  }, [batchId]);

  useEffect(() => {
    calculateDuration();
  }, [formData.startTime, formData.endTime]);

  const fetchBatchData = async () => {
    try {
      const response = await axios.get(`/api/scheduling/batch/${batchId}`);
      setBatchSchedules(response.data.batchSchedules || []);
      
      if (response.data.templateSchedule) {
        const template = response.data.templateSchedule;
        setFormData({
          startDate: template.startTime?.split('T')[0] || '',
          startTime: template.startTime?.split('T')[1]?.substring(0, 5) || '',
          endTime: template.endTime?.split('T')[1]?.substring(0, 5) || '',
          shiftTypeId: template.shiftTypeId || '',
          notes: template.notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching batch data:', error);
    }
  };

  const fetchShiftTypes = async () => {
    try {
      const response = await axios.get('/api/scheduling/shift-types');
      setShiftTypes(response.data.shiftTypes || []);
    } catch (error) {
      console.error('Error fetching shift types:', error);
    }
  };

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}:00`);
      let end = new Date(`2000-01-01T${formData.endTime}:00`);

      if (end <= start) {
        end.setDate(end.getDate() + 1);
      }

      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      setDuration(diffHours.toFixed(1));
    }
  };

  const handleShiftTypeChange = (shiftTypeId: string) => {
    const shiftType = shiftTypes.find(st => st.id === parseInt(shiftTypeId));
    if (shiftType) {
      setFormData({
        ...formData,
        shiftTypeId,
        startTime: shiftType.defaultStartTime,
        endTime: shiftType.defaultEndTime
      });
      setDuration(shiftType.durationHours.toFixed(1));
    } else {
      setFormData({ ...formData, shiftTypeId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`/api/scheduling/batch/${batchId}`, formData);
      alert(`Successfully updated ${batchSchedules.length} schedules`);
      navigate('/scheduling/manage-schedules');
    } catch (error: any) {
      console.error('Error updating batch schedules:', error);
      alert(error.response?.data?.error || 'Failed to update batch schedules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Edit Batch Schedule</h2>
              <button className="btn btn-secondary" onClick={() => navigate('/scheduling/manage-schedules')}>
                <i className="bi bi-arrow-left"></i> Back to Schedules
              </button>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-people"></i> Batch Information
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3">
                <strong>Batch ID:</strong>
                <br />
                <small className="text-muted">{batchId}</small>
              </div>
              <div className="col-md-3">
                <strong>Employees in Batch:</strong>
                <br />
                <span className="badge bg-info">{batchSchedules.length} employees</span>
              </div>
              <div className="col-md-6">
                <strong>Current Schedule:</strong>
                <br />
                <small className="text-muted">
                  {formData.startDate && formData.startTime
                    ? `${new Date(formData.startDate).toLocaleDateString()} at ${formData.startTime} - ${formData.endTime}`
                    : 'Loading...'}
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">Employees Affected by This Change</h6>
          </div>
          <div className="card-body">
            <div className="row">
              {batchSchedules.map((schedule) => (
                <div key={schedule.id} className="col-md-3 mb-2">
                  <div className="p-2 border rounded bg-light">
                    <strong>{schedule.employee.username}</strong>
                    {schedule.employee.fullName && (
                      <>
                        <br />
                        <small className="text-muted">{schedule.employee.fullName}</small>
                      </>
                    )}
                    {schedule.employee.department && (
                      <>
                        <br />
                        <span className="badge bg-secondary">{schedule.employee.department}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Edit Schedule Details</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label htmlFor="startDate" className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-2 mb-3">
                  <label htmlFor="startTime" className="form-label">Start Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    id="startTime"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-2 mb-3">
                  <label htmlFor="endTime" className="form-label">End Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    id="endTime"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="shiftTypeId" className="form-label">Shift Type</label>
                  <select
                    className="form-control"
                    id="shiftTypeId"
                    value={formData.shiftTypeId}
                    onChange={(e) => handleShiftTypeChange(e.target.value)}
                  >
                    <option value="">Custom Schedule</option>
                    {shiftTypes.map((shiftType) => (
                      <option key={shiftType.id} value={shiftType.id}>
                        {shiftType.name} ({shiftType.defaultStartTime} - {shiftType.defaultEndTime})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 mb-3 d-flex align-items-end">
                  <span className="badge bg-info">{duration}h</span>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 mb-3">
                  <label htmlFor="notes" className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    rows={3}
                    placeholder="Add any additional notes for this batch schedule..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle"></i>
                    <strong> Warning:</strong> This will update all {batchSchedules.length} schedules in this batch.
                    Each employee's schedule will be changed to the same date and time specified above.
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/scheduling/manage-schedules')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <i className="bi bi-save"></i>
                  {loading ? ' Updating...' : ` Update Batch (${batchSchedules.length} schedules)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
