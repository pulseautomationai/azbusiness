interface MetaTagsProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  schema?: any;
}

export function generateMetaTags({
  title,
  description,
  canonical,
  ogImage = "/logo.png",
  ogType = "website",
  noindex = false,
  schema
}: MetaTagsProps) {
  const siteName = "AZ Business Services";
  const siteUrl = "https://azbusinessservices.com";
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  const canonicalUrl = canonical || siteUrl;

  const metaTags = [
    // Basic Meta Tags
    { title },
    { name: "description", content: description },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    
    // Open Graph Meta Tags
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: ogType },
    { property: "og:url", content: canonicalUrl },
    { property: "og:image", content: fullImageUrl },
    { property: "og:site_name", content: siteName },
    
    // Twitter Card Meta Tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: fullImageUrl },
    
    // Canonical URL
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    
    // Additional SEO Meta Tags
    { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" },
    { name: "author", content: siteName },
    { name: "theme-color", content: "#0284c7" },
    
    // Geo Meta Tags for Local Business
    { name: "geo.region", content: "US-AZ" },
    { name: "geo.placename", content: "Arizona" },
    { name: "geo.position", content: "33.4484;-112.0740" }, // Phoenix, AZ
    { name: "ICBM", content: "33.4484, -112.0740" },
  ];

  // Add structured data schema if provided
  if (schema) {
    metaTags.push({
      tagName: "script",
      type: "application/ld+json",
      children: JSON.stringify(schema)
    });
  }

  return metaTags;
}

// Common schemas for different page types
export const schemas = {
  localBusiness: (business: any) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "description": business.description,
    "url": `https://azbusinessservices.com${business.urlPath}`,
    "telephone": business.phone,
    "email": business.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address,
      "addressLocality": business.city,
      "addressRegion": "AZ",
      "postalCode": business.zip,
      "addressCountry": "US"
    },
    "geo": business.coordinates ? {
      "@type": "GeoCoordinates",
      "latitude": business.coordinates.lat,
      "longitude": business.coordinates.lng
    } : undefined,
    "aggregateRating": business.rating ? {
      "@type": "AggregateRating",
      "ratingValue": business.rating,
      "reviewCount": business.reviewCount
    } : undefined,
    "priceRange": business.priceRange || "$$",
    "openingHours": business.hours ? Object.entries(business.hours).map(([day, hours]) => 
      `${day.charAt(0).toUpperCase() + day.slice(1)} ${hours}`
    ) : undefined
  }),

  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AZ Business Services",
    "url": "https://azbusinessservices.com",
    "logo": "https://azbusinessservices.com/logo.png",
    "description": "Arizona's premier business directory connecting local service providers with customers.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Phoenix",
      "addressRegion": "AZ",
      "addressCountry": "US"
    },
    "sameAs": [
      "https://facebook.com/azbusinessservices",
      "https://twitter.com/azbusinessservices",
      "https://linkedin.com/company/azbusinessservices"
    ]
  },

  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AZ Business Services",
    "url": "https://azbusinessservices.com",
    "description": "Find local Arizona businesses and service providers.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://azbusinessservices.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },

  breadcrumbList: (items: Array<{name: string, url: string}>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://azbusinessservices.com${item.url}`
    }))
  })
};

// Utility function to create SEO-friendly page titles
export function createPageTitle(pageTitle: string, includeSlogan = true): string {
  const siteName = "AZ Business Services";
  const slogan = "Arizona's Premier Business Directory";
  
  if (pageTitle === siteName) {
    return includeSlogan ? `${siteName} - ${slogan}` : siteName;
  }
  
  return `${pageTitle} | ${siteName}`;
}

// Utility function to truncate description to optimal length
export function optimizeDescription(description: string, maxLength = 160): string {
  if (description.length <= maxLength) return description;
  
  // Find the last complete sentence within the limit
  const truncated = description.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastPeriod > maxLength * 0.7) {
    return description.substring(0, lastPeriod + 1);
  } else if (lastSpace > maxLength * 0.8) {
    return description.substring(0, lastSpace) + '...';
  } else {
    return truncated + '...';
  }
}