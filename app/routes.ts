import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("sign-in/*", "routes/sign-in.tsx"),
  route("sign-up/*", "routes/sign-up.tsx"),
  route("pricing", "routes/pricing.tsx"),
  route("success", "routes/success.tsx"),
  route("subscription-required", "routes/subscription-required.tsx"),
  
  // Business directory routes
  route("categories", "routes/categories.tsx"),
  route("cities", "routes/cities.tsx"),
  route("city/:city", "routes/city/$city.tsx"),
  
  // New URL structure: /[category]/[city]/[businessName]
  route(":category/:city/:businessName", "routes/[$category].[$city].[$businessName].tsx"),
  
  // Category routes at root level (must come after more specific routes)
  route(":category", "routes/$category.tsx"),
  
  // Keep old business route temporarily for migration
  route("business/:slug", "routes/business/$slug.tsx"),
  route("demo/business", "routes/demo.business.tsx"),
  route("add-business", "routes/add-business.tsx"),
  route("add-business/create", "routes/add-business.create.tsx"),
  route("claim-business", "routes/claim-business.tsx"),
  route("claim-listing", "routes/claim-listing.tsx"),
  route("blog", "routes/blog.tsx"),
  route("blog/:slug", "routes/blog/$slug.tsx"),
  route("contact", "routes/contact.tsx"),
  route("about", "routes/about.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("terms", "routes/terms.tsx"),
  
  // SEO routes
  route("sitemap.xml", "routes/sitemap.xml.ts"),
  route("robots.txt", "routes/robots.txt.ts"),
  route("test", "routes/test.ts"),
  
  // Customer Dashboard
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route("dashboard/claims", "routes/dashboard/claims.tsx"),
    route("dashboard/documents", "routes/dashboard/documents.tsx"),
    route("dashboard/media", "routes/dashboard/media.tsx"),
    route("dashboard/billing", "routes/dashboard/billing.tsx"),
    route("dashboard/settings", "routes/dashboard/settings.tsx"),
  ]),
  
  // Admin Dashboard
  layout("routes/admin/layout.tsx", [
    route("admin", "routes/admin/index.tsx"),
    route("admin/moderation", "routes/admin/moderation.tsx"),
    route("admin/customers", "routes/admin/customers.tsx"),
    route("admin/businesses", "routes/admin/businesses.tsx"),
    route("admin/businesses/edit/:businessId", "routes/admin/businesses/edit.$businessId.tsx"),
    route("admin/categories", "routes/admin/categories.tsx"),
  ]),
] satisfies RouteConfig;
