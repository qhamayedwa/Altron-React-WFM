import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Edit } from 'lucide-react';

interface PayCode {
  id: number;
  code: string;
  name: string;
  description: string;
  hourly_rate: number | null;
  is_overtime: boolean;
  overtime_multiplier: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EditPayCode: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [payCode, setPayCode] = useState<PayCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    hourly_rate: '',
    is_overtime: false,
    overtime_multiplier: '1.5',
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayCode();
  }, [id]);

  const fetchPayCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pay-codes/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayCode(data);
        setFormData({
          code: data.code,
          name: data.name || data.description,
          description: data.description || '',
          hourly_rate: data.hourly_rate || '',
          is_overtime: data.is_overtime || false,
          overtime_multiplier: data.overtime_multiplier?.toString() || '1.5',
          is_active: data.is_active !== false
        });
      } else {
        setError('Failed to load pay code');
      }
    } catch (err) {
      setError('Failed to load pay code');
      console.error('Fetch pay code error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'code') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/pay-codes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code: formData.code,
          description: formData.name || formData.description,
          is_absence_code: false,
          is_active: formData.is_active,
          configuration: null
        })
      });

      if (response.ok) {
        navigate('/pay-codes');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update pay code');
      }
    } catch (err) {
      setError('Failed to update pay code. Please try again.');
      console.error('Update pay code error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!payCode) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">Pay code not found</div>
        <button onClick={() => navigate('/pay-codes')} className="btn btn-secondary">
          Back to Pay Codes
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Edit size={24} className="me-2" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
          Edit Pay Code: {payCode.code}
        </h2>
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

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Pay Code Information</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="code" className="form-label">Pay Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      maxLength={20}
                      style={{ textTransform: 'uppercase' }}
                    />
                    <small className="form-text text-muted">Unique identifier for this pay code</small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">Display Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="hourly_rate" className="form-label">Default Hourly Rate (R)</label>
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
                    <small className="form-text text-muted">Leave blank to use employee's rate</small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="is_overtime"
                        name="is_overtime"
                        checked={formData.is_overtime}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="is_overtime">
                        <strong>Overtime Pay Code</strong>
                      </label>
                    </div>
                  </div>
                </div>

                {formData.is_overtime && (
                  <div className="mb-3" id="overtime_settings">
                    <label htmlFor="overtime_multiplier" className="form-label">Overtime Multiplier</label>
                    <select
                      className="form-control"
                      id="overtime_multiplier"
                      name="overtime_multiplier"
                      value={formData.overtime_multiplier}
                      onChange={handleInputChange}
                    >
                      <option value="1.5">1.5x (Time and a Half)</option>
                      <option value="2.0">2.0x (Double Time)</option>
                      <option value="2.5">2.5x (Premium Rate)</option>
                    </select>
                  </div>
                )}

                <div className="mb-3">
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
                      <strong>Active Pay Code</strong>
                    </label>
                    <small className="form-text text-muted d-block">Inactive pay codes cannot be assigned to new employees</small>
                  </div>
                </div>

                {payCode.created_at && (
                  <div className="alert alert-info">
                    <strong>Pay Code Details:</strong><br />
                    Created: {new Date(payCode.created_at).toLocaleString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric', 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}<br />
                    {payCode.updated_at && payCode.updated_at !== payCode.created_at && (
                      <>
                        Last Modified: {new Date(payCode.updated_at).toLocaleString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric', 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </>
                    )}
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <button 
                    type="button"
                    onClick={() => navigate('/pay-codes')}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={saving}
                    style={{ backgroundColor: '#28468D', borderColor: '#28468D' }}
                  >
                    <Save size={18} className="me-2" />
                    {saving ? 'Updating...' : 'Update Pay Code'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPayCode;
