import type { Doc } from "../../convex/_generated/dataModel";

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  canonical?: string;
  openGraph: {
    title: string;
    description: string;
    type: "website" | "article" | "business.business";
    url: string;
    image?: string;
    siteName: string;
  };
  twitter: {
    card: "summary" | "summary_large_image";
    title: string;
    description: string;
    image?: string;
    site?: string;
  };
  jsonLd?: any;
}

export class SEOGenerator {
  private static readonly SITE_NAME = "AZ Business Services";
  private static readonly SITE_URL = "https://azbusiness.services";
  private static readonly DEFAULT_IMAGE = "/logo.png";
  private static readonly TWITTER_HANDLE = "@azbusiness";

  static generateHomepageSEO(): SEOMetadata {
    const title = "AZ Business Services - Find Trusted Local Service Providers in Arizona";
    const description = "Connect with verified HVAC, plumbing, electrical, and other home service professionals across Arizona. Get quotes, read reviews, and hire the best local contractors.";
    const keywords = "Arizona business directory, local services, HVAC, plumbing, electrical, contractors, home services, Phoenix, Tucson, Mesa, Scottsdale";

    return {
      title,
      description,
      keywords,
      canonical: this.SITE_URL,
      openGraph: {
        title,
        description,
        type: "website",
        url: this.SITE_URL,
        image: this.DEFAULT_IMAGE,
        siteName: this.SITE_NAME,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        image: this.DEFAULT_IMAGE,
        site: this.TWITTER_HANDLE,
      },
      jsonLd: this.generateWebsiteSchema(),
    };
  }

  static generateBusinessSEO(business: Doc<"businesses">, category?: Doc<"categories">): SEOMetadata {
    const title = `${business.name} - ${category?.name || "Service Provider"} in ${business.city}, Arizona`;
    const description = `${business.shortDescription || business.description || `Professional ${category?.name || "services"} in ${business.city}, AZ.`} Contact ${business.name} for quality service. ${business.rating ? `Rated ${business.rating}/5 stars` : ""}${business.reviewCount ? ` from ${business.reviewCount} reviews` : ""}.`;
    const keywords = `${business.name}, ${category?.name || "services"}, ${business.city}, Arizona, ${business.services?.slice(0, 5).join(", ") || ""}`;

    const businessUrl = `${this.SITE_URL}/${category?.slug || "business"}/${business.city.toLowerCase().replace(/\s+/g, "-")}/${business.slug}`;

    return {
      title,
      description,
      keywords,
      canonical: businessUrl,
      openGraph: {
        title,
        description,
        type: "business.business",
        url: businessUrl,
        image: business.logo || this.DEFAULT_IMAGE,
        siteName: this.SITE_NAME,
      },
      twitter: {
        card: "summary",
        title,
        description,
        image: business.logo || this.DEFAULT_IMAGE,
        site: this.TWITTER_HANDLE,
      },
      jsonLd: this.generateLocalBusinessSchema(business, category),
    };
  }

  static generateCategorySEO(category: Doc<"categories">, city?: string): SEOMetadata {
    const locationText = city ? ` in ${city}, Arizona` : " in Arizona";
    const title = `${category.name} Services${locationText} - AZ Business Services`;
    const description = `Find trusted ${category.name.toLowerCase()} professionals${locationText}. Compare quotes, read reviews, and hire verified contractors for your ${category.name.toLowerCase()} needs.`;
    const keywords = `${category.name}, ${city || "Arizona"}, contractors, professionals, local services, ${category.name.toLowerCase()} repair, ${category.name.toLowerCase()} installation`;

    const categoryUrl = city 
      ? `${this.SITE_URL}/${category.slug}?city=${city.toLowerCase().replace(/\s+/g, "-")}`
      : `${this.SITE_URL}/${category.slug}`;

    return {
      title,
      description,
      keywords,
      canonical: categoryUrl,
      openGraph: {
        title,
        description,
        type: "website",
        url: categoryUrl,
        image: this.DEFAULT_IMAGE,
        siteName: this.SITE_NAME,
      },
      twitter: {
        card: "summary",
        title,
        description,
        image: this.DEFAULT_IMAGE,
        site: this.TWITTER_HANDLE,
      },
      jsonLd: this.generateServiceAreaSchema(category, city),
    };
  }

