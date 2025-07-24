import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { BusinessForAdmin } from "./useBusinessFiltering";

export function useBusinessPagination() {
  const [allBusinesses, setAllBusinesses] = useState<BusinessForAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Get total count
  const totalCount = useQuery(api.businesses.getBusinessCountForAdmin);

  // Load current page
  const currentPage = useQuery(
    api.businesses.getBusinessesForAdminPaginated,
    hasMore ? { cursor: cursor || undefined, limit: 1000 } : "skip"
  );

  // Load all businesses progressively
  useEffect(() => {
    if (!currentPage || !hasMore) {
      console.log("Skipping load:", { hasCurrentPage: !!currentPage, hasMore });
      return;
    }

    console.log("Processing page:", {
      businessesInPage: currentPage.businesses.length,
      hasMore: currentPage.hasMore,
      nextCursor: currentPage.nextCursor ? `${currentPage.nextCursor.substring(0, 10)}...` : null,
      currentCursor: cursor ? `${cursor.substring(0, 10)}...` : null
    });

    // Add new businesses to our collection - ensure type compatibility
    const newBusinesses: BusinessForAdmin[] = currentPage.businesses.map(b => ({
      ...b,
      email: b.email || "",
      website: b.website || "",
      planTier: b.planTier || "free",
      placeId: b.placeId || undefined,
      claimedByUserId: b.claimedByUserId || undefined,
      dataSource: b.dataSource || undefined,
      lastReviewSync: b.lastReviewSync || undefined,
      syncStatus: b.syncStatus || undefined,
      gmbClaimed: b.gmbClaimed || undefined,
      overallScore: b.overallScore || undefined, // Include AI insights score
    }));
    
    setAllBusinesses(prev => {
      // Create a Set of existing business IDs to prevent duplicates
      const existingIds = new Set(prev.map(b => b._id));
      // Filter out any businesses that already exist
      const uniqueNewBusinesses = newBusinesses.filter(b => !existingIds.has(b._id));
      
      // Debug logging
      if (newBusinesses.length !== uniqueNewBusinesses.length) {
        console.log(`Prevented ${newBusinesses.length - uniqueNewBusinesses.length} duplicate businesses from being added`);
      }
      
      // Return combined array
      return [...prev, ...uniqueNewBusinesses];
    });
    
    // Check if we have more to load
    if (currentPage.hasMore && currentPage.nextCursor) {
      console.log(`Loading next page: ${allBusinesses.length + newBusinesses.length}/${totalCount} businesses loaded`);
      setCursor(currentPage.nextCursor);
      setHasMore(true);
    } else {
      console.log(`Loading complete: ${allBusinesses.length + newBusinesses.length}/${totalCount} businesses loaded`);
      setHasMore(false);
      setIsLoading(false);
    }
  }, [currentPage?.nextCursor, hasMore]); // Changed dependencies to avoid re-running on allBusinesses.length change

  // Update progress in a separate effect
  useEffect(() => {
    if (totalCount && allBusinesses.length > 0) {
      setLoadingProgress(Math.round((allBusinesses.length / totalCount) * 100));
    }
  }, [allBusinesses.length, totalCount]);

  // Reset function
  const reset = useCallback(() => {
    setAllBusinesses([]);
    setCursor(null);
    setHasMore(true);
    setIsLoading(true);
    setLoadingProgress(0);
  }, []);

  return {
    businesses: allBusinesses,
    isLoading,
    loadingProgress,
    totalCount: totalCount || 0,
    reset,
  };
}