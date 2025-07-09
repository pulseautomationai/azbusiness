/**
 * Universal CSV field mappings for different data sources
 */

export interface FieldMapping {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email?: string;
  website?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  rating?: string;
  reviewCount?: string;
  latitude?: string;
  longitude?: string;
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  // Additional GMB fields
  imageUrl?: string;
  favicon?: string;
  reviewUrl?: string;
  serviceOptions?: string;
  fromTheBusiness?: string;
  offerings?: string;
  planning?: string;
}

/**
 * Google My Business CSV format (like the HVAC sample)
 */
export const GOOGLE_MY_BUSINESS_MAPPING: FieldMapping = {
  name: 'Name',
  address: 'Street_Address',
  city: 'City',
  state: 'State',
  zip: 'Zip',
  phone: 'Phone_Standard_format',
  email: 'Email_From_WEBSITE',
  website: 'Website',
  description: 'Description',
  shortDescription: 'Meta_Description',
  category: 'Keyword',
  rating: 'Average_rating',
  reviewCount: 'Reviews_count',
  latitude: 'Latitude',
  longitude: 'Longitude',
  hours: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  },
  socialLinks: {
    facebook: 'Facebook_URL',
    instagram: 'Instagram_URL',
    twitter: 'Twitter_URL',
    linkedin: 'Linkedin_URL',
    youtube: 'Youtube_URL'
  },
  // Additional GMB fields
  imageUrl: 'Image_URL',
  favicon: 'Favicon',
  reviewUrl: 'Review_URL',
  serviceOptions: 'Service_options',
  fromTheBusiness: 'From_the_business',
  offerings: 'Offerings',
  planning: 'Planning'
};

/**
 * Yelp CSV format
 */
export const YELP_MAPPING: FieldMapping = {
  name: 'Business Name',
  address: 'Address',
  city: 'City',
  state: 'State',
  zip: 'ZIP Code',
  phone: 'Phone',
  email: 'Email',
  website: 'Website',
  description: 'Description',
  shortDescription: 'Short Description',
  category: 'Category',
  rating: 'Rating',
  reviewCount: 'Review Count',
  latitude: 'Latitude',
  longitude: 'Longitude'
};

/**
 * Generic CSV format with common variations
 */
export const GENERIC_MAPPING: FieldMapping = {
  name: 'Name',
  address: 'Address',
  city: 'City',
  state: 'State',
  zip: 'Zip',
  phone: 'Phone',
  email: 'Email',
  website: 'Website',
  description: 'Description',
  shortDescription: 'Short Description',
  category: 'Category',
  rating: 'Rating',
  reviewCount: 'Reviews',
  latitude: 'Lat',
  longitude: 'Lng'
};

/**
 * Common field name variations for auto-detection
 */
export const FIELD_VARIATIONS = {
  name: ['name', 'business_name', 'company_name', 'title', 'business'],
  address: ['address', 'street_address', 'street', 'location', 'full_address'],
  city: ['city', 'town', 'municipality', 'locality'],
  state: ['state', 'province', 'region'],
  zip: ['zip', 'zipcode', 'postal_code', 'postcode'],
  phone: ['phone', 'telephone', 'phone_number', 'phone_standard_format', 'contact_phone'],
  email: ['email', 'email_address', 'contact_email', 'email_from_website'],
  website: ['website', 'url', 'web_address', 'site', 'homepage'],
  description: ['description', 'about', 'details', 'info', 'summary'],
  shortDescription: ['short_description', 'snippet', 'meta_description', 'brief'],
  category: ['category', 'type', 'industry', 'business_type', 'keyword'],
  rating: ['rating', 'average_rating', 'score', 'stars'],
  reviewCount: ['review_count', 'reviews_count', 'total_reviews', 'number_of_reviews'],
  latitude: ['latitude', 'lat', 'y', 'coord_lat'],
  longitude: ['longitude', 'lng', 'lon', 'long', 'x', 'coord_lng']
};

export class FieldMappingDetector {
  /**
   * Auto-detect field mapping from CSV headers
   */
  static detectMapping(headers: string[]): FieldMapping {
    const mapping: Partial<FieldMapping> = {};
    const lowerHeaders = headers.map(h => h.toLowerCase().replace(/\s+/g, '_'));

    // Map each field type to best matching header
    for (const [fieldType, variations] of Object.entries(FIELD_VARIATIONS)) {
      const matchingHeader = this.findBestMatch(lowerHeaders, variations);
      if (matchingHeader) {
        const originalHeader = headers[lowerHeaders.indexOf(matchingHeader)];
        (mapping as any)[fieldType] = originalHeader;
      }
    }

    // Special handling for hours
    mapping.hours = this.detectHoursMapping(headers);

    // Special handling for social links
    mapping.socialLinks = this.detectSocialLinksMapping(headers);

    return mapping as FieldMapping;
  }

  /**
   * Find best matching header for field variations
   */
  private static findBestMatch(headers: string[], variations: string[]): string | null {
    for (const variation of variations) {
      const match = headers.find(h => h.includes(variation) || variation.includes(h));
      if (match) {
        return match;
      }
    }
    return null;
  }

  /**
   * Detect hours mapping from headers
   */
  private static detectHoursMapping(headers: string[]): FieldMapping['hours'] {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const hoursMapping: any = {};

    for (const day of days) {
      const header = headers.find(h => 
        h.toLowerCase().includes(day) || 
        h.toLowerCase().includes(day.substring(0, 3))
      );
      if (header) {
        hoursMapping[day] = header;
      }
    }

    return hoursMapping;
  }

  /**
   * Detect social links mapping from headers
   */
  private static detectSocialLinksMapping(headers: string[]): FieldMapping['socialLinks'] {
    const socialMapping: any = {};
    const socialPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'];

    for (const platform of socialPlatforms) {
      const header = headers.find(h => 
        h.toLowerCase().includes(platform) || 
        h.toLowerCase().includes(platform.substring(0, 4))
      );
      if (header) {
        socialMapping[platform] = header;
      }
    }

    return socialMapping;
  }

  /**
   * Get mapping based on detected CSV type
   */
  static getMappingByType(csvType: 'google' | 'yelp' | 'generic'): FieldMapping {
    switch (csvType) {
      case 'google':
        return GOOGLE_MY_BUSINESS_MAPPING;
      case 'yelp':
        return YELP_MAPPING;
      case 'generic':
      default:
        return GENERIC_MAPPING;
    }
  }

  /**
   * Detect CSV type from headers
   */
  static detectCSVType(headers: string[]): 'google' | 'yelp' | 'generic' {
    const headerSet = new Set(headers.map(h => h.toLowerCase()));

    // Check for Google My Business specific headers
    if (headerSet.has('phone_standard_format') || headerSet.has('email_from_website') || headerSet.has('gmb_url')) {
      return 'google';
    }

    // Check for Yelp specific headers
    if (headerSet.has('business name') || headerSet.has('yelp_url')) {
      return 'yelp';
    }

    return 'generic';
  }

  /**
   * Validate mapping completeness
   */
  static validateMapping(mapping: FieldMapping): { valid: boolean; missing: string[] } {
    const required = ['name', 'address', 'city', 'state', 'zip', 'phone'];
    const missing = required.filter(field => !mapping[field as keyof FieldMapping]);

    return {
      valid: missing.length === 0,
      missing
    };
  }
}

export default FieldMappingDetector;