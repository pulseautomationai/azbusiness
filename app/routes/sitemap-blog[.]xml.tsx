import type { Route } from "./+types/sitemap-blog[.]xml";

export async function loader(args: Route.LoaderArgs) {
  try {
    // TODO: Fetch all published blog posts
    // const blogPosts = await fetchQuery(api.sitemaps.getAllPublishedPosts);
    const blogPosts: any[] = [];

    const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogPosts
  .map((post) => {
    const lastmod = new Date(post.updatedAt || post.publishedAt || post.createdAt).toISOString();
    
    return `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Error generating blog sitemap:", error);
    return new Response("Error generating blog sitemap", { status: 500 });
  }
}