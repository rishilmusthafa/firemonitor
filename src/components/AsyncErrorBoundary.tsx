'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  retry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
}

export class AsyncErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('AsyncErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = async () => {
    if (this.props.retry) {
      this.setState({ isRetrying: true });
      try {
        await this.props.retry();
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          isRetrying: false,
        });
      } catch (error) {
        this.setState({ isRetrying: false });
        // Error will be caught by the error boundary again
      }
    } else {
      // Default retry behavior
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  isNetworkError = (error: Error): boolean => {
    const networkErrorMessages = [
      'network error',
      'fetch failed',
      'connection refused',
      'timeout',
      'network request failed',
    ];
    
    return networkErrorMessages.some(msg => 
      error.message.toLowerCase().includes(msg)
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isNetwork = this.state.error && this.isNetworkError(this.state.error);

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                isNetwork 
                  ? 'bg-orange-100 dark:bg-orange-900/20' 
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                {isNetwork ? (
                  <WifiOff className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">
                {isNetwork ? 'Connection Error' : 'Something went wrong'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isNetwork 
                  ? 'Unable to connect to the server. Please check your internet connection and try again.'
                  : 'We&apos;re sorry, but something unexpected happened. Please try again.'
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="rounded-md bg-muted p-3 text-sm">
                  <summary className="cursor-pointer font-medium text-foreground">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Type:</strong> {isNetwork ? 'Network Error' : 'Application Error'}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  className="w-full"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                  {this.state.isRetrying ? 'Retrying...' : 'Try Again'}
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling async errors in functional components
export function useAsyncError() {
  const [, setError] = React.useState();
  return React.useCallback((e: Error) => {
    setError(() => {
      throw e;
    });
  }, []);
}

// Higher-order component for async error boundary
export function withAsyncErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <AsyncErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AsyncErrorBoundary>
  );

  WrappedComponent.displayName = `withAsyncErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
} 