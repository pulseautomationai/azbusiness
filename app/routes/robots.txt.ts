import type { Route } from "./+types/robots.txt";

export function loader({}: Route.LoaderArgs) {
  const robotsTxt = `User-agent: *
Allow: /

# High-priority pages
Allow: /hvac-services/
Allow: /plumbing/
Allow: /electrical/
Allow: /categories/
Allow: /cities/

# Sitemap location
Sitemap: https://azbusiness.services/sitemap.xml

# Block admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /claim-business/onboarding
Disallow: /dashboard/
Disallow: /_/

# Allow important marketing pages
Allow: /for-businesses
Allow: /pricing
Allow: /about
Allow: /contact`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400" // 24 hours
    }
  });
}