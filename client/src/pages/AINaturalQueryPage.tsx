import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Send, Plus, Download } from 'lucide-react';
import { api } from '../lib/api';

interface QueryResult {
  success: boolean;
  query?: string;
  result?: {
    response: string;
    insights: string[];
    suggested_actions: string[];
    related_data: Record<string, any>;
  };
  error?: string;
}

export default function AINaturalQueryPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  const sampleQueries = {
    attendance: 'Show me attendance patterns for the last 30 days and identify any concerning trends',
    schedules: 'Analyze our current scheduling efficiency and suggest improvements',
    payroll: 'Calculate overtime costs and identify departments with highest payroll expenses',
  };

  const exampleQuestions = [
    { category: 'Attendance', questions: [
      'Show me attendance patterns for this month',
      'Which employees are frequently late?',
      'What are the busiest days of the week?',
    ]},
    { category: 'Scheduling', questions: [
      'Analyze our current scheduling efficiency',
      'Which departments need more coverage?',
      'Show schedule conflicts this week',
    ]},
    { category: 'Payroll', questions: [
      'Calculate overtime costs for last month',
      'Show payroll trends by department',
      'Identify unusual payroll patterns',
    ]},
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/ai/natural-query', { query: query.trim() });
      setResult(response.data.data || response.data);
    } catch (error) {
      console.error('Natural query error:', error);
      setResult({
        success: false,
        error: 'Failed to process your question. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const insertSample = (type: 'attendance' | 'schedules' | 'payroll') => {
    setQuery(sampleQueries[type]);
  };

  const setQueryText = (text: string) => {
    setQuery(text);
  };

  const askFollowUp = () => {
    setQuery('');
    setResult(null);
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <MessageSquare className="me-2" size={32} style={{ display: 'inline' }} />
            AI Assistant
          </h2>
          <p className="text-muted mb-0">
            Ask questions about your workforce data in natural language
          </p>
        </div>
        <Link to="/ai/dashboard" className="btn btn-outline-secondary">
          <ArrowLeft className="me-2" size={18} />
          Back to AI Dashboard
        </Link>
      </div>

      {/* Query Interface */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <MessageSquare className="me-2" size={20} />
            Ask Your Question
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="natural_query" className="form-label">
                Your Question
              </label>
              <textarea
                className="form-control"
                id="natural_query"
                rows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Show me attendance patterns for the last month, or Which employees work the most overtime?"
                required
              />
              <div className="form-text">
                Ask questions about schedules, attendance, payroll, or employee patterns
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => insertSample('attendance')}
                >
                  Sample: Attendance
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => insertSample('schedules')}
                >
                  Sample: Schedules
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => insertSample('payroll')}
                >
                  Sample: Payroll
                </button>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="me-2" size={18} />
                    Ask AI
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Response Section */}
      {result && !loading && (
        <div className="card mb-4">
          <div className={`card-header ${result.success ? 'bg-success' : 'bg-warning'} text-white`}>
            <h5 className="mb-0">
              <MessageSquare className="me-2" size={20} />
              {result.success ? 'AI Response' : 'Notice'}
            </h5>
          </div>
          <div className="card-body">
            {result.success && result.result ? (
              <>
                <div className="mb-4">
                  <h6>Analysis Results</h6>
                  <div className="alert alert-info">
                    <p className="mb-0">{result.result.response}</p>
                  </div>
                </div>

                {result.result.insights && result.result.insights.length > 0 && (
                  <div className="mb-4">
                    <h6>Key Insights</h6>
                    <ul className="list-group list-group-flush">
                      {result.result.insights.map((insight, idx) => (
                        <li key={idx} className="list-group-item">
                          <span className="text-primary me-2">💡</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.result.suggested_actions && result.result.suggested_actions.length > 0 && (
                  <div className="mb-4">
                    <h6>Suggested Actions</h6>
                    <ul className="list-group list-group-flush">
                      {result.result.suggested_actions.map((action, idx) => (
                        <li key={idx} className="list-group-item">
                          <span className="text-success me-2">✓</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.result.related_data && Object.keys(result.result.related_data).length > 0 && (
                  <div className="mb-4">
                    <h6>Related Data</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <tbody>
                          {Object.entries(result.result.related_data).map(([key, value]) => (
                            <tr key={key}>
                              <td className="fw-bold">{key}</td>
                              <td>{String(value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-primary" onClick={askFollowUp}>
                    <Plus className="me-2" size={18} />
                    Ask Follow-up
                  </button>
                </div>
              </>
            ) : (
              <div>
                <div className="alert alert-warning">
                  <p>{result.error || 'Unable to process your question'}</p>
                </div>
                <div className="mt-3">
                  <h6>Statistical Analysis Available</h6>
                  <p className="text-muted">
                    While AI natural language processing requires OpenAI configuration, our
                    system can provide statistical insights through the dashboard and specific
                    analysis tools.
                  </p>
                  <div className="d-flex gap-2">
                    <Link to="/ai/dashboard" className="btn btn-primary">
                      View Analytics Dashboard
                    </Link>
                    <Link to="/ai/scheduling-optimizer" className="btn btn-outline-primary">
                      Schedule Optimizer
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <h5>Processing Your Question...</h5>
            <p className="text-muted">AI is analyzing your workforce data</p>
          </div>
        </div>
      )}

      {/* Example Questions */}
      {!result && !loading && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Example Questions</h5>
          </div>
          <div className="card-body">
            <div className="row">
              {exampleQuestions.map((section, idx) => (
                <div key={idx} className="col-md-4">
                  <h6 className={idx === 0 ? 'text-primary' : idx === 1 ? 'text-success' : 'text-info'}>
                    {section.category}
                  </h6>
                  <ul className="list-unstyled">
                    {section.questions.map((q, qIdx) => (
                      <li key={qIdx}>
                        <button
                          className="btn btn-link text-start p-0 text-decoration-none"
                          onClick={() => setQueryText(q)}
                        >
                          • {q}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
