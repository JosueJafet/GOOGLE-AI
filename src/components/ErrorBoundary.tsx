import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      try {
        const parsed = JSON.parse(this.state.error?.message || '');
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="h-screen w-full bg-[#050505] flex items-center justify-center p-6">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[40px] p-12 max-w-md w-full text-center space-y-8">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-light tracking-tight">System Error</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:scale-105 transition-transform"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Restart Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
