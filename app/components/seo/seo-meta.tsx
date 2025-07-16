import type { SEOMetadata } from "~/utils/seo";

interface SEOMetaProps {
  seo: SEOMetadata;
}

export function SEOMeta({ seo }: SEOMetaProps) {
  return (
    <>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      
      {/* Canonical URL */}
      {seo.canonical && (
        <link rel="canonical" href={seo.canonical} />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={seo.openGraph.type} />
      <meta property="og:title" content={seo.openGraph.title} />
      <meta property="og:description" content={seo.openGraph.description} />
      <meta property="og:url" content={seo.openGraph.url} />
      <meta property="og:site_name" content={seo.openGraph.siteName} />
      {seo.openGraph.image && (
        <>
          <meta property="og:image" content={seo.openGraph.image} />
          <meta property="og:image:alt" content={seo.openGraph.title} />
          <meta property="og:image:type" content="image/png" />
          {seo.openGraph.imageWidth && (
            <meta property="og:image:width" content={seo.openGraph.imageWidth.toString()} />
          )}
          {seo.openGraph.imageHeight && (
            <meta property="og:image:height" content={seo.openGraph.imageHeight.toString()} />
          )}
          <meta property="og:image:secure_url" content={seo.openGraph.image} />
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={seo.twitter.card} />
      <meta name="twitter:title" content={seo.twitter.title} />
      <meta name="twitter:description" content={seo.twitter.description} />
      {seo.twitter.site && (
        <meta name="twitter:site" content={seo.twitter.site} />
      )}
      {seo.twitter.image && (
        <meta name="twitter:image" content={seo.twitter.image} />
      )}
      
      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Local Business Specific */}
      {seo.openGraph.type === "business.business" && (
        <>
          <meta name="geo.region" content="US-AZ" />
          <meta name="geo.placename" content="Arizona" />
          <meta name="ICBM" content="33.4484, -112.0740" />
        </>
      )}
      
      {/* JSON-LD Structured Data */}
      {seo.jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seo.jsonLd),
          }}
        />
      )}
    </>
  );
}

export function generateMetaTags(seo: SEOMetadata) {
  const metaTags = [
    { title: seo.title },
    { name: "description", content: seo.description },
    { name: "keywords", content: seo.keywords },
    { name: "robots", content: "index, follow" },
    { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
    { name: "bingbot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
    
    // Open Graph
    { property: "og:type", content: seo.openGraph.type },
    { property: "og:title", content: seo.openGraph.title },
    { property: "og:description", content: seo.openGraph.description },
    { property: "og:url", content: seo.openGraph.url },
    { property: "og:site_name", content: seo.openGraph.siteName },
    
    // Twitter Card
    { name: "twitter:card", content: seo.twitter.card },
    { name: "twitter:title", content: seo.twitter.title },
    { name: "twitter:description", content: seo.twitter.description },
  ];

  // Add image meta tags if available
  if (seo.openGraph.image) {
    metaTags.push(
      { property: "og:image", content: seo.openGraph.image },
      { property: "og:image:alt", content: seo.openGraph.title },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:secure_url", content: seo.openGraph.image }
    );
    
    if (seo.openGraph.imageWidth) {
      metaTags.push({ property: "og:image:width", content: seo.openGraph.imageWidth.toString() });
    }
    
    if (seo.openGraph.imageHeight) {
      metaTags.push({ property: "og:image:height", content: seo.openGraph.imageHeight.toString() });
    }
  }

  if (seo.twitter.image) {
    metaTags.push({ name: "twitter:image", content: seo.twitter.image });
  }

  if (seo.twitter.site) {
    metaTags.push({ name: "twitter:site", content: seo.twitter.site });
  }

  // Add canonical link
  const links = [];
  if (seo.canonical) {
    links.push({ rel: "canonical", href: seo.canonical });
  }

  return { metaTags, links };
}