  static generateCitySEO(city: Doc<"cities">): SEOMetadata {
    const title = `Local Service Providers in ${city.name}, Arizona - AZ Business Services`;
    const description = `Find trusted local service professionals in ${city.name}, AZ. HVAC, plumbing, electrical, and more. Get quotes from verified contractors in ${city.name}.`;
    const keywords = `${city.name}, Arizona, local services, contractors, professionals, HVAC, plumbing, electrical, ${city.name} businesses`;

    const cityUrl = `${this.SITE_URL}/city/${city.slug}`;

    return {
      title,
      description,
      keywords,
      canonical: cityUrl,
      openGraph: {
        title,
        description,
        type: "website",
        url: cityUrl,
        image: this.DEFAULT_IMAGE,
        siteName: this.SITE_NAME,
      },
      twitter: {
        card: "summary",
        title,
        description,
        image: this.DEFAULT_IMAGE,
        site: this.TWITTER_HANDLE,
      },
      jsonLd: this.generatePlaceSchema(city),
    };
  }

  static generateBlogSEO(post: any): SEOMetadata {
    const title = `${post.title} - AZ Business Services Blog`;
    const description = post.excerpt || post.content?.substring(0, 160) || "Read the latest insights and tips from AZ Business Services.";
    const keywords = `${post.tags?.join(", ") || "business, services, Arizona"}, blog, tips, advice`;

    const blogUrl = `${this.SITE_URL}/blog/${post.slug}`;

    return {
      title,
      description,
      keywords,
      canonical: blogUrl,
      openGraph: {
        title,
        description,
        type: "article",
        url: blogUrl,
        image: post.image || this.DEFAULT_IMAGE,
        siteName: this.SITE_NAME,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        image: post.image || this.DEFAULT_IMAGE,
        site: this.TWITTER_HANDLE,
      },
      jsonLd: this.generateArticleSchema(post),
    };
  }

  // JSON-LD Schema Generators
  private static generateWebsiteSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: this.SITE_NAME,
      url: this.SITE_URL,
      description: "Arizona's premier business directory connecting residents with trusted local service providers.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${this.SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };
  }

  private static generateLocalBusinessSchema(business: Doc<"businesses">, category?: Doc<"categories">) {
    const schema: any = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: business.name,
      description: business.description || business.shortDescription,
      url: business.website,
      telephone: business.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: business.address,
        addressLocality: business.city,
        addressRegion: "AZ",
        postalCode: business.zip,
        addressCountry: "US",
      },
      geo: business.coordinates ? {
        "@type": "GeoCoordinates",
        latitude: business.coordinates.lat,
        longitude: business.coordinates.lng,
      } : undefined,
      openingHours: business.hours ? this.formatOpeningHours(business.hours) : undefined,
      priceRange: undefined, // TODO: Add priceRange to business schema
      areaServed: {
        "@type": "City",
        name: business.city,
        containedInPlace: {
          "@type": "State",
          name: "Arizona",
        },
      },
    };

    // Add category-specific type
    if (category?.name) {
      schema["@type"] = this.getBusinessTypeFromCategory(category.name);
    }

    // Add rating if available
    if (business.rating && business.reviewCount) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: business.rating,
        reviewCount: business.reviewCount,
        bestRating: 5,
        worstRating: 1,
      };
    }

    // Add services
    if (business.services?.length) {
      schema.hasOfferCatalog = {
        "@type": "OfferCatalog",
        name: "Services",
        itemListElement: business.services.map((service: string) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service,
          },
        })),
      };
    }

    return schema;
  }

  private static generateServiceAreaSchema(category: Doc<"categories">, city?: string) {
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      name: category.name,
      description: `Professional ${category.name.toLowerCase()} services${city ? ` in ${city}, Arizona` : " in Arizona"}`,
      provider: {
        "@type": "Organization",
        name: this.SITE_NAME,
        url: this.SITE_URL,
      },
      areaServed: city ? {
        "@type": "City",
        name: city,
        containedInPlace: {
          "@type": "State",
          name: "Arizona",
        },
      } : {
        "@type": "State",
        name: "Arizona",
      },
    };
  }

  private static generatePlaceSchema(city: Doc<"cities">) {
    return {
      "@context": "https://schema.org",
      "@type": "Place",
      name: city.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: city.name,
        addressRegion: "AZ",
        addressCountry: "US",
      },
      containedInPlace: {
        "@type": "State",
        name: "Arizona",
      },
    };
  }

  private static generateArticleSchema(post: any) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt || post.content?.substring(0, 160),
      image: post.image,
      author: {
        "@type": "Organization",
        name: this.SITE_NAME,
        url: this.SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: this.SITE_NAME,
        url: this.SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${this.SITE_URL}/logo.png`,
        },
      },
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${this.SITE_URL}/blog/${post.slug}`,
      },
    };
  }

  // Helper functions
  private static formatOpeningHours(hours: any): string[] {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days.map(day => {
      const dayHours = hours[day.toLowerCase()];
      if (!dayHours || dayHours.closed) return `${day} Closed`;
      return `${day} ${dayHours.open}-${dayHours.close}`;
    });
  }

  private static getBusinessTypeFromCategory(categoryName: string): string {
    const mapping: Record<string, string> = {
      "HVAC Services": "HVACBusiness",
      "Plumbing": "Plumber",
      "Electrical": "Electrician",
      "Landscaping": "LandscapingBusiness",
      "Roofing": "RoofingContractor",
      "Cleaning Services": "HouseCleaner",
      "Auto Repair": "AutoRepair",
      "Legal Services": "LegalService",
      "Real Estate": "RealEstateAgent",
      "Restaurant": "Restaurant",
      "Medical Services": "MedicalBusiness",
      "Dental Services": "Dentist",
      "Veterinary Services": "VeterinaryCare",
      "Beauty Services": "BeautySalon",
      "Fitness": "ExerciseGym",
      "Education": "EducationalOrganization",
      "Financial Services": "FinancialService",
      "Insurance": "InsuranceAgency",
      "Home Security": "SecurityService",
      "Pest Control": "PestControlService",
      "Moving Services": "MovingCompany",
      "Storage": "SelfStorage",
      "Photography": "PhotographAction",
      "Event Planning": "EventPlanner",
      "Catering": "CateringService",
      "Computer Repair": "ComputerRepair",
      "Appliance Repair": "ApplianceRepair",
      "Locksmith": "Locksmith",
      "Painting": "PaintingService",
      "Flooring": "FlooringService",
      "Window Services": "WindowService",
      "Tree Services": "TreeService",
      "Pool Services": "PoolService",
      "Solar Services": "SolarService",
      "Home Renovation": "GeneralContractor",
      "Concrete Services": "ConcreteService",
      "Fencing": "FencingService",
      "Massage Therapy": "MassageTherapy",
      "Accounting": "AccountingService",
    };

    return mapping[categoryName] || "LocalBusiness";
  }
}

