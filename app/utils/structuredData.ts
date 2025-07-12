// Utilities for generating JSON-LD structured data for SEO

interface Business {
  _id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  coordinates?: { lat: number; lng: number };
  category?: { name: string; slug: string };
  hours: Record<string, string>;
  rating: number;
  reviewCount: number;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  heroImage?: string;
  logo?: string;
}

export function generateBusinessStructuredData(business: Business, businessContent?: any) {
  const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
  
  // Convert hours to schema.org format
  const openingHours = Object.entries(business.hours)
    .filter(([_, hours]) => hours && hours.toLowerCase() !== 'closed')
    .map(([day, hours]) => {
      const dayMapping: Record<string, string> = {
        monday: 'Monday',
        tuesday: 'Tuesday', 
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      };
      
      // Parse hours like "9:00 AM - 5:00 PM" to "09:00-17:00"
      const timeRange = hours.replace(/\s*(AM|PM)\s*/gi, match => 
        match.toLowerCase().includes('pm') ? '' : ''
      );
      
      return `${dayMapping[day]} ${timeRange}`;
    });

  // Generate aggregate rating
  const aggregateRating = business.reviewCount > 0 ? {
    "@type": "AggregateRating",
    "ratingValue": business.rating,
    "reviewCount": business.reviewCount,
    "bestRating": 5,
    "worstRating": 1
  } : undefined;

  // Generate geo coordinates
  const geo = business.coordinates ? {
    "@type": "GeoCoordinates",
    "latitude": business.coordinates.lat,
    "longitude": business.coordinates.lng
  } : undefined;

  // Generate address
  const address = {
    "@type": "PostalAddress",
    "streetAddress": business.address,
    "addressLocality": business.city,
    "addressRegion": business.state,
    "postalCode": business.zip,
    "addressCountry": "US"
  };

  // Generate contact points
  const contactPoint = {
    "@type": "ContactPoint",
    "telephone": business.phone,
    "contactType": "customer service",
    "availableLanguage": "English"
  };

  // Generate social media profiles
  const sameAs = [];
  if (business.socialLinks?.facebook) sameAs.push(business.socialLinks.facebook);
  if (business.socialLinks?.instagram) sameAs.push(business.socialLinks.instagram);
  if (business.socialLinks?.twitter) sameAs.push(business.socialLinks.twitter);
  if (business.socialLinks?.linkedin) sameAs.push(business.socialLinks.linkedin);
  if (business.website) sameAs.push(business.website);

  // Base structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "description": businessContent?.customSummary || business.description,
    "url": `${baseUrl}/${business.category?.slug || 'services'}/${business.city.toLowerCase().replace(/\s+/g, '-')}/${business.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`,
    "telephone": business.phone,
    "email": business.email,
    "address": address,
    "contactPoint": contactPoint,
    ...(openingHours.length > 0 && { "openingHours": openingHours }),
    ...(aggregateRating && { "aggregateRating": aggregateRating }),
    ...(geo && { "geo": geo }),
    ...(sameAs.length > 0 && { "sameAs": sameAs }),
    ...(business.logo && { "logo": business.logo }),
    ...(businessContent?.heroImageUrl || business.heroImage && { 
      "image": businessContent?.heroImageUrl || business.heroImage 
    }),
    "priceRange": "$$", // Default - could be customized based on business type
  };

  // Add specific business type based on category
  if (business.category) {
    const categoryToBusinessType: Record<string, string> = {
      'hvac-services': 'HVACBusiness',
      'plumbing': 'Plumber',
      'electrical': 'Electrician',
      'roofing': 'RoofingContractor',
      'landscaping': 'LandscapingBusiness',
      'cleaning': 'HouseCleaner',
      'pest-control': 'PestControlService',
      'home-security': 'SecuritySystemService',
      'handyman': 'GeneralContractor',
      'flooring': 'FlooringStore',
      'painting': 'PaintingContractor',
      'pool-services': 'PoolService',
      'auto-repair': 'AutoRepair',
      'legal-services': 'LegalService',
      'accounting': 'AccountingService',
      'real-estate': 'RealEstateAgent',
      'insurance': 'InsuranceAgency',
      'medical': 'MedicalBusiness',
      'dental': 'Dentist',
      'veterinary': 'VeterinaryCare',
      'fitness': 'ExerciseGym',
      'beauty': 'BeautySalon',
      'restaurants': 'Restaurant',
      'retail': 'Store',
      'education': 'EducationalOrganization',
      'entertainment': 'EntertainmentBusiness',
      'travel': 'TravelAgency',
      'photography': 'PhotographyBusiness',
      'marketing': 'MarketingService',
      'consulting': 'ProfessionalService',
      'technology': 'ComputerRepair',
      'construction': 'GeneralContractor',
      'moving': 'MovingCompany',
      'storage': 'SelfStorage',
      'event-planning': 'EventPlanner',
      'catering': 'CateringService',
      'transportation': 'TaxiService',
      'financial': 'FinancialService',
      'nonprofit': 'NGO',
      'government': 'GovernmentOffice'
    };

    const businessType = categoryToBusinessType[business.category.slug] || 'LocalBusiness';
    structuredData["@type"] = businessType;
  }

  return structuredData;
}

export function generateWebsiteStructuredData() {
  const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AZ Business Services",
    "description": "Find trusted local service providers across Arizona. Connect with verified businesses for home services, professional services, and more.",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AZ Business Services",
      "url": baseUrl,
      "logo": `${baseUrl}/logo.png`
    }
  };
}

export function generateOrganizationStructuredData() {
  const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AZ Business Services",
    "description": "Arizona's premier business directory connecting customers with trusted local service providers.",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English",
      "url": `${baseUrl}/contact`
    },
    "sameAs": [
      "https://facebook.com/azbusinessservices",
      "https://twitter.com/azbusiness",
      "https://linkedin.com/company/az-business-services"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Phoenix",
      "addressRegion": "Arizona",
      "addressCountry": "US"
    },
    "areaServed": {
      "@type": "State",
      "name": "Arizona"
    }
  };
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.FRONTEND_URL || "https://azbusiness.com";
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${baseUrl}${crumb.url}`
    }))
  };
}

export function generateSearchResultsStructuredData(businesses: Business[], query?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": query ? `Search results for "${query}"` : "Business listings",
    "numberOfItems": businesses.length,
    "itemListElement": businesses.map((business, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": generateBusinessStructuredData(business)
    }))
  };
}

// Utility to inject structured data into page head
export function injectStructuredData(data: any): string {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
}