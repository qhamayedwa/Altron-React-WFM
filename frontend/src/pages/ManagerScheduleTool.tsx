import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
}

interface Schedule {
  id: number;
  startTime: string;
  endTime: string;
  shiftType: {
    name: string;
    code: string;
  };
  needsApproval: boolean;
}

interface ShiftType {
  id: number;
  name: string;
  defaultStartTime: string;
  defaultEndTime: string;
}

export default function ManagerScheduleTool() {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Record<string, Schedule[]>>({});
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [stats, setStats] = useState({
    totalSchedules: 0,
    totalHours: 0,
    overtimeHours: 0,
    pendingApprovals: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    employeeId: '',
    date: '',
    shiftTypeId: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
    recurring: false
  });

  useEffect(() => {
    fetchData();
  }, [weekStart, selectedDepartment]);

  function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const fetchData = async () => {
    try {
      const [employeesRes, schedulesRes, shiftTypesRes] = await Promise.all([
        axios.get('/api/scheduling/team-employees', {
          params: { department: selectedDepartment || undefined }
        }),
        axios.get('/api/scheduling/team-schedule', {
          params: {
            startDate: weekStart.toISOString().split('T')[0],
            endDate: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            department: selectedDepartment || undefined
          }
        }),
        axios.get('/api/scheduling/shift-types')
      ]);

      setEmployees(employeesRes.data.employees || []);
      setSchedules(employeesRes.data.schedules || {});
      setShiftTypes(shiftTypesRes.data.shiftTypes || []);
      setStats(employeesRes.data.stats || stats);
      
      const depts = [...new Set(employeesRes.data.employees.map((e: Employee) => e.department).filter(Boolean))];
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const changeWeek = (direction: number) => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setWeekStart(newDate);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/scheduling/create', newSchedule);
      alert('Schedule created successfully');
      setShowCreateModal(false);
      fetchData();
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      alert(error.response?.data?.error || 'Failed to create schedule');
    }
  };

  const getDaySchedules = (employeeId: number, dayIndex: number): Schedule[] => {
    const key = `${employeeId}-${dayIndex}`;
    return schedules[key] || [];
  };

  const getEmployeeHours = (employeeId: number): number => {
    let total = 0;
    for (let day = 0; day < 7; day++) {
      const daySchedules = getDaySchedules(employeeId, day);
      daySchedules.forEach(schedule => {
        const start = new Date(`2000-01-01T${schedule.startTime}`);
        const end = new Date(`2000-01-01T${schedule.endTime}`);
        total += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      });
    }
    return total;
  };

  const formatWeekDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Schedule Management Tool</h2>
              <div className="d-flex gap-2">
                <button className="btn btn-success" onClick={() => setShowCreateModal(true)}>
                  <i className="bi bi-plus me-2"></i>Create Schedule
                </button>
                <button className="btn btn-outline-primary" onClick={() => navigate('/scheduling/edit-batch')}>
                  <i className="bi bi-files me-2"></i>Bulk Schedule
                </button>
                <button className="btn btn-outline-info" onClick={() => window.print()}>
                  <i className="bi bi-download me-2"></i>Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-4">
            <div className="btn-group" role="group">
              <button type="button" className="btn btn-outline-secondary" onClick={() => changeWeek(-1)}>
                <i className="bi bi-chevron-left"></i> Previous Week
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => changeWeek(1)}>
                Next Week <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 text-end">
            <h5 className="mb-0">Week of {formatWeekDate(weekStart)}</h5>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Team Schedule Overview</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '15%' }}>Employee</th>
                        <th style={{ width: '12%' }}>Monday</th>
                        <th style={{ width: '12%' }}>Tuesday</th>
                        <th style={{ width: '12%' }}>Wednesday</th>
                        <th style={{ width: '12%' }}>Thursday</th>
                        <th style={{ width: '12%' }}>Friday</th>
                        <th style={{ width: '12%' }}>Saturday</th>
                        <th style={{ width: '12%' }}>Sunday</th>
                        <th style={{ width: '10%' }}>Total Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => {
                        const totalHours = getEmployeeHours(employee.id);
                        return (
                          <tr key={employee.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  <span className="badge bg-secondary">
                                    {employee.firstName[0]}{employee.lastName[0]}
                                  </span>
                                </div>
                                <div>
                                  <strong>{employee.firstName} {employee.lastName}</strong><br />
                                  <small className="text-muted">{employee.department || 'No Dept'}</small>
                                </div>
                              </div>
                            </td>
                            {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                              const daySchedules = getDaySchedules(employee.id, day);
                              return (
                                <td key={day} className="bg-light">
                                  {daySchedules.map((schedule, idx) => (
                                    <div
                                      key={idx}
                                      className="schedule-item mb-1 p-1 rounded text-white"
                                      style={{
                                        background: 'linear-gradient(135deg, #007bff, #0056b3)',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => navigate(`/scheduling/edit/${schedule.id}`)}
                                    >
                                      <div className="fw-bold">{schedule.startTime} - {schedule.endTime}</div>
                                      <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>{schedule.shiftType.name}</div>
                                      {schedule.needsApproval && (
                                        <span className="badge bg-warning">Pending</span>
                                      )}
                                    </div>
                                  ))}
                                </td>
                              );
                            })}
                            <td className="text-center">
                              <strong>{totalHours.toFixed(0)}h</strong>
                              {totalHours > 40 && (
                                <>
                                  <br />
                                  <span className="badge bg-warning">OT</span>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h4 className="text-primary">{stats.totalSchedules}</h4>
                <small className="text-muted">Total Schedules</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h4 className="text-success">{stats.totalHours}</h4>
                <small className="text-muted">Total Hours</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h4 className="text-warning">{stats.overtimeHours}</h4>
                <small className="text-muted">Overtime Hours</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h4 className="text-info">{stats.pendingApprovals}</h4>
                <small className="text-muted">Pending Approvals</small>
              </div>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create New Schedule</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreateModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleCreateSchedule}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Employee</label>
                      <select
                        className="form-select"
                        value={newSchedule.employeeId}
                        onChange={(e) => setNewSchedule({ ...newSchedule, employeeId: e.target.value })}
                        required
                      >
                        <option value="">Select Employee...</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newSchedule.date}
                        onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Shift Type</label>
                      <select
                        className="form-select"
                        value={newSchedule.shiftTypeId}
                        onChange={(e) => {
                          const shiftType = shiftTypes.find(st => st.id === parseInt(e.target.value));
                          setNewSchedule({
                            ...newSchedule,
                            shiftTypeId: e.target.value,
                            startTime: shiftType?.defaultStartTime || '',
                            endTime: shiftType?.defaultEndTime || ''
                          });
                        }}
                        required
                      >
                        <option value="">Select Shift Type...</option>
                        {shiftTypes.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.defaultStartTime} - {st.defaultEndTime})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Start Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={newSchedule.startTime}
                          onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">End Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={newSchedule.endTime}
                          onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Work location (optional)"
                        value={newSchedule.location}
                        onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Additional notes..."
                        value={newSchedule.notes}
                        onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={newSchedule.recurring}
                        onChange={(e) => setNewSchedule({ ...newSchedule, recurring: e.target.checked })}
                        id="recurringCheck"
                      />
                      <label className="form-check-label" htmlFor="recurringCheck">
                        Create recurring schedule
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">Create Schedule</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
