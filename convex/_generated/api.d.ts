/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievements_achievementDefinitions from "../achievements/achievementDefinitions.js";
import type * as achievements_awardAchievement from "../achievements/awardAchievement.js";
import type * as achievements_cronJobs from "../achievements/cronJobs.js";
import type * as achievements_detectAchievements from "../achievements/detectAchievements.js";
import type * as achievements_notifications from "../achievements/notifications.js";
import type * as adminAnalytics from "../adminAnalytics.js";
import type * as adminAnalyticsLite from "../adminAnalyticsLite.js";
import type * as adminAnalyticsOptimized from "../adminAnalyticsOptimized.js";
import type * as adminCategories from "../adminCategories.js";
import type * as ai_analyzeReview from "../ai/analyzeReview.js";
import type * as aiAnalysisIntegration from "../aiAnalysisIntegration.js";
import type * as aiAnalysisTags from "../aiAnalysisTags.js";
import type * as analytics from "../analytics.js";
import type * as archived_schema_backup from "../archived_schema_backup.js";
import type * as batchImport from "../batchImport.js";
import type * as batchProcessingQueue from "../batchProcessingQueue.js";
import type * as bulkSync from "../bulkSync.js";
import type * as businessClaims from "../businessClaims.js";
import type * as businessContent from "../businessContent.js";
import type * as businessHooks from "../businessHooks.js";
import type * as businessImportOptimized from "../businessImportOptimized.js";
import type * as businesses from "../businesses.js";
import type * as categories from "../categories.js";
import type * as checkReviewImportStatus from "../checkReviewImportStatus.js";
import type * as cities from "../cities.js";
import type * as crons from "../crons.js";
import type * as dataSourceManager from "../dataSourceManager.js";
import type * as debugReviewImport from "../debugReviewImport.js";
import type * as diagnosticImport from "../diagnosticImport.js";
import type * as emails from "../emails.js";
import type * as facebookReviews from "../facebookReviews.js";
import type * as findZeroReviewBusinesses from "../findZeroReviewBusinesses.js";
import type * as fixReviewDuplication from "../fixReviewDuplication.js";
import type * as fixReviews from "../fixReviews.js";
import type * as geoScraperAPI from "../geoScraperAPI.js";
import type * as geoScraperMetrics from "../geoScraperMetrics.js";
import type * as geoScraperProcessor from "../geoScraperProcessor.js";
import type * as geoScraperQueue from "../geoScraperQueue.js";
import type * as http_sitemap from "../http/sitemap.js";
import type * as http from "../http.js";
import type * as importValidation from "../importValidation.js";
import type * as leads from "../leads.js";
import type * as makeAdmin from "../makeAdmin.js";
import type * as migrations_removeClaimedField from "../migrations/removeClaimedField.js";
import type * as moderation from "../moderation.js";
import type * as optimizedReviews from "../optimizedReviews.js";
import type * as ownerAccess from "../ownerAccess.js";
import type * as platformStats from "../platformStats.js";
import type * as rankings_calculateRankings from "../rankings/calculateRankings.js";
import type * as rankings_cronJobs from "../rankings/cronJobs.js";
import type * as rankings_realtimeUpdates from "../rankings/realtimeUpdates.js";
import type * as rateLimit from "../rateLimit.js";
import type * as reviewDeduplication from "../reviewDeduplication.js";
import type * as reviewImport from "../reviewImport.js";
import type * as reviewImportOptimized from "../reviewImportOptimized.js";
import type * as reviewSync from "../reviewSync.js";
import type * as schema_backup_complex from "../schema_backup_complex.js";
import type * as seed from "../seed.js";
import type * as seedBusinesses from "../seedBusinesses.js";
import type * as seedData from "../seedData.js";
import type * as seedNewCategories from "../seedNewCategories.js";
import type * as seo from "../seo.js";
import type * as simpleReviewImport from "../simpleReviewImport.js";
import type * as simpleReviewImport2 from "../simpleReviewImport2.js";
import type * as sitemaps from "../sitemaps.js";
import type * as subscriptions from "../subscriptions.js";
import type * as syncReviewCounts from "../syncReviewCounts.js";
import type * as syncReviewCountsBatch from "../syncReviewCountsBatch.js";
import type * as syncReviewCountsSimple from "../syncReviewCountsSimple.js";
import type * as testAction from "../testAction.js";
import type * as users from "../users.js";
import type * as verification from "../verification.js";
import type * as verifyImport from "../verifyImport.js";
import type * as yelpReviews from "../yelpReviews.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "achievements/achievementDefinitions": typeof achievements_achievementDefinitions;
  "achievements/awardAchievement": typeof achievements_awardAchievement;
  "achievements/cronJobs": typeof achievements_cronJobs;
  "achievements/detectAchievements": typeof achievements_detectAchievements;
  "achievements/notifications": typeof achievements_notifications;
  adminAnalytics: typeof adminAnalytics;
  adminAnalyticsLite: typeof adminAnalyticsLite;
  adminAnalyticsOptimized: typeof adminAnalyticsOptimized;
  adminCategories: typeof adminCategories;
  "ai/analyzeReview": typeof ai_analyzeReview;
  aiAnalysisIntegration: typeof aiAnalysisIntegration;
  aiAnalysisTags: typeof aiAnalysisTags;
  analytics: typeof analytics;
  archived_schema_backup: typeof archived_schema_backup;
  batchImport: typeof batchImport;
  batchProcessingQueue: typeof batchProcessingQueue;
  bulkSync: typeof bulkSync;
  businessClaims: typeof businessClaims;
  businessContent: typeof businessContent;
  businessHooks: typeof businessHooks;
  businessImportOptimized: typeof businessImportOptimized;
  businesses: typeof businesses;
  categories: typeof categories;
  checkReviewImportStatus: typeof checkReviewImportStatus;
  cities: typeof cities;
  crons: typeof crons;
  dataSourceManager: typeof dataSourceManager;
  debugReviewImport: typeof debugReviewImport;
  diagnosticImport: typeof diagnosticImport;
  emails: typeof emails;
  facebookReviews: typeof facebookReviews;
  findZeroReviewBusinesses: typeof findZeroReviewBusinesses;
  fixReviewDuplication: typeof fixReviewDuplication;
  fixReviews: typeof fixReviews;
  geoScraperAPI: typeof geoScraperAPI;
  geoScraperMetrics: typeof geoScraperMetrics;
  geoScraperProcessor: typeof geoScraperProcessor;
  geoScraperQueue: typeof geoScraperQueue;
  "http/sitemap": typeof http_sitemap;
  http: typeof http;
  importValidation: typeof importValidation;
  leads: typeof leads;
  makeAdmin: typeof makeAdmin;
  "migrations/removeClaimedField": typeof migrations_removeClaimedField;
  moderation: typeof moderation;
  optimizedReviews: typeof optimizedReviews;
  ownerAccess: typeof ownerAccess;
  platformStats: typeof platformStats;
  "rankings/calculateRankings": typeof rankings_calculateRankings;
  "rankings/cronJobs": typeof rankings_cronJobs;
  "rankings/realtimeUpdates": typeof rankings_realtimeUpdates;
  rateLimit: typeof rateLimit;
  reviewDeduplication: typeof reviewDeduplication;
  reviewImport: typeof reviewImport;
  reviewImportOptimized: typeof reviewImportOptimized;
  reviewSync: typeof reviewSync;
  schema_backup_complex: typeof schema_backup_complex;
  seed: typeof seed;
  seedBusinesses: typeof seedBusinesses;
  seedData: typeof seedData;
  seedNewCategories: typeof seedNewCategories;
  seo: typeof seo;
  simpleReviewImport: typeof simpleReviewImport;
  simpleReviewImport2: typeof simpleReviewImport2;
  sitemaps: typeof sitemaps;
  subscriptions: typeof subscriptions;
  syncReviewCounts: typeof syncReviewCounts;
  syncReviewCountsBatch: typeof syncReviewCountsBatch;
  syncReviewCountsSimple: typeof syncReviewCountsSimple;
  testAction: typeof testAction;
  users: typeof users;
  verification: typeof verification;
  verifyImport: typeof verifyImport;
  yelpReviews: typeof yelpReviews;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  polar: {
    lib: {
      createProduct: FunctionReference<
        "mutation",
        "internal",
        {
          product: {
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              createdAt: string;
              id: string;
              isArchived: boolean;
              modifiedAt: string | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "month" | "year" | null;
              type?: string;
            }>;
            recurringInterval?: "month" | "year" | null;
          };
        },
        any
      >;
      createSubscription: FunctionReference<
        "mutation",
        "internal",
        {
          subscription: {
            amount: number | null;
            cancelAtPeriodEnd: boolean;
            checkoutId: string | null;
            createdAt: string;
            currency: string | null;
            currentPeriodEnd: string | null;
            currentPeriodStart: string;
            customerCancellationComment?: string | null;
            customerCancellationReason?: string | null;
            customerId: string;
            endedAt: string | null;
            id: string;
            metadata: Record<string, any>;
            modifiedAt: string | null;
            priceId?: string;
            productId: string;
            recurringInterval: "month" | "year" | null;
            startedAt: string | null;
            status: string;
          };
        },
        any
      >;
      getCurrentSubscription: FunctionReference<
        "query",
        "internal",
        { userId: string },
        {
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          endedAt: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          product: {
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              createdAt: string;
              id: string;
              isArchived: boolean;
              modifiedAt: string | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "month" | "year" | null;
              type?: string;
            }>;
            recurringInterval?: "month" | "year" | null;
          };
          productId: string;
          recurringInterval: "month" | "year" | null;
          startedAt: string | null;
          status: string;
        } | null
      >;
      getCustomerByUserId: FunctionReference<
        "query",
        "internal",
        { userId: string },
        { id: string; metadata?: Record<string, any>; userId: string } | null
      >;
      getProduct: FunctionReference<
        "query",
        "internal",
        { id: string },
        {
          createdAt: string;
          description: string | null;
          id: string;
          isArchived: boolean;
          isRecurring: boolean;
          medias: Array<{
            checksumEtag: string | null;
            checksumSha256Base64: string | null;
            checksumSha256Hex: string | null;
            createdAt: string;
            id: string;
            isUploaded: boolean;
            lastModifiedAt: string | null;
            mimeType: string;
            name: string;
            organizationId: string;
            path: string;
            publicUrl: string;
            service?: string;
            size: number;
            sizeReadable: string;
            storageVersion: string | null;
            version: string | null;
          }>;
          metadata?: Record<string, any>;
          modifiedAt: string | null;
          name: string;
          organizationId: string;
          prices: Array<{
            amountType?: string;
            createdAt: string;
            id: string;
            isArchived: boolean;
            modifiedAt: string | null;
            priceAmount?: number;
            priceCurrency?: string;
            productId: string;
            recurringInterval?: "month" | "year" | null;
            type?: string;
          }>;
          recurringInterval?: "month" | "year" | null;
        } | null
      >;
      getSubscription: FunctionReference<
        "query",
        "internal",
        { id: string },
        {
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          endedAt: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          productId: string;
          recurringInterval: "month" | "year" | null;
          startedAt: string | null;
          status: string;
        } | null
      >;
      insertCustomer: FunctionReference<
        "mutation",
        "internal",
        { id: string; metadata?: Record<string, any>; userId: string },
        string
      >;
      listCustomerSubscriptions: FunctionReference<
        "query",
        "internal",
        { customerId: string },
        Array<{
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          endedAt: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          productId: string;
          recurringInterval: "month" | "year" | null;
          startedAt: string | null;
          status: string;
        }>
      >;
      listProducts: FunctionReference<
        "query",
        "internal",
        { includeArchived?: boolean },
        Array<{
          createdAt: string;
          description: string | null;
          id: string;
          isArchived: boolean;
          isRecurring: boolean;
          medias: Array<{
            checksumEtag: string | null;
            checksumSha256Base64: string | null;
            checksumSha256Hex: string | null;
            createdAt: string;
            id: string;
            isUploaded: boolean;
            lastModifiedAt: string | null;
            mimeType: string;
            name: string;
            organizationId: string;
            path: string;
            publicUrl: string;
            service?: string;
            size: number;
            sizeReadable: string;
            storageVersion: string | null;
            version: string | null;
          }>;
          metadata?: Record<string, any>;
          modifiedAt: string | null;
          name: string;
          organizationId: string;
          priceAmount?: number;
          prices: Array<{
            amountType?: string;
            createdAt: string;
            id: string;
            isArchived: boolean;
            modifiedAt: string | null;
            priceAmount?: number;
            priceCurrency?: string;
            productId: string;
            recurringInterval?: "month" | "year" | null;
            type?: string;
          }>;
          recurringInterval?: "month" | "year" | null;
        }>
      >;
      listUserSubscriptions: FunctionReference<
        "query",
        "internal",
        { userId: string },
        Array<{
          amount: number | null;
          cancelAtPeriodEnd: boolean;
          checkoutId: string | null;
          createdAt: string;
          currency: string | null;
          currentPeriodEnd: string | null;
          currentPeriodStart: string;
          customerCancellationComment?: string | null;
          customerCancellationReason?: string | null;
          customerId: string;
          endedAt: string | null;
          id: string;
          metadata: Record<string, any>;
          modifiedAt: string | null;
          priceId?: string;
          product: {
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              createdAt: string;
              id: string;
              isArchived: boolean;
              modifiedAt: string | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "month" | "year" | null;
              type?: string;
            }>;
            recurringInterval?: "month" | "year" | null;
          } | null;
          productId: string;
          recurringInterval: "month" | "year" | null;
          startedAt: string | null;
          status: string;
        }>
      >;
      updateProduct: FunctionReference<
        "mutation",
        "internal",
        {
          product: {
            createdAt: string;
            description: string | null;
            id: string;
            isArchived: boolean;
            isRecurring: boolean;
            medias: Array<{
              checksumEtag: string | null;
              checksumSha256Base64: string | null;
              checksumSha256Hex: string | null;
              createdAt: string;
              id: string;
              isUploaded: boolean;
              lastModifiedAt: string | null;
              mimeType: string;
              name: string;
              organizationId: string;
              path: string;
              publicUrl: string;
              service?: string;
              size: number;
              sizeReadable: string;
              storageVersion: string | null;
              version: string | null;
            }>;
            metadata?: Record<string, any>;
            modifiedAt: string | null;
            name: string;
            organizationId: string;
            prices: Array<{
              amountType?: string;
              createdAt: string;
              id: string;
              isArchived: boolean;
              modifiedAt: string | null;
              priceAmount?: number;
              priceCurrency?: string;
              productId: string;
              recurringInterval?: "month" | "year" | null;
              type?: string;
            }>;
            recurringInterval?: "month" | "year" | null;
          };
        },
        any
      >;
      updateSubscription: FunctionReference<
        "mutation",
        "internal",
        {
          subscription: {
            amount: number | null;
            cancelAtPeriodEnd: boolean;
            checkoutId: string | null;
            createdAt: string;
            currency: string | null;
            currentPeriodEnd: string | null;
            currentPeriodStart: string;
            customerCancellationComment?: string | null;
            customerCancellationReason?: string | null;
            customerId: string;
            endedAt: string | null;
            id: string;
            metadata: Record<string, any>;
            modifiedAt: string | null;
            priceId?: string;
            productId: string;
            recurringInterval: "month" | "year" | null;
            startedAt: string | null;
            status: string;
          };
        },
        any
      >;
      upsertCustomer: FunctionReference<
        "mutation",
        "internal",
        { id: string; metadata?: Record<string, any>; userId: string },
        string
      >;
    };
  };
};
