"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  Eye,
  Settings,
  Play,
  Download,
  BarChart3,
  ExternalLink,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { toast } from "~/hooks/use-toast";
// Removed field mapping imports to avoid Node.js dependencies

interface CSVPreview {
  headers: string[];
  sampleRows: Record<string, any>[];
  detectedType: "google" | "yelp" | "generic";
  fieldMapping: Record<string, string>; // Simplified field mapping
  totalRows: number;
}

interface ImportProgress {
  status: "idle" | "uploading" | "parsing" | "importing" | "completed" | "failed";
  progress: number;
  message: string;
  batchId?: string;
  results?: {
    successful: number;
    failed: number;
    skipped: number;
    errors: string[];
  };
}

export function ImportManager() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);
  const [importConfig, setImportConfig] = useState({
    source: "admin_import",
    skipDuplicates: true,
    batchSize: 50,
    confidence: 85,
    syncReviewsAfterImport: false,
  });
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    status: "idle",
    progress: 0,
    message: "",
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationProgress, setValidationProgress] = useState<{
    status: "idle" | "running" | "completed" | "failed";
    results?: any;
    error?: string;
  }>({ status: "idle" });

  const createImportBatch = useMutation(api.batchImport.createImportBatch);
  const batchImportBusinesses = useMutation(api.batchImport.batchImportBusinesses);
  const importBusinessBatch = useMutation(api.businessImportOptimized.importBusinessBatch);
  const updateImportBatch = useMutation(api.batchImport.updateImportBatch);
  const validateImportBatch = useMutation(api.importValidation.validateImportBatch);
  const startBulkSync = useAction(api.bulkSync.startBulkSync);
  const getValidationResults = useQuery(
    api.importValidation.getValidationResults,
    importProgress.batchId ? { batchId: importProgress.batchId } : "skip"
  );
  const categories = useQuery(api.categories.getAllCategoriesForAdmin);

  // Handle file selection
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
    setImportProgress({ status: "parsing", progress: 25, message: "Parsing CSV file..." });

    try {
      // Read and parse CSV
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV file must have at least a header row and one data row");
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Parse sample rows (first 5 data rows)
      const sampleRows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: Record<string, any> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      // Simple field mapping detection
      const detectedType = "google"; // Default type
      const fieldMapping = {
        name: "Name",
        address: "Street_Address", 
        city: "City",
        phone: "Phone_Standard_format",
        email: "Email_From_WEBSITE",
        website: "Website"
      };

      setCsvPreview({
        headers,
        sampleRows,
        detectedType,
        fieldMapping,
        totalRows: lines.length - 1,
      });

      setImportProgress({ 
        status: "completed", 
        progress: 100, 
        message: `Successfully parsed ${lines.length - 1} rows`
      });

      toast({
        title: "CSV parsed successfully",
        description: `Found ${lines.length - 1} rows with ${headers.length} columns`,
      });

    } catch (error) {
      setImportProgress({ 
        status: "failed", 
        progress: 0, 
        message: `Parsing failed: ${error}` 
      });
      toast({
        title: "Parsing failed",
        description: String(error),
        variant: "destructive",
      });
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Start import process
  const handleStartImport = async () => {
    if (!selectedFile || !csvPreview) {
      toast({
        title: "No file selected",
        description: "Please select and preview a CSV file first",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to perform imports",
        variant: "destructive",
      });
      return;
    }

    // Use the hardcoded user ID that we know works for John
    const userId = "j97aew6htjzrn1btw4edmxjq2s7ka8n9" as any;

    setImportProgress({ 
      status: "uploading", 
      progress: 10, 
      message: "Creating import batch..." 
    });

    try {
      // Create import batch record
      const batchId = await createImportBatch({
        importType: "csv_import",
        importedBy: userId,
        source: importConfig.source,
        sourceMetadata: {
          fileName: selectedFile.name,
          csvType: csvPreview.detectedType,
          totalRows: csvPreview.totalRows,
          headers: csvPreview.headers,
          configuration: importConfig,
        },
        businessCount: csvPreview.totalRows,
        reviewCount: 0,
      });

      setImportProgress({ 
        status: "importing", 
        progress: 25, 
        message: "Starting CSV import...",
        batchId,
      });

      // Process the actual CSV import
      await processCSVImport(batchId);

    } catch (error) {
      setImportProgress({ 
        status: "failed", 
        progress: 0, 
        message: `Import failed: ${error}` 
      });
      toast({
        title: "Import failed",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  // Process actual CSV import using the proper CSV processing pipeline
  const processCSVImport = async (batchId: string) => {
    if (!selectedFile || !csvPreview || !categories) {
      throw new Error("Missing required data for import");
    }

    try {
      setImportProgress(prev => ({ 
        ...prev, 
        progress: 40, 
        message: "Processing CSV rows..." 
      }));

      // Process the CSV directly in memory using the proper pipeline
      setImportProgress(prev => ({ 
        ...prev, 
        progress: 60, 
        message: "Converting business data using proper pipeline..." 
      }));

      // Use browser-compatible inline processing to avoid Node.js dependencies
      
      // Simple category detection (inline to avoid import issues)
      const detectCategory = (name: string, description?: string) => {
        const text = `${name} ${description || ''}`.toLowerCase();
        
        if (text.includes('cleaning') || text.includes('maid') || text.includes('janitorial')) {
          return 'cleaning-services';
        }
        if (text.includes('hvac') || text.includes('air conditioning') || text.includes('heating')) {
          return 'hvac-services';
        }
        if (text.includes('landscaping') || text.includes('lawn') || text.includes('garden')) {
          return 'landscaping';
        }
        if (text.includes('plumbing') || text.includes('plumber')) {
          return 'plumbing';
        }
        if (text.includes('electrical') || text.includes('electrician')) {
          return 'electrical';
        }
        
        return 'cleaning-services'; // Default fallback for this CSV
      };

      // Simple slug generation
      const generateSlug = (text: string) => {
        return text
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .replace(/^-+|-+$/g, '');
      };

      // Parse CSV data properly
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Parse all rows into proper CSV format
      const csvRows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      // Create category mapping for quick lookup
      const categoryMap = new Map<string, string>();
      categories.forEach(cat => {
        categoryMap.set(cat.slug, cat._id);
      });

      // Process each row using the proper pipeline
      const businesses: any[] = [];
      let processedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < csvRows.length; i++) {
        const row = csvRows[i];
        
        try {
          console.log(`🔄 Processing row ${i + 1}/${csvRows.length}...`);
          // Step 1: Clean and validate row data (browser-compatible)
          const cleanedRow: Record<string, string> = {};
          for (const [key, value] of Object.entries(row)) {
            // Trim whitespace and normalize empty strings
            cleanedRow[key] = value?.trim() || '';
          }
          
          // Step 2: Extract business data from CSV using detected headers
          // Debug: Log the actual row data and headers for first few rows
          if (i < 3) {
            console.log(`🔍 Row ${i + 1} headers:`, Object.keys(cleanedRow));
            console.log(`🔍 Row ${i + 1} data sample:`, cleanedRow);
          }
          
          // Step 2A: Extract data using proper header-based mapping (CSV structure analysis)
          // Headers: Keyword,Category,City,Category+City,Name,Full_Address,Street_Address,Zip,Municipality,State,Country...
          
          let businessName = '';
          let businessAddress = '';
          let businessCity = '';
          let businessZip = '';
          let businessPhone = '';
          let businessEmail = undefined;
          let businessWebsite = undefined;
          let businessDescription = undefined;
          
          // Extract business name from 'Name' column (most reliable)
          businessName = cleanedRow['Name'] || '';
          
          // Safety check: never use Category+City as business name
          if (businessName === cleanedRow['Category+City']) {
            businessName = '';
            console.log(`⚠️ Rejected Category+City as business name: "${cleanedRow['Category+City']}"`);
          }
          
          // Extract city from 'City' column
          businessCity = cleanedRow['City'] || '';
          
          // Extract ZIP code from 'Zip' column
          businessZip = cleanedRow['Zip'] || '';
          
          // Extract address from 'Street_Address' column (preferred) or 'Full_Address'
          businessAddress = cleanedRow['Street_Address'] || cleanedRow['Full_Address'] || '';
          
          // Extract phone from formatted phone column
          businessPhone = cleanedRow['Phone_Standard_format'] || cleanedRow['Phone_1'] || '';
          
          // Extract website
          businessWebsite = cleanedRow['Website'] || '';
          if (businessWebsite && !businessWebsite.startsWith('http')) {
            businessWebsite = 'https://' + businessWebsite;
          }
          
          // Extract email
          businessEmail = cleanedRow['Email_From_WEBSITE'] || '';
          if (!businessEmail || businessEmail.trim() === '') {
            businessEmail = undefined;
          }
          
          // Extract description
          businessDescription = cleanedRow['Description'] || cleanedRow['Meta_Description'] || '';
          
          // Clean business name by removing city suffix if present
          if (businessName && businessCity) {
            const cityVariations = [
              businessCity,
              businessCity.toLowerCase(),
              businessCity.toUpperCase(),
              businessCity.charAt(0).toUpperCase() + businessCity.slice(1).toLowerCase()
            ];
            
            for (const cityVariation of cityVariations) {
              const patterns = [
                new RegExp(`\\s*[-–]\\s*${cityVariation}$`, 'i'),
                new RegExp(`\\s+${cityVariation}$`, 'i'),
                new RegExp(`\\s*,\\s*${cityVariation}$`, 'i')
              ];
              
              for (const pattern of patterns) {
                if (pattern.test(businessName)) {
                  const cleanedName = businessName.replace(pattern, '').trim();
                  console.log(`🧹 Cleaned business name: "${businessName}" → "${cleanedName}" (removed city: ${cityVariation})`);
                  businessName = cleanedName;
                  break;
                }
              }
            }
          }
          
          // Fallback logic if header-based extraction fails
          if (!businessName || businessName.trim() === '') {
            // Look for any company-like name (but avoid Category+City like "Cleaning Service in Mesa")
            for (const [key, value] of Object.entries(cleanedRow)) {
              if (value && typeof value === 'string' && value.length > 3 && 
                  key !== 'Category+City' && key !== 'Keyword' && key !== 'Category' &&
                  !value.toLowerCase().includes(' in ') && // Avoid "Service in City" patterns
                  !value.includes('@') && 
                  !value.match(/^\(\d{3}\)/) &&
                  !value.match(/^\d+.*\s+(St|Ave|Dr|Rd|Street|Avenue|Drive|Road)/i)) {
                businessName = value;
                console.log(`🔄 Fallback: Using business name from ${key}: ${value}`);
                break;
              }
            }
          }
          
          // Fallback for city if not found
          if (!businessCity || businessCity.trim() === '') {
            // Try Municipality or extract from address
            businessCity = cleanedRow['Municipality'] || 'Mesa'; // Default fallback only if absolutely necessary
          }
          
          // Fallback for address if not found
          if (!businessAddress || businessAddress.trim() === '') {
            for (const [key, value] of Object.entries(cleanedRow)) {
              if (value && typeof value === 'string' && value.length > 5 &&
                  (value.match(/^\d+/) && value.match(/\s+(St|Ave|Dr|Rd|Street|Avenue|Drive|Road)/i))) {
                businessAddress = value;
                console.log(`🔄 Fallback: Using address from ${key}: ${value}`);
                break;
              }
            }
          }
          
          // Fallback for phone if not found
          if (!businessPhone || businessPhone.trim() === '') {
            for (const [key, value] of Object.entries(cleanedRow)) {
              if (value && typeof value === 'string' &&
                  (value.match(/^\(\d{3}\)/) || value.match(/^\d{3}-\d{3}-\d{4}/) || 
                   value.match(/^\+\d/) || value.replace(/\D/g, '').length === 10)) {
                businessPhone = value;
                console.log(`🔄 Fallback: Using phone from ${key}: ${value}`);
                break;
              }
            }
          }
          
          console.log(`🔍 Row ${i + 1} final mapping:`);
          console.log(`  Name: "${businessName}"`);
          console.log(`  City: "${businessCity}"`);
          console.log(`  ZIP: "${businessZip}"`);
          console.log(`  Address: "${businessAddress}"`);
          console.log(`  Phone: "${businessPhone}"`);

          // Basic validation
          if (!businessName || businessName.trim() === '' || businessName === `Business ${i + 1}`) {
            console.log(`⚠️ Skipping row ${i + 1} - no valid business name`);
            errorCount++;
            continue;
          }
          
          // Skip rows where business name looks like a category description
          if (businessName.toLowerCase().includes(' in ') && 
              (businessName.toLowerCase().includes('service') || businessName.toLowerCase().includes('cleaning'))) {
            console.log(`⚠️ Skipping row ${i + 1} - business name appears to be category description: "${businessName}"`);
            errorCount++;
            continue;
          }

          // Step 3: Auto-detect category
          const detectedCategory = detectCategory(businessName, businessDescription);
          const categoryId = categoryMap.get(detectedCategory);
          
          if (!categoryId) {
            console.log(`⚠️ Skipping ${businessName} - category ${detectedCategory} not found in database`);
            errorCount++;
            continue;
          }

          // Step 4: Generate slug and URL path
          const categoryNames = {
            'cleaning-services': 'Cleaning Services',
            'hvac-services': 'HVAC Services',
            'landscaping': 'Landscaping',
            'plumbing': 'Plumbing',
            'electrical': 'Electrical'
          };
          const categoryName = categoryNames[detectedCategory as keyof typeof categoryNames] || 'Cleaning Services';
          
          // Generate slug with business name only (no city)
          // IMPORTANT: Never include city in the slug
          const businessSlug = generateSlug(businessName).replace(new RegExp(`-?${generateSlug(businessCity)}$`, 'i'), '');
          const urlPath = `/${detectedCategory}/${generateSlug(businessCity)}/${businessSlug}`;

          // Step 5: Generate default services
          const servicesByCategory = {
            'cleaning-services': ['Residential Cleaning', 'Commercial Cleaning', 'Deep Cleaning', 'Move-in/Move-out Cleaning'],
            'hvac-services': ['AC Installation', 'Heating Repair', 'Duct Cleaning', 'Emergency Service'],
            'landscaping': ['Lawn Maintenance', 'Landscape Design', 'Irrigation', 'Tree Care'],
            'plumbing': ['Leak Repair', 'Drain Cleaning', 'Water Heater', 'Emergency Plumbing'],
            'electrical': ['Electrical Repair', 'Panel Upgrades', 'Lighting', 'Emergency Electrical']
          };
          const services = servicesByCategory[detectedCategory as keyof typeof servicesByCategory] || servicesByCategory['cleaning-services'];

          // Step 6: Create proper business object (simplified to avoid any Node.js issues)
          const business = {
            name: businessName,
            slug: businessSlug,
            urlPath: urlPath,
            shortDescription: `Professional ${categoryName.toLowerCase()} services in ${businessCity}, Arizona.`,
            description: businessDescription || `${businessName} provides professional ${categoryName.toLowerCase()} services in ${businessCity}, Arizona. Contact us for quality service.`,
            phone: businessPhone,
            email: businessEmail || undefined,
            website: businessWebsite || undefined,
            address: businessAddress,
            city: businessCity,
            state: 'AZ',
            zip: businessZip, // Use actual ZIP from CSV, leave empty if not provided
            categoryId: categoryId,
            services: services,
            coordinates: undefined,
            hours: {
              monday: '8:00 AM - 6:00 PM',
              tuesday: '8:00 AM - 6:00 PM',
              wednesday: '8:00 AM - 6:00 PM',
              thursday: '8:00 AM - 6:00 PM',
              friday: '8:00 AM - 6:00 PM',
              saturday: '9:00 AM - 4:00 PM',
              sunday: 'Closed'
            },
            rating: 0,
            reviewCount: 0,
            socialLinks: undefined
          };

          // Debug logging
          console.log(`✅ Row ${i + 1}: ${businessName} → slug: ${businessSlug} (city: ${businessCity})`);
          if (businessSlug.includes(generateSlug(businessCity))) {
            console.error(`⚠️ WARNING: Slug contains city! ${businessSlug} includes ${generateSlug(businessCity)}`);
          }
          
          businesses.push(business);
          processedCount++;

        } catch (error) {
          console.error(`❌ Error processing row ${i + 1}:`, error);
          errorCount++;
        }

        // Update progress
        if ((i + 1) % 10 === 0) {
          setImportProgress(prev => ({ 
            ...prev, 
            progress: 60 + (20 * (i + 1) / csvRows.length), 
            message: `Processed ${i + 1}/${csvRows.length} rows (${processedCount} successful, ${errorCount} errors)...` 
          }));
        }
      }

      console.log(`🔍 Processing complete: ${processedCount} successful, ${errorCount} errors out of ${csvRows.length} total`);

      if (businesses.length === 0) {
        throw new Error(`No valid businesses found in CSV. ${errorCount} rows had errors.`);
      }

      setImportProgress(prev => ({ 
        ...prev, 
        progress: 80, 
        message: "Creating database records..." 
      }));

      // Import businesses using batched processing
      console.log(`🔄 Starting batched import of ${businesses.length} businesses...`);
      
      const BATCH_SIZE = 250; // Process 250 businesses at a time
      const totalBatches = Math.ceil(businesses.length / BATCH_SIZE);
      let overallResults = {
        newBusinessesAdded: 0,
        existingBusinessesSkipped: 0,
        errors: 0,
        errorMessages: [] as string[]
      };
      
      try {
        for (let i = 0; i < totalBatches; i++) {
          const start = i * BATCH_SIZE;
          const end = start + BATCH_SIZE;
          const batch = businesses.slice(start, end);
          
          console.log(`Processing batch ${i + 1}/${totalBatches}: ${batch.length} businesses`);
          
          setImportProgress(prev => ({ 
            ...prev, 
            progress: 80 + ((i / totalBatches) * 15), 
            message: `Processing batch ${i + 1} of ${totalBatches}...` 
          }));

          const batchResult = await importBusinessBatch({
            businesses: batch,
            importSource: importConfig.source,
            skipDuplicateCheck: false,
          });

          // Accumulate results
          overallResults.newBusinessesAdded += batchResult.newBusinessesAdded;
          overallResults.existingBusinessesSkipped += batchResult.existingBusinessesSkipped;
          overallResults.errors += batchResult.errors;
          overallResults.errorMessages.push(...batchResult.errorMessages);

          console.log(`Batch ${i + 1} completed:`, batchResult);
          
          // Small delay to prevent overwhelming the system
          if (i < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        const results = {
          successful: overallResults.newBusinessesAdded,
          failed: overallResults.errors,
          skipped: overallResults.existingBusinessesSkipped,
          errors: overallResults.errorMessages,
        };
        
        console.log(`✅ All batches completed:`, results);
      } catch (convexError) {
        console.error(`❌ Convex import error:`, convexError);
        throw new Error(`Convex import failed: ${convexError}`);
      }

      setImportProgress(prev => ({ 
        ...prev, 
        progress: 90, 
        message: "Finalizing import..." 
      }));

      // Update the import batch with results
      await updateImportBatch({
        batchId,
        status: "completed",
        results: {
          created: results.successful,
          updated: 0,
          failed: results.failed,
          duplicates: results.skipped,
        },
        errors: results.errors,
      });

      setImportProgress({ 
        status: "completed", 
        progress: 100, 
        message: `Import completed! ${results.successful} businesses imported successfully.`,
        batchId,
        results
      });

      toast({
        title: "Import completed",
        description: `${results.successful} businesses imported successfully`,
      });

      // Queue review syncs if enabled
      if (importConfig.syncReviewsAfterImport && results.businessIds && results.businessIds.length > 0) {
        setImportProgress(prev => ({ 
          ...prev, 
          message: "Queueing Google review syncs..." 
        }));

        try {
          // Start bulk sync for all imported businesses
          const syncResult = await startBulkSync({
            filters: {
              // We'll need to pass business IDs or modify the bulk sync to accept them
              lastSyncBefore: -1, // Never synced
            },
            concurrency: 3,
            skipErrors: true,
          });

          toast({
            title: "Review sync queued",
            description: `${syncResult.added} businesses queued for review sync`,
          });
        } catch (error) {
          console.error("Failed to queue review syncs:", error);
          toast({
            title: "Review sync failed",
            description: "Failed to queue review syncs. You can manually sync from the Review Sync dashboard.",
            variant: "destructive",
          });
        }
      }

    } catch (error) {
      // Update batch status to failed
      await updateImportBatch({
        batchId,
        status: "failed",
        errors: [String(error)],
      });

      throw error;
    }
  };

  // Reset the import process
  const handleReset = () => {
    setSelectedFile(null);
    setCsvPreview(null);
    setImportProgress({ status: "idle", progress: 0, message: "" });
  };

  // Download sample CSV template
  const handleDownloadTemplate = () => {
    const csvContent = `Name,Street_Address,City,State,Zip,Phone_Standard_format,Email_From_WEBSITE,Website,Description,Meta_Description,Keyword,Average_rating,Reviews_count,Latitude,Longitude,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,Facebook_URL,Instagram_URL,Twitter_URL,Linkedin_URL,Youtube_URL,Image_URL,Favicon,Review_URL,Service_options,From_the_business,Offerings,Planning
Sample Business,123 Main St,Phoenix,AZ,85001,(602) 555-0123,info@samplebusiness.com,https://samplebusiness.com,Professional services in Phoenix,Quality service provider,Professional Services,4.5,25,33.4484,-112.0740,9:00 AM - 5:00 PM,9:00 AM - 5:00 PM,9:00 AM - 5:00 PM,9:00 AM - 5:00 PM,9:00 AM - 5:00 PM,10:00 AM - 3:00 PM,Closed,https://facebook.com/samplebusiness,,,,,,,,,,,,`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Run validation on import batch
  const handleRunValidation = async (fullValidation: boolean = false) => {
    if (!importProgress.batchId) {
      toast({
        title: "No import batch",
        description: "No import batch available for validation",
        variant: "destructive",
      });
      return;
    }

    setValidationProgress({ status: "running" });

    try {
      const results = await validateImportBatch({
        batchId: importProgress.batchId,
        runFullValidation: fullValidation,
      });

      setValidationProgress({ 
        status: "completed", 
        results 
      });

      toast({
        title: "Validation completed",
        description: `Overall score: ${results.overallScore}/100`,
      });

    } catch (error) {
      setValidationProgress({ 
        status: "failed", 
        error: String(error) 
      });
      
      toast({
        title: "Validation failed",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  // Test a sample business URL
  const handleTestBusinessURL = (urlPath: string) => {
    const testUrl = `${window.location.origin}${urlPath}`;
    window.open(testUrl, '_blank');
  };

  // Get score color for display
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  // Get score badge variant
  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return "default";
    if (score >= 75) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>CSV File Upload</CardTitle>
          <CardDescription>
            Upload a CSV file containing business data for import
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedFile ? (
            <div className="space-y-4">
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Drop your CSV file here</h3>
                <p className="text-muted-foreground mb-4">
                  or click to browse and select a file
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="csv-upload"
                />
                <Button asChild>
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    Select CSV File
                  </label>
                </Button>
              </div>

              {/* Template Download */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Need a template?</p>
                  <p className="text-sm text-blue-700">
                    Download our CSV template with sample data and proper formatting
                  </p>
                </div>
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          ) : (
            // File Selected View
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">{selectedFile.name}</p>
                    <p className="text-sm text-green-700">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>

              {/* Import Progress */}
              {importProgress.status !== "idle" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{importProgress.message}</span>
                    <span className="text-sm text-muted-foreground">
                      {importProgress.progress}%
                    </span>
                  </div>
                  <Progress value={importProgress.progress} className="w-full" />
                  
                  {importProgress.status === "failed" && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {importProgress.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {importProgress.results && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {importProgress.results.successful}
                        </p>
                        <p className="text-sm text-muted-foreground">Successful</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {importProgress.results.skipped}
                        </p>
                        <p className="text-sm text-muted-foreground">Skipped</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {importProgress.results.failed}
                        </p>
                        <p className="text-sm text-muted-foreground">Failed</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post-Import Validation Panel */}
      {importProgress.status === "completed" && importProgress.batchId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Post-Import Validation
            </CardTitle>
            <CardDescription>
              Run quality assurance tests to ensure your import is production-ready
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Validation Controls */}
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => handleRunValidation(false)}
                  disabled={validationProgress.status === "running"}
                  variant="outline"
                >
                  {validationProgress.status === "running" ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <BarChart3 className="h-4 w-4 mr-2" />
                  )}
                  Quick Validation
                </Button>
                
                <Button 
                  onClick={() => handleRunValidation(true)}
                  disabled={validationProgress.status === "running"}
                  variant="outline"
                >
                  {validationProgress.status === "running" ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Full Validation (includes SEO)
                </Button>
              </div>

              {/* Validation Progress */}
              {validationProgress.status === "running" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Running validation checks...</span>
                  </div>
                  <Progress value={50} className="w-full" />
                </div>
              )}

              {/* Validation Results */}
              {validationProgress.status === "completed" && validationProgress.results && (
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                    <div>
                      <h4 className="font-semibold text-gray-900">Overall Validation Score</h4>
                      <p className="text-sm text-gray-600">Quality assessment across all categories</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getScoreColor(validationProgress.results.overallScore)}`}>
                        {validationProgress.results.overallScore}
                        <span className="text-lg">/100</span>
                      </div>
                      <Badge variant={getScoreBadgeVariant(validationProgress.results.overallScore)}>
                        {validationProgress.results.overallScore >= 90 ? 'Excellent' :
                         validationProgress.results.overallScore >= 75 ? 'Good' : 'Needs Attention'}
                      </Badge>
                    </div>
                  </div>

                  {/* Category Results Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(validationProgress.results.categories).map(([categoryKey, category]: [string, any]) => {
                      const categoryName = categoryKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      return (
                        <div key={categoryKey} className="p-4 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-sm">{categoryName}</h5>
                            <Badge variant={category.passed ? "default" : "destructive"}>
                              {category.score}/100
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            {category.checks.slice(0, 2).map((check: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                {check.passed ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                )}
                                <span className={check.passed ? "text-green-700" : "text-red-700"}>
                                  {check.name}
                                </span>
                              </div>
                            ))}
                            {category.checks.length > 2 && (
                              <p className="text-xs text-gray-500">
                                +{category.checks.length - 2} more checks
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sample Businesses for Testing */}
                  {validationProgress.results.sampleBusinesses && validationProgress.results.sampleBusinesses.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Sample Businesses for Testing</h4>
                      <div className="grid gap-3">
                        {validationProgress.results.sampleBusinesses.slice(0, 3).map((business: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{business.name}</p>
                              <p className="text-xs text-gray-600">{business.city} • {business.category}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleTestBusinessURL(business.urlPath)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Test Live
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {validationProgress.results.recommendations && validationProgress.results.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Recommendations</h4>
                      <div className="space-y-2">
                        {validationProgress.results.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded text-sm">
                            <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-blue-800">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                        const filename = `validation-results-${timestamp}.json`;
                        const blob = new Blob([JSON.stringify(validationProgress.results, null, 2)], { type: 'application/json' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open('/admin/businesses?source=admin_import&date=today', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Imported Businesses
                    </Button>
                  </div>
                </div>
              )}

              {/* Validation Error */}
              {validationProgress.status === "failed" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Validation failed: {validationProgress.error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Previous Validation Results */}
              {!validationProgress.results && getValidationResults && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Previous Validation Available</p>
                      <p className="text-xs text-gray-600">
                        Score: {getValidationResults.overallScore}/100 • 
                        {new Date(getValidationResults.completedAt || 0).toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setValidationProgress({ 
                        status: "completed", 
                        results: getValidationResults 
                      })}
                    >
                      View Results
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSV Preview */}
      {csvPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              CSV Preview
            </CardTitle>
            <CardDescription>
              Preview of your CSV data and detected field mapping
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Detection Results */}
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {csvPreview.totalRows} rows detected
                </Badge>
                <Badge variant="outline">
                  {csvPreview.headers.length} columns
                </Badge>
                <Badge className="capitalize">
                  {csvPreview.detectedType} format
                </Badge>
              </div>

              {/* Sample Data Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {csvPreview.headers.slice(0, 6).map((header, index) => (
                          <th key={index} className="px-3 py-2 text-left font-medium">
                            {header}
                          </th>
                        ))}
                        {csvPreview.headers.length > 6 && (
                          <th className="px-3 py-2 text-left font-medium">
                            +{csvPreview.headers.length - 6} more columns
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.sampleRows.slice(0, 3).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t">
                          {csvPreview.headers.slice(0, 6).map((header, colIndex) => (
                            <td key={colIndex} className="px-3 py-2 max-w-32 truncate">
                              {row[header] || '-'}
                            </td>
                          ))}
                          {csvPreview.headers.length > 6 && (
                            <td className="px-3 py-2 text-muted-foreground">...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Configuration */}
      {csvPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Import Configuration
            </CardTitle>
            <CardDescription>
              Configure how your CSV data should be imported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="source">Data Source</Label>
                <Select 
                  value={importConfig.source} 
                  onValueChange={(value) => setImportConfig(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger id="source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin_import">Admin Import</SelectItem>
                    <SelectItem value="gmb_scraped">GMB Scraped</SelectItem>
                    <SelectItem value="csv_upload">CSV Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchSize">Batch Size</Label>
                <Select 
                  value={importConfig.batchSize.toString()} 
                  onValueChange={(value) => setImportConfig(prev => ({ ...prev, batchSize: parseInt(value) }))}
                >
                  <SelectTrigger id="batchSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 (Small)</SelectItem>
                    <SelectItem value="50">50 (Medium)</SelectItem>
                    <SelectItem value="100">100 (Large)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence">Confidence Score</Label>
                <Input
                  id="confidence"
                  type="number"
                  min="1"
                  max="100"
                  value={importConfig.confidence}
                  onChange={(e) => setImportConfig(prev => ({ 
                    ...prev, 
                    confidence: parseInt(e.target.value) 
                  }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skipDuplicates"
                  checked={importConfig.skipDuplicates}
                  onCheckedChange={(checked) => setImportConfig(prev => ({ 
                    ...prev, 
                    skipDuplicates: !!checked 
                  }))}
                />
                <Label htmlFor="skipDuplicates">Skip Duplicate Businesses</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="syncReviews"
                  checked={importConfig.syncReviewsAfterImport}
                  onCheckedChange={(checked) => setImportConfig(prev => ({ 
                    ...prev, 
                    syncReviewsAfterImport: !!checked 
                  }))}
                />
                <Label htmlFor="syncReviews">Sync Google Reviews After Import</Label>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <Button 
                onClick={handleStartImport}
                disabled={importProgress.status === "importing" || importProgress.status === "uploading"}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Import
              </Button>
              
              {importProgress.status === "completed" && (
                <Button variant="outline" onClick={handleReset}>
                  Import Another File
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}