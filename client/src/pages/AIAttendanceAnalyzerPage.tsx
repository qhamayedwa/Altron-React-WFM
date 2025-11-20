import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, BarChart2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

interface AttendanceAnalysisResult {
  success: boolean;
  analysis?: {
    attendance_trends: {
      punctuality_score: number;
      consistency_score: number;
      average_daily_hours: string;
    };
    patterns_identified: string[];
    risk_indicators: Array<{
      type: string;
      employee_id: string;
      description: string;
      probability: 'low' | 'medium' | 'high';
    }>;
    recommendations: string[];
    productivity_insights: string[];
  };
  insights?: any;
  period?: string;
  entries_analyzed?: number;
  error?: string;
}

export default function AIAttendanceAnalyzerPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AttendanceAnalysisResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const params = new URLSearchParams();
      if (employeeId) params.append('employee_id', employeeId);
      params.append('days', days.toString());

      const response = await api.get(`/ai/analyze-attendance?${params}`);
      setResult(response.data.data || response.data);
    } catch (error) {
      console.error('Attendance analysis error:', error);
      setResult({
        success: false,
        error: 'Failed to analyze attendance patterns. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityBadge = (probability: string) => {
    const classes = {
      low: 'bg-info',
      medium: 'bg-warning',
      high: 'bg-danger',
    };
    return classes[probability as keyof typeof classes] || 'bg-secondary';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <Users className="me-2" size={32} style={{ display: 'inline' }} />
            AI Attendance Analyzer
          </h2>
          <p className="text-muted mb-0">
            Analyze attendance patterns and identify risk factors
          </p>
        </div>
        <Link to="/ai/dashboard" className="btn btn-outline-secondary">
          <ArrowLeft className="me-2" size={18} />
          Back to AI Dashboard
        </Link>
      </div>

      {/* Analysis Controls */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">
            <BarChart2 className="me-2" size={20} />
            Attendance Analysis Settings
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="employee_id" className="form-label">
                    Employee ID (Optional)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="employee_id"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Leave empty for all employees"
                  />
                  <div className="form-text">
                    Analyze specific employee or leave empty for company-wide analysis
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label htmlFor="days" className="form-label">
                    Analysis Period (Days)
                  </label>
                  <select
                    className="form-select"
                    id="days"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={14}>Last 14 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={60}>Last 60 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                </div>
              </div>
              <div className="col-md-2">
                <label className="form-label d-block">&nbsp;</label>
                <button type="submit" className="btn btn-info w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart2 className="me-2" size={18} />
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
      {result && !loading && result.success && (
        <>
          {/* Attendance Trends */}
          {result.analysis?.attendance_trends && (
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body text-center">
                    <h6 className="text-muted">Punctuality Score</h6>
                    <h2
                      className={`text-${getScoreColor(result.analysis.attendance_trends.punctuality_score)}`}
                    >
                      {result.analysis.attendance_trends.punctuality_score}%
                    </h2>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className={`progress-bar bg-${getScoreColor(result.analysis.attendance_trends.punctuality_score)}`}
                        style={{
                          width: `${result.analysis.attendance_trends.punctuality_score}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body text-center">
                    <h6 className="text-muted">Consistency Score</h6>
                    <h2
                      className={`text-${getScoreColor(result.analysis.attendance_trends.consistency_score)}`}
                    >
                      {result.analysis.attendance_trends.consistency_score}%
                    </h2>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className={`progress-bar bg-${getScoreColor(result.analysis.attendance_trends.consistency_score)}`}
                        style={{
                          width: `${result.analysis.attendance_trends.consistency_score}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body text-center">
                    <h6 className="text-muted">Average Daily Hours</h6>
                    <h2 className="text-primary">
                      {result.analysis.attendance_trends.average_daily_hours}
                    </h2>
                    <small className="text-muted">Hours per day</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Patterns & Risk Indicators */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">Patterns Identified</h6>
                </div>
                <div className="card-body">
                  {(result.analysis?.patterns_identified || result.insights?.patterns || [])
                    .length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {(result.analysis?.patterns_identified || result.insights?.patterns || []).map(
                        (pattern: string, idx: number) => (
                          <li key={idx} className="mb-2">
                            <span className="text-primary me-2">📊</span>
                            {pattern}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">No patterns detected</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-warning text-dark">
                  <h6 className="mb-0">
                    <AlertCircle className="me-2" size={18} />
                    Risk Indicators
                  </h6>
                </div>
                <div className="card-body">
                  {result.analysis?.risk_indicators &&
                  result.analysis.risk_indicators.length > 0 ? (
                    <div className="list-group">
                      {result.analysis.risk_indicators.map((risk, idx) => (
                        <div key={idx} className="list-group-item p-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <span
                                className={`badge ${getProbabilityBadge(risk.probability)} me-2`}
                              >
                                {risk.probability.toUpperCase()}
                              </span>
                              <small>{risk.description}</small>
                              <br />
                              <small className="text-muted">Employee: {risk.employee_id}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">
                      {result.insights?.risk_factors?.[0] || 'No risk factors detected'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations & Insights */}
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">Recommendations</h6>
                </div>
                <div className="card-body">
                  {(result.analysis?.recommendations || result.insights?.recommendations || [])
                    .length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {(result.analysis?.recommendations || result.insights?.recommendations || []).map(
                        (rec: string, idx: number) => (
                          <li key={idx} className="mb-2">
                            <span className="text-success me-2">✓</span>
                            {rec}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">No recommendations at this time</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">Productivity Insights</h6>
                </div>
                <div className="card-body">
                  {result.analysis?.productivity_insights &&
                  result.analysis.productivity_insights.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {result.analysis.productivity_insights.map((insight, idx) => (
                        <li key={idx} className="mb-2">
                          <span className="text-info me-2">💡</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">
                      {result.insights?.period_summary || 'No insights available'}
                    </p>
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
              <p>{result.error || 'Failed to analyze attendance patterns'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-info mb-3" role="status"></div>
            <h5>Analyzing Attendance Patterns...</h5>
            <p className="text-muted">AI is processing attendance data and detecting patterns</p>
          </div>
        </div>
      )}
    </div>
  );
}
