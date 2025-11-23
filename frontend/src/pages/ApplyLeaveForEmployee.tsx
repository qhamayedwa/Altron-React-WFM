import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

interface LeaveType {
  id: number;
  name: string;
  code: string;
}

export default function ApplyLeaveForEmployee() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [formData, setFormData] = useState({
    userId: '',
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    isHourly: false,
    hoursRequested: '',
    autoApprove: false,
    reason: ''
  });
  const [balance, setBalance] = useState<number | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchLeaveTypes();
  }, []);

  useEffect(() => {
    if (formData.userId && formData.leaveTypeId) {
      fetchBalance();
    }
  }, [formData.userId, formData.leaveTypeId]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get('/api/leave/types');
      setLeaveTypes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`/api/leave/balance/${formData.userId}/${formData.leaveTypeId}`);
      setBalance(response.data.balance);
      setShowBalance(true);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setShowBalance(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/leave/apply-for-employee', {
        userId: parseInt(formData.userId),
        leaveTypeId: parseInt(formData.leaveTypeId),
        startDate: formData.startDate,
        endDate: formData.isHourly ? formData.startDate : formData.endDate,
        isHourly: formData.isHourly,
        hoursRequested: formData.isHourly ? parseFloat(formData.hoursRequested) : null,
        autoApprove: formData.autoApprove,
        reason: formData.reason
      });

      alert('Leave application submitted successfully');
      navigate('/leave/team-applications');
    } catch (error: any) {
      console.error('Error submitting leave application:', error);
      alert(error.response?.data?.error || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">
                  <i className="bi bi-person-plus me-2"></i>
                  Apply Leave for Employee
                </h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="userId" className="form-label">Employee *</label>
                        <select
                          name="userId"
                          id="userId"
                          className="form-select"
                          required
                          value={formData.userId}
                          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        >
                          <option value="">Select employee</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.username} - {user.fullName || `${user.firstName} ${user.lastName}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="leaveTypeId" className="form-label">Leave Type *</label>
                        <select
                          name="leaveTypeId"
                          id="leaveTypeId"
                          className="form-select"
                          required
                          value={formData.leaveTypeId}
                          onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                        >
                          <option value="">Select leave type</option>
                          {leaveTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isHourly"
                            checked={formData.isHourly}
                            onChange={(e) => setFormData({ ...formData, isHourly: e.target.checked })}
                          />
                          <label className="form-check-label" htmlFor="isHourly">
                            Hourly Leave Request
                          </label>
                        </div>
                      </div>

                      {formData.isHourly && (
                        <div className="mb-3">
                          <label htmlFor="hoursRequested" className="form-label">Hours Requested</label>
                          <input
                            type="number"
                            name="hoursRequested"
                            id="hoursRequested"
                            className="form-control"
                            step="0.5"
                            min="0.5"
                            max="8"
                            value={formData.hoursRequested}
                            onChange={(e) => setFormData({ ...formData, hoursRequested: e.target.value })}
                            required={formData.isHourly}
                          />
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="startDate" className="form-label">Start Date *</label>
                        <input
                          type="date"
                          name="startDate"
                          id="startDate"
                          className="form-control"
                          required
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>

                      {!formData.isHourly && (
                        <div className="mb-3">
                          <label htmlFor="endDate" className="form-label">End Date *</label>
                          <input
                            type="date"
                            name="endDate"
                            id="endDate"
                            className="form-control"
                            required={!formData.isHourly}
                            min={formData.startDate}
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          />
                        </div>
                      )}

                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="autoApprove"
                            checked={formData.autoApprove}
                            onChange={(e) => setFormData({ ...formData, autoApprove: e.target.checked })}
                          />
                          <label className="form-check-label" htmlFor="autoApprove">
                            Auto-approve this application
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="reason" className="form-label">Reason</label>
                    <textarea
                      name="reason"
                      id="reason"
                      className="form-control"
                      rows={3}
                      placeholder="Optional: Provide reason for leave request"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    ></textarea>
                  </div>

                  {showBalance && balance !== null && (
                    <div className="alert alert-info">
                      <small>
                        <strong>Employee Leave Balance:</strong> {balance.toFixed(1)} hours available
                      </small>
                    </div>
                  )}

                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/leave/team-applications')}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Back to Applications
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      <i className="bi bi-send me-2"></i>
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
