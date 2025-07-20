"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { useConvex } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Download,
  ArrowRight,
  ArrowLeft,
  Eye,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { toast } from "~/hooks/use-toast";
import Papa from 'papaparse';

// Import wizard steps
type WizardStep = 'upload' | 'template' | 'preview' | 'validate' | 'import' | 'complete';

interface CSVRow {
  [key: string]: string;
}

interface FieldMapping {
  [key: string]: string | undefined;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  category?: string;
  description?: string;
  // GMB specific fields
  latitude?: string;
  longitude?: string;
  rating?: string;
  reviewCount?: string;
  hours?: string;
  placeId?: string;
  gmbUrl?: string;
  cid?: string;
  gmbClaimed?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  categoryInternal?: string;
  cityInternal?: string;
}

interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  confidence: number;
}

interface ProcessedBusiness {
  originalRow: number;
  data: any;
  validation: ValidationResult;
  status: 'valid' | 'warning' | 'error';
}

const REQUIRED_FIELDS = ['name', 'city', 'category']; // Phone is optional
const RECOMMENDED_FIELDS = ['phone']; // Phone is recommended but not required
const TEMPLATES = [
  {
    id: 'basic',
    name: 'Basic Import Template',
    description: 'Required fields (Name, City, Category) plus recommended Phone',
    file: '/templates/basic-import-template.csv',
    fields: ['Name', 'City', 'Category', 'Phone (recommended)']
  },
  {
    id: 'standard',
    name: 'Arizona Business Template',
    description: 'Standard business fields with address and contact information',
    file: '/templates/arizona-business-template.csv',
    fields: ['Name', 'Address', 'City', 'State', 'ZIP', 'Phone', 'Email', 'Website', 'Category', 'Description']
  },
  {
    id: 'gmb',
    name: 'Google My Business Template',
    description: 'Full GMB export format with ratings, reviews, location data, and social media URLs',
    file: '/templates/google-my-business-template.csv',
    fields: ['Category Internal', 'City Internal', 'Name', 'Street_Address', 'City', 'State', 'Zip', 'Phone_Standard_format', 'Email_From_WEBSITE', 'Category', 'Description', 'Average_rating', 'Reviews_count', 'Latitude', 'Longitude', 'Hours', 'place_ID', 'gmb_url', 'cid', 'Facebook_URL', 'Linkedin_URL', 'Twitter_URL', 'Youtube_URL', 'Instagram_URL']
  }
];

