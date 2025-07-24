import { useMemo } from "react";
import type { Id } from "convex/_generated/dataModel";

export interface BusinessForAdmin {
  _id: Id<"businesses">;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  planTier: string;
  active: boolean;
  verified: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  placeId?: string;
  categoryId: Id<"categories">;
  categoryName: string;
  categorySlug: string;
  claimedByUserId?: string;
  dataSource?: {
    primary: string;
    lastSyncedAt?: number;
    syncStatus?: string;
  };
  createdAt: number;
  updatedAt: number;
  lastReviewSync?: number;
  syncStatus?: string;
  gmbClaimed?: boolean;
  overallScore?: number; // AI insights score
}

export interface BusinessFilters {
  search: string;
  planTier: "all" | "free" | "starter" | "pro" | "power";
  statusFilter: "all" | "active" | "inactive";
  verificationFilter: "all" | "verified" | "unverified";
  reviewCountFilter: "all" | "none" | "few" | "moderate" | "many" | "lots";
  cityFilter: string;
  zipcodeFilter: string;
  categoryFilter: string | Id<"categories">;
  sourceFilter: "all" | "gmb_api" | "admin_import" | "user_manual" | "system";
  dateFilter: "all" | "today" | "week" | "month";
  claimFilter: "all" | "claimed" | "unclaimed";
}

