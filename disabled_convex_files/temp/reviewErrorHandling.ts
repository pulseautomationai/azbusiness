/**
 * Review Import Error Handling and Retry Mechanisms
 * Part of AI Ranking System - Phase 1.2
 */

import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Error types and their handling strategies
 */
interface ErrorHandlingStrategy {
  shouldRetry: boolean;
  maxRetries: number;
  retryDelayMs: number;
  escalateToAdmin: boolean;
  userMessage: string;
}

const errorStrategies: Record<string, ErrorHandlingStrategy> = {
  // Network/API errors - should retry
  "NETWORK_ERROR": {
    shouldRetry: true,
    maxRetries: 3,
    retryDelayMs: 5000,
    escalateToAdmin: false,
    userMessage: "Network connection issue. We'll retry automatically."
  },
  "API_RATE_LIMIT": {
    shouldRetry: true,
    maxRetries: 5,
    retryDelayMs: 60000, // 1 minute
    escalateToAdmin: false,
    userMessage: "API rate limit reached. Retrying after cooldown period."
  },
  "API_TIMEOUT": {
    shouldRetry: true,
    maxRetries: 2,
    retryDelayMs: 10000,
    escalateToAdmin: false,
    userMessage: "Request timed out. Retrying with extended timeout."
  },
  
  // Authentication errors - should not retry, but might resolve
  "AUTH_EXPIRED": {
    shouldRetry: false,
    maxRetries: 0,
    retryDelayMs: 0,
    escalateToAdmin: true,
    userMessage: "Authentication expired. Please reconnect your account."
  },
  "PERMISSION_DENIED": {
    shouldRetry: false,
    maxRetries: 0,
    retryDelayMs: 0,
    escalateToAdmin: true,
    userMessage: "Permission denied. Please check your account access."
  },
  
  // Data errors - should not retry
  "INVALID_DATA": {
    shouldRetry: false,
    maxRetries: 0,
    retryDelayMs: 0,
    escalateToAdmin: false,
    userMessage: "Invalid data format. Please contact support."
  },
  "DUPLICATE_CONTENT": {
    shouldRetry: false,
    maxRetries: 0,
    retryDelayMs: 0,
    escalateToAdmin: false,
    userMessage: "Content already exists and was skipped."
  },
  
  // System errors - should retry with escalation
  "DATABASE_ERROR": {
    shouldRetry: true,
    maxRetries: 2,
    retryDelayMs: 2000,
    escalateToAdmin: true,
    userMessage: "Database temporarily unavailable. Retrying automatically."
  },
  "UNKNOWN_ERROR": {
    shouldRetry: true,
    maxRetries: 1,
    retryDelayMs: 5000,
    escalateToAdmin: true,
    userMessage: "Unexpected error occurred. Our team has been notified."
  }
};

/**
 * Classify error type from error message/object
 */
function classifyError(error: any): string {
  const errorMessage = typeof error === 'string' ? error : error?.message || error?.toString() || '';
  const lowerMessage = errorMessage.toLowerCase();
  
  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return 'NETWORK_ERROR';
  }
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return 'API_RATE_LIMIT';
  }
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return 'API_TIMEOUT';
  }
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('auth')) {
    return 'AUTH_EXPIRED';
  }
  if (lowerMessage.includes('permission') || lowerMessage.includes('forbidden')) {
    return 'PERMISSION_DENIED';
  }
  if (lowerMessage.includes('invalid') || lowerMessage.includes('malformed')) {
    return 'INVALID_DATA';
  }
  if (lowerMessage.includes('duplicate') || lowerMessage.includes('already exists')) {
    return 'DUPLICATE_CONTENT';
  }
  if (lowerMessage.includes('database') || lowerMessage.includes('db')) {
    return 'DATABASE_ERROR';
  }
  
  return 'UNKNOWN_ERROR';
}

/**
 * Record an error for tracking and potential retry
 */
export const recordImportError = internalMutation({
  args: {
    batchId: v.id("importBatches"),
    businessId: v.id("businesses"),
    errorType: v.string(),
    errorMessage: v.string(),
    context: v.optional(v.any()), // Additional context about what was being processed
    retryCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const errorType = classifyError(args.errorMessage);
    const strategy = errorStrategies[errorType] || errorStrategies.UNKNOWN_ERROR;
    
    // Update the import batch with error info
    const batch = await ctx.db.get(args.batchId);
    if (batch) {
      const existingErrors = batch.errors || [];
      const errorEntry = `[${new Date().toISOString()}] ${errorType}: ${args.errorMessage}`;
      
      await ctx.db.patch(args.batchId, {
        errors: [...existingErrors, errorEntry],
      });
    }
    
    // If this is a retryable error and we haven't exceeded max retries
    const currentRetryCount = args.retryCount || 0;
    if (strategy.shouldRetry && currentRetryCount < strategy.maxRetries) {
      // Schedule a retry
      await ctx.scheduler.runAfter(strategy.retryDelayMs, internal.retryFailedImport, {
        batchId: args.batchId,
        businessId: args.businessId,
        retryCount: currentRetryCount + 1,
        originalError: args.errorMessage,
        context: args.context,
      });
      
      return {
        action: "retry_scheduled",
        retryCount: currentRetryCount + 1,
        retryDelayMs: strategy.retryDelayMs,
        userMessage: strategy.userMessage,
      };
    }
    
    // If we can't or shouldn't retry
    if (strategy.escalateToAdmin) {
      // TODO: Send admin notification
      console.log(`ADMIN ESCALATION: ${errorType} for batch ${args.batchId}: ${args.errorMessage}`);
    }
    
    return {
      action: "error_final",
      retryCount: currentRetryCount,
      escalated: strategy.escalateToAdmin,
      userMessage: strategy.userMessage,
    };
  },
});

