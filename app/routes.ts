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
  route("category/:category", "routes/category/$category.tsx"),
  route("cities", "routes/cities.tsx"),
  route("city/:city", "routes/city/$city.tsx"),
  route("business/:slug", "routes/business/$slug.tsx"),
  route("add-business", "routes/add-business.tsx"),
  route("blog", "routes/blog.tsx"),
  route("blog/:slug", "routes/blog/$slug.tsx"),
  route("contact", "routes/contact.tsx"),
  route("about", "routes/about.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("terms", "routes/terms.tsx"),
  
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route("dashboard/chat", "routes/dashboard/chat.tsx"),
    route("dashboard/settings", "routes/dashboard/settings.tsx"),
  ]),
] satisfies RouteConfig;
