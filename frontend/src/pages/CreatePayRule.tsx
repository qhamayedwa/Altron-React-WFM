import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';

interface ExampleRule {
  name: string;
  description: string;
  priority: number;
  conditions: any;
  actions: any;
}

const EXAMPLE_RULES: Record<string, ExampleRule> = {
  overtime: {
    name: 'Standard Overtime (1.5x)',
    description: 'Applies 1.5x pay rate for hours worked over 8 per day',
    priority: 100,
    conditions: {
      overtime_threshold: 8
    },
    actions: {
      pay_multiplier: 1.5,
      component_name: 'overtime_1_5'
    }
  },
  double_time: {
    name: 'Double Time (2.0x)',
    description: 'Applies 2.0x pay rate for hours worked over 12 per day',
    priority: 200,
    conditions: {
      overtime_threshold: 12
    },
    actions: {
      pay_multiplier: 2.0,
      component_name: 'double_time'
    }
  },
  weekend_premium: {
    name: 'Weekend Premium',
    description: 'Additional $2/hour for weekend work',
    priority: 150,
    conditions: {
      day_of_week: [5, 6]
    },
    actions: {
      shift_differential: 2.0,
      differential_name: 'weekend_premium'
    }
  },
  night_shift: {
    name: 'Night Shift Differential',
    description: 'Additional $1.50/hour for night shifts (18:00-06:00)',
    priority: 120,
    conditions: {
      time_range: { start: 18, end: 6 }
    },
    actions: {
      shift_differential: 1.5,
      differential_name: 'night_shift'
    }
  }
};

