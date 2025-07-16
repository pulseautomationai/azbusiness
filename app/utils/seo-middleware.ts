import { SEOGenerator, type SEOMetadata } from "~/utils/seo";
import { generateMetaTags } from "~/components/seo/seo-meta";
import { SlugGenerator } from "~/utils/slug-generator";

/**
 * SEO Middleware for automatic meta generation
 * This ensures all new pages get proper SEO, OpenGraph, and social media optimization
 */

export type RouteType = 
  | "homepage"
  | "about"
  | "business"
  | "category"
  | "city"
  | "blog"
  | "pricing"
  | "contact"
  | "generic";

export interface RouteParams {
  category?: string;
  city?: string;
  businessName?: string;
  slug?: string;
  [key: string]: string | undefined;
}

export interface RouteData {
  business?: any;
  category?: any;
  city?: any;
  post?: any;
  [key: string]: any;
}

/**
 * Generate SEO metadata for any route type
 */
export function generateSEOForRoute(
  routeType: RouteType,
  params: RouteParams = {},
  data: RouteData = {}
): SEOMetadata {
  switch (routeType) {
    case "homepage":
      return SEOGenerator.generateHomepageSEO();

    case "business":
      return generateBusinessSEO(params, data);

    case "category":
      return generateCategorySEO(params, data);

    case "city":
      return generateCitySEO(params, data);

    case "blog":
      return generateBlogSEO(params, data);

    case "about":
      return generateAboutSEO();

    case "pricing":
      return generatePricingSEO();

    case "contact":
      return generateContactSEO();

    default:
      return generateGenericSEO(params);
  }
}

/**
 * Generate meta tags for React Router meta function
 */
export function generateMetaForRoute(
  routeType: RouteType,
  params: RouteParams = {},
  data: RouteData = {}
) {
  const seo = generateSEOForRoute(routeType, params, data);
  const { metaTags } = generateMetaTags(seo);
  return metaTags;
}

// Route-specific SEO generators

