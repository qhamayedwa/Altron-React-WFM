import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

interface Employee {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  department_id: number | null;
  department?: {
    id: number;
    name: string;
  };
  pay_codes?: Array<{
    id: number;
    code: string;
    description: string;
  }>;
}

interface PayCode {
  id: number;
  code: string;
  description: string;
}

interface Department {
  id: number;
  name: string;
}

export default function BulkPayCodeAssignment() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payCodes, setPayCodes] = useState<PayCode[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<number>>(new Set());
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkPayCodeId, setBulkPayCodeId] = useState('');
  const [individualSelections, setIndividualSelections] = useState<Record<number, number>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [assignmentResults, setAssignmentResults] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [employeesRes, payCodesRes, departmentsRes] = await Promise.all([
        api.get('/users'),
        api.get('/pay-codes'),
        api.get('/organization/departments')
      ]);

      setEmployees(employeesRes.data.users || employeesRes.data || []);
      setPayCodes(payCodesRes.data.payCodes || payCodesRes.data || []);
      setDepartments(departmentsRes.data.departments || departmentsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const departmentMatch = !departmentFilter || employee.department_id?.toString() === departmentFilter;
    const searchMatch = !searchTerm || 
      `${employee.first_name} ${employee.last_name} ${employee.username}`.toLowerCase().includes(searchTerm.toLowerCase());
    return departmentMatch && searchMatch;
  });

  const toggleSelectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const toggleEmployee = (employeeId: number) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const applyBulkSelection = () => {
    if (!bulkPayCodeId) {
      alert('Please select a pay code first.');
      return;
    }
    if (selectedEmployees.size === 0) {
      alert('Please select at least one employee.');
      return;
    }

    const newSelections = { ...individualSelections };
    selectedEmployees.forEach(employeeId => {
      newSelections[employeeId] = parseInt(bulkPayCodeId);
    });
    setIndividualSelections(newSelections);
    alert(`Pay code applied to ${selectedEmployees.size} employees. Click "Save All Assignments" to confirm.`);
  };

  const assignIndividual = async (employeeId: number) => {
    const payCodeId = individualSelections[employeeId];
    if (!payCodeId) {
      alert('Please select a pay code first.');
      return;
    }

    try {
      await api.post('/pay-codes/assign', {
        userId: employeeId,
        payCodeId: payCodeId
      });
      
      await loadData();
      const newSelections = { ...individualSelections };
      delete newSelections[employeeId];
      setIndividualSelections(newSelections);
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.message || 'Failed to assign pay code'));
    }
  };

  const removePayCode = async (employeeId: number, payCodeId: number) => {
    if (!confirm('Are you sure you want to remove this pay code assignment?')) {
      return;
    }

    try {
      await api.post('/pay-codes/unassign', {
        userId: employeeId,
        payCodeId: payCodeId
      });
      
      await loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.message || 'Failed to remove pay code'));
    }
  };

  const saveAllAssignments = async () => {
    const assignments = Object.entries(individualSelections).map(([employeeId, payCodeId]) => ({
      userId: parseInt(employeeId),
      payCodeId: payCodeId
    }));

    if (assignments.length === 0) {
      alert('No assignments to save.');
      return;
    }

    try {
      await api.post('/pay-codes/assign-bulk', { assignments });
      
      setAssignmentResults({
        success: true,
        message: `${assignments.length} pay codes assigned successfully`,
        count: assignments.length
      });
      setShowSuccessModal(true);
      setIndividualSelections({});
      await loadData();
    } catch (error: any) {
      setAssignmentResults({
        success: false,
        message: error.response?.data?.message || 'Failed to save assignments'
      });
      setShowSuccessModal(true);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">
                <i className="bi bi-people me-2"></i>
                Assign Pay Codes to Employees
              </h2>
              <p className="text-muted mb-0">Manage pay code assignments for employees</p>
            </div>
            <div className="btn-group">
              <Link to="/pay-code-configuration" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Dashboard
              </Link>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={saveAllAssignments}
                disabled={Object.keys(individualSelections).length === 0}
              >
                <i className="bi bi-save me-2"></i>
                Save All Assignments ({Object.keys(individualSelections).length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label className="form-label">Filter by Department</label>
          <select 
            className="form-select" 
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Search Employee</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by name or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Bulk Actions</label>
          <div className="input-group">
            <select 
              className="form-select"
              value={bulkPayCodeId}
              onChange={(e) => setBulkPayCodeId(e.target.value)}
            >
              <option value="">Select Pay Code</option>
              {payCodes.map(pc => (
                <option key={pc.id} value={pc.id}>{pc.code} - {pc.description}</option>
              ))}
            </select>
            <button 
              type="button" 
              className="btn btn-outline-primary"
              onClick={applyBulkSelection}
            >
              Apply to Selected
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Employee Pay Code Assignments</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped mb-0">
              <thead className="table-dark">
                <tr>
                  <th>
                    <input 
                      type="checkbox" 
                      className="form-check-input"
                      checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Current Pay Codes</th>
                  <th>Assign Pay Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(employee => (
                  <tr key={employee.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        checked={selectedEmployees.has(employee.id)}
                        onChange={() => toggleEmployee(employee.id)}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-3 text-white">
                          {(employee.first_name || employee.username)[0].toUpperCase()}
                        </div>
                        <div>
                          <h6 className="mb-0">{employee.first_name} {employee.last_name}</h6>
                          <small className="text-muted">{employee.username}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {employee.department ? (
                        <span className="badge bg-secondary">{employee.department.name}</span>
                      ) : (
                        <span className="text-muted">No Department</span>
                      )}
                    </td>
                    <td>
                      {employee.pay_codes && employee.pay_codes.length > 0 ? (
                        employee.pay_codes.map(pc => (
                          <span key={pc.id} className="badge bg-info me-1 mb-1">
                            {pc.code}
                            <button
                              type="button"
                              className="btn-close btn-close-white btn-sm ms-1"
                              onClick={() => removePayCode(employee.id, pc.id)}
                              aria-label="Remove"
                              style={{ fontSize: '0.5rem' }}
                            ></button>
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">No pay codes assigned</span>
                      )}
                    </td>
                    <td>
                      <select 
                        className="form-select form-select-sm"
                        value={individualSelections[employee.id] || ''}
                        onChange={(e) => setIndividualSelections({
                          ...individualSelections,
                          [employee.id]: parseInt(e.target.value)
                        })}
                      >
                        <option value="">Select Pay Code</option>
                        {payCodes.map(pc => (
                          <option key={pc.id} value={pc.id}>{pc.code} - {pc.description}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          type="button" 
                          className="btn btn-outline-primary"
                          onClick={() => assignIndividual(employee.id)}
                          disabled={!individualSelections[employee.id]}
                        >
                          <i className="bi bi-plus me-1"></i>
                          Assign
                        </button>
                        <Link 
                          to={`/users/${employee.id}/edit`}
                          className="btn btn-outline-secondary"
                        >
                          <i className="bi bi-eye me-1"></i>
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Success/Error Modal */}
      {showSuccessModal && assignmentResults && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assignment Status</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowSuccessModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {assignmentResults.success ? (
                  <div className="alert alert-success">
                    <strong>Success!</strong> {assignmentResults.message}
                  </div>
                ) : (
                  <div className="alert alert-danger">
                    <strong>Error!</strong> {assignmentResults.message}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .avatar-sm {
          width: 40px;
          height: 40px;
          font-size: 18px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
