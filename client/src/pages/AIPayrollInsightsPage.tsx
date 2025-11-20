import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ArrowLeft, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';

interface PayrollInsightsResult {
  success: boolean;
  insights?: {
    anomalies_detected: Array<{
      type: string;
      employee_id?: string;
      date?: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    cost_analysis: {
      total_hours_worked?: string;
      overtime_percentage: string;
      employees_tracked?: string;
    };
    recommendations: string[];
    compliance_notes: string[];
    efficiency_insights: string[];
  };
  period?: string;
  calculations_analyzed?: number;
  time_entries_analyzed?: number;
  error?: string;
}

export default function AIPayrollInsightsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PayrollInsightsResult | null>(null);

  useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/ai/generate-payroll-insights', {
        start_date: startDate,
        end_date: endDate,
      });
      setResult(response.data.data || response.data);
    } catch (error) {
      console.error('Payroll insights error:', error);
      setResult({
        success: false,
        error: 'Failed to generate payroll insights. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const classes = {
      low: 'bg-info',
      medium: 'bg-warning',
      high: 'bg-danger',
    };
    return classes[severity as keyof typeof classes] || 'bg-secondary';
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <DollarSign className="me-2" size={32} style={{ display: 'inline' }} />
            AI Payroll Insights
          </h2>
          <p className="text-muted mb-0">
            Analyze payroll data for anomalies, trends, and cost optimization
          </p>
        </div>
        <Link to="/ai/dashboard" className="btn btn-outline-secondary">
          <ArrowLeft className="me-2" size={18} />
          Back to AI Dashboard
        </Link>
      </div>

      {/* Analysis Controls */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <Calendar className="me-2" size={20} />
            Payroll Period Selection
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-5">
                <div className="mb-3">
                  <label htmlFor="start_date" className="form-label">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="start_date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-md-5">
                <div className="mb-3">
                  <label htmlFor="end_date" className="form-label">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="end_date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-md-2">
                <label className="form-label d-block">&nbsp;</label>
                <button type="submit" className="btn btn-success w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="me-2" size={18} />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {result && !loading && result.success && result.insights && (
        <>
          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card border-primary">
                <div className="card-body">
                  <h6 className="text-muted">Total Hours Worked</h6>
                  <h3 className="text-primary">
                    {result.insights.cost_analysis.total_hours_worked || 'N/A'}
                  </h3>
                  <small className="text-muted">{result.period}</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-warning">
                <div className="card-body">
                  <h6 className="text-muted">Overtime Percentage</h6>
                  <h3 className="text-warning">
                    {result.insights.cost_analysis.overtime_percentage}
                  </h3>
                  <small className="text-muted">Of total hours</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-info">
                <div className="card-body">
                  <h6 className="text-muted">Employees Tracked</h6>
                  <h3 className="text-info">
                    {result.insights.cost_analysis.employees_tracked || 'N/A'}
                  </h3>
                  <small className="text-muted">In this period</small>
                </div>
              </div>
            </div>
          </div>

          {/* Anomalies Detected */}
          {result.insights.anomalies_detected.length > 0 && (
            <div className="card mb-4">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">
                  <AlertTriangle className="me-2" size={20} />
                  Anomalies Detected ({result.insights.anomalies_detected.length})
                </h5>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {result.insights.anomalies_detected.map((anomaly, idx) => (
                    <div key={idx} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">
                            <span className={`badge ${getSeverityBadge(anomaly.severity)} me-2`}>
                              {anomaly.severity.toUpperCase()}
                            </span>
                            {anomaly.type.replace(/_/g, ' ').toUpperCase()}
                          </h6>
                          <p className="mb-1">{anomaly.description}</p>
                          {anomaly.employee_id && (
                            <small className="text-muted">Employee ID: {anomaly.employee_id}</small>
                          )}
                          {anomaly.date && (
                            <small className="text-muted ms-2">Date: {anomaly.date}</small>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="row">
            <div className="col-md-4">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">Recommendations</h6>
                </div>
                <div className="card-body">
                  {result.insights.recommendations.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {result.insights.recommendations.map((rec, idx) => (
                        <li key={idx} className="mb-2">
                          <span className="text-success me-2">✓</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">No recommendations at this time</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">Compliance Notes</h6>
                </div>
                <div className="card-body">
                  {result.insights.compliance_notes.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {result.insights.compliance_notes.map((note, idx) => (
                        <li key={idx} className="mb-2">
                          <span className="text-info me-2">ℹ</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">All compliance checks passed</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">Efficiency Insights</h6>
                </div>
                <div className="card-body">
                  {result.insights.efficiency_insights.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {result.insights.efficiency_insights.map((insight, idx) => (
                        <li key={idx} className="mb-2">
                          <span className="text-primary me-2">📊</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">No insights available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Error State */}
      {result && !loading && !result.success && (
        <div className="card">
          <div className="card-body">
            <div className="alert alert-warning">
              <p>{result.error || 'Failed to generate payroll insights'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-success mb-3" role="status"></div>
            <h5>Analyzing Payroll Data...</h5>
            <p className="text-muted">AI is detecting anomalies and generating insights</p>
          </div>
        </div>
      )}
    </div>
  );
}
