import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="route-loading" style={{ padding: 24, textAlign: 'center' }}>
          <h2 style={{ color: '#e8eaf0', marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: 'rgba(232,234,240,0.5)', marginBottom: 20, maxWidth: 420 }}>
            {this.state.error.message}
          </p>
          <a
            href="/welcome"
            style={{
              color: '#00e5b4',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Go to welcome page →
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
