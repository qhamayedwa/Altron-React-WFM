import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import apiClient from '../lib/api';

export const DepartmentManagementPage: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchSites();
    fetchUsers();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.get('/organization/departments');
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await apiClient.get('/organization/sites');
      setSites(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/organization/departments');
      const allUsers: any[] = [];
      response.data.data?.forEach((dept: any) => {
        if (dept.users) {
          allUsers.push(...dept.users);
        }
      });
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleCreate = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      description: '',
      code: '',
      site_id: '',
      manager_id: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (dept: any) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      code: dept.code || '',
      site_id: dept.site_id || '',
      manager_id: dept.manager_id || '',
      is_active: dept.is_active !== false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingDept) {
        await apiClient.patch(`/organization/departments/${editingDept.id}`, formData);
        setSuccess('Department updated successfully!');
      } else {
        await apiClient.post('/organization/departments', formData);
        setSuccess('Department created successfully!');
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deptId: number) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/organization/departments/${deptId}`);
      setSuccess('Department deleted successfully!');
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete department');
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold" style={{ color: '#0057A8' }}>
            Department Management
          </h2>
          <p className="text-muted">Manage departments, assign managers, and organize teams</p>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={handleCreate}>
            + Create Department
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center">
            <Card.Body>
              <h3 className="fw-bold" style={{ color: '#0057A8' }}>{departments.length}</h3>
              <small className="text-muted">Total Departments</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center">
            <Card.Body>
              <h3 className="fw-bold text-success">
                {departments.filter(d => d.is_active !== false).length}
              </h3>
              <small className="text-muted">Active Departments</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center">
            <Card.Body>
              <h3 className="fw-bold" style={{ color: '#008C95' }}>
                {departments.filter(d => d.manager_id).length}
              </h3>
              <small className="text-muted">With Managers</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center">
            <Card.Body>
              <h3 className="fw-bold" style={{ color: '#62237A' }}>
                {departments.reduce((sum, d) => sum + (d.users?.length || 0), 0)}
              </h3>
              <small className="text-muted">Total Employees</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Departments Table */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: '#0057A8', color: 'white' }}>
              <h5 className="mb-0">All Departments</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Site</th>
                    <th>Manager</th>
                    <th>Employees</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.id}>
                      <td>
                        <strong>{dept.name}</strong>
                        {dept.description && (
                          <>
                            <br />
                            <small className="text-muted">{dept.description}</small>
                          </>
                        )}
                      </td>
                      <td>
                        {dept.code ? (
                          <Badge bg="secondary">{dept.code}</Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>{dept.site?.name || '-'}</td>
                      <td>
                        {dept.manager ? (
                          <>
                            <strong>{dept.manager.first_name} {dept.manager.last_name}</strong>
                            <br />
                            <small className="text-muted">{dept.manager.username}</small>
                          </>
                        ) : (
                          <span className="text-muted">No manager assigned</span>
                        )}
                      </td>
                      <td>
                        <Badge bg="info">{dept.users?.length || 0}</Badge>
                      </td>
                      <td>
                        {dept.is_active !== false ? (
                          <Badge bg="success">Active</Badge>
                        ) : (
                          <Badge bg="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2"
                          onClick={() => handleEdit(dept)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(dept.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {departments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        No departments found. Click "Create Department" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingDept ? 'Edit Department' : 'Create New Department'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Department Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., IT Department"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Department Code</Form.Label>
              <Form.Control
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., IT, HR, FIN"
              />
              <Form.Text className="text-muted">
                Short code for easy identification
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the department's purpose"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Site</Form.Label>
              <Form.Select
                value={formData.site_id || ''}
                onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
              >
                <option value="">No site assigned</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Select the physical location for this department
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Manager</Form.Label>
              <Form.Select
                value={formData.manager_id || ''}
                onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
              >
                <option value="">No manager assigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.username})
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Assign a manager responsible for this department
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Department'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