// Breadcrumb generator
export interface BreadcrumbItem {
  label: string;
  url: string;
  position: number;
}

export class BreadcrumbGenerator {
  static generateHomeBreadcrumb(): BreadcrumbItem[] {
    return [
      { label: "Home", url: "/", position: 1 },
    ];
  }

  static generateCategoryBreadcrumb(category: Doc<"categories">, city?: string): BreadcrumbItem[] {
    const breadcrumbs = [
      { label: "Home", url: "/", position: 1 },
      { label: "Categories", url: "/categories", position: 2 },
    ];

    if (city) {
      breadcrumbs.push(
        { label: city, url: `/city/${city.toLowerCase().replace(/\s+/g, "-")}`, position: 3 },
        { label: category.name, url: `/${category.slug}?city=${city.toLowerCase().replace(/\s+/g, "-")}`, position: 4 }
      );
    } else {
      breadcrumbs.push(
        { label: category.name, url: `/${category.slug}`, position: 3 }
      );
    }

    return breadcrumbs;
  }

  static generateCityBreadcrumb(city: Doc<"cities">): BreadcrumbItem[] {
    return [
      { label: "Home", url: "/", position: 1 },
      { label: "Cities", url: "/cities", position: 2 },
      { label: city.name, url: `/city/${city.slug}`, position: 3 },
    ];
  }

  static generateBusinessBreadcrumb(business: Doc<"businesses">, category?: Doc<"categories">): BreadcrumbItem[] {
    const breadcrumbs = [
      { label: "Home", url: "/", position: 1 },
    ];

    if (category) {
      breadcrumbs.push(
        { label: "Categories", url: "/categories", position: 2 },
        { label: category.name, url: `/${category.slug}`, position: 3 },
        { label: business.city, url: `/city/${business.city.toLowerCase().replace(/\s+/g, "-")}`, position: 4 },
        { label: business.name, url: `/business/${business.slug}`, position: 5 }
      );
    } else {
      breadcrumbs.push(
        { label: business.city, url: `/city/${business.city.toLowerCase().replace(/\s+/g, "-")}`, position: 2 },
        { label: business.name, url: `/business/${business.slug}`, position: 3 }
      );
    }

    return breadcrumbs;
  }

  static generateBlogBreadcrumb(post: any): BreadcrumbItem[] {
    return [
      { label: "Home", url: "/", position: 1 },
      { label: "Blog", url: "/blog", position: 2 },
      { label: post.title, url: `/blog/${post.slug}`, position: 3 },
    ];
  }

  static generateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item) => ({
        "@type": "ListItem",
        position: item.position,
        name: item.label,
        item: `https://azbusiness.services${item.url}`,
      })),
    };
  }
}