const CreatePayRule: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    priority: 100,
    description: '',
    day_of_week: [] as number[],
    start_hour: '',
    end_hour: '',
    overtime_threshold: '',
    employee_ids: '',
    roles: [] as string[],
    pay_multiplier: '',
    component_name: '',
    flat_allowance: '',
    allowance_name: '',
    shift_differential: '',
    differential_name: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const loadExample = (exampleKey: string) => {
    const example = EXAMPLE_RULES[exampleKey];
    if (!example) return;

    setFormData({
      name: example.name,
      priority: example.priority,
      description: example.description,
      day_of_week: example.conditions.day_of_week || [],
      start_hour: example.conditions.time_range?.start?.toString() || '',
      end_hour: example.conditions.time_range?.end?.toString() || '',
      overtime_threshold: example.conditions.overtime_threshold?.toString() || '',
      employee_ids: example.conditions.employee_ids?.join(', ') || '',
      roles: example.conditions.roles || [],
      pay_multiplier: example.actions.pay_multiplier?.toString() || '',
      component_name: example.actions.component_name || '',
      flat_allowance: example.actions.flat_allowance?.toString() || '',
      allowance_name: example.actions.allowance_name || '',
      shift_differential: example.actions.shift_differential?.toString() || '',
      differential_name: example.actions.differential_name || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      conditions.employee_ids = formData.employee_ids.split(',').map(id => parseInt(id.trim()));
    }
    if (formData.roles.length > 0) {
      conditions.roles = formData.roles;
    }

    if (formData.pay_multiplier) {
      actions.pay_multiplier = parseFloat(formData.pay_multiplier);
      if (formData.component_name) {
        actions.component_name = formData.component_name;
      }
    }
    if (formData.flat_allowance) {
      actions.flat_allowance = parseFloat(formData.flat_allowance);
      if (formData.allowance_name) {
        actions.allowance_name = formData.allowance_name;
      }
    }
    if (formData.shift_differential) {
      actions.shift_differential = parseFloat(formData.shift_differential);
      if (formData.differential_name) {
        actions.differential_name = formData.differential_name;
      }
    }

    if (Object.keys(conditions).length === 0) {
      alert('Please specify at least one condition.');
      return;
    }
    if (Object.keys(actions).length === 0) {
      alert('Please specify at least one action.');
      return;
    }

    try {
      const response = await fetch('/api/pay-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          priority: formData.priority,
          description: formData.description,
          conditions,
          actions
        })
      });

      if (response.ok) {
        navigate('/pay-rules');
      } else {
        alert('Failed to create pay rule');
      }
    } catch (error) {
      console.error('Error creating pay rule:', error);
      alert('An error occurred while creating the pay rule');
    }
  };

  const days = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
  ];

  const roles = ['Employee', 'Manager', 'Admin', 'Super User'];

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Plus className="me-2" size={28} style={{ display: 'inline', verticalAlign: 'middle' }} />
          Create Pay Rule
        </h2>
        <button onClick={() => navigate('/pay-rules')} className="btn btn-outline-secondary">
          <ArrowLeft className="me-2" size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
          Back to Rules
        </button>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="card mb-4">
                  <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
                    <h5 className="mb-0">Basic Information</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="name" className="form-label">Rule Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                          <div className="form-text">Unique name for this pay rule</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="priority" className="form-label">Priority</label>
                          <input
                            type="number"
                            className="form-control"
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            min="1"
                            max="999"
                          />
                          <div className="form-text">Lower numbers = higher priority</div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                      ></textarea>
                      <div className="form-text">Optional description of the rule purpose</div>
                    </div>
                  </div>
                </div>

                {/* Rule Conditions */}
                <div className="card mb-4">
                  <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
                    <h5 className="mb-0">Conditions (When to Apply)</h5>
                  </div>
                  <div className="card-body">
                    {/* Day of Week */}
                    <div className="mb-4">
                      <label className="form-label">Days of Week</label>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="btn-group flex-wrap" role="group">
                            {days.map(day => (
                              <React.Fragment key={day.value}>
                                <input
                                  type="checkbox"
                                  className="btn-check"
                                  id={`day_${day.value}`}
                                  checked={formData.day_of_week.includes(day.value)}
                                  onChange={() => handleDayToggle(day.value)}
                                />
                                <label 
                                  className="btn btn-outline-primary" 
                                  htmlFor={`day_${day.value}`}
                                  style={{ borderColor: '#28468D' }}
                                >
                                  {day.label}
                                </label>
                              </React.Fragment>
                            ))}
                          </div>
                          <div className="form-text mt-2">Select specific days when this rule applies (leave blank for all days)</div>
                        </div>
                      </div>
                    </div>

                    {/* Time Range */}
                    <div className="mb-4">
                      <label className="form-label">Time Range</label>
                      <div className="row">
                        <div className="col-md-6">
                          <label htmlFor="start_hour" className="form-label">Start Hour</label>
                          <select
                            className="form-select"
                            id="start_hour"
                            name="start_hour"
                            value={formData.start_hour}
                            onChange={handleInputChange}
                          >
                            <option value="">Any time</option>
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="end_hour" className="form-label">End Hour</label>
                          <select
                            className="form-select"
                            id="end_hour"
                            name="end_hour"
                            value={formData.end_hour}
                            onChange={handleInputChange}
                          >
                            <option value="">Any time</option>
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="form-text">Time range when shifts must start to apply this rule</div>
                    </div>

                    {/* Overtime Threshold */}
                    <div className="mb-4">
                      <label htmlFor="overtime_threshold" className="form-label">Overtime Threshold (Hours)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="overtime_threshold"
                        name="overtime_threshold"
                        min="0"
                        max="24"
                        step="0.5"
                        placeholder="e.g., 8.0"
                        value={formData.overtime_threshold}
                        onChange={handleInputChange}
                      />
                      <div className="form-text">Apply rule only when daily hours exceed this threshold</div>
                    </div>

                    {/* Employee Selection */}
                    <div className="mb-4">
                      <label htmlFor="employee_ids" className="form-label">Specific Employees</label>
                      <input
                        type="text"
                        className="form-control"
                        id="employee_ids"
                        name="employee_ids"
                        placeholder="e.g., 1,2,3"
                        value={formData.employee_ids}
                        onChange={handleInputChange}
                      />
                      <div className="form-text">Comma-separated employee IDs (leave blank for all employees)</div>
                    </div>

                    {/* Role Selection */}
                    <div className="mb-4">
                      <label className="form-label">Employee Roles</label>
                      <div className="row">
                        <div className="col-md-12">
                          {roles.map(role => (
                            <div className="form-check" key={role}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`role_${role}`}
                                checked={formData.roles.includes(role)}
                                onChange={() => handleRoleToggle(role)}
                              />
                              <label className="form-check-label" htmlFor={`role_${role}`}>
                                {role}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="form-text">Apply rule only to employees with these roles (leave blank for all roles)</div>
                    </div>
                  </div>
                </div>

                {/* Rule Actions */}
                <div className="card mb-4">
                  <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
                    <h5 className="mb-0">Actions (What to Calculate)</h5>
                  </div>
                  <div className="card-body">
                    {/* Pay Multiplier */}
                    <div className="mb-4">
                      <label className="form-label">Pay Multiplier</label>
                      <div className="row">
                        <div className="col-md-6">
                          <label htmlFor="pay_multiplier" className="form-label">Multiplier</label>
                          <input
                            type="number"
                            className="form-control"
                            id="pay_multiplier"
                            name="pay_multiplier"
                            min="0.1"
                            max="10"
                            step="0.1"
                            placeholder="e.g., 1.5"
                            value={formData.pay_multiplier}
                            onChange={handleInputChange}
                          />
                          <div className="form-text">Multiply applicable hours by this factor</div>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="component_name" className="form-label">Component Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="component_name"
                            name="component_name"
                            placeholder="e.g., overtime_1_5"
                            value={formData.component_name}
                            onChange={handleInputChange}
                          />
                          <div className="form-text">Name for this pay component</div>
                        </div>
                      </div>
                    </div>

                    {/* Flat Allowance */}
                    <div className="mb-4">
                      <label className="form-label">Flat Allowance</label>
                      <div className="row">
                        <div className="col-md-6">
                          <label htmlFor="flat_allowance" className="form-label">Amount ($)</label>
                          <input
                            type="number"
                            className="form-control"
                            id="flat_allowance"
                            name="flat_allowance"
                            min="0"
                            step="0.01"
                            placeholder="e.g., 25.00"
                            value={formData.flat_allowance}
                            onChange={handleInputChange}
                          />
                          <div className="form-text">Fixed dollar amount per occurrence</div>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="allowance_name" className="form-label">Allowance Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="allowance_name"
                            name="allowance_name"
                            placeholder="e.g., meal_allowance"
                            value={formData.allowance_name}
                            onChange={handleInputChange}
                          />
                          <div className="form-text">Name for this allowance</div>
                        </div>
                      </div>
                    </div>

                    {/* Shift Differential */}
                    <div className="mb-4">
                      <label className="form-label">Shift Differential</label>
                      <div className="row">
                        <div className="col-md-6">
                          <label htmlFor="shift_differential" className="form-label">Differential ($/hour)</label>
                          <input
                            type="number"
                            className="form-control"
                            id="shift_differential"
                            name="shift_differential"
                            min="0"
                            step="0.01"
                            placeholder="e.g., 2.00"
                            value={formData.shift_differential}
                            onChange={handleInputChange}
                          />
                          <div className="form-text">Additional amount per hour worked</div>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="differential_name" className="form-label">Differential Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="differential_name"
                            name="differential_name"
                            placeholder="e.g., night_differential"
                            value={formData.differential_name}
                            onChange={handleInputChange}
                          />
                          <div className="form-text">Name for this differential</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    onClick={() => navigate('/pay-rules')}
                    className="btn btn-secondary"
                  >
                    <X className="me-2" size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    Cancel
                  </button>
                  <button type="submit" className="btn" style={{ backgroundColor: '#28468D', color: 'white' }}>
                    <Save className="me-2" size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    Create Pay Rule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Example Rules Sidebar */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
              <h6 className="mb-0">Example Rules</h6>
            </div>
            <div className="card-body">
              {Object.entries(EXAMPLE_RULES).map(([key, rule]) => (
                <div className="card mb-3" key={key}>
                  <div className="card-body p-3">
                    <h6 className="card-title">{rule.name}</h6>
                    <p className="card-text small">{rule.description}</p>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => loadExample(key)}
                      style={{ borderColor: '#28468D', color: '#28468D' }}
                    >
                      Use This Example
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help Card */}
          <div className="card mt-3">
            <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
              <h6 className="mb-0">Rule Configuration Help</h6>
            </div>
            <div className="card-body">
              <h6>Conditions</h6>
              <ul className="small">
                <li><strong>Days:</strong> Rule applies only on selected days</li>
                <li><strong>Time:</strong> Rule applies to shifts starting in time range</li>
                <li><strong>Overtime:</strong> Rule applies when daily hours exceed threshold</li>
                <li><strong>Employees:</strong> Rule applies to specific employee IDs</li>
                <li><strong>Roles:</strong> Rule applies to employees with specific roles</li>
              </ul>

              <h6 className="mt-3">Actions</h6>
              <ul className="small">
                <li><strong>Multiplier:</strong> Multiply hours by factor (e.g., 1.5x for overtime)</li>
                <li><strong>Allowance:</strong> Add fixed dollar amount</li>
                <li><strong>Differential:</strong> Add amount per hour worked</li>
              </ul>

              <div className="alert alert-info small mt-3" style={{ borderLeftColor: '#54B8DF', borderLeftWidth: '3px' }}>
                <strong>Note:</strong> At least one condition and one action must be specified. Rules are processed in priority order (lower number = higher priority).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePayRule;
