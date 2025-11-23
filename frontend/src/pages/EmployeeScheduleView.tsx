import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

interface Schedule {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: {
    name: string;
  };
  location?: string;
  durationHours: number;
}

export default function EmployeeScheduleView() {
  const { id } = useParams();
  const [weekStart, setWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [scheduledDays, setScheduledDays] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [upcomingShifts, setUpcomingShifts] = useState<Schedule[]>([]);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeRequest, setChangeRequest] = useState({
    changeType: '',
    date: '',
    reason: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchSchedule();
  }, [id, weekStart]);

  function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const fetchSchedule = async () => {
    try {
      const endDate = new Date(weekStart);
      endDate.setDate(endDate.getDate() + 6);

      const response = await axios.get(`/api/scheduling/employee-schedule/${id}`, {
        params: {
          startDate: weekStart.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });

      setSchedules(response.data.schedules || []);
      setTotalHours(response.data.totalHours || 0);
      setScheduledDays(response.data.scheduledDays || 0);
      setOvertimeHours(response.data.overtimeHours || 0);
      setUpcomingShifts(response.data.upcomingShifts || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const changeWeek = (direction: number) => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setWeekStart(newDate);
  };

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/scheduling/request-change', {
        ...changeRequest,
        employeeId: id
      });
      alert('Schedule change request submitted successfully');
      setShowChangeModal(false);
      setChangeRequest({
        changeType: '',
        date: '',
        reason: '',
        priority: 'medium'
      });
    } catch (error: any) {
      console.error('Error submitting change request:', error);
      alert(error.response?.data?.error || 'Failed to submit change request');
    }
  };

  const getSchedulesByDay = () => {
    const schedulesByDay: Record<number, Schedule[]> = {};
    schedules.forEach(schedule => {
      const scheduleDate = new Date(schedule.date);
      const dayOfWeek = scheduleDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      if (!schedulesByDay[adjustedDay]) {
        schedulesByDay[adjustedDay] = [];
      }
      schedulesByDay[adjustedDay].push(schedule);
    });
    return schedulesByDay;
  };

  const schedulesByDay = getSchedulesByDay();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  const formatWeekDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>My Schedule</h2>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary" onClick={() => window.print()}>
                  <i className="bi bi-download me-2"></i>Export Schedule
                </button>
                <button className="btn btn-primary" onClick={() => setShowChangeModal(true)}>
                  <i className="bi bi-pencil me-2"></i>Request Change
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="btn-group" role="group">
              <button type="button" className="btn btn-outline-secondary" onClick={() => changeWeek(-1)}>
                <i className="bi bi-chevron-left"></i> Previous Week
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => changeWeek(1)}>
                Next Week <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
          <div className="col-md-6 text-end">
            <h5 className="mb-0">Week of {formatWeekDate(weekStart)}</h5>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Weekly Schedule</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '15%' }}>Time</th>
                        {days.map((day) => (
                          <th key={day} style={{ width: '12%' }}>{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hours.map((hour) => (
                        <tr key={hour}>
                          <td className="bg-light fw-medium">{`${hour.toString().padStart(2, '0')}:00`}</td>
                          {days.map((_, dayIndex) => {
                            const daySchedules = schedulesByDay[dayIndex] || [];
                            const matchingSchedules = daySchedules.filter(schedule => {
                              const startHour = parseInt(schedule.startTime.split(':')[0]);
                              const endHour = parseInt(schedule.endTime.split(':')[0]);
                              return startHour <= hour && hour < endHour;
                            });

                            return (
                              <td key={dayIndex} style={{ height: '50px', verticalAlign: 'top', position: 'relative' }}>
                                {matchingSchedules.map((schedule, idx) => {
                                  const startHour = parseInt(schedule.startTime.split(':')[0]);
                                  if (startHour === hour) {
                                    return (
                                      <div
                                        key={idx}
                                        className="p-2 rounded text-white"
                                        style={{
                                          background: 'linear-gradient(135deg, #007bff, #0056b3)',
                                          fontSize: '0.75rem',
                                          lineHeight: '1.2',
                                          margin: '2px'
                                        }}
                                      >
                                        <strong>{schedule.shiftType.name}</strong><br />
                                        <small>{schedule.startTime} - {schedule.endTime}</small>
                                        {schedule.location && (
                                          <>
                                            <br />
                                            <small><i className="bi bi-geo-alt"></i> {schedule.location}</small>
                                          </>
                                        )}
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Weekly Summary</h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-4">
                    <strong>{totalHours}</strong><br />
                    <small className="text-muted">Total Hours</small>
                  </div>
                  <div className="col-4">
                    <strong>{scheduledDays}</strong><br />
                    <small className="text-muted">Scheduled Days</small>
                  </div>
                  <div className="col-4">
                    <strong>{overtimeHours}</strong><br />
                    <small className="text-muted">Overtime Hours</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Upcoming Shifts</h6>
              </div>
              <div className="card-body">
                {upcomingShifts.length > 0 ? (
                  upcomingShifts.map((shift, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong>{new Date(shift.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}</strong> - {shift.shiftType.name}<br />
                        <small className="text-muted">{shift.startTime} - {shift.endTime}</small>
                      </div>
                      <span className="badge bg-primary">{shift.durationHours}h</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted mb-0">No upcoming shifts scheduled</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {showChangeModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Request Schedule Change</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowChangeModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleRequestChange}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Change Type</label>
                      <select
                        className="form-select"
                        value={changeRequest.changeType}
                        onChange={(e) => setChangeRequest({ ...changeRequest, changeType: e.target.value })}
                        required
                      >
                        <option value="">Select change type...</option>
                        <option value="shift_swap">Shift Swap</option>
                        <option value="time_off">Time Off Request</option>
                        <option value="schedule_change">Schedule Change</option>
                        <option value="overtime">Overtime Request</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={changeRequest.date}
                        onChange={(e) => setChangeRequest({ ...changeRequest, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Reason</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Please explain your request..."
                        value={changeRequest.reason}
                        onChange={(e) => setChangeRequest({ ...changeRequest, reason: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={changeRequest.priority}
                        onChange={(e) => setChangeRequest({ ...changeRequest, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowChangeModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">Submit Request</button>
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
