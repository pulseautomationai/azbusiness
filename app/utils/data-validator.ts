import type { CSVRow } from './csv-processor';
import type { FieldMapping } from '../../config/field-mappings';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BusinessData {
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
  rating?: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
  hours?: Record<string, string>;
  socialLinks?: Record<string, string>;
  // Additional GMB fields
  imageUrl?: string;
  favicon?: string;
  reviewUrl?: string;
  serviceOptions?: string;
  fromTheBusiness?: string;
  offerings?: string;
  planning?: string;
}

export class DataValidator {
  private static readonly ARIZONA_CITIES = [
    'phoenix', 'scottsdale', 'mesa', 'tempe', 'glendale', 'chandler', 'peoria', 
    'gilbert', 'surprise', 'avondale', 'goodyear', 'buckeye', 'paradise valley',
    'fountain hills', 'carefree', 'cave creek', 'queen creek', 'tucson', 
    'oro valley', 'marana', 'sahuarita', 'south tucson', 'catalina foothills',
    'flagstaff', 'sedona', 'prescott', 'prescott valley', 'cottonwood', 
    'camp verde', 'payson', 'show low', 'winslow', 'yuma', 'lake havasu city',
    'bullhead city', 'kingman', 'parker', 'casa grande', 'eloy', 'florence',
    'apache junction', 'globe', 'sierra vista', 'benson', 'safford', 'thatcher',
    'nogales', 'douglas', 'somerton', 'san luis', 'page', 'holbrook'
  ];

  private static readonly PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly URL_REGEX = /^https?:\/\/.+\..+/;

  /**
   * Validate business data
   */
  static validateBusinessData(data: BusinessData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!data.name?.trim()) {
      errors.push('Business name is required');
    }

    if (!data.address?.trim()) {
      errors.push('Business address is required');
    }

    if (!data.city?.trim()) {
      errors.push('City is required');
    }

    if (!data.state?.trim()) {
      errors.push('State is required');
    }

    if (!data.zip?.trim()) {
      errors.push('ZIP code is required');
    }

    if (!data.phone?.trim()) {
      errors.push('Phone number is required');
    }

    // Arizona city validation
    if (data.city && !this.isArizonaCity(data.city)) {
      errors.push(`City "${data.city}" is not a recognized Arizona city`);
    }

    // State validation
    if (data.state && !this.isArizonaState(data.state)) {
      errors.push(`State "${data.state}" is not Arizona`);
    }

    // Phone validation
    if (data.phone && !this.isValidPhone(data.phone)) {
      warnings.push('Phone number format may be invalid');
    }

    // Email validation
    if (data.email && !this.isValidEmail(data.email)) {
      warnings.push('Email format appears invalid');
    }

    // Website validation
    if (data.website && !this.isValidURL(data.website)) {
      warnings.push('Website URL format appears invalid');
    }

    // Rating validation
    if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
      warnings.push('Rating should be between 0 and 5');
    }

    // Review count validation
    if (data.reviewCount !== undefined && data.reviewCount < 0) {
      warnings.push('Review count should be non-negative');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if city is in Arizona
   */
  static isArizonaCity(city: string): boolean {
    return this.ARIZONA_CITIES.includes(city.toLowerCase().trim());
  }

  /**
   * Check if state is Arizona
   */
  static isArizonaState(state: string): boolean {
    const normalized = state.toLowerCase().trim();
    return normalized === 'arizona' || normalized === 'az';
  }

  /**
   * Validate phone number format
   */
  static isValidPhone(phone: string): boolean {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Check if it's a valid US phone number (10 digits)
    return cleaned.length === 10 || cleaned.length === 11;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email.trim());
  }

  /**
   * Validate URL format
   */
  static isValidURL(url: string): boolean {
    return this.URL_REGEX.test(url.trim());
  }

  /**
   * Normalize city name
   */
  static normalizeCity(city: string): string {
    return city.trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/,?\s*(az|arizona)$/i, '')
      .trim();
  }

  /**
   * Normalize state name
   */
  static normalizeState(state: string): string {
    const normalized = state.trim().toLowerCase();
    return normalized === 'arizona' ? 'AZ' : 'AZ';
  }

  /**
   * Normalize phone number
   */
  static normalizePhone(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone; // Return original if can't format
  }

  /**
   * Generate slug from business name
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/--+/g, '-')     // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Validate and process CSV row for business data
   */
  static processCSVRow(row: CSVRow, fieldMapping: FieldMapping): { data: BusinessData | null; validation: ValidationResult } {
    try {
      // Process hours if available
      let hours: Record<string, string> | undefined;
      if (fieldMapping.hours) {
        hours = {};
        for (const [day, column] of Object.entries(fieldMapping.hours)) {
          if (column && row[column]) {
            hours[day] = row[column];
          }
        }
      }

      // Process social links if available
      let socialLinks: Record<string, string> | undefined;
      if (fieldMapping.socialLinks) {
        socialLinks = {};
        for (const [platform, column] of Object.entries(fieldMapping.socialLinks)) {
          if (column && row[column]) {
            socialLinks[platform] = row[column];
          }
        }
      }

      // Map CSV fields to business data
      const data: BusinessData = {
        name: row[fieldMapping.name] || '',
        address: row[fieldMapping.address] || '',
        city: this.normalizeCity(row[fieldMapping.city] || ''),
        state: this.normalizeState(row[fieldMapping.state] || ''),
        zip: row[fieldMapping.zip] || '',
        phone: this.normalizePhone(row[fieldMapping.phone] || ''),
        email: row[fieldMapping.email] || undefined,
        website: row[fieldMapping.website] || undefined,
        description: row[fieldMapping.description] || undefined,
        shortDescription: row[fieldMapping.shortDescription] || undefined,
        category: row[fieldMapping.category] || undefined,
        rating: row[fieldMapping.rating] ? parseFloat(row[fieldMapping.rating]) : undefined,
        reviewCount: row[fieldMapping.reviewCount] ? parseInt(row[fieldMapping.reviewCount]) : undefined,
        latitude: row[fieldMapping.latitude] ? parseFloat(row[fieldMapping.latitude]) : undefined,
        longitude: row[fieldMapping.longitude] ? parseFloat(row[fieldMapping.longitude]) : undefined,
        // Additional GMB fields
        imageUrl: row[fieldMapping.imageUrl] || undefined,
        favicon: row[fieldMapping.favicon] || undefined,
        reviewUrl: row[fieldMapping.reviewUrl] || undefined,
        serviceOptions: row[fieldMapping.serviceOptions] || undefined,
        fromTheBusiness: row[fieldMapping.fromTheBusiness] || undefined,
        offerings: row[fieldMapping.offerings] || undefined,
        planning: row[fieldMapping.planning] || undefined,
        hours: hours,
        socialLinks: socialLinks
      };

      // Validate the processed data
      const validation = this.validateBusinessData(data);
      
      return {
        data: validation.valid ? data : null,
        validation
      };
    } catch (error) {
      return {
        data: null,
        validation: {
          valid: false,
          errors: [`Error processing row: ${error}`],
          warnings: []
        }
      };
    }
  }
}

export default DataValidator;