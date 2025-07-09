import { useState, useEffect, useCallback } from 'react';
import { withConvexRetry, withConvexMutationRetry } from '~/utils/retry';
import { logger } from '~/utils/logger';

interface RetryableQueryState<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isRetrying: boolean;
  retryCount: number;
}

interface UseRetryableQueryOptions {
  maxRetries?: number;
  retryDelay?: number;
  enableAutoRetry?: boolean;
  retryCondition?: (error: any) => boolean;
}

/**
 * Hook that wraps any async function with retry logic
 */
export function useRetryableQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseRetryableQueryOptions = {}
) {
  const [state, setState] = useState<RetryableQueryState<T>>({
    data: undefined,
    error: null,
    isLoading: false,
    isRetrying: false,
    retryCount: 0
  });

  const {
    maxRetries = 3,
    retryDelay = 1000,
    enableAutoRetry = true,
    retryCondition
  } = options;

  const executeQuery = useCallback(async (isRetry = false) => {
    setState(prev => ({
      ...prev,
      isLoading: !isRetry,
      isRetrying: isRetry,
      error: null
    }));

    try {
      const result = await withConvexRetry(queryFn, {
        maxAttempts: maxRetries,
        baseDelay: retryDelay,
        retryCondition,
        onRetry: (error, attempt) => {
          setState(prev => ({
            ...prev,
            retryCount: attempt,
            isRetrying: true
          }));
        }
      });

      setState(prev => ({
        ...prev,
        data: result,
        error: null,
        isLoading: false,
        isRetrying: false
      }));

      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        error: errorObj,
        isLoading: false,
        isRetrying: false
      }));

      logger.error('Query failed after all retries', errorObj, 'RETRYABLE_QUERY');
      throw error;
    }
  }, [queryFn, maxRetries, retryDelay, retryCondition]);

  // Auto-execute query when dependencies change
  useEffect(() => {
    executeQuery();
  }, dependencies);

  // Manual retry function
  const retry = useCallback(() => {
    return executeQuery(true);
  }, [executeQuery]);

  return {
    ...state,
    retry,
    refetch: () => executeQuery(),
  };
}

/**
 * Hook for retryable mutations
 */
export function useRetryableMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  options: UseRetryableQueryOptions = {}
) {
  const [state, setState] = useState<RetryableQueryState<TResult>>({
    data: undefined,
    error: null,
    isLoading: false,
    isRetrying: false,
    retryCount: 0
  });

  const {
    maxRetries = 2, // Fewer retries for mutations
    retryDelay = 1000,
    retryCondition
  } = options;

  const mutate = useCallback(async (args: TArgs) => {
    setState({
      data: undefined,
      error: null,
      isLoading: true,
      isRetrying: false,
      retryCount: 0
    });

    try {
      const result = await withConvexMutationRetry(() => mutationFn(args), {
        maxAttempts: maxRetries,
        baseDelay: retryDelay,
        retryCondition,
        onRetry: (error, attempt) => {
          setState(prev => ({
            ...prev,
            retryCount: attempt,
            isRetrying: true
          }));
        }
      });

      setState(prev => ({
        ...prev,
        data: result,
        error: null,
        isLoading: false,
        isRetrying: false
      }));

      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        error: errorObj,
        isLoading: false,
        isRetrying: false
      }));

      logger.error('Mutation failed after all retries', errorObj, 'RETRYABLE_MUTATION');
      throw error;
    }
  }, [mutationFn, maxRetries, retryDelay, retryCondition]);

  const retry = useCallback((args: TArgs) => {
    return mutate(args);
  }, [mutate]);

  return {
    ...state,
    mutate,
    retry,
  };
}

/**
 * Hook that enhances existing Convex queries with retry logic
 */
export function useQueryWithRetry<T>(
  data: T | undefined,
  error: any,
  isLoading: boolean,
  refetchFn?: () => void,
  options: UseRetryableQueryOptions = {}
) {
  const [retryState, setRetryState] = useState({
    retryCount: 0,
    isRetrying: false,
    lastRetryTime: 0
  });

  const {
    maxRetries = 3,
    retryDelay = 1000,
    enableAutoRetry = false,
    retryCondition = () => true
  } = options;

  // Auto-retry logic
  useEffect(() => {
    if (
      enableAutoRetry &&
      error &&
      retryState.retryCount < maxRetries &&
      retryCondition(error) &&
      refetchFn
    ) {
      const timeSinceLastRetry = Date.now() - retryState.lastRetryTime;
      const delay = Math.max(0, retryDelay - timeSinceLastRetry);

      const timeoutId = setTimeout(() => {
        setRetryState(prev => ({
          ...prev,
          retryCount: prev.retryCount + 1,
          isRetrying: true,
          lastRetryTime: Date.now()
        }));

        logger.info(`Auto-retrying query (attempt ${retryState.retryCount + 1})`, {
          retryCount: retryState.retryCount + 1,
          maxRetries
        }, 'AUTO_RETRY');

        refetchFn();
      }, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [error, retryState.retryCount, maxRetries, retryDelay, enableAutoRetry, retryCondition, refetchFn, retryState.lastRetryTime]);

  // Reset retry state when query succeeds
  useEffect(() => {
    if (data && !error && !isLoading) {
      setRetryState(prev => ({
        ...prev,
        retryCount: 0,
        isRetrying: false
      }));
    }
  }, [data, error, isLoading]);

  // Stop retrying state when loading ends
  useEffect(() => {
    if (!isLoading && retryState.isRetrying) {
      setRetryState(prev => ({
        ...prev,
        isRetrying: false
      }));
    }
  }, [isLoading, retryState.isRetrying]);

  const manualRetry = useCallback(() => {
    if (refetchFn && retryState.retryCount < maxRetries) {
      setRetryState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1,
        isRetrying: true,
        lastRetryTime: Date.now()
      }));

      logger.info(`Manual retry triggered (attempt ${retryState.retryCount + 1})`, {
        retryCount: retryState.retryCount + 1,
        maxRetries
      }, 'MANUAL_RETRY');

      refetchFn();
    }
  }, [refetchFn, retryState.retryCount, maxRetries]);

  const canRetry = retryState.retryCount < maxRetries && !!refetchFn && !!error;

  return {
    data,
    error,
    isLoading: isLoading || retryState.isRetrying,
    isRetrying: retryState.isRetrying,
    retryCount: retryState.retryCount,
    canRetry,
    retry: manualRetry,
    maxRetries
  };
}