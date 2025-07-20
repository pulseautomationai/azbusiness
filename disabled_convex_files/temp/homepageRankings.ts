/**
 * Homepage Ranking Data Queries
 * Provides ranking data for homepage sections
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get top performing businesses across Arizona for the "This Week's Top Performers" section
 */
export const getTopPerformers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 3;
    
    // Get businesses with the highest overall performance scores
    // For now, we'll use a combination of rating, review count, and tier as a proxy
    // until we have actual performance scores from AI analysis
    const businesses = await ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("active"), true))
      .filter((q) => q.eq(q.field("verified"), true))
      .collect();

    // Sort by a composite score: rating * log(reviewCount) + tier bonus
    const scoredBusinesses = businesses
      .map((business) => {
        const rating = business.rating || 0;
        const reviewCount = business.reviewCount || 1;
        const tierBonus = getTierBonus(business.planTier || "free");
        
        // Composite performance score
        const performanceScore = rating * Math.log10(reviewCount + 1) + tierBonus;
        
        return {
          ...business,
          performanceScore,
          // Generate performance badges based on business characteristics
          performanceBadge: generatePerformanceBadge(business),
        };
      })
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, limit);

    // Format for homepage display
    return scoredBusinesses.map((business) => ({
      id: business._id,
      name: business.name,
      badge: business.performanceBadge,
      rating: business.rating || 0,
      reviewCount: business.reviewCount || 0,
      performanceMetric: generatePerformanceMetric(business),
      location: formatLocation(business.city, business.state),
      slug: business.urlPath || `/business/${business.slug}`,
      planTier: business.planTier || "free",
      category: business.category,
    }));
  },
});

/**
 * Get best businesses by category for the table section
 */
export const getBestByCategory = query({
  args: {
    limit: v.optional(v.number()),
    cityFilter: v.optional(v.string()),
    categoryFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    let query = ctx.db.query("businesses")
      .filter((q) => q.eq(q.field("active"), true))
      .filter((q) => q.eq(q.field("verified"), true));

    // Apply filters if provided
    if (args.cityFilter) {
      query = query.filter((q) => q.eq(q.field("city"), args.cityFilter.toLowerCase()));
    }
    
    if (args.categoryFilter) {
      // Get category ID first
      const category = await ctx.db
        .query("categories")
        .filter((q) => q.eq(q.field("slug"), args.categoryFilter))
        .first();
      
      if (category) {
        query = query.filter((q) => q.eq(q.field("categoryId"), category._id));
      }
    }

    const businesses = await query.collect();

    // Get category information for each business
    const businessesWithCategories = await Promise.all(
      businesses.map(async (business) => {
        const category = await ctx.db.get(business.categoryId);
        return {
          ...business,
          categoryInfo: category,
        };
      })
    );

    // Sort by performance score
    const scoredBusinesses = businessesWithCategories
      .map((business) => {
        const rating = business.rating || 0;
        const reviewCount = business.reviewCount || 1;
        const tierBonus = getTierBonus(business.planTier || "free");
        const performanceScore = rating * Math.log10(reviewCount + 1) + tierBonus;
        
        return {
          ...business,
          performanceScore,
          performanceBadge: generatePerformanceBadge(business),
        };
      })
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, limit);

    return scoredBusinesses.map((business) => ({
      id: business._id,
      name: business.name,
      category: business.categoryInfo?.name || "Unknown",
      city: formatCityName(business.city),
      rating: business.rating || 0,
      reviewCount: business.reviewCount || 0,
      performanceBadge: business.performanceBadge,
      planTier: business.planTier || "free",
      slug: business.urlPath || `/business/${business.slug}`,
      lastUpdated: business.updatedAt || business._creationTime,
    }));
  },
});

/**
 * Get city champions for specific cities
 */
export const getCityChampions = query({
  args: {
    city: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 4;
    
    const businesses = await ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("active"), true))
      .filter((q) => q.eq(q.field("verified"), true))
      .filter((q) => q.eq(q.field("city"), args.city.toLowerCase()))
      .collect();

    // Get category information
    const businessesWithCategories = await Promise.all(
      businesses.map(async (business) => {
        const category = await ctx.db.get(business.categoryId);
        return {
          ...business,
          categoryInfo: category,
        };
      })
    );

    // Sort by performance and select top performers
    const champions = businessesWithCategories
      .map((business) => {
        const rating = business.rating || 0;
        const reviewCount = business.reviewCount || 1;
        const tierBonus = getTierBonus(business.planTier || "free");
        const performanceScore = rating * Math.log10(reviewCount + 1) + tierBonus;
        
        return {
          ...business,
          performanceScore,
          performanceBadge: generatePerformanceBadge(business),
        };
      })
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, limit);

    return champions.map((business) => ({
      id: business._id,
      name: business.name,
      category: business.categoryInfo?.name || "Unknown",
      rating: business.rating || 0,
      reviewCount: business.reviewCount || 0,
      performanceBadge: business.performanceBadge,
      planTier: business.planTier || "free",
      slug: business.urlPath || `/business/${business.slug}`,
      performanceMetric: generatePerformanceMetric(business),
    }));
  },
});

// Helper functions

function getTierBonus(planTier: string): number {
  const bonuses = {
    "free": 0,
    "starter": 0.02,
    "pro": 0.03,
    "power": 0.05,
  };
  return bonuses[planTier as keyof typeof bonuses] || 0;
}

function generatePerformanceBadge(business: any) {
  const rating = business.rating || 0;
  const reviewCount = business.reviewCount || 0;
  const planTier = business.planTier || "free";

  // Determine badge type based on business characteristics
  if (rating >= 4.8 && reviewCount >= 100) {
    return {
      label: "TOP RATED",
      icon: "🏆",
      color: "blue" as const,
    };
  } else if (reviewCount >= 200) {
    return {
      label: "MOST TRUSTED",
      icon: "⭐",
      color: "green" as const,
    };
  } else if (planTier === "power") {
    return {
      label: "FEATURED",
      icon: "💎",
      color: "purple" as const,
    };
  } else if (rating >= 4.5) {
    return {
      label: "EXCELLENT",
      icon: "✨",
      color: "yellow" as const,
    };
  } else {
    return {
      label: "VERIFIED",
      icon: "✓",
      color: "gray" as const,
    };
  }
}

function generatePerformanceMetric(business: any): string {
  const rating = business.rating || 0;
  const reviewCount = business.reviewCount || 0;
  
  if (rating >= 4.8) {
    return `${rating} star average with exceptional service`;
  } else if (reviewCount >= 200) {
    return `Trusted by ${reviewCount}+ satisfied customers`;
  } else if (rating >= 4.5) {
    return `Consistently rated ${rating} stars by customers`;
  } else {
    return `Verified professional service provider`;
  }
}

function formatLocation(city: string, state?: string): string {
  const formattedCity = formatCityName(city);
  return state ? `${formattedCity}, ${state}` : formattedCity;
}

function formatCityName(city: string): string {
  return city
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}