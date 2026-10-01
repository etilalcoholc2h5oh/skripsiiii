import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-8 bg-red-100 text-red-900 border border-red-500 rounded-xl">
          <h1 className="text-xl font-bold mb-4">Aplikasi Mengalami Kesalahan</h1>
          <pre className="text-sm overflow-auto p-4 bg-white rounded">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded font-bold"
          >
            Muat Ulang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
