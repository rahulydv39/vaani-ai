import React from 'react';

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
        // You can also log the error to an error reporting service here
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ padding: '2rem', color: '#ff6b6b', background: '#12121a', minHeight: '100vh', fontFamily: 'sans-serif' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong.</h1>
                    <details style={{ whiteSpace: 'pre-wrap', background: 'rgba(255,107,107,0.1)', padding: '1rem', borderRadius: '8px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Error Details</summary>
                        <br />
                        {this.state.error && this.state.error.toString()}
                        <br />
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
