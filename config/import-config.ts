/**
 * General import configuration and settings
 */

export interface ImportConfig {
  batchSize: number;
  maxConcurrentRequests: number;
  retryAttempts: number;
  retryDelay: number;
  defaultPlanTier: 'free' | 'pro' | 'power';
  defaultClaimed: boolean;
  defaultVerified: boolean;
  defaultActive: boolean;
  defaultPriority: number;
  defaultFeatured: boolean;
  skipDuplicates: boolean;
  validateArizonaOnly: boolean;
  generateDefaultServices: boolean;
  generateDefaultHours: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const DEFAULT_IMPORT_CONFIG: ImportConfig = {
  batchSize: 50,
  maxConcurrentRequests: 5,
  retryAttempts: 3,
  retryDelay: 1000,
  defaultPlanTier: 'free',
  defaultClaimed: false,
  defaultVerified: false,
  defaultActive: true,
  defaultPriority: 0,
  defaultFeatured: false,
  skipDuplicates: true,
  validateArizonaOnly: true,
  generateDefaultServices: true,
  generateDefaultHours: true,
  logLevel: 'info'
};

/**
 * Default business hours for different categories
 */
export const DEFAULT_BUSINESS_HOURS = {
  'hvac-services': {
    monday: '7:00 AM - 6:00 PM',
    tuesday: '7:00 AM - 6:00 PM',
    wednesday: '7:00 AM - 6:00 PM',
    thursday: '7:00 AM - 6:00 PM',
    friday: '7:00 AM - 6:00 PM',
    saturday: '8:00 AM - 4:00 PM',
    sunday: 'Emergency Only'
  },
  'plumbing': {
    monday: '8:00 AM - 5:00 PM',
    tuesday: '8:00 AM - 5:00 PM',
    wednesday: '8:00 AM - 5:00 PM',
    thursday: '8:00 AM - 5:00 PM',
    friday: '8:00 AM - 5:00 PM',
    saturday: '9:00 AM - 3:00 PM',
    sunday: 'Emergency Only'
  },
  'electrical': {
    monday: '8:00 AM - 5:00 PM',
    tuesday: '8:00 AM - 5:00 PM',
    wednesday: '8:00 AM - 5:00 PM',
    thursday: '8:00 AM - 5:00 PM',
    friday: '8:00 AM - 5:00 PM',
    saturday: '9:00 AM - 3:00 PM',
    sunday: 'Emergency Only'
  },
  'cleaning-services': {
    monday: '8:00 AM - 6:00 PM',
    tuesday: '8:00 AM - 6:00 PM',
    wednesday: '8:00 AM - 6:00 PM',
    thursday: '8:00 AM - 6:00 PM',
    friday: '8:00 AM - 6:00 PM',
    saturday: '9:00 AM - 4:00 PM',
    sunday: 'Closed'
  },
  'default': {
    monday: '9:00 AM - 5:00 PM',
    tuesday: '9:00 AM - 5:00 PM',
    wednesday: '9:00 AM - 5:00 PM',
    thursday: '9:00 AM - 5:00 PM',
    friday: '9:00 AM - 5:00 PM',
    saturday: '10:00 AM - 3:00 PM',
    sunday: 'Closed'
  }
};

/**
 * Default services for different categories
 */
export const DEFAULT_SERVICES = {
  'hvac-services': [
    'AC Installation & Replacement',
    'Heating System Repair',
    'Duct Cleaning & Sealing',
    'Preventive Maintenance',
    'Emergency 24/7 Service',
    'Energy Audits'
  ],
  'plumbing': [
    'Leak Detection & Repair',
    'Drain Cleaning',
    'Water Heater Installation',
    'Pipe Repair & Replacement',
    'Emergency Plumbing',
    'Fixture Installation'
  ],
  'electrical': [
    'Electrical Repair',
    'Panel Upgrades',
    'Lighting Installation',
    'Outlet & Switch Installation',
    'Electrical Inspections',
    'Emergency Electrical Service'
  ],
  'cleaning-services': [
    'Residential Cleaning',
    'Commercial Cleaning',
    'Deep Cleaning',
    'Move-in/Move-out Cleaning',
    'Carpet Cleaning',
    'Window Cleaning'
  ],
  'landscaping': [
    'Lawn Maintenance',
    'Landscape Design',
    'Irrigation Installation',
    'Tree & Shrub Care',
    'Hardscape Installation',
    'Seasonal Cleanup'
  ],
  'pest-control': [
    'General Pest Control',
    'Termite Treatment',
    'Rodent Control',
    'Ant & Cockroach Control',
    'Scorpion Control',
    'Preventive Treatments'
  ],
  'roofing-gutters': [
    'Roof Repair',
    'Roof Replacement',
    'Gutter Installation',
    'Gutter Cleaning',
    'Leak Detection',
    'Emergency Repairs'
  ],
  'solar-installation': [
    'Solar Panel Installation',
    'Battery Storage Systems',
    'System Maintenance',
    'Energy Audits',
    'Permit Assistance',
    'Financing Options'
  ],
  'default': [
    'Professional Services',
    'Consultation',
    'Installation',
    'Repair & Maintenance',
    'Emergency Service',
    'Free Estimates'
  ]
};

/**
 * Data transformation rules
 */
export const DATA_TRANSFORMATIONS = {
  phone: {
    removeChars: ['-', '(', ')', ' ', '.'],
    format: '(XXX) XXX-XXXX'
  },
  website: {
    ensureProtocol: true,
    defaultProtocol: 'https://'
  },
  email: {
    toLowerCase: true,
    validate: true
  },
  city: {
    normalizeSpacing: true,
    removeStateAbbreviation: true,
    capitalizeWords: true
  },
  state: {
    normalizeToAbbreviation: true,
    acceptedValues: ['AZ', 'Arizona']
  },
  zip: {
    format: 'XXXXX',
    validate: true
  }
};

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 100,
    required: true
  },
  address: {
    minLength: 10,
    maxLength: 200,
    required: true
  },
  city: {
    minLength: 2,
    maxLength: 50,
    required: true,
    arizonaOnly: true
  },
  state: {
    allowedValues: ['AZ', 'Arizona'],
    required: true
  },
  zip: {
    pattern: /^\d{5}(-\d{4})?$/,
    required: true
  },
  phone: {
    pattern: /^\(\d{3}\) \d{3}-\d{4}$/,
    required: true
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: false
  },
  website: {
    pattern: /^https?:\/\/.+\..+/,
    required: false
  },
  rating: {
    min: 0,
    max: 5,
    required: false
  },
  reviewCount: {
    min: 0,
    required: false
  }
};

