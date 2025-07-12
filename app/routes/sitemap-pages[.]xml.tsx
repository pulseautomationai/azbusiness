import type { Route } from "./+types/sitemap-pages[.]xml";

export async function loader(args: Route.LoaderArgs) {
  const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
  const currentDate = new Date().toISOString();

  const pages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/categories", priority: "0.9", changefreq: "weekly" },
    { url: "/cities", priority: "0.9", changefreq: "weekly" },
    { url: "/pricing", priority: "0.8", changefreq: "monthly" },
    { url: "/blog", priority: "0.7", changefreq: "weekly" },
    { url: "/about", priority: "0.6", changefreq: "monthly" },
    { url: "/contact", priority: "0.6", changefreq: "monthly" },
    { url: "/privacy", priority: "0.3", changefreq: "yearly" },
    { url: "/terms", priority: "0.3", changefreq: "yearly" },
    { url: "/add-business", priority: "0.8", changefreq: "monthly" },
    { url: "/claim-business", priority: "0.8", changefreq: "monthly" },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    },
  });
}