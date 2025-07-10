import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Track when the sitemap needs to be regenerated
export const invalidateSitemapCache = mutation({
  args: {
    reason: v.string(),
  },
  handler: async (ctx, { reason }) => {
    const now = Date.now();
    
    // Store the invalidation record
    await ctx.db.insert("sitemapCache", {
      lastInvalidated: now,
      reason,
      status: "pending",
    });

    console.log(`Sitemap cache invalidated: ${reason} at ${new Date(now).toISOString()}`);
  },
});

// Get the last sitemap cache invalidation
export const getSitemapCacheStatus = query({
  handler: async (ctx) => {
    const lastInvalidation = await ctx.db
      .query("sitemapCache")
      .order("desc")
      .first();

    return {
      lastInvalidated: lastInvalidation?.lastInvalidated || 0,
      reason: lastInvalidation?.reason || "initial",
      status: lastInvalidation?.status || "valid",
    };
  },
});

// Mark sitemap as regenerated
export const markSitemapRegenerated = mutation({
  handler: async (ctx) => {
    const latest = await ctx.db
      .query("sitemapCache")
      .order("desc")
      .first();

    if (latest) {
      await ctx.db.patch(latest._id, {
        status: "completed",
      });
    }
  },
});

// Get all data needed for sitemap generation
export const getSitemapData = query({
  handler: async (ctx) => {
    const [businesses, categories, cities] = await Promise.all([
      ctx.db.query("businesses").collect(),
      ctx.db.query("categories").collect(),
      ctx.db.query("cities").collect(),
    ]);

    return {
      businesses: businesses.map(business => ({
        _id: business._id,
        slug: business.slug,
        name: business.name,
        city: business.city,
        categoryId: business.categoryId,
        planTier: business.planTier,
        logo: business.logo,
        heroImage: business.heroImage,
        updatedAt: business.updatedAt,
        createdAt: business.createdAt,
      })),
      categories: categories.map(category => ({
        _id: category._id,
        name: category.name,
        slug: category.slug,
      })),
      cities: cities.map(city => ({
        _id: city._id,
        name: city.name,
        slug: city.slug,
      })),
    };
  },
});

// Trigger sitemap regeneration when businesses are added/updated
export const onBusinessChange = mutation({
  args: {
    businessId: v.id("businesses"),
    action: v.union(v.literal("created"), v.literal("updated"), v.literal("deleted")),
  },
  handler: async (ctx, { businessId, action }) => {
    // Invalidate sitemap cache
    await ctx.db.insert("sitemapCache", {
      lastInvalidated: Date.now(),
      reason: `Business ${action}: ${businessId}`,
      status: "pending",
    });

    // You can add webhook calls here to trigger sitemap regeneration
    // For example, calling a webhook to your deployment service
    console.log(`Sitemap invalidated due to business ${action}: ${businessId}`);
  },
});

// Generate structured data for a business
export const getBusinessStructuredData = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, { businessId }) => {
    const business = await ctx.db.get(businessId);
    if (!business) return null;

    const category = business.categoryId 
      ? await ctx.db.get(business.categoryId)
      : null;

    return {
      business,
      category,
    };
  },
});

// Get SEO metadata for a business
export const getBusinessSEOData = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, { businessId }) => {
    const business = await ctx.db.get(businessId);
    if (!business) return null;

    const category = business.categoryId 
      ? await ctx.db.get(business.categoryId)
      : null;

    // Get related businesses for "related" schema
    const relatedBusinesses = await ctx.db
      .query("businesses")
      .filter(q => 
        q.and(
          q.eq(q.field("city"), business.city),
          q.neq(q.field("_id"), businessId)
        )
      )
      .take(3);

    // Get reviews for aggregate rating
    const reviews = await ctx.db
      .query("reviews")
      .filter(q => q.eq(q.field("businessId"), businessId))
      .collect();

    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return {
      business,
      category,
      relatedBusinesses,
      reviews: {
        count: reviews.length,
        averageRating: avgRating,
      },
    };
  },
});