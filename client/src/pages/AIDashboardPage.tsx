import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Cpu, MessageSquare, Calendar, Users, DollarSign, Zap } from 'lucide-react';
import { api } from '../lib/api';

export default function AIDashboardPage() {
  const [schedulingData, setSchedulingData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [payrollData, setPayrollData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllInsights();
  }, []);

  const loadAllInsights = async () => {
    await Promise.all([
      loadSchedulingInsights(),
      loadAttendanceInsights(),
      loadPayrollSummary(),
    ]);
    setLoading(false);
  };

  const loadSchedulingInsights = async () => {
    try {
      const response = await api.get('/ai/analyze-scheduling?days=14');
      setSchedulingData(response.data.data);
    } catch (error) {
      console.error('Failed to load scheduling insights:', error);
    }
  };

  const loadAttendanceInsights = async () => {
    try {
      const response = await api.get('/ai/analyze-attendance?days=14');
      setAttendanceData(response.data.data);
    } catch (error) {
      console.error('Failed to load attendance insights:', error);
    }
  };

  const loadPayrollSummary = async () => {
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const response = await api.post('/ai/generate-payroll-insights', {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });
      
      if (response.data.success && response.data.data?.insights) {
        setPayrollData(response.data.data.insights);
      }
    } catch (error) {
      console.error('Failed to load payroll summary:', error);
    }
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <Brain className="me-2" size={32} style={{ display: 'inline' }} />
            AI Insights Dashboard
          </h2>
          <p className="text-muted mb-0">
            Intelligent workforce management insights and recommendations
          </p>
        </div>
        <div className="btn-group">
          <Link to="/ai/scheduling-optimizer" className="btn btn-primary">
            <Cpu className="me-2" size={18} />
            Schedule Optimizer
          </Link>
          <Link to="/ai/natural-query" className="btn btn-outline-primary">
            <MessageSquare className="me-2" size={18} />
            Ask AI
          </Link>
        </div>
      </div>

      {/* Quick Insights Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">Scheduling Insights</h4>
                  <p className="mb-0">
                    {schedulingData?.suggestions?.efficiency_score
                      ? `Efficiency: ${schedulingData.suggestions.efficiency_score}%`
                      : schedulingData?.analysis?.efficiency_score
                      ? `Efficiency: ${schedulingData.analysis.efficiency_score}%`
                      : 'Loading...'}
                  </p>
                </div>
                <div className="align-self-center">
                  <Calendar size={48} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">Attendance Patterns</h4>
                  <p className="mb-0">
                    {attendanceData?.insights?.patterns?.[0] ||
                      attendanceData?.analysis?.patterns_identified?.[0] ||
                      'Loading...'}
                  </p>
                </div>
                <div className="align-self-center">
                  <Users size={48} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">Payroll Analysis</h4>
                  <p className="mb-0">
                    {payrollData?.cost_analysis?.total_hours_worked
                      ? `${payrollData.cost_analysis.total_hours_worked} hours tracked`
                      : 'Loading...'}
                  </p>
                  {payrollData?.cost_analysis?.overtime_percentage && (
                    <small className="opacity-75">
                      {payrollData.cost_analysis.overtime_percentage} overtime
                    </small>
                  )}
                </div>
                <div className="align-self-center">
                  <DollarSign size={48} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="row">
        {/* Scheduling Insights */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <Calendar className="me-2" size={20} />
                Scheduling Patterns
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted">Analyzing scheduling patterns...</p>
                </div>
              ) : schedulingData?.success ? (
                renderSchedulingInsights(
                  schedulingData.suggestions || schedulingData.analysis
                )
              ) : (
                <div className="alert alert-warning">
                  <p>{schedulingData?.error || 'Unable to load scheduling insights'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Insights */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <Users className="me-2" size={20} />
                Attendance Analysis
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-success" role="status"></div>
                  <p className="mt-2 text-muted">Analyzing attendance patterns...</p>
                </div>
              ) : attendanceData?.success ? (
                renderAttendanceInsights(
                  attendanceData.insights || attendanceData.analysis
                )
              ) : (
                <div className="alert alert-warning">
                  <p>{attendanceData?.error || 'Unable to load attendance insights'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Payroll Insights */}
        <div className="col-md-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <DollarSign className="me-2" size={20} />
                Payroll Insights & Anomalies
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-info" role="status"></div>
                  <p className="mt-2 text-muted">Analyzing payroll data...</p>
                </div>
              ) : payrollData ? (
                <div className="row">
                  {/* Cost Analysis */}
                  {payrollData.cost_analysis && (
                    <div className="col-md-4 mb-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title text-muted">Cost Analysis</h6>
                          {payrollData.cost_analysis.total_hours_worked && (
                            <p className="mb-1">
                              <strong>Total Hours:</strong> {payrollData.cost_analysis.total_hours_worked}
                            </p>
                          )}
                          <p className="mb-1">
                            <strong>Overtime:</strong> {payrollData.cost_analysis.overtime_percentage || '0%'}
                          </p>
                          {payrollData.cost_analysis.employees_tracked && (
                            <p className="mb-0">
                              <strong>Employees:</strong> {payrollData.cost_analysis.employees_tracked}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Anomalies */}
                  {payrollData.anomalies_detected && payrollData.anomalies_detected.length > 0 && (
                    <div className="col-md-8 mb-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title text-muted">Anomalies Detected</h6>
                          <ul className="list-unstyled mb-0">
                            {payrollData.anomalies_detected.slice(0, 3).map((anomaly: any, idx: number) => (
                              <li key={idx} className="mb-2">
                                <span className={`badge ${anomaly.severity === 'high' ? 'bg-danger' : anomaly.severity === 'medium' ? 'bg-warning' : 'bg-info'} me-2`}>
                                  {anomaly.severity}
                                </span>
                                {anomaly.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Recommendations */}
                  {payrollData.recommendations && payrollData.recommendations.length > 0 && (
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title text-muted">Recommendations</h6>
                          <ul className="mb-0">
                            {payrollData.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Efficiency Insights */}
                  {payrollData.efficiency_insights && payrollData.efficiency_insights.length > 0 && (
                    <div className="col-md-6 mb-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title text-muted">Efficiency Insights</h6>
                          <ul className="mb-0">
                            {payrollData.efficiency_insights.slice(0, 3).map((insight: string, idx: number) => (
                              <li key={idx}>{insight}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="alert alert-warning">
                  <p>Unable to load payroll insights</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <Zap className="me-2" size={20} />
                AI-Powered Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <div className="d-grid">
                    <Link to="/ai/scheduling-optimizer" className="btn btn-outline-primary">
                      <Cpu className="me-2" size={18} />
                      Schedule Optimizer
                    </Link>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="d-grid">
                    <Link to="/ai/payroll-insights" className="btn btn-outline-success">
                      <DollarSign className="me-2" size={18} />
                      Payroll Insights
                    </Link>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="d-grid">
                    <Link to="/ai/attendance-analyzer" className="btn btn-outline-info">
                      <Users className="me-2" size={18} />
                      Attendance Analysis
                    </Link>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="d-grid">
                    <Link to="/ai/natural-query" className="btn btn-outline-warning">
                      <MessageSquare className="me-2" size={18} />
                      Ask AI Assistant
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderSchedulingInsights(data: any) {
  if (!data) return <p className="text-muted">No insights available</p>;

  const patterns = data.patterns || data.patterns_identified || [];
  const recommendations = data.recommendations || [];
  const efficiencyScore = data.efficiency_score || 0;

  return (
    <div>
      <div className="mb-3">
        <h6>Efficiency Score</h6>
        <div className="progress mb-2">
          <div
            className="progress-bar bg-primary"
            style={{ width: `${efficiencyScore}%` }}
          ></div>
        </div>
        <small className="text-muted">{efficiencyScore}% efficiency</small>
      </div>

      {patterns.length > 0 && (
        <div className="mb-3">
          <h6>Key Patterns</h6>
          <ul className="list-unstyled">
            {patterns.map((pattern: string, idx: number) => (
              <li key={idx} className="mb-2">
                <span className="text-success me-2">✓</span>
                {pattern}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h6>Recommendations</h6>
          <ul className="list-unstyled">
            {recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="mb-2">
                <span className="text-info me-2">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function renderAttendanceInsights(data: any) {
  if (!data) return <p className="text-muted">No insights available</p>;

  const patterns = data.patterns || data.patterns_identified || [];
  const riskFactors = data.risk_factors || data.risk_indicators || [];
  const recommendations = data.recommendations || [];

  return (
    <div>
      {patterns.length > 0 && (
        <div className="mb-3">
          <h6>Attendance Patterns</h6>
          <ul className="list-unstyled">
            {patterns.map((pattern: string, idx: number) => (
              <li key={idx} className="mb-2">
                <span className="text-primary me-2">📊</span>
                {pattern}
              </li>
            ))}
          </ul>
        </div>
      )}

      {riskFactors.length > 0 && (
        <div className="mb-3">
          <h6>Risk Factors</h6>
          <ul className="list-unstyled">
            {(Array.isArray(riskFactors) ? riskFactors : [riskFactors]).map(
              (risk: any, idx: number) => (
                <li key={idx} className="mb-2">
                  <span className="text-warning me-2">⚠</span>
                  {typeof risk === 'string' ? risk : risk.description || 'Risk detected'}
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h6>Recommendations</h6>
          <ul className="list-unstyled">
            {recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="mb-2">
                <span className="text-success me-2">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
