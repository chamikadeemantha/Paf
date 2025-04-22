import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by error boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h1>Something went wrong</h1>
            <p>We're sorry — an unexpected error has occurred.</p>
            
            <details className="error-details">
              <summary>Technical Details</summary>
              <p>{this.state.error && this.state.error.toString()}</p>
              <div className="error-stack">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </div>
            </details>
            
            <div className="error-actions">
              <button 
                onClick={() => window.location.reload()} 
                className="error-reload-btn"
              >
                Reload Page
              </button>
              <button 
                onClick={() => window.location.href = '/allPost'} 
                className="error-home-btn"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
