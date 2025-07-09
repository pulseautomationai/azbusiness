import type { Route } from "./+types/robots.txt";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and internal paths
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/
Disallow: /.netlify/
Disallow: /sign-in/
Disallow: /sign-up/
Disallow: /subscription-required
Disallow: /success

# Allow specific important paths
Allow: /category/
Allow: /city/
Allow: /business/
Allow: /blog/
Allow: /pricing
Allow: /about
Allow: /contact
Allow: /add-business

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Specific rules for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 1

# Block AI training bots while allowing search indexing
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

# Block common bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    },
  });
}