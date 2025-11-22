import { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Row, Col, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Users, UserPlus, Search, X, Edit, Trash2 } from 'lucide-react';
import api from '../api/client';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  department_id: number | null;
  is_active: boolean;
  created_at: string;
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !selectedRole || user.roles.includes(selectedRole);
    const matchesDepartment = !selectedDepartment || user.department_id === parseInt(selectedDepartment);
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Users size={28} className="me-2" />
          User Management
        </h2>
        <Button variant="primary" onClick={() => alert('User registration form will open here')}>
          <UserPlus size={18} className="me-2" />
          Register New User
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label>Search Users</Form.Label>
                <InputGroup>
                  <InputGroup.Text><Search size={18} /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, username, email, employee ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Label>Filter by Role</Form.Label>
                <Form.Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  <option value="">All Roles</option>
                  <option value="Super User">Super User</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Filter by Department</Form.Label>
                <Form.Select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                  <option value="">All Departments</option>
                </Form.Select>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRole('');
                    setSelectedDepartment('');
                  }}
                >
                  <X size={16} className="me-1" />
                  Clear
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Users ({filteredUsers.length})</h5>
          <Button variant="outline-primary" size="sm" onClick={loadUsers}>
            Refresh
          </Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading users...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5 text-danger">
              <p>{error}</p>
              <Button variant="primary" onClick={loadUsers}>Retry</Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Roles</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-4">
                        <Users size={48} className="text-muted mb-3" />
                        <p className="mb-0">No users found matching your filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td><strong>{user.username}</strong></td>
                        <td>{user.email}</td>
                        <td>{user.first_name} {user.last_name}</td>
                        <td>
                          {user.roles.map((role, idx) => (
                            <Badge bg="primary" className="me-1" key={idx}>
                              {role}
                            </Badge>
                          ))}
                        </td>
                        <td>{user.department_id || '-'}</td>
                        <td>
                          <Badge bg={user.is_active ? 'success' : 'danger'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Button variant="outline-primary" size="sm" title="Edit">
                              <Edit size={14} />
                            </Button>
                            <Button variant="outline-danger" size="sm" title="Delete">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
