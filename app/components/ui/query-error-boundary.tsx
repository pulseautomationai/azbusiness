import { useState } from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';

interface QueryErrorBoundaryProps {
  error: Error | null;
  isLoading: boolean;
  isRetrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
  canRetry?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function QueryErrorBoundary({
  error,
  isLoading,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  canRetry = false,
  onRetry,
  children,
  fallback,
  className
}: QueryErrorBoundaryProps) {
  const [userDismissed, setUserDismissed] = useState(false);

  // Show children if no error or user dismissed the error
  if (!error || userDismissed) {
    return <div className={className}>{children}</div>;
  }

  // Determine error type for better UX
  const isNetworkError = error.message.includes('fetch') || 
                        error.message.includes('network') || 
                        error.message.includes('connection') ||
                        error.name === 'NetworkError';

  const isTimeoutError = error.message.includes('timeout') || 
                        error.message.includes('timed out');

  const getErrorIcon = () => {
    if (isNetworkError) return <WifiOff className="h-5 w-5" />;
    if (isTimeoutError) return <AlertCircle className="h-5 w-5" />;
    return <AlertCircle className="h-5 w-5" />;
  };

  const getErrorTitle = () => {
    if (isNetworkError) return 'Connection Error';
    if (isTimeoutError) return 'Request Timeout';
    return 'Something Went Wrong';
  };

  const getErrorMessage = () => {
    if (isNetworkError) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    if (isTimeoutError) {
      return 'The request took too long to complete. Please try again.';
    }
    return error.message || 'An unexpected error occurred. Please try again.';
  };

  // Custom fallback component
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div className={cn("w-full", className)}>
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-destructive text-base">
            {getErrorIcon()}
            {getErrorTitle()}
          </CardTitle>
          <CardDescription className="text-destructive/80">
            {getErrorMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-3">
            {canRetry && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                disabled={isRetrying || retryCount >= maxRetries}
                className="flex items-center gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUserDismissed(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </Button>
          </div>
          
          {retryCount > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              Attempt {retryCount} of {maxRetries}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface RetryableQueryWrapperProps {
  data: any;
  error: any;
  isLoading: boolean;
  retryFn?: () => void;
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  className?: string;
  showRetryInfo?: boolean;
}

/**
 * Wrapper component that handles common query states with retry logic
 */
export function RetryableQueryWrapper({
  data,
  error,
  isLoading,
  retryFn,
  children,
  loadingFallback,
  errorFallback,
  className,
  showRetryInfo = false
}: RetryableQueryWrapperProps) {
  if (isLoading && !data) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        {loadingFallback || (
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        )}
      </div>
    );
  }

  if (error && !data) {
    return (
      <QueryErrorBoundary
        error={error}
        isLoading={isLoading}
        canRetry={!!retryFn}
        onRetry={retryFn}
        fallback={errorFallback}
        className={className}
      >
        {children}
      </QueryErrorBoundary>
    );
  }

  return (
    <div className={className}>
      {/* Show retry info if requested and there was an error but we have data */}
      {showRetryInfo && error && data && retryFn && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 text-yellow-800">
            <Wifi className="h-4 w-4" />
            <span className="text-sm">
              Data may be outdated due to connection issues.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={retryFn}
              className="ml-auto h-auto p-1 text-yellow-800 hover:text-yellow-900"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}