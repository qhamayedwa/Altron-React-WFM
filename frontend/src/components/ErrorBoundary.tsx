import { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service if configured
    if (typeof window !== 'undefined' && (window as any).errorReporter) {
      (window as any).errorReporter.log(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div className="card shadow-lg border-0">
                  <div className="card-body text-center p-5">
                    {/* Error Icon */}
                    <div className="mb-4">
                      <div className="error-icon-circle mx-auto">
                        <i className="bi bi-bug text-danger" style={{ fontSize: '4rem' }}></i>
                      </div>
                    </div>

                    {/* Error Title */}
                    <h1 className="h2 mb-3">Application Error</h1>
                    
                    {/* Error Message */}
                    <p className="text-muted mb-4">
                      We're sorry, but something went wrong. The error has been logged and we'll look into it.
                    </p>

                    {/* Error Details (Development Only) */}
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                      <div className="alert alert-danger text-start mb-4">
                        <h6 className="alert-heading">Error Details:</h6>
                        <p className="mb-2"><strong>{this.state.error.toString()}</strong></p>
                        
                        {this.state.errorInfo && (
                          <details className="mt-3">
                            <summary className="cursor-pointer">Component Stack</summary>
                            <pre className="mt-2 p-3 bg-light rounded small overflow-auto">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </details>
                        )}

                        {this.state.error.stack && (
                          <details className="mt-3">
                            <summary className="cursor-pointer">Stack Trace</summary>
                            <pre className="mt-2 p-3 bg-light rounded small overflow-auto">
                              {this.state.error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                      <button 
                        onClick={this.handleReset}
                        className="btn btn-outline-primary"
                      >
                        <i className="bi bi-arrow-repeat me-2"></i>
                        Try Again
                      </button>
                      <Link to="/dashboard" className="btn btn-primary">
                        <i className="bi bi-house me-2"></i>
                        Go to Dashboard
                      </Link>
                      <button 
                        onClick={() => window.location.reload()} 
                        className="btn btn-outline-secondary"
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Reload Application
                      </button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-5 pt-4 border-top">
                      <p className="text-muted small mb-0">
                        If this problem continues, please contact support with the error details above.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <style>{`
            .error-icon-circle {
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background-color: #f8d7da;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .cursor-pointer {
              cursor: pointer;
            }

            details summary {
              user-select: none;
            }

            details[open] summary {
              margin-bottom: 0.5rem;
            }

            pre {
              max-height: 300px;
            }

            .card {
              border-radius: 1rem;
            }

            .btn {
              border-radius: 0.5rem;
              padding: 0.625rem 1.5rem;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
