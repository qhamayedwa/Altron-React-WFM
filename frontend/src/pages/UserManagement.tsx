import { useState } from 'react';
import { Card, Button, Table, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { Users, UserPlus, Search, X } from 'lucide-react';

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Users size={28} className="me-2" />
          User Management
        </h2>
        <Button variant="primary">
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
                <Button variant="outline-primary" className="me-2">
                  <Search size={16} className="me-1" />
                  Search
                </Button>
                <Button variant="outline-secondary">
                  <X size={16} className="me-1" />
                  Clear
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Roles</th>
                  <th>Organization</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No users found. Use the filters above to search.
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