function generateBusinessSEO(params: RouteParams, data: RouteData): SEOMetadata {
  // If we have actual business data, use it
  if (data.business && data.category) {
    return SEOGenerator.generateBusinessSEO(data.business, data.category);
  }

  // Otherwise, generate from URL params
  const { category, city, businessName } = params;
  
  if (!category || !city || !businessName) {
    return SEOGenerator.generateHomepageSEO();
  }

  const businessNameFormatted = SlugGenerator.generateBusinessNameFromSlug(businessName);
  const cityFormatted = SlugGenerator.generateCityFromSlug(city);
  const categoryFormatted = SlugGenerator.generateCategoryFromSlug(category);

  const mockBusiness = {
    _id: "mock" as any,
    _creationTime: Date.now(),
    name: businessNameFormatted,
    slug: businessName,
    city: cityFormatted,
    state: "Arizona",
    zip: "85001",
    address: `${cityFormatted}, AZ`,
    phone: "",
    email: "",
    website: "",
    description: `Professional ${categoryFormatted} services in ${cityFormatted}, Arizona. Quality service provider with verified credentials.`,
    shortDescription: `Professional ${categoryFormatted} services in ${cityFormatted}, AZ`,
    services: [categoryFormatted],
    planTier: "free" as const,
    featured: false,
    priority: 0,
    claimed: false,
    verified: false,
    active: true,
    categoryId: "mock" as any,
    hours: {},
    rating: 0,
    reviewCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockCategory = {
    _id: "mock" as any,
    _creationTime: Date.now(),
    name: categoryFormatted,
    slug: category,
    description: `${categoryFormatted} services in Arizona`,
    icon: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return SEOGenerator.generateBusinessSEO(mockBusiness, mockCategory);
}

function generateCategorySEO(params: RouteParams, data: RouteData): SEOMetadata {
  // If we have actual category data, use it
  if (data.category) {
    return SEOGenerator.generateCategorySEO(data.category, data.city?.name);
  }

  // Otherwise, generate from URL params
  const { category, city } = params;
  
  if (!category) {
    return SEOGenerator.generateHomepageSEO();
  }

  const categoryFormatted = SlugGenerator.generateCategoryFromSlug(category);
  const cityFormatted = city ? SlugGenerator.generateCityFromSlug(city) : undefined;

  const mockCategory = {
    _id: "mock" as any,
    _creationTime: Date.now(),
    name: categoryFormatted,
    slug: category,
    description: `Professional ${categoryFormatted.toLowerCase()} services throughout Arizona`,
    icon: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return SEOGenerator.generateCategorySEO(mockCategory, cityFormatted);
}

function generateCitySEO(params: RouteParams, data: RouteData): SEOMetadata {
  // If we have actual city data, use it
  if (data.city) {
    return SEOGenerator.generateCitySEO(data.city);
  }

  // Otherwise, generate from URL params
  const { city } = params;
  
  if (!city) {
    return SEOGenerator.generateHomepageSEO();
  }

  const cityFormatted = SlugGenerator.generateCityFromSlug(city);

  const mockCity = {
    _id: "mock" as any,
    _creationTime: Date.now(),
    name: cityFormatted,
    slug: city,
    state: "Arizona",
    description: `Professional services and local businesses in ${cityFormatted}, Arizona`,
    businessCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return SEOGenerator.generateCitySEO(mockCity);
}

function generateBlogSEO(params: RouteParams, data: RouteData): SEOMetadata {
  // If we have actual post data, use it
  if (data.post) {
    return SEOGenerator.generateBlogSEO(data.post);
  }

  // Otherwise, generate generic blog SEO
  const { slug } = params;
  const title = slug ? SlugGenerator.formatSlugToName(slug) : "Blog Post";
  
  const mockPost = {
    title,
    slug: slug || "blog-post",
    excerpt: `Read our latest insights about ${title.toLowerCase()} and how it relates to Arizona businesses.`,
    content: `Discover valuable information about ${title.toLowerCase()} for Arizona business owners and service providers.`,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["Arizona", "business", "services"],
    image: "/logo.png",
  };

  return SEOGenerator.generateBlogSEO(mockPost);
}

function generateAboutSEO(): SEOMetadata {
  return {
    title: "Why Choose Us - AZ Business Services",
    description: "Meet John Schulenburg, founder of AZ Business Services. Learn why he built this platform to help Arizona businesses grow and connect with local customers.",
    keywords: "AZ Business Services, Arizona business directory, John Schulenburg, local businesses, about us, founder",
    canonical: "https://azbusiness.services/about",
    openGraph: {
      title: "Why Choose Us - AZ Business Services",
      description: "Meet John Schulenburg, founder of AZ Business Services. Learn why he built this platform to help Arizona businesses grow and connect with local customers.",
      type: "website",
      url: "https://azbusiness.services/about",
      image: "/logo.png",
      siteName: "AZ Business Services",
    },
    twitter: {
      card: "summary",
      title: "Why Choose Us - AZ Business Services",
      description: "Meet John Schulenburg, founder of AZ Business Services. Learn why he built this platform to help Arizona businesses grow and connect with local customers.",
      image: "/logo.png",
      site: "@azbusiness",
    },
  };
}

function generatePricingSEO(): SEOMetadata {
  return {
    title: "Pricing Plans - AZ Business Services",
    description: "Choose the perfect plan for your Arizona business. From Starter ($9/month) to Power ($97/month) with exclusive leads and AI-enhanced listings.",
    keywords: "Arizona business pricing, directory plans, business listings, local SEO, starter plan, power plan, exclusive leads",
    canonical: "https://azbusiness.services/pricing",
    openGraph: {
      title: "Pricing Plans - AZ Business Services",
      description: "Choose the perfect plan for your Arizona business. From Starter ($9/month) to Power ($97/month) with exclusive leads and AI-enhanced listings.",
      type: "website",
      url: "https://azbusiness.services/pricing",
      image: "/logo.png",
      siteName: "AZ Business Services",
    },
    twitter: {
      card: "summary",
      title: "Pricing Plans - AZ Business Services",
      description: "Choose the perfect plan for your Arizona business. From Starter ($9/month) to Power ($97/month) with exclusive leads and AI-enhanced listings.",
      image: "/logo.png",
      site: "@azbusiness",
    },
  };
}

function generateContactSEO(): SEOMetadata {
  return {
    title: "Contact Us - AZ Business Services",
    description: "Get in touch with AZ Business Services. Questions about our Arizona business directory? Need help with your listing? We're here to help.",
    keywords: "contact AZ Business Services, Arizona business directory support, help, customer service",
    canonical: "https://azbusiness.services/contact",
    openGraph: {
      title: "Contact Us - AZ Business Services",
      description: "Get in touch with AZ Business Services. Questions about our Arizona business directory? Need help with your listing? We're here to help.",
      type: "website",
      url: "https://azbusiness.services/contact",
      image: "/logo.png",
      siteName: "AZ Business Services",
    },
    twitter: {
      card: "summary",
      title: "Contact Us - AZ Business Services",
      description: "Get in touch with AZ Business Services. Questions about our Arizona business directory? Need help with your listing? We're here to help.",
      image: "/logo.png",
      site: "@azbusiness",
    },
  };
}

function generateGenericSEO(params: RouteParams): SEOMetadata {
  const title = "AZ Business Services - Arizona Business Directory";
  const description = "Discover local businesses in Arizona. Find professional services, read reviews, and connect with trusted providers in your area.";
  
  return {
    title,
    description,
    keywords: "Arizona business directory, local services, professional providers, business listings",
    canonical: "https://azbusiness.services",
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://azbusiness.services",
      image: "/logo.png",
      siteName: "AZ Business Services",
    },
    twitter: {
      card: "summary",
      title,
      description,
      image: "/logo.png",
      site: "@azbusiness",
    },
  };
}

/**
 * Template for new route meta functions
 * Use this pattern for all new pages to ensure consistent SEO
 */
export function createMetaFunction(routeType: RouteType) {
  return function meta({ params, data }: { params: RouteParams; data?: RouteData }) {
    return generateMetaForRoute(routeType, params, data);
  };
}

/**
 * SEO validation for development
 * Ensures all required fields are present
 */
export function validateSEO(seo: SEOMetadata): string[] {
  const errors: string[] = [];

  if (!seo.title) errors.push("Title is required");
  if (!seo.description) errors.push("Description is required");
  if (!seo.openGraph.title) errors.push("OpenGraph title is required");
  if (!seo.openGraph.description) errors.push("OpenGraph description is required");
  if (!seo.openGraph.url) errors.push("OpenGraph URL is required");
  if (!seo.openGraph.image) errors.push("OpenGraph image is required");
  if (!seo.twitter.title) errors.push("Twitter title is required");
  if (!seo.twitter.description) errors.push("Twitter description is required");

  if (seo.title.length > 60) errors.push("Title is too long (max 60 characters)");
  if (seo.description.length > 160) errors.push("Description is too long (max 160 characters)");

  return errors;
}