import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowLeft, Zap, Check, Download, RefreshCw, Settings } from 'lucide-react';
import { api } from '../lib/api';

interface OptimizationResult {
  success: boolean;
  suggestions?: {
    recommended_schedule: Array<{
      employee_id: string;
      shift_start: string;
      shift_end: string;
      shift_type: string;
      reasoning: string;
    }>;
    coverage_analysis: {
      peak_hours_covered: boolean;
      minimum_staffing_met: boolean;
      optimal_distribution: boolean;
    };
    efficiency_score: number;
    cost_estimate: string;
    notes: string[];
  };
  target_date?: string;
  employees_available?: number;
  error?: string;
}

export default function AISchedulingOptimizerPage() {
  const [targetDate, setTargetDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setTargetDate(tomorrow.toISOString().split('T')[0]);

    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await api.get('/organization/departments');
      if (response.data.success && response.data.departments) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/ai/suggest-schedule', {
        target_date: targetDate,
        department_id: departmentId ? parseInt(departmentId) : undefined,
      });
      setResult(response.data.data || response.data);
    } catch (error) {
      console.error('Optimization error:', error);
      setResult({
        success: false,
        error: 'Failed to generate optimized schedule. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <Cpu className="me-2" size={32} style={{ display: 'inline' }} />
            AI Scheduling Optimizer
          </h2>
          <p className="text-muted mb-0">
            Generate optimized schedules using intelligent analysis
          </p>
        </div>
        <Link to="/ai/dashboard" className="btn btn-outline-secondary">
          <ArrowLeft className="me-2" size={18} />
          Back to AI Dashboard
        </Link>
      </div>

      {/* Optimization Controls */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <Settings className="me-2" size={20} />
            Schedule Optimization Settings
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="target_date" className="form-label">
                    Target Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="target_date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="department_id" className="form-label">
                    Department (Optional)
                  </label>
                  <select
                    className="form-select"
                    id="department_id"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.code} - {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="me-2" size={18} />
                    Generate Optimized Schedule
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {result && !loading && result.success && result.suggestions && (
        <div className="card">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">
              <Check className="me-2" size={20} />
              Optimization Results
            </h5>
          </div>
          <div className="card-body">
            {/* Optimization Summary */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="text-center">
                  <h3 className="text-primary">{result.suggestions.efficiency_score || '--'}</h3>
                  <small className="text-muted">Efficiency Score</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <h3 className="text-success">
                    {result.suggestions.coverage_analysis?.optimal_distribution ? '✓' : 'Review'}
                  </h3>
                  <small className="text-muted">Coverage</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <h3 className="text-info">{result.suggestions.cost_estimate || '--'}</h3>
                  <small className="text-muted">Est. Cost</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <h3 className="text-warning">
                    {result.suggestions.recommended_schedule?.length || 0}
                  </h3>
                  <small className="text-muted">Employees</small>
                </div>
              </div>
            </div>

            {/* Recommended Schedule */}
            <div className="row">
              <div className="col-md-8">
                <h6>Recommended Schedule</h6>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead className="table-dark">
                      <tr>
                        <th>Employee</th>
                        <th>Shift Start</th>
                        <th>Shift End</th>
                        <th>Type</th>
                        <th>Reasoning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.suggestions.recommended_schedule?.map((item, idx) => (
                        <tr key={idx}>
                          <td>Employee {item.employee_id}</td>
                          <td>{item.shift_start}</td>
                          <td>{item.shift_end}</td>
                          <td>
                            <span className="badge bg-primary">{item.shift_type}</span>
                          </td>
                          <td>
                            <small>{item.reasoning || 'Optimized assignment'}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-md-4">
                <h6>AI Insights</h6>
                <div className="mb-3">
                  {result.suggestions.notes?.map((note, idx) => (
                    <div key={idx} className="alert alert-info alert-sm mb-2">
                      <small>{note}</small>
                    </div>
                  ))}
                </div>

                <h6 className="mt-3">Actions</h6>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => handleSubmit(new Event('submit') as any)}
                  >
                    <RefreshCw className="me-2" size={18} />
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {result && !loading && !result.success && (
        <div className="card">
          <div className="card-body">
            <div className="alert alert-warning">
              <p>{result.error || 'Failed to generate optimized schedule'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <h5>Optimizing Schedule...</h5>
            <p className="text-muted">
              AI is analyzing historical data and generating the optimal schedule
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
