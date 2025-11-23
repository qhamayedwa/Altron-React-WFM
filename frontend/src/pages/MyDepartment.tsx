import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Calendar, Umbrella, Mail, Phone, AlertCircle } from 'lucide-react';

interface TeamMember {
  id: number;
  username: string;
  full_name?: string;
  email?: string;
  phone?: string;
  employee_id?: string;
  is_clocked_in?: boolean;
  clock_in_time?: string;
  todays_hours?: number;
}

interface Department {
  id: number;
  name: string;
  description?: string;
}

export default function MyDepartment() {
  const navigate = useNavigate();
  const [department, setDepartment] = useState<Department | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    scheduled: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMyDepartment();
  }, []);

  const loadMyDepartment = async () => {
    try {
      const response = await fetch('/api/v1/organization/my-department');
      if (response.ok) {
        const data = await response.json();
        setDepartment(data.department);
        setTeamMembers(data.team_members || []);
        setStats({
          total: (data.team_members || []).length,
          active: data.active_count || 0,
          onLeave: data.on_leave_count || 0,
          scheduled: data.scheduled_count || 0
        });
      }
    } catch (err) {
      console.error('Error loading department:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-5 text-center">Loading...</div>;
  }

  if (!department) {
    return (
      <div className="py-5 text-center">
        <AlertCircle size={64} className="text-warning mb-3" />
        <h3 className="text-muted">No Department Assigned</h3>
        <p className="text-muted">You are not currently assigned as manager of any department.</p>
        <p className="text-muted">Please contact your administrator to assign you to a department.</p>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <Users size={28} className="me-2" />
            {department.name}
          </h2>
          {department.description && (
            <p className="text-muted mb-0">{department.description}</p>
          )}
        </div>
        <div className="text-end">
          <Badge bg="primary" className="fs-6">{stats.total} Team Members</Badge>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="text-center">
            <Card.Body>
              <h5 className="card-title text-primary">{stats.total}</h5>
              <p className="card-text">Total Employees</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <Card.Body>
              <h5 className="card-title text-success">{stats.active}</h5>
              <p className="card-text">Active Today</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <Card.Body>
              <h5 className="card-title text-warning">{stats.onLeave}</h5>
              <p className="card-text">On Leave</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center">
            <Card.Body>
              <h5 className="card-title text-info">{stats.scheduled}</h5>
              <p className="card-text">Scheduled Today</p>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <Users size={20} className="me-2" />
            Department Team Members
          </h5>
        </Card.Header>
        <Card.Body>
          {teamMembers.length > 0 ? (
            <div className="table-responsive">
              <Table striped>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Contact</th>
                    <th>Employee ID</th>
                    <th>Status</th>
                    <th>Today's Hours</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <div
                              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '40px', height: '40px' }}
                            >
                              {(member.full_name || member.username)[0].toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <strong>{member.full_name || member.username}</strong>
                            <br />
                            <small className="text-muted">@{member.username}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {member.email && (
                          <div>
                            <Mail size={16} className="me-1" /> {member.email}
                          </div>
                        )}
                        {member.phone && (
                          <div>
                            <Phone size={16} className="me-1" /> {member.phone}
                          </div>
                        )}
                        {!member.email && !member.phone && (
                          <span className="text-muted">No contact info</span>
                        )}
                      </td>
                      <td>
                        {member.employee_id ? (
                          <Badge bg="light" text="dark">{member.employee_id}</Badge>
                        ) : (
                          <span className="text-muted">Not assigned</span>
                        )}
                      </td>
                      <td>
                        {member.is_clocked_in ? (
                          <>
                            <Badge bg="success">Clocked In</Badge>
                            <br />
                            <small className="text-muted">
                              Since {member.clock_in_time ? new Date(member.clock_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </small>
                          </>
                        ) : (
                          <Badge bg="secondary">Clocked Out</Badge>
                        )}
                      </td>
                      <td>
                        {member.todays_hours ? (
                          <strong>{member.todays_hours.toFixed(1)}h</strong>
                        ) : (
                          <span className="text-muted">0.0h</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button
                            variant="outline-primary"
                            title="View Timecard"
                            onClick={() => navigate(`/time-attendance/team-timecard/${member.id}`)}
                          >
                            <Clock size={16} />
                          </Button>
                          <Button
                            variant="outline-success"
                            title="View Schedule"
                            onClick={() => navigate('/scheduling/my-schedule')}
                          >
                            <Calendar size={16} />
                          </Button>
                          <Button
                            variant="outline-warning"
                            title="Leave Management"
                            onClick={() => navigate('/leave/team-applications')}
                          >
                            <Umbrella size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <Users size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No Team Members</h5>
              <p className="text-muted">No employees are currently assigned to this department.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <div className="row mt-4">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => navigate('/time-attendance/team-timecard')}
                >
                  <Clock size={18} className="me-2" />
                  View Team Timecard
                </Button>
                <Button
                  variant="outline-success"
                  onClick={() => navigate('/scheduling/manage')}
                >
                  <Calendar size={18} className="me-2" />
                  Manage Team Schedules
                </Button>
                <Button
                  variant="outline-warning"
                  onClick={() => navigate('/leave/team-applications')}
                >
                  <Umbrella size={18} className="me-2" />
                  Team Leave Requests
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Department Information</h6>
            </Card.Header>
            <Card.Body>
              <dl className="row">
                <dt className="col-sm-4">Department:</dt>
                <dd className="col-sm-8">{department.name}</dd>
                
                {department.description && (
                  <>
                    <dt className="col-sm-4">Description:</dt>
                    <dd className="col-sm-8">{department.description}</dd>
                  </>
                )}
                
                <dt className="col-sm-4">Team Size:</dt>
                <dd className="col-sm-8">{stats.total} employees</dd>
              </dl>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
