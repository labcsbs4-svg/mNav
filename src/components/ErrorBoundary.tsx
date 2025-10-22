import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<object>, State> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an external service here
    console.error('Uncaught error in App:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-red-600 mb-2">Application error</h2>
            <p className="text-gray-700 mb-4">The application encountered an error while rendering. See console for details.</p>
            {this.state.error && (
              <pre className="text-sm text-gray-600 overflow-auto max-h-40 bg-gray-50 p-3 rounded">{this.state.error.toString()}</pre>
            )}
            {this.state.errorInfo && (
              <details className="text-xs text-gray-500 mt-3">
                <summary>Stack trace</summary>
                <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
            <div className="mt-4 flex gap-2">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded">Reload</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactNode;
  }
}
