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
    
    // Get business count for each city
    const citiesWithCount = await Promise.all(
      cities.map(async (city) => {
        // Get all active businesses and filter by city with case-insensitive matching
        const allBusinesses = await ctx.db
          .query("businesses")
          .filter((q) => q.eq(q.field("active"), true))
          .collect();
        
        // Filter businesses by city name (case-insensitive)
        const cityNameLower = city.name.toLowerCase().trim();
        const businesses = allBusinesses.filter(b => 
          b.city.toLowerCase().trim() === cityNameLower
        );
        
        return {
          ...city,
          businessCount: businesses.length,
        };
      })
    );
    
    // Sort by order
    citiesWithCount.sort((a, b) => a.order - b.order);
    
    return citiesWithCount;
  },
});