export function useBusinessFiltering(
  businesses: BusinessForAdmin[] | undefined,
  filters: BusinessFilters,
  pageSize: number = 50
) {
  const filteredBusinesses = useMemo(() => {
    if (!businesses || businesses.length === 0) {
      console.log("No businesses to filter - data is undefined or empty");
      return [];
    }

    // Debug logging
    console.log("Starting filter with:", {
      totalBusinesses: businesses.length,
      businessesProvided: !!businesses,
      filters: filters,
      categoryFilter: filters.categoryFilter,
      categoryFilterType: typeof filters.categoryFilter
    });

    let filtered = businesses;

    // Search filter (name, address, phone, email)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchLower) ||
        business.address.toLowerCase().includes(searchLower) ||
        business.phone?.toLowerCase().includes(searchLower) ||
        business.email?.toLowerCase().includes(searchLower) ||
        business.city.toLowerCase().includes(searchLower)
      );
    }

    // Plan tier filter
    if (filters.planTier !== "all") {
      filtered = filtered.filter(business => business.planTier === filters.planTier);
    }

    // Status filter
    if (filters.statusFilter !== "all") {
      filtered = filtered.filter(business => 
        filters.statusFilter === "active" ? business.active : !business.active
      );
    }

    // Verification filter
    if (filters.verificationFilter !== "all") {
      filtered = filtered.filter(business =>
        filters.verificationFilter === "verified" ? business.verified : !business.verified
      );
    }

    // Review count filter
    if (filters.reviewCountFilter !== "all") {
      filtered = filtered.filter(business => {
        switch (filters.reviewCountFilter) {
          case "none":
            return business.reviewCount === 0;
          case "few":
            return business.reviewCount >= 1 && business.reviewCount <= 10;
          case "moderate":
            return business.reviewCount >= 11 && business.reviewCount <= 50;
          case "many":
            return business.reviewCount >= 51 && business.reviewCount <= 100;
          case "lots":
            return business.reviewCount > 100;
          default:
            return true;
        }
      });
    }

    // City filter - handle case sensitivity and trimming
    if (filters.cityFilter !== "all" && filters.cityFilter !== "") {
      console.log("Applying city filter:", {
        cityFilter: filters.cityFilter,
        citiesInData: [...new Set(filtered.slice(0, 10).map(b => b.city))]
      });
      
      filtered = filtered.filter(business => 
        business.city.trim().toLowerCase() === filters.cityFilter.trim().toLowerCase()
      );
      
      console.log(`City filter applied: ${filtered.length} businesses match`);
    }

    // Zipcode filter
    if (filters.zipcodeFilter !== "all") {
      filtered = filtered.filter(business => business.zip === filters.zipcodeFilter);
    }

    // Category filter - handle both string and Id types
    if (filters.categoryFilter !== "all" && filters.categoryFilter !== "") {
      const beforeCount = filtered.length;
      
      console.log("Applying category filter:", {
        categoryFilter: filters.categoryFilter,
        categoryFilterType: typeof filters.categoryFilter,
        businessSample: filtered.slice(0, 3).map(b => ({
          name: b.name,
          categoryId: b.categoryId,
          categoryIdType: typeof b.categoryId,
          categoryName: b.categoryName,
          matches: b.categoryId === filters.categoryFilter,
          stringMatches: String(b.categoryId) === String(filters.categoryFilter)
        }))
      });
      
      // Convert both to strings for comparison in case of type mismatch
      filtered = filtered.filter(business => 
        String(business.categoryId) === String(filters.categoryFilter)
      );
      
      console.log(`Category filter applied: ${beforeCount} → ${filtered.length} businesses (filtered out ${beforeCount - filtered.length})`);
      
      // Log first few results after filtering
      console.log("After category filter, first 3 businesses:", 
        filtered.slice(0, 3).map(b => ({ name: b.name, category: b.categoryName }))
      );
    }

    // Data source filter
    if (filters.sourceFilter !== "all") {
      filtered = filtered.filter(business => 
        business.dataSource?.primary === filters.sourceFilter
      );
    }

    // Date filter
    if (filters.dateFilter !== "all") {
      const now = Date.now();
      const cutoffTime = 
        filters.dateFilter === "today" ? now - (24 * 60 * 60 * 1000) :
        filters.dateFilter === "week" ? now - (7 * 24 * 60 * 60 * 1000) :
        filters.dateFilter === "month" ? now - (30 * 24 * 60 * 60 * 1000) : 0;
      
      filtered = filtered.filter(business => business.createdAt >= cutoffTime);
    }

    // Claim filter
    if (filters.claimFilter !== "all") {
      filtered = filtered.filter(business =>
        filters.claimFilter === "claimed" ? !!business.claimedByUserId : !business.claimedByUserId
      );
    }

    // Sort by most recently updated
    filtered.sort((a, b) => b.updatedAt - a.updatedAt);

    // Debug logging results
    console.log("Filter results:", {
      originalCount: businesses.length,
      filteredCount: filtered.length,
      activeFilters: {
        city: filters.cityFilter !== "all" ? filters.cityFilter : null,
        category: filters.categoryFilter !== "all" ? filters.categoryFilter : null,
      },
      cityMatches: filters.cityFilter !== "all" ? 
        businesses.filter(b => b.city.trim().toLowerCase() === filters.cityFilter.trim().toLowerCase()).length : 
        businesses.length,
      categoryMatches: filters.categoryFilter !== "all" ? 
        businesses.filter(b => String(b.categoryId) === String(filters.categoryFilter)).length : 
        businesses.length,
      bothFiltersMatch: filters.cityFilter !== "all" && filters.categoryFilter !== "all" ?
        businesses.filter(b => 
          b.city.trim().toLowerCase() === filters.cityFilter.trim().toLowerCase() && 
          String(b.categoryId) === String(filters.categoryFilter)
        ).length : null
    });

    return filtered;
  }, [businesses, filters]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const totalPages = Math.ceil(filteredBusinesses.length / pageSize);
    
    console.log("Pagination data:", {
      filteredCount: filteredBusinesses.length,
      pageSize,
      returningCount: filteredBusinesses.slice(0, pageSize).length,
      firstFewBusinesses: filteredBusinesses.slice(0, 3).map(b => ({
        name: b.name,
        category: b.categoryName
      }))
    });
    
    return {
      businesses: filteredBusinesses,
      totalCount: filteredBusinesses.length,
      totalPages,
      // For now, just return all results - pagination can be added later if needed
      currentPage: filteredBusinesses.slice(0, pageSize),
    };
  }, [filteredBusinesses, pageSize]);

  return paginatedData;
}

// Helper function to get unique values for filter dropdowns
export function getFilterOptions(businesses: BusinessForAdmin[] | undefined) {
  if (!businesses) return { cities: [], zipcodes: [], categories: [] };

  const cities = [...new Set(businesses.map(b => b.city))].filter(Boolean).sort();
  const zipcodes = [...new Set(businesses.map(b => b.zip))].filter(Boolean).sort();
  
  // Create a map to ensure unique categories by ID
  const categoryMap = new Map<string, { id: string, name: string }>();
  businesses.forEach(b => {
    if (b.categoryId && b.categoryName) {
      categoryMap.set(b.categoryId, { id: b.categoryId, name: b.categoryName });
    }
  });
  
  const categories = Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  return {
    cities,
    zipcodes,
    categories,
  };
}