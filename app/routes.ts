import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("for-businesses", "routes/for-businesses.tsx"),
  route("how-rankings-work", "routes/how-rankings-work.tsx"),
  route("sign-in/*", "routes/sign-in.tsx"),
  route("sign-up/*", "routes/sign-up.tsx"),
  route("pricing", "routes/pricing.tsx"),
  route("success", "routes/success.tsx"),
  route("subscription-required", "routes/subscription-required.tsx"),
  
  // Business directory routes
  route("categories", "routes/categories.tsx"),
  route("cities", "routes/cities.tsx"),
  route("rankings", "routes/rankings.tsx"),
  
  // New URL structure: /[category]/[city]/[businessName]
  route(":category/:city/:businessName", "routes/[$category].[$city].[$businessName].tsx"),
  
  // Category/City combination pages: /[category]/[city]
  route(":category/:city", "routes/[$category].[$city].tsx"),
  
  // Single slug handler for both cities and categories
  route(":slug", "routes/$slug.tsx"),
  
  // Keep old business route temporarily for migration
  route("business/:slug", "routes/business/$slug.tsx"),
  route("demo/business", "routes/demo.business.tsx"),
  route("add-business", "routes/add-business.tsx"),
  route("add-business/create", "routes/add-business.create.tsx"),
  route("search", "routes/search.tsx"),
  route("claim-business", "routes/claim-business.tsx"),
  route("claim-listing", "routes/claim-listing.tsx"),
  route("blog", "routes/blog.tsx"),
  route("blog/:slug", "routes/blog/$slug.tsx"),
  route("contact", "routes/contact.tsx"),
  route("about", "routes/about.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("privacy-policy", "routes/privacy-policy.tsx"),
  route("terms", "routes/terms.tsx"),
  route("terms-of-service", "routes/terms-of-service.tsx"),
  
  
  // SEO routes (handled by static files in public/ directory)
  route("test", "routes/test.ts"),
  
  // Customer Dashboard
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route("dashboard/claims", "routes/dashboard/claims.tsx"),
    route("dashboard/achievements", "routes/dashboard/achievements.tsx"),
    route("dashboard/documents", "routes/dashboard/documents.tsx"),
    route("dashboard/media", "routes/dashboard/media.tsx"),
    route("dashboard/billing", "routes/dashboard/billing.tsx"),
    route("dashboard/settings", "routes/dashboard/settings.tsx"),
  ]),
  
  // Admin Dashboard
  layout("routes/admin/layout.tsx", [
    route("admin", "routes/admin/index.tsx"),
    route("admin/analytics", "routes/admin/analytics.tsx"),
    route("admin/moderation", "routes/admin/moderation.tsx"),
    route("admin/customers", "routes/admin/customers.tsx"),
    route("admin/businesses", "routes/admin/businesses-optimized.tsx"),
    route("admin/businesses/create", "routes/admin/businesses/create.tsx"),
    route("admin/businesses/edit/:businessId", "routes/admin/businesses/edit.$businessId.tsx"),
    route("admin/imports", "routes/admin/imports.tsx"),
    route("admin/review-sync", "routes/admin/review-sync.tsx"),
    route("admin/categories", "routes/admin/categories.tsx"),
    route("admin/ai-ranking-tests", "routes/admin/ai-ranking-tests.tsx"),
    route("admin/settings", "routes/admin/settings.tsx"),
  ]),
] satisfies RouteConfig;
