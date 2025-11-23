import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Edit } from 'lucide-react';

interface PayRule {
  id: number;
  name: string;
  description: string;
  priority: number;
  conditions: string;
  actions: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EditPayRule: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [payRule, setPayRule] = useState<PayRule | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    priority: 100,
    description: '',
    is_active: true,
    day_of_week: [] as number[],
    start_hour: '',
    end_hour: '',
    overtime_threshold: '',
    employee_ids: '',
    roles: [] as string[],
    multiplier: '',
    bonus_amount: '',
    hourly_rate: '',
    deduction_amount: ''
  });

  useEffect(() => {
    fetchPayRule();
  }, [id]);

  const fetchPayRule = async () => {
    try {
      const response = await fetch(`/api/pay-rules/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayRule(data);
        
        const conditions = typeof data.conditions === 'string' 
          ? JSON.parse(data.conditions) 
          : data.conditions;
        const actions = typeof data.actions === 'string' 
          ? JSON.parse(data.actions) 
          : data.actions;

        setFormData({
          name: data.name || '',
          priority: data.priority || 100,
          description: data.description || '',
          is_active: data.is_active !== false,
          day_of_week: conditions.day_of_week || [],
          start_hour: conditions.time_range?.start?.toString() || '',
          end_hour: conditions.time_range?.end?.toString() || '',
          overtime_threshold: conditions.overtime_threshold?.toString() || '',
          employee_ids: conditions.employee_ids?.join(', ') || '',
          roles: conditions.roles || [],
          multiplier: actions.multiplier?.toString() || '',
          bonus_amount: actions.bonus_amount?.toString() || '',
          hourly_rate: actions.hourly_rate?.toString() || '',
          deduction_amount: actions.deduction_amount?.toString() || ''
        });
      }
    } catch (error) {
      console.error('Error fetching pay rule:', error);
      alert('Failed to load pay rule');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      day_of_week: prev.day_of_week.includes(day)
        ? prev.day_of_week.filter(d => d !== day)
        : [...prev.day_of_week, day]
    }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a rule name.');
      return;
    }

    if (!formData.multiplier && !formData.bonus_amount && !formData.hourly_rate && !formData.deduction_amount) {
      alert('Please specify at least one action (multiplier, bonus, hourly rate, or deduction).');
      return;
    }

    const conditions: any = {};
    const actions: any = {};

    if (formData.day_of_week.length > 0) {
      conditions.day_of_week = formData.day_of_week;
    }
    if (formData.start_hour && formData.end_hour) {
      conditions.time_range = {
        start: parseInt(formData.start_hour),
        end: parseInt(formData.end_hour)
      };
    }
    if (formData.overtime_threshold) {
      conditions.overtime_threshold = parseFloat(formData.overtime_threshold);
    }
    if (formData.employee_ids) {
      conditions.employee_ids = formData.employee_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    }
    if (formData.roles.length > 0) {
      conditions.roles = formData.roles;
    }

    if (formData.multiplier) {
      actions.multiplier = parseFloat(formData.multiplier);
    }
    if (formData.bonus_amount) {
      actions.bonus_amount = parseFloat(formData.bonus_amount);
    }
    if (formData.hourly_rate) {
      actions.hourly_rate = parseFloat(formData.hourly_rate);
    }
    if (formData.deduction_amount) {
      actions.deduction_amount = parseFloat(formData.deduction_amount);
    }

    try {
      const response = await fetch(`/api/pay-rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          priority: formData.priority,
          description: formData.description,
          is_active: formData.is_active,
          conditions,
          actions
        })
      });

      if (response.ok) {
        navigate(`/pay-rules/view/${id}`);
      } else {
        alert('Failed to update pay rule');
      }
    } catch (error) {
      console.error('Error updating pay rule:', error);
      alert('An error occurred while updating the pay rule');
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!payRule) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">Pay rule not found</div>
      </div>
    );
  }

  const days = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const roles = ['Employee', 'Manager', 'Super User', 'HR', 'Payroll'];

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <Edit className="me-2" size={28} style={{ display: 'inline', verticalAlign: 'middle' }} />
                Edit Pay Rule: {payRule.name}
              </h2>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/">Dashboard</a></li>
                  <li className="breadcrumb-item"><a href="/pay-rules">Pay Rules</a></li>
                  <li className="breadcrumb-item"><a href={`/pay-rules/view/${id}`}>{payRule.name}</a></li>
                  <li className="breadcrumb-item active">Edit</li>
                </ol>
              </nav>
            </div>
            <div className="d-flex gap-2">
              <button onClick={() => navigate(`/pay-rules/view/${id}`)} className="btn btn-outline-secondary">
                <ArrowLeft className="me-2" size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
                Back to Rule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Rule Configuration</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label">Rule Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="priority" className="form-label">Priority</label>
                    <input
                      type="number"
                      className="form-control"
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      min="1"
                      max="1000"
                    />
                    <small className="form-text text-muted">Lower numbers have higher priority (1 = highest)</small>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="is_active">
                      Rule is Active
                    </label>
                  </div>
                </div>

                {/* Conditions Section */}
                <h6 className="border-bottom pb-2 mb-3">Conditions</h6>

                {/* Day of Week */}
                <div className="mb-4">
                  <label className="form-label">Days of Week</label>
                  <div className="row">
                    {days.map(day => (
                      <div className="col-md-3 col-6" key={day.value}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`day_${day.value}`}
                            checked={formData.day_of_week.includes(day.value)}
                            onChange={() => handleDayToggle(day.value)}
                          />
                          <label className="form-check-label" htmlFor={`day_${day.value}`}>
                            {day.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Range */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="start_hour" className="form-label">Start Hour (24h format)</label>
                    <select
                      className="form-select"
                      id="start_hour"
                      name="start_hour"
                      value={formData.start_hour}
                      onChange={handleInputChange}
                    >
                      <option value="">No restriction</option>
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="end_hour" className="form-label">End Hour (24h format)</label>
                    <select
                      className="form-select"
                      id="end_hour"
                      name="end_hour"
                      value={formData.end_hour}
                      onChange={handleInputChange}
                    >
                      <option value="">No restriction</option>
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Overtime Threshold */}
                <div className="mb-4">
                  <label htmlFor="overtime_threshold" className="form-label">Overtime Threshold (hours per day)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="overtime_threshold"
                    name="overtime_threshold"
                    value={formData.overtime_threshold}
                    onChange={handleInputChange}
                    step="0.5"
                    min="0"
                    max="24"
                  />
                  <small className="form-text text-muted">Leave empty for no overtime threshold</small>
                </div>

                {/* Employee IDs */}
                <div className="mb-4">
                  <label htmlFor="employee_ids" className="form-label">Specific Employee IDs</label>
                  <input
                    type="text"
                    className="form-control"
                    id="employee_ids"
                    name="employee_ids"
                    value={formData.employee_ids}
                    onChange={handleInputChange}
                    placeholder="1, 2, 3"
                  />
                  <small className="form-text text-muted">Comma-separated list of employee IDs. Leave empty to apply to all employees.</small>
                </div>

                {/* Roles */}
                <div className="mb-4">
                  <label className="form-label">Employee Roles</label>
                  <div className="row">
                    {roles.map((role, index) => (
                      <div className="col-md-3 col-6" key={role}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`role_${index}`}
                            checked={formData.roles.includes(role)}
                            onChange={() => handleRoleToggle(role)}
                          />
                          <label className="form-check-label" htmlFor={`role_${index}`}>
                            {role}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Section */}
                <h6 className="border-bottom pb-2 mb-3">Actions</h6>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="multiplier" className="form-label">Rate Multiplier</label>
                    <input
                      type="number"
                      className="form-control"
                      id="multiplier"
                      name="multiplier"
                      value={formData.multiplier}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      max="10"
                    />
                    <small className="form-text text-muted">e.g., 1.5 for time-and-a-half</small>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="bonus_amount" className="form-label">Bonus Amount (R)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="bonus_amount"
                      name="bonus_amount"
                      value={formData.bonus_amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="hourly_rate" className="form-label">Fixed Hourly Rate (R)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="hourly_rate"
                      name="hourly_rate"
                      value={formData.hourly_rate}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="deduction_amount" className="form-label">Deduction Amount (R)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="deduction_amount"
                      name="deduction_amount"
                      value={formData.deduction_amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="d-flex gap-2">
                  <button type="submit" className="btn" style={{ backgroundColor: '#28468D', color: 'white' }}>
                    <Save className="me-2" size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    Update Rule
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/pay-rules/view/${id}`)}
                    className="btn btn-secondary"
                  >
                    <X className="me-2" size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">Rule Information</h6>
            </div>
            <div className="card-body">
              <table className="table table-borderless table-sm">
                <tbody>
                  <tr>
                    <td><strong>Created:</strong></td>
                    <td>{payRule.created_at ? new Date(payRule.created_at).toLocaleDateString() : 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td><strong>Last Updated:</strong></td>
                    <td>{payRule.updated_at ? new Date(payRule.updated_at).toLocaleDateString() : 'Never'}</td>
                  </tr>
                  <tr>
                    <td><strong>Status:</strong></td>
                    <td>
                      {payRule.is_active ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-danger">Inactive</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Configuration Tips</h6>
            </div>
            <div className="card-body">
              <small className="text-muted">
                <ul className="list-unstyled">
                  <li className="mb-2">• Lower priority numbers execute first</li>
                  <li className="mb-2">• Multiple conditions are combined with AND logic</li>
                  <li className="mb-2">• Actions define what happens when conditions are met</li>
                  <li className="mb-2">• Use the test feature to validate rules</li>
                </ul>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPayRule;
