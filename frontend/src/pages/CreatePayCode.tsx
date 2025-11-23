import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

const CreatePayCode: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    is_absence_code: false,
    pay_rate_factor: '',
    is_paid: true,
    requires_approval: true,
    deducts_from_balance: false,
    leave_type_id: '',
    max_hours_per_day: '',
    max_consecutive_days: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'code') {
      // Auto-uppercase and only allow alphanumeric
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase().replace(/[^A-Z0-9]/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Build configuration object for absence-specific settings
      let configuration = null;
      if (formData.is_absence_code) {
        configuration = JSON.stringify({
          is_paid: formData.is_paid,
          requires_approval: formData.requires_approval,
          deducts_from_balance: formData.deducts_from_balance,
          leave_type_id: formData.leave_type_id || null,
          max_hours_per_day: formData.max_hours_per_day ? parseFloat(formData.max_hours_per_day) : null,
          max_consecutive_days: formData.max_consecutive_days ? parseInt(formData.max_consecutive_days) : null,
          pay_rate_factor: formData.pay_rate_factor ? parseFloat(formData.pay_rate_factor) : 1.0
        });
      }

      const response = await fetch('/api/pay-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code: formData.code,
          description: formData.description,
          is_absence_code: formData.is_absence_code,
          is_active: true,
          configuration
        })
      });

      if (response.ok) {
        navigate('/pay-codes');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create pay code');
      }
    } catch (err) {
      setError('Failed to create pay code. Please try again.');
      console.error('Create pay code error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Create Pay Code</h1>
        <button 
          onClick={() => navigate('/pay-codes')}
          className="btn btn-outline-secondary"
        >
          <ArrowLeft size={18} className="me-2" />
          Back to Pay Codes
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Pay Code Details</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="code" className="form-label">Pay Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., SICK, VAC, OT"
                      style={{ textTransform: 'uppercase' }}
                    />
                    <div className="form-text">Short code identifier (uppercase letters only)</div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="description" className="form-label">Description *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Sick Leave"
                    />
                  </div>
                </div>

                {/* Code Type */}
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_absence_code"
                      name="is_absence_code"
                      checked={formData.is_absence_code}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="is_absence_code">
                      This is an absence code
                    </label>
                    <div className="form-text">Check if this code is used for tracking employee absences</div>
                  </div>
                </div>

                {/* Pay Rate Configuration */}
                <div className="mb-3">
                  <label htmlFor="pay_rate_factor" className="form-label">Pay Rate Factor</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      id="pay_rate_factor"
                      name="pay_rate_factor"
                      value={formData.pay_rate_factor}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="1.0"
                    />
                    <span className="input-group-text">x</span>
                  </div>
                  <div className="form-text">Multiplier for base pay rate (e.g., 1.5 for overtime, 0.0 for unpaid)</div>
                </div>

                {/* Absence-Specific Settings */}
                {formData.is_absence_code && (
                  <div id="absence-settings">
                    <hr />
                    <h6 className="mb-3">Absence Settings</h6>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="is_paid"
                            name="is_paid"
                            checked={formData.is_paid}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="is_paid">
                            Paid absence
                          </label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="requires_approval"
                            name="requires_approval"
                            checked={formData.requires_approval}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="requires_approval">
                            Requires approval
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="deducts_from_balance"
                            name="deducts_from_balance"
                            checked={formData.deducts_from_balance}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="deducts_from_balance">
                            Deducts from leave balance
                          </label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="leave_type_id" className="form-label">Linked Leave Type</label>
                        <select
                          className="form-select"
                          id="leave_type_id"
                          name="leave_type_id"
                          value={formData.leave_type_id}
                          onChange={handleInputChange}
                        >
                          <option value="">Select leave type...</option>
                        </select>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="max_hours_per_day" className="form-label">Max Hours Per Day</label>
                        <input
                          type="number"
                          className="form-control"
                          id="max_hours_per_day"
                          name="max_hours_per_day"
                          value={formData.max_hours_per_day}
                          onChange={handleInputChange}
                          step="0.5"
                          min="0"
                          max="24"
                          placeholder="8.0"
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="max_consecutive_days" className="form-label">Max Consecutive Days</label>
                        <input
                          type="number"
                          className="form-control"
                          id="max_consecutive_days"
                          name="max_consecutive_days"
                          value={formData.max_consecutive_days}
                          onChange={handleInputChange}
                          min="1"
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-end">
                  <button 
                    type="button"
                    onClick={() => navigate('/pay-codes')}
                    className="btn btn-outline-secondary me-2"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
                  >
                    <Save size={18} className="me-2" />
                    {loading ? 'Creating...' : 'Create Pay Code'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Help Panel */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Pay Code Examples</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Common Absence Codes:</strong>
                <ul className="list-unstyled mt-2">
                  <li><code>SICK</code> - Sick Leave</li>
                  <li><code>VAC</code> - Vacation</li>
                  <li><code>PTO</code> - Paid Time Off</li>
                  <li><code>UNPD</code> - Unpaid Leave</li>
                </ul>
              </div>
              
              <div className="mb-3">
                <strong>Common Payroll Codes:</strong>
                <ul className="list-unstyled mt-2">
                  <li><code>OT</code> - Overtime (1.5x)</li>
                  <li><code>DT</code> - Double Time (2.0x)</li>
                  <li><code>HOL</code> - Holiday Pay (1.5x)</li>
                  <li><code>CALL</code> - Call-out Pay</li>
                </ul>
              </div>

              <div className="alert alert-info">
                <small>
                  <strong>Tip:</strong> Use short, descriptive codes that are easy to remember and type.
                  Absence codes should be linked to leave types when they deduct from balances.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePayCode;