/**
 * Retry a failed import operation
 */
export const retryFailedImport = internalMutation({
  args: {
    batchId: v.id("importBatches"),
    businessId: v.id("businesses"),
    retryCount: v.number(),
    originalError: v.string(),
    context: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error(`Batch ${args.batchId} not found for retry`);
    }
    
    // Update batch status to show retry in progress
    await ctx.db.patch(args.batchId, {
      status: "retrying",
    });
    
    try {
      // Determine the original import type and retry appropriately
      switch (batch.importType) {
        case "gmb_review_sync":
          // TODO: Retry GMB sync
          // await ctx.scheduler.runAfter(0, internal.syncGMBReviewsInternal, {
          //   ...batch.sourceMetadata,
          //   batchId: args.batchId,
          //   retryCount: args.retryCount,
          // });
          break;
          
        case "yelp_import":
          // TODO: Retry Yelp import
          break;
          
        case "facebook_import":
          // TODO: Retry Facebook import
          break;
          
        default:
          throw new Error(`Unknown import type for retry: ${batch.importType}`);
      }
      
      return { status: "retry_initiated", retryCount: args.retryCount };
      
    } catch (error) {
      // Retry failed, record the error again
      await ctx.runMutation(internal.recordImportError, {
        batchId: args.batchId,
        businessId: args.businessId,
        errorType: "RETRY_FAILED",
        errorMessage: `Retry ${args.retryCount} failed: ${error}`,
        context: { originalError: args.originalError, ...args.context },
        retryCount: args.retryCount,
      });
      
      throw error;
    }
  },
});

/**
 * Get error statistics for a business or batch
 */
export const getErrorAnalytics = query({
  args: {
    businessId: v.optional(v.id("businesses")),
    batchId: v.optional(v.id("importBatches")),
    timeframe: v.optional(v.string()), // "24h", "7d", "30d"
  },
  handler: async (ctx, args) => {
    let batches;
    
    if (args.batchId) {
      // Get specific batch
      const batch = await ctx.db.get(args.batchId);
      batches = batch ? [batch] : [];
    } else if (args.businessId) {
      // Get all batches for business
      batches = await ctx.db
        .query("importBatches")
        .filter((q) => q.eq(q.field("sourceMetadata.businessId"), args.businessId))
        .collect();
    } else {
      // Get all recent batches
      const timeframeDays = {
        "24h": 1,
        "7d": 7,
        "30d": 30,
      }[args.timeframe || "7d"] || 7;
      
      const cutoff = Date.now() - (timeframeDays * 24 * 60 * 60 * 1000);
      
      batches = await ctx.db
        .query("importBatches")
        .filter((q) => q.gt(q.field("createdAt"), cutoff))
        .collect();
    }
    
    // Analyze errors
    const errorStats = {
      totalBatches: batches.length,
      successfulBatches: 0,
      failedBatches: 0,
      retriedBatches: 0,
      errorTypes: {} as Record<string, number>,
      commonErrors: [] as Array<{ message: string; count: number; type: string }>,
      recentErrors: [] as Array<{ batchId: string; timestamp: number; error: string }>,
    };
    
    const errorCounts: Record<string, number> = {};
    
    for (const batch of batches) {
      if (batch.status === "completed") {
        errorStats.successfulBatches++;
      } else if (batch.status === "failed") {
        errorStats.failedBatches++;
      } else if (batch.status === "retrying") {
        errorStats.retriedBatches++;
      }
      
      if (batch.errors && batch.errors.length > 0) {
        for (const error of batch.errors) {
          const errorType = classifyError(error);
          errorStats.errorTypes[errorType] = (errorStats.errorTypes[errorType] || 0) + 1;
          
          // Extract just the error message (after the timestamp and type)
          const messageMatch = error.match(/\] \w+: (.+)$/);
          const message = messageMatch ? messageMatch[1] : error;
          
          errorCounts[message] = (errorCounts[message] || 0) + 1;
          
          errorStats.recentErrors.push({
            batchId: batch._id,
            timestamp: batch.createdAt,
            error: message,
          });
        }
      }
    }
    
    // Sort and limit common errors
    errorStats.commonErrors = Object.entries(errorCounts)
      .map(([message, count]) => ({
        message,
        count,
        type: classifyError(message),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Sort recent errors by timestamp
    errorStats.recentErrors = errorStats.recentErrors
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
    
    return errorStats;
  },
});

/**
 * Mark errors as resolved/acknowledged by admin
 */
export const acknowledgeErrors = mutation({
  args: {
    batchId: v.id("importBatches"),
    adminUserId: v.id("users"),
    resolution: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db.get(args.adminUserId);
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      throw new Error("Admin permissions required");
    }
    
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }
    
    // Add resolution note to the batch
    const resolutionNote = `[${new Date().toISOString()}] RESOLVED by ${user.name}: ${args.resolution}`;
    const updatedErrors = [...(batch.errors || []), resolutionNote];
    
    await ctx.db.patch(args.batchId, {
      errors: updatedErrors,
      status: batch.status === "failed" ? "resolved" : batch.status,
    });
    
    return { acknowledged: true, resolution: args.resolution };
  },
});