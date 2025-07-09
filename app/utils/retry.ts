import { logger } from './logger';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  retryCondition: (error: any) => {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error?.name === 'NetworkError') return true;
    if (error?.name === 'TimeoutError') return true;
    if (error?.message?.includes('fetch')) return true;
    if (error?.message?.includes('network')) return true;
    if (error?.message?.includes('timeout')) return true;
    if (error?.status >= 500) return true;
    
    // Don't retry on client errors (4xx) or validation errors
    if (error?.status >= 400 && error?.status < 500) return false;
    
    // Default to retrying unknown errors
    return true;
  },
  onRetry: () => {}
};

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const result = await fn();
      
      // Log successful retry if this wasn't the first attempt
      if (attempt > 1) {
        logger.info(`Function succeeded on attempt ${attempt}`, { attempt }, 'RETRY_SUCCESS');
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Log the error
      const errorForLog = error instanceof Error ? error : new Error(String(error));
      logger.warn(`Function failed on attempt ${attempt}`, { 
        error: errorForLog.message,
        attempt,
        maxAttempts: opts.maxAttempts
      }, 'RETRY_ATTEMPT');

      // Check if we should retry this error
      if (!opts.retryCondition(error)) {
        logger.error('Error is not retryable, giving up', errorForLog, 'RETRY_FAILED');
        throw error;
      }

      // Don't wait after the last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }

      // Call onRetry callback
      opts.onRetry(errorForLog, attempt);

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      );

      logger.debug(`Retrying in ${delay}ms`, { delay, attempt }, 'RETRY_DELAY');
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  const finalError = lastError instanceof Error ? lastError : new Error(String(lastError));
  logger.error(`All ${opts.maxAttempts} attempts failed`, finalError, 'RETRY_EXHAUSTED');
  throw lastError;
}

/**
 * Retry specifically for Convex queries with appropriate defaults
 */
export async function withConvexRetry<T>(
  queryFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const convexOptions: RetryOptions = {
    maxAttempts: 3,
    baseDelay: 500,
    maxDelay: 5000,
    backoffFactor: 2,
    retryCondition: (error: any) => {
      // Retry on network/connection errors
      if (error?.name === 'NetworkError') return true;
      if (error?.message?.includes('fetch')) return true;
      if (error?.message?.includes('network')) return true;
      if (error?.message?.includes('connection')) return true;
      
      // Don't retry on Convex validation errors or auth errors
      if (error?.message?.includes('Uncaught') && error?.message?.includes('Error:')) return false;
      if (error?.message?.includes('Unauthorized')) return false;
      if (error?.message?.includes('Permission denied')) return false;
      
      // Retry on other errors
      return true;
    },
    onRetry: (error: any, attempt: number) => {
      logger.warn(`Convex query retry ${attempt}`, { 
        error: error instanceof Error ? error.message : String(error),
        attempt 
      }, 'CONVEX_RETRY');
    },
    ...options
  };

  return withRetry(queryFn, convexOptions);
}

/**
 * Retry for mutations with different defaults (fewer retries)
 */
export async function withConvexMutationRetry<T>(
  mutationFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const mutationOptions: RetryOptions = {
    maxAttempts: 2, // Fewer retries for mutations to avoid duplicate operations
    baseDelay: 1000,
    maxDelay: 3000,
    backoffFactor: 2,
    retryCondition: (error: any) => {
      // Only retry on clear network/connection failures for mutations
      if (error?.name === 'NetworkError') return true;
      if (error?.message?.includes('fetch')) return true;
      if (error?.message?.includes('network')) return true;
      if (error?.message?.includes('connection')) return true;
      
      // Don't retry mutations on most other errors to avoid duplicates
      return false;
    },
    onRetry: (error: any, attempt: number) => {
      logger.warn(`Convex mutation retry ${attempt}`, { 
        error: error instanceof Error ? error.message : String(error),
        attempt 
      }, 'CONVEX_MUTATION_RETRY');
    },
    ...options
  };

  return withRetry(mutationFn, mutationOptions);
}

/**
 * Create a retryable version of a query hook
 */
export function createRetryableQuery<T>(
  useQuery: () => T | undefined,
  isLoading: boolean,
  error: any
) {
  return {
    data: useQuery(),
    isLoading,
    error,
    retry: async () => {
      // This would need to be implemented based on how Convex handles query retries
      // For now, we'll just log that a retry was requested
      logger.info('Query retry requested', {}, 'QUERY_RETRY');
    }
  };
}

/**
 * Utility to wrap async operations with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Combine retry with timeout
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  retryOptions: RetryOptions = {},
  timeoutMs = 30000
): Promise<T> {
  return withRetry(
    () => withTimeout(fn(), timeoutMs),
    retryOptions
  );
}