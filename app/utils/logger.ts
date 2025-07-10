type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
  context?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logPerformance = import.meta.env.PROD || import.meta.env.VITE_DEBUG_PERFORMANCE;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, context } = entry;
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} [${level.toUpperCase()}] ${contextStr} ${message}`;
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error, context?: string): void {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      data,
      error,
      context,
    };

    if (this.isDevelopment) {
      // In development, use console with appropriate method
      const consoleMethod = level === 'error' ? 'error' : 
                           level === 'warn' ? 'warn' : 
                           level === 'info' ? 'info' : 'debug';
      
      console[consoleMethod](this.formatLogEntry(entry));
      
      if (data) {
        console[consoleMethod]('Data:', data);
      }
      
      if (error) {
        console[consoleMethod]('Error:', error);
      }
    } else {
      // In production, you could send to a logging service
      // For now, just use console.error for errors
      if (level === 'error') {
        console.error(this.formatLogEntry(entry));
        if (error) {
          console.error('Error:', error);
        }
      }
    }
  }

  error(message: string, error?: Error, context?: string): void {
    this.log('error', message, undefined, error, context);
  }

  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, undefined, context);
  }

  info(message: string, data?: any, context?: string): void {
    // Skip performance logs unless specifically enabled
    if (message.includes('[PERFORMANCE]') && !this.logPerformance) {
      return;
    }
    // Also skip other verbose performance-related logs
    if (this.isDevelopment && (message.includes('PERFORMANCE') || message.includes('TIMING'))) {
      return;
    }
    this.log('info', message, data, undefined, context);
  }

  debug(message: string, data?: any, context?: string): void {
    this.log('debug', message, data, undefined, context);
  }

  // Convenience methods for common scenarios
  apiError(message: string, error: Error, endpoint?: string): void {
    this.error(`API Error: ${message}`, error, endpoint);
  }

  userAction(action: string, userId?: string, data?: any): void {
    this.info(`User Action: ${action}`, { userId, ...data }, 'USER');
  }

  convexError(message: string, error: Error, functionName?: string): void {
    this.error(`Convex Error: ${message}`, error, `CONVEX:${functionName}`);
  }

  authError(message: string, error?: Error): void {
    this.error(`Auth Error: ${message}`, error, 'AUTH');
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LogEntry };