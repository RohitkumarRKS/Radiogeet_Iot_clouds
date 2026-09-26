import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--color-bg-primary)',
          padding: 'var(--space-6)',
        }}>
          <div style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-xl)',
            padding: 'var(--space-10)',
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--border-radius-full)',
              background: 'var(--color-danger-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-6)',
            }}>
              <AlertTriangle size={28} style={{ color: 'var(--color-danger)' }} />
            </div>

            <h1 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-3)',
            }}>
              Something went wrong
            </h1>

            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-6)',
              lineHeight: 'var(--line-height-relaxed)',
            }}>
              An unexpected error occurred. Please try refreshing the page or go back to the home screen.
            </p>

            {this.state.error && (
              <details open style={{
                textAlign: 'left',
                marginBottom: 'var(--space-6)',
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-md)',
                overflow: 'hidden',
              }}>

                <summary style={{
                  padding: 'var(--space-3) var(--space-4)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-tertiary)',
                  fontWeight: 500,
                }}>
                  Error Details
                </summary>
                <pre style={{
                  padding: 'var(--space-4)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-danger)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: 200,
                  overflow: 'auto',
                  fontFamily: 'var(--font-mono)',
                  borderTop: '1px solid var(--color-border)',
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={this.handleGoHome}>
                <Home size={16} /> Go Home
              </button>
              <button className="btn btn-primary" onClick={this.handleRefresh}>
                <RefreshCw size={16} /> Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
