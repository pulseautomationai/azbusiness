import { v } from "convex/values";
import { query } from "./_generated/server";

// Get all active cities
export const getCities = query({
  handler: async (ctx) => {
    const cities = await ctx.db
      .query("cities")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    
    // Sort by order
    cities.sort((a, b) => a.order - b.order);
    
    return cities;
  },
});

// Get cities grouped by region
export const getCitiesByRegion = query({
  handler: async (ctx) => {
    const cities = await ctx.db
      .query("cities")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    
    // Group by region
    const regions = cities.reduce((acc, city) => {
      if (!acc[city.region]) {
        acc[city.region] = [];
      }
      acc[city.region].push(city);
      return acc;
    }, {} as Record<string, typeof cities>);
    
    // Sort cities within each region
    Object.values(regions).forEach(regionCities => {
      regionCities.sort((a, b) => a.order - b.order);
    });
    
    return regions;
  },
});

// Get city by slug
export const getCityBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cities")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("active"), true))
      .first();
  },
});

// Alias for getCityBySlug for consistency
export const getBySlug = getCityBySlug;

// Get cities with business count
export const getCitiesWithCount = query({
  args: { region: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let cities;
    
    if (args.region) {
      cities = await ctx.db
        .query("cities")
        .withIndex("by_region", (q) => q.eq("region", args.region!))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();
    } else {
      cities = await ctx.db
        .query("cities")
        .withIndex("by_active", (q) => q.eq("active", true))
        .collect();
    }
    
    // Get all active businesses once (not for each city)
    const allBusinesses = await ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    
    // Create a map of city counts
    const cityCountMap = new Map<string, number>();
    
    // Count businesses by city (case-insensitive)
    allBusinesses.forEach(business => {
      const cityLower = business.city.toLowerCase().trim();
      cityCountMap.set(cityLower, (cityCountMap.get(cityLower) || 0) + 1);
    });
    
    // Add counts to cities
    const citiesWithCount = cities.map(city => {
      const cityNameLower = city.name.toLowerCase().trim();
      return {
        ...city,
        businessCount: cityCountMap.get(cityNameLower) || 0,
      };
    });
    
    // Sort by order
    citiesWithCount.sort((a, b) => a.order - b.order);
    
    return citiesWithCount;
  },
});

// Get all cities for admin interfaces (like bulk sync)
export const getAllCities = query({
  handler: async (ctx) => {
    const cities = await ctx.db
      .query("cities")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    
    // Get all active businesses once (not for each city)
    const allBusinesses = await ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    
    // Create a map of city counts
    const cityCountMap = new Map<string, number>();
    
    // Count businesses by city (case-insensitive)
    allBusinesses.forEach(business => {
      const cityLower = business.city.toLowerCase().trim();
      cityCountMap.set(cityLower, (cityCountMap.get(cityLower) || 0) + 1);
    });
    
    // Add counts to cities
    const citiesWithCount = cities.map(city => {
      const cityNameLower = city.name.toLowerCase().trim();
      return {
        ...city,
        businessCount: cityCountMap.get(cityNameLower) || 0,
      };
    });
    
    // Sort by order
    citiesWithCount.sort((a, b) => a.order - b.order);
    
    return citiesWithCount;
  },
});