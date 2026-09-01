import React from 'react';
import { AlertTriangle, Home, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    try {
      window.location.reload();
    } catch {
      window.location.href = '/';
    }
  };

  private handleGoHome = () => {
    try {
      window.location.href = '/';
    } catch {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#121218] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Something went wrong
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  An unexpected error occurred while rendering this page.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/5 bg-black/40 p-4">
              <p className="text-xs font-medium text-neutral-300">
                {this.state.error?.message || 'Unknown runtime error'}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reload Application
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Home className="h-3.5 w-3.5" /> Return to Home
              </button>

              <button
                type="button"
                onClick={this.toggleDetails}
                className="ml-auto inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                {this.state.showDetails ? (
                  <>
                    Hide Details <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Show Details <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

            {this.state.showDetails && (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-[11px] text-neutral-400 overflow-x-auto max-h-60 scrollbar-thin">
                <p className="font-semibold text-red-400">Stack Trace:</p>
                <pre className="mt-2 whitespace-pre-wrap leading-relaxed">
                  {this.state.error?.stack || 'No stack trace available'}
                </pre>
                {this.state.errorInfo && (
                  <>
                    <p className="mt-3 font-semibold text-neutral-300">Component Stack:</p>
                    <pre className="mt-1 whitespace-pre-wrap leading-relaxed">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
