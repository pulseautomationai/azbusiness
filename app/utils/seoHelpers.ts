// SEO helper utilities for generating meta tags and canonical URLs

interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string[];
  robots?: string;
  jsonLd?: any;
}

interface Business {
  name: string;
  city: string;
  state: string;
  category?: { name: string; slug: string };
  rating: number;
  reviewCount: number;
  description: string;
  shortDescription?: string;
}

export function generateBusinessSEO(business: Business, businessContent?: any): SEOData {
  const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
  
  // Generate business URL
  const categorySlug = business.category?.slug || 'services';
  const citySlug = business.city.toLowerCase().replace(/\s+/g, '-');
  const businessSlug = business.name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  const canonical = `${baseUrl}/${categorySlug}/${citySlug}/${businessSlug}`;
  
  // Generate title (60 characters max)
  const title = `${business.name} - ${business.category?.name || 'Services'} in ${business.city}, AZ | AZ Business Services`;
  
  // Generate description (160 characters max)
  const customDescription = businessContent?.customSummary || business.shortDescription || business.description;
  const ratingText = business.reviewCount > 0 ? ` Rated ${business.rating.toFixed(1)}/5 from ${business.reviewCount} reviews.` : '';
  const description = `${customDescription.substring(0, 120)}${ratingText} Contact ${business.name} in ${business.city}, Arizona.`.substring(0, 160);
  
  // Generate keywords
  const keywords = [
    business.name,
    business.category?.name || 'services',
    `${business.category?.name || 'services'} ${business.city}`,
    `${business.category?.name || 'services'} Arizona`,
    business.city,
    'Arizona',
    'local business',
    'professional services'
  ];
  
  return {
    title,
    description,
    canonical,
    keywords,
    ogImage: businessContent?.heroImageUrl || `${baseUrl}/og-business-default.jpg`,
    ogType: 'website'
  };
}

export function generateCategorySEO(category: { name: string; slug: string; description: string }, city?: { name: string; slug: string }): SEOData {
  const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
  
  const location = city ? `${city.name}, Arizona` : 'Arizona';
  const canonical = city 
    ? `${baseUrl}/${category.slug}/${city.slug}`
    : `${baseUrl}/${category.slug}`;
  
  const title = `${category.name} in ${location} | Top Rated Local Providers | AZ Business Services`;
  const description = `Find trusted ${category.name.toLowerCase()} providers in ${location}. Compare ratings, read reviews, and get quotes from verified local businesses.`;
  
  const keywords = [
    category.name,
    `${category.name} ${location}`,
    `${category.name} Arizona`,
    city?.name || 'Arizona',
    'local services',
    'trusted providers',
    'professional services'
  ];
  
  return {
    title,
    description,
    canonical,
    keywords,
    ogImage: `${baseUrl}/og-category-${category.slug}.jpg`,
    ogType: 'website'
  };
}

export function generateCitySEO(city: { name: string; slug: string; description?: string }): SEOData {
  const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
  
  const canonical = `${baseUrl}/city/${city.slug}`;
  const title = `Local Businesses in ${city.name}, Arizona | AZ Business Services Directory`;
  const description = city.description || 
    `Discover top-rated local businesses and services in ${city.name}, Arizona. Find trusted providers for home services, professional services, and more.`;
  
  const keywords = [
    city.name,
    `${city.name} Arizona`,
    `${city.name} businesses`,
    `${city.name} services`,
    'local directory',
    'Arizona businesses'
  ];
  
  return {
    title,
    description,
    canonical,
    keywords,
    ogImage: `${baseUrl}/og-city-${city.slug}.jpg`,
    ogType: 'website'
  };
}

export function generateHomepageSEO(): SEOData {
  const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
  
  return {
    title: "AZ Business Services - Find Trusted Local Service Providers in Arizona",
    description: "Arizona's premier business directory. Find verified local service providers, read reviews, compare ratings, and get quotes from trusted businesses across Arizona.",
    canonical: baseUrl,
    keywords: [
      'Arizona businesses',
      'local services',
      'home services Arizona',
      'professional services',
      'business directory',
      'Arizona contractors',
      'Phoenix services',
      'Scottsdale businesses',
      'Mesa services',
      'Tucson providers'
    ],
    ogImage: `${baseUrl}/og-homepage.jpg`,
    ogType: 'website'
  };
}

export function generateBlogSEO(post: { title: string; slug: string; excerpt: string; publishedAt?: number }): SEOData {
  const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
  
  const canonical = `${baseUrl}/blog/${post.slug}`;
  const title = `${post.title} | AZ Business Services Blog`;
  const description = post.excerpt.substring(0, 160);
  
  return {
    title,
    description,
    canonical,
    ogImage: `${baseUrl}/og-blog-${post.slug}.jpg`,
    ogType: 'article'
  };
}

export function generateSearchSEO(query: string, results: number): SEOData {
  const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
  
  const canonical = `${baseUrl}/search?q=${encodeURIComponent(query)}`;
  const title = `"${query}" Search Results | AZ Business Services`;
  const description = `Found ${results} local businesses for "${query}" in Arizona. Compare ratings, read reviews, and contact verified service providers.`;
  
  return {
    title,
    description,
    canonical,
    robots: 'noindex, follow', // Don't index search results
    ogType: 'website'
  };
}

// Utility to generate robots meta tag
export function generateRobotsMeta(
  index: boolean = true, 
  follow: boolean = true, 
  additionalDirectives: string[] = []
): string {
  const directives = [
    index ? 'index' : 'noindex',
    follow ? 'follow' : 'nofollow',
    ...additionalDirectives
  ];
  
  return directives.join(', ');
}

// Utility to generate canonical URL
export function generateCanonicalUrl(path: string): string {
  const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

// Utility to truncate text for meta descriptions
export function truncateText(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > maxLength * 0.8 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

// Utility to clean and format keywords
export function formatKeywords(keywords: string[]): string {
  return keywords
    .filter(Boolean)
    .map(keyword => keyword.toLowerCase().trim())
    .filter((keyword, index, arr) => arr.indexOf(keyword) === index) // Remove duplicates
    .join(', ');
}

// Utility to generate hreflang tags for multi-language support (future)
export function generateHrefLangTags(currentUrl: string, languages: string[] = ['en']): Array<{ hreflang: string; href: string }> {
  return languages.map(lang => ({
    hreflang: lang,
    href: currentUrl // For now, all point to the same URL
  }));
}

// Utility to validate and clean URLs
export function cleanUrl(url: string): string {
  return url
    .toLowerCase()
    .replace(/[^a-z0-9\/\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}