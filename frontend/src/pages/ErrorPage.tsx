import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  let errorMessage: string;
  let errorStatus: number | string = 'Error';

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || 'An unexpected error occurred';
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error occurred';
  }

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
                    <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
                  </div>
                </div>

                {/* Error Status */}
                <h1 className="display-1 fw-bold text-primary mb-3">{errorStatus}</h1>
                
                {/* Error Title */}
                <h2 className="h3 mb-4">Oops! Something went wrong</h2>
                
                {/* Error Message */}
                <p className="text-muted mb-4 fs-5">{errorMessage}</p>

                {/* Additional Info for Developers */}
                {error instanceof Error && error.stack && (
                  <details className="text-start mb-4">
                    <summary className="text-muted small cursor-pointer">
                      Technical Details (for developers)
                    </summary>
                    <pre className="bg-light p-3 rounded mt-2 text-start small overflow-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}

                {/* Action Buttons */}
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <button 
                    onClick={() => window.history.back()} 
                    className="btn btn-outline-primary"
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Go Back
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
                    Reload Page
                  </button>
                </div>

                {/* Help Text */}
                <div className="mt-5 pt-4 border-top">
                  <p className="text-muted small mb-0">
                    If this problem persists, please contact your system administrator or{' '}
                    <Link to="/support" className="text-decoration-none">
                      submit a support ticket
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Common Issues */}
            <div className="card mt-4 border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <i className="bi bi-lightbulb me-2"></i>
                  Common Solutions
                </h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Check your internet connection
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Clear your browser cache and cookies
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Try refreshing the page
                  </li>
                  <li className="mb-0">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Ensure you have the necessary permissions
                  </li>
                </ul>
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
          max-height: 200px;
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