/**
 * Error handling configuration
 */
export const ERROR_HANDLING = {
  continueOnError: true,
  logErrors: true,
  maxErrorsBeforeAbort: 100,
  errorReportFile: 'import-errors.json'
};

/**
 * Progress reporting configuration
 */
export const PROGRESS_CONFIG = {
  updateInterval: 10, // Update progress every N records
  showPercentage: true,
  showETA: true,
  showProcessedCount: true,
  showErrorCount: true
};

export class ImportConfigManager {
  private config: ImportConfig;

  constructor(customConfig?: Partial<ImportConfig>) {
    this.config = { ...DEFAULT_IMPORT_CONFIG, ...customConfig };
  }

  getConfig(): ImportConfig {
    return this.config;
  }

  updateConfig(updates: Partial<ImportConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getDefaultServices(categorySlug: string): string[] {
    return DEFAULT_SERVICES[categorySlug as keyof typeof DEFAULT_SERVICES] || DEFAULT_SERVICES.default;
  }

  getDefaultHours(categorySlug: string): Record<string, string> {
    return DEFAULT_BUSINESS_HOURS[categorySlug as keyof typeof DEFAULT_BUSINESS_HOURS] || DEFAULT_BUSINESS_HOURS.default;
  }

  shouldSkipDuplicates(): boolean {
    return this.config.skipDuplicates;
  }

  shouldValidateArizonaOnly(): boolean {
    return this.config.validateArizonaOnly;
  }

  getBatchSize(): number {
    return this.config.batchSize;
  }

  getLogLevel(): string {
    return this.config.logLevel;
  }
}

export default ImportConfigManager;