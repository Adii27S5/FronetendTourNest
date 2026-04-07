import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card rounded-3xl shadow-premium p-8 text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-4">Oops! Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              We're sorry for the inconvenience. An unexpected error occurred.
            </p>
            {this.state.error && (
              <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-mono text-destructive">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <Button onClick={this.handleReset} variant="adventure" className="w-full">
              Return to Homepage
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
