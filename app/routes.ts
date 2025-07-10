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
  
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route("dashboard/chat", "routes/dashboard/chat.tsx"),
    route("dashboard/settings", "routes/dashboard/settings.tsx"),
  ]),
] satisfies RouteConfig;
