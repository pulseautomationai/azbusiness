/**
 * Slug generation utilities for business URLs
 */

export class SlugGenerator {
  /**
   * Generate a URL-friendly slug from text
   */
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')     // Remove special characters except hyphens and spaces
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/--+/g, '-')         // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
  }

  /**
   * Generate category slug from category name
   */
  static generateCategorySlug(categoryName: string): string {
    return this.generateSlug(categoryName);
  }

  /**
   * Generate city slug from city name
   */
  static generateCitySlug(cityName: string): string {
    return this.generateSlug(cityName);
  }

  /**
   * Generate business name slug from business name
   */
  static generateBusinessNameSlug(businessName: string): string {
    return this.generateSlug(businessName);
  }

  /**
   * Generate full business slug (business name only, no city or category)
   * @deprecated Use generateBusinessNameSlug instead
   */
  static generateFullBusinessSlug(businessName: string, cityName: string, categoryName: string): string {
    // Changed to only return business name slug, ignoring city and category
    // This maintains backward compatibility while fixing the slug issue
    return this.generateBusinessNameSlug(businessName);
  }

  /**
   * Generate URL path in format: /category/city/businessname
   */
  static generateURLPath(businessName: string, cityName: string, categoryName: string): string {
    const categorySlug = this.generateCategorySlug(categoryName);
    const citySlug = this.generateCitySlug(cityName);
    const businessSlug = this.generateBusinessNameSlug(businessName);
    
    return `/${categorySlug}/${citySlug}/${businessSlug}`;
  }

  /**
   * Parse URL path to extract components
   */
  static parseURLPath(urlPath: string): { category: string; city: string; business: string } | null {
    // Remove leading slash and split by /
    const parts = urlPath.replace(/^\//, '').split('/');
    
    if (parts.length !== 3) {
      return null;
    }

    return {
      category: parts[0],
      city: parts[1],
      business: parts[2]
    };
  }

  /**
   * Validate slug format
   */
  static isValidSlug(slug: string): boolean {
    // Check if slug only contains lowercase letters, numbers, and hyphens
    // Should not start or end with hyphen
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  }

  /**
   * Ensure slug uniqueness by appending number if needed
   */
  static ensureUnique(baseSlug: string, existingSlugs: string[]): string {
    let slug = baseSlug;
    let counter = 1;
    
    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }

  /**
   * Generate short description from business name and category
   */
  static generateShortDescription(businessName: string, categoryName: string, cityName: string): string {
    return `${businessName} - ${categoryName} in ${cityName}, Arizona`;
  }

  /**
   * Convert slug back to formatted name
   */
  static formatSlugToName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Convert business name slug back to formatted business name
   */
  static generateBusinessNameFromSlug(slug: string): string {
    return this.formatSlugToName(slug);
  }

  /**
   * Convert city slug back to formatted city name
   */
  static generateCityFromSlug(slug: string): string {
    return this.formatSlugToName(slug);
  }

  /**
   * Convert category slug back to formatted category name
   */
  static generateCategoryFromSlug(slug: string): string {
    return this.formatSlugToName(slug);
  }
}

export default SlugGenerator;