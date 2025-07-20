/**
 * Universal CSV field mappings for different data sources
 */

// Business field mappings
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

// Review field mappings
export interface ReviewFieldMapping {
  // Required fields
  businessName: string; // Business name for matching
  reviewId: string; // Unique review identifier
  rating: string; // 1-5 star rating
  comment: string; // Review text content
  userName: string; // Reviewer name
  
  // Optional fields
  businessPhone?: string; // For business matching
  businessAddress?: string; // For business matching
  businessId?: string; // Direct business ID if available
  userId?: string; // Reviewer user ID
  authorPhotoUrl?: string; // Reviewer profile photo
  verified?: string; // Is review verified
  helpful?: string; // Helpful count/votes
  sourceUrl?: string; // Original review URL
  originalCreateTime?: string; // When review was created
  originalUpdateTime?: string; // When review was last updated
  
  // Reply information
  replyText?: string; // Business reply content
  replyAuthorName?: string; // Who replied
  replyCreatedAt?: string; // When reply was posted
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

/**
 * Review field mappings for different sources
 */

// Google My Business Review CSV format
export const GOOGLE_MY_BUSINESS_REVIEW_MAPPING: ReviewFieldMapping = {
  businessName: 'Business_Name',
  reviewId: 'Review_ID',
  rating: 'Rating',
  comment: 'Review_Text',
  userName: 'Reviewer_Name',
  businessPhone: 'Business_Phone',
  businessAddress: 'Business_Address',
  userId: 'Reviewer_ID',
  authorPhotoUrl: 'Reviewer_Photo',
  verified: 'Verified',
  helpful: 'Helpful_Votes',
  sourceUrl: 'Review_URL',
  originalCreateTime: 'Created_Date',
  originalUpdateTime: 'Updated_Date',
  replyText: 'Owner_Reply',
  replyAuthorName: 'Reply_Author',
  replyCreatedAt: 'Reply_Date'
};

// Yelp Review CSV format
export const YELP_REVIEW_MAPPING: ReviewFieldMapping = {
  businessName: 'business_name',
  reviewId: 'review_id',
  rating: 'stars',
  comment: 'text',
  userName: 'user_name',
  businessPhone: 'business_phone',
  businessAddress: 'business_address',
  userId: 'user_id',
  authorPhotoUrl: 'user_photo',
  verified: 'verified',
  helpful: 'useful',
  sourceUrl: 'review_url',
  originalCreateTime: 'date',
  originalUpdateTime: 'updated_date'
};

// Facebook Review CSV format
export const FACEBOOK_REVIEW_MAPPING: ReviewFieldMapping = {
  businessName: 'page_name',
  reviewId: 'review_id',
  rating: 'rating',
  comment: 'review_text',
  userName: 'reviewer_name',
  businessPhone: 'page_phone',
  businessAddress: 'page_address',
  userId: 'reviewer_id',
  authorPhotoUrl: 'reviewer_photo',
  verified: 'verified',
  helpful: 'reactions',
  sourceUrl: 'review_url',
  originalCreateTime: 'created_time',
  originalUpdateTime: 'updated_time',
  replyText: 'page_reply',
  replyAuthorName: 'reply_author',
  replyCreatedAt: 'reply_time'
};

// Generic Review CSV format
export const GENERIC_REVIEW_MAPPING: ReviewFieldMapping = {
  businessName: 'Business Name',
  reviewId: 'Review ID',
  rating: 'Rating',
  comment: 'Review',
  userName: 'Reviewer',
  businessPhone: 'Phone',
  businessAddress: 'Address',
  userId: 'User ID',
  authorPhotoUrl: 'Photo',
  verified: 'Verified',
  helpful: 'Helpful',
  sourceUrl: 'URL',
  originalCreateTime: 'Date',
  originalUpdateTime: 'Updated'
};

/**
 * Review field name variations for auto-detection
 */
export const REVIEW_FIELD_VARIATIONS = {
  businessName: ['business_name', 'business', 'company', 'name', 'page_name', 'establishment'],
  reviewId: ['review_id', 'id', 'review_identifier', 'unique_id', 'review_key'],
  rating: ['rating', 'stars', 'score', 'review_rating', 'star_rating'],
  comment: ['comment', 'review', 'text', 'review_text', 'review_comment', 'content', 'body'],
  userName: ['user_name', 'reviewer', 'reviewer_name', 'customer', 'author', 'name'],
  businessPhone: ['business_phone', 'phone', 'telephone', 'contact_phone', 'page_phone'],
  businessAddress: ['business_address', 'address', 'location', 'page_address'],
  businessId: ['business_id', 'location_id', 'place_id', 'establishment_id'],
  userId: ['user_id', 'reviewer_id', 'customer_id', 'author_id'],
  authorPhotoUrl: ['photo', 'profile_photo', 'avatar', 'reviewer_photo', 'user_photo'],
  verified: ['verified', 'confirmed', 'authentic', 'validated'],
  helpful: ['helpful', 'useful', 'likes', 'votes', 'reactions'],
  sourceUrl: ['url', 'review_url', 'link', 'source_url', 'original_url'],
  originalCreateTime: ['date', 'created', 'created_time', 'created_date', 'review_date'],
  originalUpdateTime: ['updated', 'updated_time', 'updated_date', 'modified'],
  replyText: ['reply', 'owner_reply', 'business_reply', 'response', 'page_reply'],
  replyAuthorName: ['reply_author', 'reply_by', 'responder', 'owner_name'],
  replyCreatedAt: ['reply_date', 'reply_time', 'response_date', 'replied_at']
};

export class FieldMappingDetector {
  /**
   * Auto-detect field mapping from CSV headers (for business data)
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
   * Auto-detect review field mapping from CSV headers
   */
  static detectReviewMapping(headers: string[]): ReviewFieldMapping {
    const mapping: Partial<ReviewFieldMapping> = {};
    const lowerHeaders = headers.map(h => h.toLowerCase().replace(/\s+/g, '_'));

    // Map each field type to best matching header
    for (const [fieldType, variations] of Object.entries(REVIEW_FIELD_VARIATIONS)) {
      const matchingHeader = this.findBestMatch(lowerHeaders, variations);
      if (matchingHeader) {
        const originalHeader = headers[lowerHeaders.indexOf(matchingHeader)];
        (mapping as any)[fieldType] = originalHeader;
      }
    }

    return mapping as ReviewFieldMapping;
  }