export function ImportWizard() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const convex = useConvex();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [processedBusinesses, setProcessedBusinesses] = useState<ProcessedBusiness[]>([]);
  const [importProgress, setImportProgress] = useState({ progress: 0, message: '', total: 0, completed: 0 });
  const [isDragOver, setIsDragOver] = useState(false);

  const categories = useQuery(api.categories.getAllCategoriesForAdmin);
  const createImportBatch = useMutation(api.batchImport.createImportBatch);
  const batchImportBusinesses = useMutation(api.batchImport.batchImportBusinesses);
  const updateImportBatch = useMutation(api.batchImport.updateImportBatch);
  // Note: We'll call this directly in the function since it's async

  // Template download handler
  const handleTemplateDownload = (template: typeof TEMPLATES[0]) => {
    const link = document.createElement('a');
    link.href = template.file;
    link.download = template.file.split('/').pop() || `${template.id}-template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Template downloaded",
      description: `${template.name} has been downloaded to your computer`,
    });
  };

  // File upload handlers
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Parse CSV using Papa Parse
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: "CSV parsing errors",
            description: `Found ${results.errors.length} parsing errors. Please check your CSV format.`,
            variant: "destructive",
          });
          return;
        }

        const headers = results.meta.fields || [];
        const data = results.data as CSVRow[];
        
        setCsvHeaders(headers);
        setCsvData(data);
        
        // Auto-detect field mapping
        const detectedMapping = autoDetectFieldMapping(headers);
        setFieldMapping(detectedMapping);
        
        // Analyze column usage
        const columnAnalysis = analyzeColumnUsage(headers, detectedMapping);
        
        setCurrentStep('preview');
        
        toast({
          title: "CSV parsed successfully",
          description: `Found ${data.length} rows, ${columnAnalysis.used} columns mapped, ${columnAnalysis.ignored} columns will be ignored`,
        });
      },
      error: (error) => {
        toast({
          title: "CSV parsing failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }, []);

  // Analyze which columns will be used vs ignored
  const analyzeColumnUsage = (headers: string[], mapping: FieldMapping) => {
    const mappedColumns = new Set(
      Object.values(mapping).filter(value => value && value !== "__none__")
    );
    const used = mappedColumns.size;
    const ignored = headers.length - used;
    
    return {
      used,
      ignored,
      mappedColumns: Array.from(mappedColumns),
      ignoredColumns: headers.filter(header => !mappedColumns.has(header))
    };
  };

  // Auto-detect field mapping
  const autoDetectFieldMapping = (headers: string[]): FieldMapping => {
    const mapping: FieldMapping = {};
    const headerLower = headers.map(h => h.toLowerCase());

    // Field detection patterns
    const patterns = {
      name: ['name', 'business', 'company', 'business_name', 'company_name'],
      address: ['address', 'street', 'street_address', 'location'],
      city: ['city internal', 'city_internal', 'city', 'town', 'municipality'],
      state: ['state', 'province', 'region'],
      zip: ['zip', 'zipcode', 'postal_code', 'postcode'],
      phone: ['phone_standard_format', 'phone', 'telephone', 'phone_number'],
      email: ['email', 'email_address', 'email_from_website'],
      website: ['website', 'url', 'web_address', 'site'],
      category: ['category internal', 'category_internal', 'category', 'type', 'industry', 'keyword'],
      description: ['description', 'about', 'details', 'meta_description'],
      // GMB specific fields
      latitude: ['latitude', 'lat', 'coords_lat'],
      longitude: ['longitude', 'lng', 'lon', 'coords_lng'],
      rating: ['rating', 'average_rating', 'avg_rating', 'stars'],
      reviewCount: ['reviews_count', 'review_count', 'num_reviews', 'reviews'],
      hours: ['hours', 'business_hours', 'operating_hours'],
      placeId: ['place_id', 'placeid', 'google_place_id'],
      gmbUrl: ['gmb_url', 'google_maps_url', 'maps_url'],
      cid: ['cid', 'customer_id', 'citation_id', 'google_customer_id'],
      gmbClaimed: ['claimed_google_my_business', 'gmb_claimed', 'claimed'],
      facebookUrl: ['facebook_url', 'facebook', 'fb_url'],
      linkedinUrl: ['linkedin_url', 'linkedin', 'li_url'],
      twitterUrl: ['twitter_url', 'twitter', 'tw_url'],
      youtubeUrl: ['youtube_url', 'youtube', 'yt_url'],
      instagramUrl: ['instagram_url', 'instagram', 'ig_url'],
      categoryInternal: ['category internal', 'category_internal', 'internal_category'],
      cityInternal: ['city internal', 'city_internal', 'internal_city']
    };

    // Find best matches - prioritize exact matches first, then partial matches
    for (const [field, variations] of Object.entries(patterns)) {
      let foundMatch = false;
      
      // First pass: Look for exact matches
      for (const variation of variations) {
        const exactMatchIndex = headerLower.findIndex(h => h === variation);
        if (exactMatchIndex >= 0) {
          mapping[field] = headers[exactMatchIndex];
          foundMatch = true;
          break;
        }
      }
      
      // Second pass: Look for partial matches if no exact match found
      if (!foundMatch) {
        for (const variation of variations) {
          const partialMatchIndex = headerLower.findIndex(h => h.includes(variation) || variation.includes(h));
          if (partialMatchIndex >= 0) {
            mapping[field] = headers[partialMatchIndex];
            break;
          }
        }
      }
    }

    return mapping;
  };

  // Get existing businesses for duplicate checking
  const getBusinessesForDuplicateCheck = async () => {
    try {
      // Get all businesses with minimal data needed for duplicate checking
      const businesses = await convex.query(api.businesses.getBusinesses, {});
      return businesses || [];
    } catch (error) {
      console.error('Error fetching businesses for duplicate check:', error);
      return [];
    }
  };

  // Check for duplicate against existing businesses
  const checkForDuplicate = (business: any, existingBusinesses: any[]) => {
    // Normalize strings for comparison
    const normalizeName = (name: string) => name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
    const normalizeAddress = (addr: string) => addr.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
    const normalizeCity = (city: string) => city.toLowerCase().trim();

    const businessName = normalizeName(business.name || '');
    const businessAddress = normalizeAddress(business.address || '');
    const businessCity = normalizeCity(business.city || '');
    const businessPhone = business.phone ? business.phone.replace(/\D/g, '').slice(-7) : '';

    for (const existing of existingBusinesses) {
      const existingName = normalizeName(existing.name || '');
      const existingAddress = normalizeAddress(existing.address || '');
      const existingCity = normalizeCity(existing.city || '');
      const existingPhone = existing.phone ? existing.phone.replace(/\D/g, '').slice(-7) : '';

      const nameMatch = businessName === existingName;
      const addressMatch = businessAddress === existingAddress;
      const cityMatch = businessCity === existingCity;
      const phoneMatch = businessPhone && existingPhone && businessPhone === existingPhone;

      // Consider it a duplicate if:
      // 1. Same name AND same address
      // 2. Same name AND same city AND same phone
      if (nameMatch && (addressMatch || (cityMatch && phoneMatch))) {
        return {
          isDuplicate: true,
          reason: addressMatch ? 'Same name and address' : 'Same name, city, and phone',
          existingBusiness: existing
        };
      }
    }

    return { isDuplicate: false };
  };

  // Check for duplicate within the CSV itself
  const checkForCSVDuplicate = (business: any, processedSoFar: ProcessedBusiness[]) => {
    const normalizeName = (name: string) => name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
    const normalizeAddress = (addr: string) => addr.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
    const normalizeCity = (city: string) => city.toLowerCase().trim();

    const businessName = normalizeName(business.name || '');
    const businessAddress = normalizeAddress(business.address || '');
    const businessCity = normalizeCity(business.city || '');
    const businessPhone = business.phone ? business.phone.replace(/\D/g, '').slice(-7) : '';

    for (const processed of processedSoFar) {
      const processedName = normalizeName(processed.data.name || '');
      const processedAddress = normalizeAddress(processed.data.address || '');
      const processedCity = normalizeCity(processed.data.city || '');
      const processedPhone = processed.data.phone ? processed.data.phone.replace(/\D/g, '').slice(-7) : '';

      const nameMatch = businessName === processedName;
      const addressMatch = businessAddress === processedAddress;
      const cityMatch = businessCity === processedCity;
      const phoneMatch = businessPhone && processedPhone && businessPhone === processedPhone;

      if (nameMatch && (addressMatch || (cityMatch && phoneMatch))) {
        return {
          isDuplicate: true,
          reason: addressMatch ? 'Same name and address' : 'Same name, city, and phone',
          rowNumber: processed.originalRow
        };
      }
    }

    return { isDuplicate: false };
  };

  // Validate and process data
  const validateAndProcessData = async () => {
    const processed: ProcessedBusiness[] = [];
    
    // Log column usage for debugging
    const analysis = analyzeColumnUsage(csvHeaders, fieldMapping);
    console.log('Import Column Analysis:', {
      totalColumns: csvHeaders.length,
      mappedColumns: analysis.mappedColumns,
      ignoredColumns: analysis.ignoredColumns,
      fieldMapping: fieldMapping
    });

    // Get existing businesses for duplicate checking
    setImportProgress({ progress: 5, message: 'Checking for duplicates...', total: csvData.length, completed: 0 });
    const existingBusinesses = await getBusinessesForDuplicateCheck();
    
    csvData.forEach((row, index) => {
      const business = extractBusinessData(row, fieldMapping);
      const validation = validateBusinessData(business);
      
      // Check for duplicates against existing businesses
      const duplicateCheck = checkForDuplicate(business, existingBusinesses);
      if (duplicateCheck.isDuplicate) {
        validation.errors.push(`Duplicate business detected: ${duplicateCheck.reason}`);
        validation.warnings.push(`Matches existing business: ${duplicateCheck.existingBusiness?.name}`);
      }

      // Also check for duplicates within the CSV itself
      const csvDuplicateCheck = checkForCSVDuplicate(business, processed);
      if (csvDuplicateCheck.isDuplicate) {
        validation.errors.push(`Duplicate within CSV: ${csvDuplicateCheck.reason}`);
        validation.warnings.push(`Matches row ${csvDuplicateCheck.rowNumber}`);
      }
      
      processed.push({
        originalRow: index + 1,
        data: business,
        validation,
        status: validation.errors.length > 0 ? 'error' : 
                validation.warnings.length > 0 ? 'warning' : 'valid'
      });
    });

    setProcessedBusinesses(processed);
    setImportProgress({ progress: 0, message: '', total: 0, completed: 0 });
    setCurrentStep('validate');
  };

  // Extract business data from CSV row - only processes mapped columns
  const extractBusinessData = (row: CSVRow, mapping: FieldMapping) => {
    // Helper function to safely extract mapped field
    const getFieldValue = (fieldKey: keyof FieldMapping, defaultValue: any = undefined) => {
      const columnName = mapping[fieldKey];
      if (!columnName || columnName === "__none__" || !row.hasOwnProperty(columnName)) {
        return defaultValue;
      }
      return row[columnName] || defaultValue;
    };

    // Core business data - only extract if columns are mapped
    const data: any = {
      name: getFieldValue('name', ''),
      address: getFieldValue('address', ''),
      city: getFieldValue('city', ''),
      state: getFieldValue('state', 'AZ'),
      zip: getFieldValue('zip', ''),
      phone: getFieldValue('phone', ''),
      email: getFieldValue('email', undefined),
      website: getFieldValue('website', undefined),
      category: getFieldValue('category', ''),
      description: getFieldValue('description', '')
    };

    // Add GMB-specific fields if available - only process mapped columns
    const latValue = getFieldValue('latitude');
    if (latValue) {
      data.latitude = parseFloat(latValue) || undefined;
    }
    
    const lngValue = getFieldValue('longitude');
    if (lngValue) {
      data.longitude = parseFloat(lngValue) || undefined;
    }
    
    const ratingValue = getFieldValue('rating');
    if (ratingValue) {
      data.rating = parseFloat(ratingValue) || undefined;
    }
    
    const reviewCountValue = getFieldValue('reviewCount');
    if (reviewCountValue) {
      data.reviewCount = parseInt(reviewCountValue) || 0;
    }

    // String fields - only add if mapped and has value
    const stringFields = [
      'hours', 'placeId', 'gmbUrl', 'facebookUrl', 'linkedinUrl', 
      'twitterUrl', 'youtubeUrl', 'instagramUrl', 'categoryInternal', 'cityInternal'
    ] as const;
    
    stringFields.forEach(field => {
      const value = getFieldValue(field);
      if (value) {
        data[field] = value;
      }
    });

    return data;
  };

  // Validate business data
  const validateBusinessData = (data: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidence = 100;

    // Required field validation
    REQUIRED_FIELDS.forEach(field => {
      if (!data[field] || data[field].trim() === '') {
        errors.push(`Missing required field: ${field}`);
        confidence -= 25;
      }
    });

    // Recommended field validation (warnings only)
    RECOMMENDED_FIELDS.forEach(field => {
      if (!data[field] || data[field].trim() === '') {
        warnings.push(`Missing recommended field: ${field}`);
        confidence -= 10;
      }
    });

    // Data quality checks
    if (data.phone && !data.phone.match(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/)) {
      warnings.push(`Phone number format may be invalid: ${data.phone}`);
      confidence -= 5;
    }

    if (data.email && !data.email.includes('@')) {
      warnings.push(`Email format appears invalid: ${data.email}`);
      confidence -= 5;
    }

    if (data.website && data.website.trim() && !data.website.match(/^https?:\/\//)) {
      warnings.push(`Website should start with http:// or https://`);
      confidence -= 3;
    }

    // GMB field validations
    if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
      warnings.push(`Rating should be between 0 and 5: ${data.rating}`);
      confidence -= 5;
    }

    if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
      warnings.push(`Invalid latitude value: ${data.latitude}`);
      confidence -= 5;
    }

    if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
      warnings.push(`Invalid longitude value: ${data.longitude}`);
      confidence -= 5;
    }

    // Validate social media URLs - only if field has content and isn't empty/whitespace
    const socialUrls = [
      { field: 'facebookUrl', name: 'Facebook' },
      { field: 'linkedinUrl', name: 'LinkedIn' },
      { field: 'twitterUrl', name: 'Twitter' },
      { field: 'youtubeUrl', name: 'YouTube' },
      { field: 'instagramUrl', name: 'Instagram' },
      { field: 'gmbUrl', name: 'Google Maps' }
    ];

    socialUrls.forEach(({ field, name }) => {
      const url = data[field];
      // Only validate if the field has actual content (not empty/whitespace)
      if (url && url.trim() && url.trim() !== '' && !url.trim().match(/^https?:\/\//)) {
        warnings.push(`${name} URL should start with http:// or https://`);
        confidence -= 2;
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      confidence: Math.max(0, confidence)
    };
  };

  // Execute import
  const executeImport = async () => {
    if (!user?.id || !currentUser?._id || !categories) {
      toast({
        title: "Authentication required",
        description: "Please log in to perform imports",
        variant: "destructive",
      });
      return;
    }

    // Only import valid and warning rows, skip error rows
    const validBusinesses = processedBusinesses.filter(b => b.status !== 'error');
    
    if (validBusinesses.length === 0) {
      toast({
        title: "No valid businesses to import",
        description: "Please fix the validation errors and try again",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('import');
    setImportProgress({ progress: 0, message: 'Starting import...', total: validBusinesses.length, completed: 0 });

    let batchId: any = null;

    try {
      console.log('Starting import execution...', {
        validBusinesses: validBusinesses.length,
        fieldMapping,
        user: user?.id
      });

      // Create import batch
      batchId = await createImportBatch({
        importType: "csv_import",
        importedBy: currentUser._id,
        source: "admin_import",
        sourceMetadata: {
          fileName: selectedFile?.name || 'unknown.csv',
          csvType: 'wizard',
          totalRows: validBusinesses.length,
          headers: csvHeaders,
          fieldMapping: fieldMapping,
        },
        businessCount: validBusinesses.length,
        reviewCount: 0,
      });

      console.log('Import batch created:', batchId);

      setImportProgress(prev => ({ ...prev, progress: 10, message: 'Processing businesses...' }));

      // Process businesses in batches of 10
      const batchSize = 10;
      let completed = 0;

      for (let i = 0; i < validBusinesses.length; i += batchSize) {
        try {
          const batch = validBusinesses.slice(i, i + batchSize);
          console.log(`Processing batch ${i / batchSize + 1}, businesses:`, batch.length);
          
          const businesses = batch.map(b => {
            // Extract fields for processing - separate GMB identifiers from excluded fields
            const { 
              category, 
              categoryInternal, 
              cityInternal,
              facebookUrl,
              linkedinUrl,
              twitterUrl,
              youtubeUrl,
              instagramUrl,
              latitude,
              longitude,
              // GMB Identifiers - keep these for business creation
              gmbUrl,
              placeId,
              cid,
              gmbClaimed,
              ...cleanData 
            } = b.data;
            
            // Build socialLinks object from individual URL fields
            const socialLinks: any = {};
            if (facebookUrl) socialLinks.facebook = facebookUrl;
            if (linkedinUrl) socialLinks.linkedin = linkedinUrl;
            if (twitterUrl) socialLinks.twitter = twitterUrl;
            if (youtubeUrl) socialLinks.youtube = youtubeUrl;
            if (instagramUrl) socialLinks.instagram = instagramUrl;
            
            // Build coordinates object from latitude/longitude
            let coordinates = undefined;
            if (latitude && longitude) {
              const lat = parseFloat(latitude);
              const lng = parseFloat(longitude);
              if (!isNaN(lat) && !isNaN(lng)) {
                coordinates = { lat, lng };
              }
            }
            
            return {
              ...cleanData,
              categoryId: findCategoryId(category),
              slug: generateSlug(b.data.name, b.data.city),
              urlPath: generateUrlPath(b.data.name, b.data.city, category),
              services: generateDefaultServices(category),
              hours: generateDefaultHours(),
              coordinates,
              socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
              // GMB Identifiers for future review matching
              placeId: placeId || undefined,
              gmbUrl: gmbUrl || undefined,
              cid: cid || undefined,
              gmbClaimed: gmbClaimed ? (gmbClaimed.toLowerCase() === 'true' || gmbClaimed.toLowerCase() === 'yes' || gmbClaimed === '1') : undefined,
              rating: 0,
              reviewCount: 0,
              // Generate shortDescription from description or use default
              shortDescription: b.data.description 
                ? (b.data.description.length > 150 
                    ? b.data.description.substring(0, 147) + '...' 
                    : b.data.description)
                : `Professional ${category || 'business'} services in ${b.data.city}, Arizona.`
            };
          });

          console.log('Calling batchImportBusinesses with:', { 
            businessCount: businesses.length, 
            batchId,
            importSource: "admin_import"
          });

          await batchImportBusinesses({
            businesses,
            skipDuplicates: true,
            importSource: "admin_import",
            importBatchId: batchId,
            sourceMetadata: {
              fileName: selectedFile?.name || 'unknown.csv',
              totalRows: batch.length,
            },
          });

          completed += batch.length;
          const progress = 10 + (80 * completed / validBusinesses.length);
          setImportProgress({ 
            progress, 
            message: `Imported ${completed}/${validBusinesses.length} businesses...`,
            total: validBusinesses.length,
            completed
          });
        } catch (batchError) {
          console.error('Error processing batch:', batchError);
          // Continue with next batch but log the error
          toast({
            title: "Batch import error",
            description: `Error processing batch ${i / batchSize + 1}: ${batchError instanceof Error ? batchError.message : String(batchError)}`,
            variant: "destructive",
          });
        }
      }

      const duplicateCount = processedBusinesses.filter(b => 
        b.validation.errors.some(error => error.includes('Duplicate'))
      ).length;
      
      const totalErrors = processedBusinesses.filter(b => b.status === 'error').length;
      const skippedDuplicates = duplicateCount;
      const otherErrors = totalErrors - duplicateCount;

      setImportProgress({ 
        progress: 100, 
        message: `Import completed! ${completed} businesses imported successfully. ${skippedDuplicates > 0 ? `${skippedDuplicates} duplicates skipped.` : ''}`,
        total: validBusinesses.length,
        completed
      });

      // Update import batch status to completed
      await updateImportBatch({
        batchId: batchId,
        status: "completed",
        results: {
          created: completed,
          updated: 0,
          failed: otherErrors,
          duplicates: skippedDuplicates
        }
      });
      
      setCurrentStep('complete');

      toast({
        title: "Import completed",
        description: `${completed} businesses imported successfully${skippedDuplicates > 0 ? `, ${skippedDuplicates} duplicates skipped` : ''}`,
      });

    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error('Error details:', {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        fieldMapping,
        validBusinesses: validBusinesses.length
      });
      
      setImportProgress({ 
        progress: 0, 
        message: `Import failed: ${errorMessage}`,
        total: validBusinesses.length,
        completed: 0
      });

      // Update import batch status to failed
      if (batchId) {
        await updateImportBatch({
          batchId: batchId,
          status: "failed",
          errors: [errorMessage]
        });
      }
      
      toast({
        title: "Import failed",
        description: `${errorMessage}. Check console for details.`,
        variant: "destructive",
      });
    }
  };

  // Helper functions
  const findCategoryId = (categoryName: string): string => {
    if (!categories) return '';
    const category = categories.find(c => 
      c.name.toLowerCase().includes(categoryName.toLowerCase()) ||
      categoryName.toLowerCase().includes(c.name.toLowerCase())
    );
    return category?._id || categories[0]?._id || '';
  };

  const generateSlug = (name: string, city: string): string => {
    const baseSlug = `${name}-${city}`.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    // For potential conflicts, we'll let the duplicate detection handle it
    // rather than adding timestamps that defeat deduplication
    return baseSlug;
  };

  const generateUrlPath = (name: string, city: string, category: string): string => {
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    return `/${categorySlug}/${citySlug}/${nameSlug}`;
  };

  const generateDefaultServices = (category: string): string[] => {
    const serviceMap: { [key: string]: string[] } = {
      'cleaning': ['Residential Cleaning', 'Commercial Cleaning', 'Deep Cleaning', 'Move-in/Move-out Cleaning'],
      'hvac': ['AC Installation', 'Heating Repair', 'Duct Cleaning', 'Emergency Service'],
      'landscaping': ['Lawn Maintenance', 'Landscape Design', 'Irrigation', 'Tree Care'],
      'plumbing': ['Leak Repair', 'Drain Cleaning', 'Water Heater', 'Emergency Plumbing'],
      'electrical': ['Electrical Repair', 'Panel Upgrades', 'Lighting', 'Emergency Electrical']
    };

    const categoryLower = category.toLowerCase();
    for (const [key, services] of Object.entries(serviceMap)) {
      if (categoryLower.includes(key)) {
        return services;
      }
    }
    return ['General Services', 'Consultation', 'Repair', 'Installation'];
  };

  const generateDefaultHours = () => ({
    monday: '8:00 AM - 6:00 PM',
    tuesday: '8:00 AM - 6:00 PM',
    wednesday: '8:00 AM - 6:00 PM',
    thursday: '8:00 AM - 6:00 PM',
    friday: '8:00 AM - 6:00 PM',
    saturday: '9:00 AM - 4:00 PM',
    sunday: 'Closed'
  });

  // Drag and drop handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.csv')) {
        handleFileSelect(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please drop a CSV file",
          variant: "destructive",
        });
      }
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  // Navigation helpers
  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const goBack = () => {
    const steps: WizardStep[] = ['upload', 'template', 'preview', 'validate', 'import', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const reset = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setSelectedTemplate('');
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMapping({});
    setProcessedBusinesses([]);
    setImportProgress({ progress: 0, message: '', total: 0, completed: 0 });
  };

  // Render steps
  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Upload Your CSV File</h2>
        <p className="text-muted-foreground">
          Start by uploading your business data CSV file. We support various formats and will help you map the fields.
        </p>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended: Use Our Templates</CardTitle>
          <CardDescription>
            Download a template to ensure 100% compatibility with our import system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {TEMPLATES.map((template) => (
              <Card key={template.id} className="border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Fields: {template.fields.slice(0, 3).join(', ')}
                      {template.fields.length > 3 && ` +${template.fields.length - 3} more`}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleTemplateDownload(template)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Your CSV</CardTitle>
          <CardDescription>
            Drag and drop your CSV file here, or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground">or</p>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleFileSelect(files[0]);
                  }
                }}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" type="button" asChild>
                  <span>
                    <FileText className="h-4 w-4 mr-2" />
                    Browse Files
                  </span>
                </Button>
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Supports CSV files up to 10MB
            </p>
          </div>

          {selectedFile && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="font-medium text-green-800">{selectedFile.name}</p>
                  <p className="text-sm text-green-600">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Preview & Map Fields</h2>
        <p className="text-muted-foreground">
          Review your data and confirm the field mapping. We've auto-detected the most likely matches.
        </p>
      </div>

      {/* Column Usage Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Column Analysis</CardTitle>
          <CardDescription>
            Overview of which columns will be imported vs ignored
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const analysis = analyzeColumnUsage(csvHeaders, fieldMapping);
            return (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-green-600">
                    Will Import ({analysis.used} columns)
                  </h4>
                  <div className="space-y-1">
                    {analysis.mappedColumns.length > 0 ? (
                      analysis.mappedColumns.map((column) => (
                        <Badge key={column} variant="secondary" className="mr-1 mb-1">
                          {column}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No columns mapped yet</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 text-gray-500">
                    Will Ignore ({analysis.ignored} columns)
                  </h4>
                  <div className="space-y-1">
                    {analysis.ignoredColumns.length > 0 ? (
                      analysis.ignoredColumns.map((column) => (
                        <Badge key={column} variant="outline" className="mr-1 mb-1">
                          {column}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">All columns will be used</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Field Mapping */}
      <Card>
        <CardHeader>
          <CardTitle>Field Mapping</CardTitle>
          <CardDescription>
            Map your CSV columns to our business fields. Required fields are marked with *
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { key: 'name', label: 'Business Name*', required: true },
              { key: 'address', label: 'Address', required: false },
              { key: 'city', label: 'City*', required: true },
              { key: 'state', label: 'State', required: false },
              { key: 'zip', label: 'ZIP Code', required: false },
              { key: 'phone', label: 'Phone*', required: true },
              { key: 'email', label: 'Email', required: false },
              { key: 'website', label: 'Website', required: false },
              { key: 'category', label: 'Category*', required: true },
              { key: 'description', label: 'Description', required: false }
            ].map((field) => (
              <div key={field.key}>
                <Label className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Select
                  value={fieldMapping[field.key] || "__none__"}
                  onValueChange={(value) => 
                    setFieldMapping(prev => ({ ...prev, [field.key]: value === "__none__" ? undefined : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {csvHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
          <CardDescription>
            First 5 rows of your CSV data with current field mapping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.slice(0, 5).map((row, index) => {
                  const business = extractBusinessData(row, fieldMapping);
                  return (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{business.name || <span className="text-gray-400">—</span>}</TableCell>
                      <TableCell>{business.city || <span className="text-gray-400">—</span>}</TableCell>
                      <TableCell>{business.phone || <span className="text-gray-400">—</span>}</TableCell>
                      <TableCell>{business.category || <span className="text-gray-400">—</span>}</TableCell>
                      <TableCell>{business.address || <span className="text-gray-400">—</span>}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => validateAndProcessData()}>
          Continue to Validation
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderValidateStep = () => {
    const validCount = processedBusinesses.filter(b => b.status === 'valid').length;
    const warningCount = processedBusinesses.filter(b => b.status === 'warning').length;
    const errorCount = processedBusinesses.filter(b => b.status === 'error').length;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Validation Results</h2>
          <p className="text-muted-foreground">
            Review the validation results for your data. Only valid and warning rows will be imported.
          </p>
        </div>

        {/* Validation Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{validCount}</p>
                  <p className="text-sm text-muted-foreground">Valid Records</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {errorCount > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorCount} rows have errors and will be skipped. Only {validCount + warningCount} rows will be imported.
              {(() => {
                const duplicateCount = processedBusinesses.filter(b => 
                  b.validation.errors.some(error => error.includes('Duplicate'))
                ).length;
                return duplicateCount > 0 ? ` (${duplicateCount} duplicates detected)` : '';
              })()}
            </AlertDescription>
          </Alert>
        )}

        {(() => {
          const duplicateBusinesses = processedBusinesses.filter(b => 
            b.validation.errors.some(error => error.includes('Duplicate'))
          );
          return duplicateBusinesses.length > 0 ? (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <strong>{duplicateBusinesses.length} duplicate(s) found:</strong>
                <ul className="mt-2 space-y-1">
                  {duplicateBusinesses.slice(0, 3).map(business => (
                    <li key={business.originalRow} className="text-sm">
                      • Row {business.originalRow}: {business.data.name} ({business.validation.errors.find(e => e.includes('Duplicate'))})
                    </li>
                  ))}
                  {duplicateBusinesses.length > 3 && (
                    <li className="text-sm text-muted-foreground">
                      ... and {duplicateBusinesses.length - 3} more
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          ) : null;
        })()}

        {/* Validation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Validation Details</CardTitle>
            <CardDescription>
              Detailed validation results for each row
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedBusinesses.map((business) => (
                    <TableRow key={business.originalRow}>
                      <TableCell>{business.originalRow}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            business.status === 'valid' ? 'default' :
                            business.status === 'warning' ? 'secondary' : 'destructive'
                          }
                        >
                          {business.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{business.data.name || '—'}</TableCell>
                      <TableCell>
                        {business.validation.errors.length > 0 && (
                          <div className="text-red-600 text-sm">
                            {business.validation.errors.slice(0, 2).join('; ')}
                            {business.validation.errors.length > 2 && '...'}
                          </div>
                        )}
                        {business.validation.warnings.length > 0 && (
                          <div className="text-yellow-600 text-sm">
                            {business.validation.warnings.slice(0, 2).join('; ')}
                            {business.validation.warnings.length > 2 && '...'}
                          </div>
                        )}
                        {business.validation.errors.length === 0 && business.validation.warnings.length === 0 && (
                          <span className="text-green-600 text-sm">No issues</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {business.validation.confidence}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Preview
          </Button>
          <Button 
            onClick={executeImport}
            disabled={validCount + warningCount === 0}
          >
            Import {validCount + warningCount} Businesses
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderImportStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Importing Your Data</h2>
        <p className="text-muted-foreground">
          Please wait while we import your businesses into the directory
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="space-y-4">
            <RefreshCw className="h-12 w-12 mx-auto animate-spin text-blue-600" />
            <div className="space-y-2">
              <Progress value={importProgress.progress} className="w-full" />
              <p className="text-sm text-muted-foreground">{importProgress.message}</p>
              <p className="text-lg font-medium">
                {importProgress.completed} of {importProgress.total} completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Import Complete!</h2>
        <p className="text-muted-foreground">
          Your businesses have been successfully imported into the directory
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-2xl font-bold text-green-600">{importProgress.completed}</p>
                <p className="text-sm text-muted-foreground">Businesses Imported</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">100%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={reset}>
          Import Another File
        </Button>
        <Button onClick={() => window.location.href = '/admin/businesses'}>
          <Eye className="h-4 w-4 mr-2" />
          View Imported Businesses
        </Button>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Import Wizard</h1>
          <p className="text-muted-foreground">
            Reliable CSV import with validation and error detection
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {[
              { step: 'upload', label: 'Upload', icon: Upload },
              { step: 'preview', label: 'Preview', icon: Eye },
              { step: 'validate', label: 'Validate', icon: CheckCircle },
              { step: 'import', label: 'Import', icon: RefreshCw },
              { step: 'complete', label: 'Complete', icon: CheckCircle }
            ].map((item, index) => {
              const Icon = item.icon;
              const isActive = currentStep === item.step;
              const isCompleted = ['upload', 'preview', 'validate', 'import', 'complete'].indexOf(currentStep) > index;
              
              return (
                <div key={item.step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive ? 'border-blue-600 bg-blue-600 text-white' :
                    isCompleted ? 'border-green-600 bg-green-600 text-white' :
                    'border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`ml-2 text-sm ${
                    isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                  {index < 4 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div>
        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'preview' && renderPreviewStep()}
        {currentStep === 'validate' && renderValidateStep()}
        {currentStep === 'import' && renderImportStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </div>
    </div>
  );
}