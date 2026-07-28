import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React UI error:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#060814] text-white">
          <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-red-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">Something Went Wrong</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected user interface exception occurred. The application remains protected.
            </p>
            {this.state.error && (
              <div className="p-3 bg-red-950/40 border border-red-500/20 text-[11px] text-red-300 rounded-xl font-mono text-left truncate">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" /> Reload Portal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