  /**
   * Get review mapping based on detected CSV type
   */
  static getReviewMappingByType(csvType: 'google_reviews' | 'yelp_reviews' | 'facebook_reviews' | 'generic_reviews'): ReviewFieldMapping {
    switch (csvType) {
      case 'google_reviews':
        return GOOGLE_MY_BUSINESS_REVIEW_MAPPING;
      case 'yelp_reviews':
        return YELP_REVIEW_MAPPING;
      case 'facebook_reviews':
        return FACEBOOK_REVIEW_MAPPING;
      case 'generic_reviews':
      default:
        return GENERIC_REVIEW_MAPPING;
    }
  }

  /**
   * Detect if CSV contains review data vs business data
   */
  static isReviewCSV(headers: string[]): boolean {
    const headerSet = new Set(headers.map(h => h.toLowerCase()));
    
    // Look for review-specific headers
    const reviewIndicators = [
      'review', 'rating', 'comment', 'reviewer', 'review_text', 
      'stars', 'review_id', 'user_name', 'review_rating'
    ];
    
    const hasReviewFields = reviewIndicators.some(indicator => 
      Array.from(headerSet).some(header => header.includes(indicator))
    );
    
    // Look for business-specific headers that are NOT in reviews
    const businessOnlyIndicators = [
      'address', 'phone', 'website', 'hours', 'services'
    ];
    
    const hasBusinessOnlyFields = businessOnlyIndicators.some(indicator =>
      Array.from(headerSet).some(header => header.includes(indicator))
    );
    
    // If it has review fields and no business-only fields, it's likely a review CSV
    return hasReviewFields && !hasBusinessOnlyFields;
  }

  /**
   * Detect business CSV type from headers (backward compatibility)
   */
  static detectBusinessCSVType(headers: string[]): 'google' | 'yelp' | 'generic' {
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
   * Detect CSV type from headers (extended for reviews)
   */
  static detectCSVType(headers: string[]): 'google' | 'yelp' | 'generic' | 'google_reviews' | 'yelp_reviews' | 'facebook_reviews' | 'generic_reviews' {
    const headerSet = new Set(headers.map(h => h.toLowerCase()));

    // First check if this is a review CSV
    if (this.isReviewCSV(headers)) {
      // Check for Google Reviews specific headers
      if (headerSet.has('review_id') && headerSet.has('business_name') && 
          (headerSet.has('created_date') || headerSet.has('reviewer_id'))) {
        return 'google_reviews';
      }
      
      // Check for Yelp Reviews specific headers
      if (headerSet.has('review_id') && headerSet.has('stars') && headerSet.has('text') && 
          (headerSet.has('user_name') || headerSet.has('business_name'))) {
        return 'yelp_reviews';
      }
      
      // Check for Facebook Reviews specific headers
      if (headerSet.has('page_name') && headerSet.has('rating') && 
          (headerSet.has('created_time') || headerSet.has('reviewer_name'))) {
        return 'facebook_reviews';
      }
      
      return 'generic_reviews';
    }

    // Business CSV detection (existing logic)
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
   * Validate mapping completeness (for business data)
   */
  static validateMapping(mapping: FieldMapping): { valid: boolean; missing: string[] } {
    const required = ['name', 'address', 'city', 'state', 'zip', 'phone'];
    const missing = required.filter(field => !mapping[field as keyof FieldMapping]);

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Validate review mapping completeness
   */
  static validateReviewMapping(mapping: ReviewFieldMapping): { valid: boolean; missing: string[] } {
    const required = ['businessName', 'reviewId', 'rating', 'comment', 'userName'];
    const missing = required.filter(field => !mapping[field as keyof ReviewFieldMapping]);

    return {
      valid: missing.length === 0,
      missing
    };
  }
}

export default FieldMappingDetector;