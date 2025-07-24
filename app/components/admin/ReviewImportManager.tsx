"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery, useConvex } from "convex/react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  Eye,
  Star,
  MessageSquare,
  User,
  Calendar,
  Building2,
  Download,
  RefreshCw,
  Settings
} from "lucide-react";
import { toast } from "~/hooks/use-toast";
import Papa from 'papaparse';

interface ReviewCSVPreview {
  headers: string[];
  sampleRows: Record<string, any>[];
  totalRows: number;
  businessMatches: BusinessMatch[];
  unmatchedBusinesses: string[];
  fieldMapping?: Record<string, string>;
}

interface BusinessMatch {
  csvBusinessName: string;
  matchedBusiness: {
    _id: string;
    name: string;
    city: string;
    confidence: number;
    planTier?: string;
    currentReviews?: number;
    reviewLimit?: number;
    canAcceptReviews?: boolean;
  } | null;
  possibleMatches: Array<{
    _id: string;
    name: string;
    city: string;
    confidence: number;
    planTier?: string;
    currentReviews?: number;
    reviewLimit?: number;
  }>;
}

interface ReviewImportProgress {
  status: "idle" | "uploading" | "parsing" | "matching" | "importing" | "completed" | "failed";
  progress: number;
  message: string;
  batchId?: string;
  results?: {
    successful: number;
    failed: number;
    skipped: number;
    businessesMatched: number;
    businessesUnmatched: number;
  };
}

export function ReviewImportManager() {
  const { user } = useUser();
  const convex = useConvex();
  const [file, setFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<ReviewCSVPreview | null>(null);
  const [progress, setProgress] = useState<ReviewImportProgress>({ 
    status: "idle", 
    progress: 0, 
    message: "" 
  });
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [importOptions, setImportOptions] = useState({
    source: "admin_import" as "admin_import" | "google" | "yelp" | "manual",
    skipDuplicates: true, // Re-enabled with improved review ID generation
    requireBusinessMatch: true,
    minimumRating: 1,
    includeUnverified: false
  });

  // Get recent review imports
  const reviewBatches = useQuery(api.batchImport.getImportBatches, { 
    limit: 10
  });

  // Get all businesses for matching
  const allBusinesses = useQuery(api.businesses.getBusinesses, { limit: 1000 });
  
  // Get businesses needing reviews for plan validation
  const businessesNeedingReviews = useQuery(api.reviewImport.getBusinessesNeedingReviews, { limit: 1000 });
  
  // Get review import statistics
  const reviewImportStats = useQuery(api.reviewImport.getReviewImportStats);

  // Plan limits configuration
  const REVIEW_LIMITS = {
    free: 100,
    starter: 100,
    pro: 100,
    power: Number.MAX_SAFE_INTEGER // UNLIMITED for Power tier
  };

  // Required fields for review import
  const REQUIRED_FIELDS = {
    reviewId: "Review ID",
    businessName: "Business Name",
    placeId: "Place ID (Optional)",
    rating: "Rating (1-5)",
    comment: "Review Text/Comment",
    userName: "Reviewer Name",
    reviewDate: "Review Date",
    source: "Source Platform"
  };

  // Analyze which columns will be used vs ignored
  const analyzeColumnUsage = (headers: string[], mapping: Record<string, string>) => {
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

  // Auto-detect field mapping based on common column names
  const autoDetectFieldMapping = (headers: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {};
    const headerLower = headers.map(h => h.toLowerCase());
    
    // Field detection patterns
    const patterns = {
      reviewId: ['review_id', 'reviewid', 'id', 'review_identifier', 'identifier', 'review id'],
      businessName: ['business_name', 'business name', 'title', 'name', 'business', 'company'],
      placeId: ['place_id', 'placeid', 'place id', 'google_place_id'],
      rating: ['rating', 'stars', 'star', 'score', 'review_rating'],
      comment: ['comment', 'text', 'review', 'content', 'review_text', 'review_comment', 'description'],
      userName: ['user_name', 'username', 'reviewer_name', 'reviewer', 'name', 'author', 'customer'],
      reviewDate: ['date', 'created_date', 'review_date', 'published_date', 'time', 'created', 'published'],
      source: ['source', 'platform', 'origin', 'from', 'review_source']
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

  // Mutations for review import
  const batchImportReviews = useMutation(api.reviewImport.batchImportReviews);
  const simpleImportReviews = useMutation(api.simpleReviewImport.simpleImportReviews);
  const ultraSimpleImport = useMutation(api.simpleReviewImport2.ultraSimpleImport);
  const importReviewBatch = useMutation(api.reviewImportOptimized.importReviewBatch);
  // const triggerAIAnalysis = useMutation(api.aiReviewAnalysis.triggerBusinessAnalysis);
  
  // Query for duplicate checking (we'll call this manually)
  // const checkDuplicateReviews = useMutation(api.reviewImport.checkDuplicateReviews);

  // String similarity calculation
  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // Removed separate duplicate detection - now handled automatically during import

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setProgress({ status: "parsing", progress: 25, message: "Parsing CSV file..." });

    try {
      // Parse CSV using Papa Parse for proper handling of quoted values and commas
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          if (results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
            setProgress({ status: "failed", progress: 0, message: "Failed to parse CSV file" });
            toast({
              title: "CSV parsing error",
              description: "Please check your CSV format and try again.",
              variant: "destructive",
            });
            return;
          }

          const headers = results.meta.fields || [];
          const allRows = results.data as Record<string, any>[];
          const sampleRows = allRows.slice(0, 5);

          // Extract unique business names for matching (will be updated after field mapping)
          const businessNames = new Set<string>();

          // Auto-detect field mapping
          const detectedMapping = autoDetectFieldMapping(headers);
          console.log(`CSV Headers:`, headers);
          console.log(`Detected field mapping:`, detectedMapping);
          setFieldMapping(detectedMapping);
          
          // Extract unique business names using the detected field mapping
          if (detectedMapping.businessName) {
            allRows.forEach(row => {
              const businessName = row[detectedMapping.businessName!];
              if (businessName && businessName.trim()) {
                businessNames.add(businessName.trim());
              }
            });
            console.log(`Found ${businessNames.size} unique businesses in CSV:`, Array.from(businessNames).slice(0, 10));
          } else {
            console.warn(`No business name field detected in mapping:`, detectedMapping);
          }

          setProgress({ status: "matching", progress: 50, message: "Matching businesses..." });

          // Implement client-side business matching for preview
          const businessMatches: BusinessMatch[] = [];
          
          console.log(`🔍 Pre-matching check:`, {
            allBusinesses: allBusinesses ? allBusinesses.length : 'null/undefined',
            businessNames: businessNames.size,
            businessNamesArray: Array.from(businessNames),
            allBusinessesStatus: allBusinesses === undefined ? 'undefined' : allBusinesses === null ? 'null' : 'loaded'
          });
          
          // Wait for allBusinesses to load before proceeding
          if (!allBusinesses) {
            console.warn(`⚠️ allBusinesses not loaded yet, skipping matching for now`);
            // Set a basic preview without matching for now
            setCsvPreview({
              headers,
              sampleRows,
              totalRows: allRows.length,
              businessMatches: [],
              unmatchedBusinesses: Array.from(businessNames),
              fieldMapping: detectedMapping
            });
            setProgress({ status: "idle", progress: 0, message: "" });
            return;
          }
          
          if (allBusinesses && businessNames.size > 0) {
            console.log(`Matching ${businessNames.size} businesses against ${allBusinesses.length} database businesses`);
            console.log(`First 5 database businesses:`, allBusinesses.slice(0, 5).map(b => ({ name: b.name, placeId: b.placeId })));
            
            for (const businessName of Array.from(businessNames)) {
              try {
                console.log(`\n🔍 Matching business: "${businessName}"`);
                
                // Find a sample row for this business to get Place_ID
                const sampleRow = allRows.find(row => row[detectedMapping.businessName!] === businessName);
                console.log(`🔍 Sample row for "${businessName}":`, sampleRow);
                console.log(`🔍 Place_ID field mapping:`, detectedMapping.placeId);
                
                const placeId = sampleRow ? (sampleRow[detectedMapping.placeId!] || sampleRow.place_id || sampleRow.businessPlaceId) : null;
                
                console.log(`🎯 Place_ID for "${businessName}": ${placeId || 'Not found'}`);
                console.log(`🎯 Available fields in sample row:`, sampleRow ? Object.keys(sampleRow) : 'No sample row');
                
                let matchedBusiness = null;
                
                // Strategy 1: Try Place_ID match first (highest priority - just like backend)
                if (placeId) {
                  matchedBusiness = allBusinesses.find((business: any) => business.placeId === placeId);
                  if (matchedBusiness) {
                    console.log(`✅ PLACE_ID MATCH FOUND: ${matchedBusiness.name}`);
                  } else {
                    console.log(`❌ No Place_ID match found for: ${placeId}`);
                    console.log(`🔍 Available Place_IDs in DB:`, allBusinesses.filter(b => b.placeId).map(b => b.placeId).slice(0, 5));
                  }
                }
                
                // Strategy 2: Fallback to name matching only if no Place_ID match
                const potentialMatches = !matchedBusiness ? (() => {
                  const normalizedSearchName = businessName.toLowerCase().replace(/[^\w\s]/g, '').trim();
                  console.log(`🔍 Falling back to name matching for: "${normalizedSearchName}"`);
                  
                  return allBusinesses
                    .map((business: any) => {
                      const normalizedBusinessName = business.name.toLowerCase().replace(/[^\w\s]/g, '').trim();
                      const similarity = calculateStringSimilarity(normalizedSearchName, normalizedBusinessName);
                      return {
                        business,
                        similarity
                      };
                    })
                    .filter((match: any) => match.similarity > 0.3) // TEMPORARILY LOWERED - Only show matches with >30% similarity
                    .sort((a: any, b: any) => b.similarity - a.similarity)
                    .slice(0, 5); // Top 5 matches
                })() : [];
                
                console.log(`🔍 Best matches for "${businessName}":`, potentialMatches.map(m => ({ name: m.business.name, similarity: m.similarity })));

                // Use Place_ID match if found, otherwise use best name match
                const finalMatch = matchedBusiness || (potentialMatches.length > 0 ? potentialMatches[0].business : null);
                
                // Simplified plan validation - assume all businesses can accept reviews with new higher limits
                const planInfo = {
                  planTier: finalMatch?.planTier || 'free',
                  currentReviews: 0, // We'll get the actual count during import
                  reviewLimit: REVIEW_LIMITS[finalMatch?.planTier as keyof typeof REVIEW_LIMITS] || REVIEW_LIMITS.free,
                  canAcceptReviews: true // With new higher limits (100+), assume all businesses can accept reviews
                };
                console.log(`✅ Simplified plan info for ${finalMatch?.name}:`, planInfo);

                const finalMatchedBusiness = finalMatch ? {
                  _id: finalMatch._id,
                  name: finalMatch.name,
                  city: finalMatch.city,
                  confidence: matchedBusiness ? 100 : (potentialMatches[0] ? Math.round(potentialMatches[0].similarity * 100) : 0),
                  ...planInfo
                } : null;

                const possibleMatches = potentialMatches.map((match: any) => {
                  return {
                    _id: match.business._id,
                    name: match.business.name,
                    city: match.business.city,
                    confidence: Math.round(match.similarity * 100),
                    planTier: match.business.planTier || 'free',
                    currentReviews: 0, // Simplified - will be checked during actual import
                    reviewLimit: REVIEW_LIMITS[match.business.planTier as keyof typeof REVIEW_LIMITS] || REVIEW_LIMITS.free
                  };
                });

                businessMatches.push({
                  csvBusinessName: businessName,
                  matchedBusiness: finalMatchedBusiness,
                  possibleMatches
                });
              } catch (error) {
                console.error(`Error matching business ${businessName}:`, error);
                businessMatches.push({
                  csvBusinessName: businessName,
                  matchedBusiness: null,
                  possibleMatches: []
                });
              }
            }
          } else {
            console.error(`❌ Matching skipped:`, {
              allBusinesses: allBusinesses ? 'exists' : 'null/undefined',
              businessNamesSize: businessNames.size,
              reason: !allBusinesses ? 'allBusinesses is null/undefined' : 
                      businessNames.size === 0 ? 'no business names found' : 'unknown'
            });
          }

          console.log(`Final business matches:`, businessMatches);
          console.log(`Business matches with matchedBusiness:`, businessMatches.filter(m => m.matchedBusiness));
          console.log(`Business matches array details:`, businessMatches.map(m => ({
            csvBusinessName: m.csvBusinessName,
            hasMatchedBusiness: !!m.matchedBusiness,
            matchedBusinessName: m.matchedBusiness?.name,
            confidence: m.matchedBusiness?.confidence,
            canAcceptReviews: m.matchedBusiness?.canAcceptReviews
          })));
          
          // Calculate unmatched businesses (those without successful matches)
          const matchedBusinessNames = new Set(
            businessMatches
              .filter(match => match.matchedBusiness)
              .map(match => match.csvBusinessName)
          );
          const unmatchedBusinessNames = Array.from(businessNames).filter(
            name => !matchedBusinessNames.has(name)
          );

          setCsvPreview({
            headers,
            sampleRows,
            totalRows: allRows.length,
            businessMatches,
            unmatchedBusinesses: unmatchedBusinessNames,
            fieldMapping: detectedMapping
          });

          setProgress({ status: "idle", progress: 0, message: "" });
          
          // Duplicate detection now handled automatically during import

          toast({
            title: "CSV parsed successfully",
            description: `Found ${allRows.length} reviews for ${businessNames.size} businesses.`,
          });
        },
        error: (error) => {
          console.error('Papa Parse error:', error);
          setProgress({ status: "failed", progress: 0, message: "Failed to parse CSV file" });
          toast({
            title: "CSV parsing error",
            description: "Please check your CSV format and try again.",
            variant: "destructive",
          });
        }
      });

    } catch (error) {
      console.error('Error parsing CSV:', error);
      setProgress({ status: "failed", progress: 0, message: "Failed to parse CSV file" });
      toast({
        title: "Error parsing CSV",
        description: "Please check your CSV format and try again.",
        variant: "destructive",
      });
    }
  }, []);

  // Re-run business matching when field mapping changes
  const updateBusinessMatching = useCallback(() => {
    setCsvPreview(prev => {
      if (!prev || !allBusinesses || !fieldMapping.businessName) return prev;

      const businessNames = new Set<string>();
      
      // Extract business names using current field mapping
      prev.sampleRows.forEach(row => {
        const businessName = row[fieldMapping.businessName!];
        if (businessName && businessName.trim()) {
          businessNames.add(businessName.trim());
        }
      });

    // Re-run business matching
    const businessMatches: BusinessMatch[] = [];
    
    for (const businessName of Array.from(businessNames)) {
      try {
        const normalizedSearchName = businessName.toLowerCase().replace(/[^\w\s]/g, '').trim();
        
        // Find potential matches using string similarity
        const potentialMatches = allBusinesses
          .map((business: any) => {
            const normalizedBusinessName = business.name.toLowerCase().replace(/[^\w\s]/g, '').trim();
            const similarity = calculateStringSimilarity(normalizedSearchName, normalizedBusinessName);
            
            return {
              ...business,
              confidence: Math.round(similarity * 100),
              currentReviews: 0, // Simplified - will be checked during actual import
              reviewLimit: REVIEW_LIMITS[business.planTier as keyof typeof REVIEW_LIMITS] || REVIEW_LIMITS.free,
              canAcceptReviews: true // With new higher limits (100+), assume all businesses can accept reviews
            };
          })
          .filter((business: any) => business.confidence > 70)
          .sort((a: any, b: any) => b.confidence - a.confidence);

        const matchedBusiness = potentialMatches.length > 0 ? potentialMatches[0] : null;

        businessMatches.push({
          csvBusinessName: businessName,
          matchedBusiness,
          possibleMatches: potentialMatches.slice(1, 4) // Show up to 3 alternative matches
        });
      } catch (error) {
        console.error(`Error matching business ${businessName}:`, error);
        businessMatches.push({
          csvBusinessName: businessName,
          matchedBusiness: null,
          possibleMatches: []
        });
      }
    }

    // Calculate unmatched businesses (those without successful matches)
    const matchedBusinessNames = new Set(
      businessMatches
        .filter(match => match.matchedBusiness)
        .map(match => match.csvBusinessName)
    );
    const unmatchedBusinessNames = Array.from(businessNames).filter(
      name => !matchedBusinessNames.has(name)
    );

      // Return updated preview
      return {
        ...prev,
        businessMatches,
        unmatchedBusinesses: unmatchedBusinessNames
      };
    });
  }, [allBusinesses, fieldMapping, calculateStringSimilarity]); // Removed csvPreview to prevent circular dependency

  // Update business matching whenever field mapping changes
  useEffect(() => {
    if (csvPreview && allBusinesses) {
      updateBusinessMatching();
    }
  }, [fieldMapping]); // Only run when fieldMapping changes, not updateBusinessMatching

  // Remove the problematic useEffect that was causing infinite re-renders
  // The business matching now happens automatically when the file is selected
  // and allBusinesses is already loaded

  const handleImport = async () => {
    if (!file || !csvPreview || !user) return;

    setProgress({ status: "uploading", progress: 10, message: "Starting review import..." });

    try {
      // Parse CSV data for import using Papa Parse
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            if (results.errors.length > 0) {
              console.error('CSV parsing errors during import:', results.errors);
              setProgress({ status: "failed", progress: 0, message: "Failed to parse CSV file during import" });
              toast({
                title: "Import failed",
                description: "CSV parsing error during import. Please check your file format.",
                variant: "destructive",
              });
              return;
            }

            const allRows = results.data as Record<string, any>[];
            
            // Check if we have any required field mappings
            const requiredFields = ['businessName', 'rating', 'comment', 'userName'];
            const missingFields = requiredFields.filter(field => !fieldMapping[field]);
            
            if (missingFields.length > 0) {
              setProgress({ status: "failed", progress: 0, message: "Missing required field mappings" });
              toast({
                title: "Import failed",
                description: `Missing required field mappings: ${missingFields.join(', ')}`,
                variant: "destructive",
              });
              return;
            }
            
            // Map CSV columns to review data using field mapping
            const reviewData = allRows.map((row, index) => {
              // Use field mapping to extract data
              const getMappedValue = (fieldKey: string) => {
                const mappedHeader = fieldMapping[fieldKey];
                return mappedHeader ? String(row[mappedHeader] || '') : '';
              };
              
              // Use mapped reviewId from CSV, or generate one if not present
              const reviewId = getMappedValue('reviewId') || row.reviewId || row.review_id || 
                `${getMappedValue('businessName') || 'unknown'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`;
              
              return {
                reviewId,
                rating: parseInt(getMappedValue('rating') || '5'),
                comment: getMappedValue('comment') || '',
                userName: getMappedValue('userName') || 'Anonymous',
                businessName: getMappedValue('businessName') || '',
                businessPhone: getMappedValue('businessPhone') || '',
                businessAddress: getMappedValue('businessAddress') || '',
                businessPlaceId: getMappedValue('placeId') || '',
                originalCreateTime: getMappedValue('reviewDate') || '',
                verified: false,
              };
            });

            setProgress({ status: "importing", progress: 30, message: "Processing reviews..." });
            
            console.log('Frontend: Prepared review data sample:', reviewData.slice(0, 3));
            console.log('Frontend: Field mapping used:', fieldMapping);
            
            // Process in batches to handle large imports
            console.log('🚀 Frontend: Starting batched import with reviewData length:', reviewData.length);
            
            const BATCH_SIZE = 500; // Process 500 reviews at a time
            const totalBatches = Math.ceil(reviewData.length / BATCH_SIZE);
            let overallResults = {
              newReviewsAdded: 0,
              existingReviewsSkipped: 0,
              businessNotFound: 0,
              errors: 0,
              errorMessages: [] as string[]
            };
            
            try {
              for (let i = 0; i < totalBatches; i++) {
                const start = i * BATCH_SIZE;
                const end = start + BATCH_SIZE;
                const batch = reviewData.slice(start, end);
                
                console.log(`Processing batch ${i + 1}/${totalBatches}: ${batch.length} reviews`);
                
                setProgress({ 
                  status: "importing", 
                  progress: 30 + ((i / totalBatches) * 60), 
                  message: `Processing batch ${i + 1} of ${totalBatches}...` 
                });

                const batchResult = await importReviewBatch({
                  reviews: batch.map(r => ({
                    reviewId: r.reviewId,
                    rating: r.rating,
                    comment: r.comment,
                    userName: r.userName,
                    businessName: r.businessName,
                    place_id: r.businessPlaceId,
                    businessPlaceId: r.businessPlaceId,
                  })),
                  skipDuplicateCheck: false, // Set to true if you know there are no duplicates for faster processing
                });

                // Accumulate results
                overallResults.newReviewsAdded += batchResult.newReviewsAdded;
                overallResults.existingReviewsSkipped += batchResult.existingReviewsSkipped;
                overallResults.businessNotFound += batchResult.businessNotFound;
                overallResults.errors += batchResult.errors;
                overallResults.errorMessages.push(...batchResult.errorMessages);

                console.log(`Batch ${i + 1} completed:`, batchResult);
                
                // Small delay to prevent overwhelming the system
                if (i < totalBatches - 1) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
              }

              console.log('✅ All batches completed:', overallResults);
              
              setProgress({ 
                status: "completed", 
                progress: 100, 
                message: "Import completed!",
                results: {
                  successful: overallResults.newReviewsAdded,
                  failed: overallResults.errors,
                  skipped: overallResults.existingReviewsSkipped,
                  businessesMatched: reviewData.length - overallResults.businessNotFound,
                  businessesUnmatched: overallResults.businessNotFound
                }
              });

              // Create summary message
              const successMsg = `✅ Added ${overallResults.newReviewsAdded} new reviews`;
              const skipMsg = overallResults.existingReviewsSkipped > 0 ? `\n⏭️ Skipped ${overallResults.existingReviewsSkipped} duplicates` : '';
              const errorMsg = overallResults.errors > 0 ? `\n❌ ${overallResults.errors} errors` : '';
              const unmatched = overallResults.businessNotFound > 0 ? `\n🏢 ${overallResults.businessNotFound} businesses not found` : '';
              
              const description = successMsg + skipMsg + errorMsg + unmatched;

              toast({
                title: overallResults.newReviewsAdded > 0 ? "Import Successful!" : "Import Complete",
                description: description,
              });

            } catch (importError) {
              console.error('Simple import error:', importError);
              setProgress({ status: "failed", progress: 0, message: "Import failed" });
              toast({
                title: "Import failed",
                description: `Import error: ${importError}`,
                variant: "destructive",
              });
              return;
            }

          } catch (error) {
            console.error('Import error within Papa Parse:', error);
            setProgress({ status: "failed", progress: 0, message: "Import processing failed" });
            toast({
              title: "Import failed",
              description: "Failed to process import data. Please check your CSV format and try again.",
              variant: "destructive",
            });
          }
        },
        error: (error) => {
          console.error('Papa Parse error:', error);
          setProgress({ status: "failed", progress: 0, message: "CSV parsing failed" });
          toast({
            title: "Import failed",
            description: "Failed to parse CSV file. Please check your file format.",
            variant: "destructive",
          });
        }
      });

    } catch (error) {
      console.error('Import error:', error);
      setProgress({ status: "failed", progress: 0, message: "Import failed" });
      toast({
        title: "Import failed",
        description: "Please check your CSV format and try again.",
        variant: "destructive",
      });
    }
  };

  const resetImport = () => {
    setFile(null);
    setCsvPreview(null);
    setProgress({ status: "idle", progress: 0, message: "" });
    setFieldMapping({});
  };

  const downloadCSVTemplate = () => {
    const csvContent = [
      'businessName,placeId,rating,comment,userName,reviewDate,source',
      'Phoenix HVAC Services,ChIJN1t_tDeuEmsRUsoyG83frY4,5,"Excellent service! Very professional and fast.",John Smith,2024-01-15,google',
      'Valley Air Conditioning,ChIJN1t_tDeuEmsRUsoyG83frX5,4,"Good work but a bit expensive.",Jane Doe,2024-01-14,yelp',
      'Desert Cooling Solutions,ChIJN1t_tDeuEmsRUsoyG83frZ9,5,"Amazing response time! Fixed our AC in 30 minutes.",Mike Johnson,2024-01-13,facebook'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'review_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: "Generic CSV template has been downloaded to your computer.",
    });
  };

  const downloadPlatformTemplate = (platform: 'gmb' | 'yelp' | 'facebook') => {
    let csvContent: string;
    let filename: string;

    switch (platform) {
      case 'gmb':
        csvContent = [
          'Business_Name,Place_ID,Review_ID,Rating,Review_Text,Reviewer_Name,Created_Date,Owner_Reply',
          'Phoenix HVAC Services,ChIJN1t_tDeuEmsRUsoyG83frY4,12345,5,"Excellent service! Very professional and fast.",John Smith,2024-01-15,Thank you for your review!',
          'Valley Air Conditioning,ChIJN1t_tDeuEmsRUsoyG83frX5,12346,4,"Good work but a bit expensive.",Jane Doe,2024-01-14,',
          'Desert Cooling Solutions,ChIJN1t_tDeuEmsRUsoyG83frZ9,12347,5,"Amazing response time! Fixed our AC in 30 minutes.",Mike Johnson,2024-01-13,'
        ].join('\n');
        filename = 'gmb_reviews_template.csv';
        break;
      
      case 'yelp':
        csvContent = [
          'business_name,place_id,review_id,stars,text,user_name,date',
          'Phoenix HVAC Services,ChIJN1t_tDeuEmsRUsoyG83frY4,abc123,5,"Excellent service! Very professional and fast.",John S.,2024-01-15',
          'Valley Air Conditioning,ChIJN1t_tDeuEmsRUsoyG83frX5,def456,4,"Good work but a bit expensive.",Jane D.,2024-01-14',
          'Desert Cooling Solutions,ChIJN1t_tDeuEmsRUsoyG83frZ9,ghi789,5,"Amazing response time! Fixed our AC in 30 minutes.",Mike J.,2024-01-13'
        ].join('\n');
        filename = 'yelp_reviews_template.csv';
        break;
      
      case 'facebook':
        csvContent = [
          'page_name,place_id,review_id,rating,review_text,reviewer_name,created_time,page_reply',
          'Phoenix HVAC Services,ChIJN1t_tDeuEmsRUsoyG83frY4,fb123,5,"Excellent service! Very professional and fast.",John Smith,2024-01-15T10:30:00Z,Thanks for choosing us!',
          'Valley Air Conditioning,ChIJN1t_tDeuEmsRUsoyG83frX5,fb456,4,"Good work but a bit expensive.",Jane Doe,2024-01-14T14:20:00Z,',
          'Desert Cooling Solutions,ChIJN1t_tDeuEmsRUsoyG83frZ9,fb789,5,"Amazing response time! Fixed our AC in 30 minutes.",Mike Johnson,2024-01-13T09:15:00Z,'
        ].join('\n');
        filename = 'facebook_reviews_template.csv';
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: `${platform.toUpperCase()} CSV template has been downloaded to your computer.`,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Reviews
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Import History
          </TabsTrigger>
          <TabsTrigger value="template" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            CSV Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Review CSV Import
              </CardTitle>
              <CardDescription>
                Import thousands of reviews and automatically match them to existing businesses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress.status === "idle" && !csvPreview && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="csv-file">Select Review CSV File</Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="mt-1"
                    />
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your CSV should contain columns for: businessName, placeId (optional but recommended), rating, comment, userName, reviewDate, and source.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {(progress.status !== "idle" && progress.status !== "completed") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{progress.message}</span>
                    <span className="text-sm text-muted-foreground">{progress.progress}%</span>
                  </div>
                  <Progress value={progress.progress} className="w-full" />
                </div>
              )}

              {csvPreview && progress.status === "idle" && (
                <div className="space-y-4">

                  {/* Column Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Column Analysis</CardTitle>
                      <CardDescription>
                        Overview of which columns will be imported vs ignored
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const analysis = analyzeColumnUsage(csvPreview?.headers || [], fieldMapping);
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
                        Map your CSV columns to our review fields. Required fields are marked with *
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {[
                          { key: 'businessName', label: 'Business Name*', required: true },
                          { key: 'placeId', label: 'Place ID (Optional)', required: false },
                          { key: 'rating', label: 'Rating (1-5)*', required: true },
                          { key: 'comment', label: 'Review Text/Comment*', required: true },
                          { key: 'userName', label: 'Reviewer Name*', required: true },
                          { key: 'reviewDate', label: 'Review Date*', required: true },
                          { key: 'source', label: 'Source Platform', required: false }
                        ].map((field) => (
                          <div key={field.key}>
                            <Label className="text-sm font-medium">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Select
                              value={fieldMapping[field.key] || "__none__"}
                              onValueChange={(value) => 
                                setFieldMapping(prev => {
                                  const newMapping = { ...prev };
                                  if (value === "__none__") {
                                    delete newMapping[field.key];
                                  } else {
                                    newMapping[field.key] = value;
                                  }
                                  return newMapping;
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select column..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">None</SelectItem>
                                {csvPreview?.headers.map((header) => (
                                  <SelectItem key={header} value={header}>
                                    {header}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={() => {
                            const detectedMapping = autoDetectFieldMapping(csvPreview?.headers || []);
                            setFieldMapping(detectedMapping);
                            toast({
                              title: "Auto-detection applied",
                              description: "Field mapping has been automatically detected based on column names.",
                            });
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Auto-Detect Fields
                        </Button>
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
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Comment</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {csvPreview.sampleRows.slice(0, 5).map((row, index) => {
                              // Extract review data using current field mapping - fix data extraction
                              const reviewData = {
                                businessName: fieldMapping.businessName ? String(row[fieldMapping.businessName] || '') : '',
                                rating: fieldMapping.rating ? String(row[fieldMapping.rating] || '') : '',
                                userName: fieldMapping.userName ? String(row[fieldMapping.userName] || '') : '',
                                comment: fieldMapping.comment ? String(row[fieldMapping.comment] || '') : '',
                                reviewDate: fieldMapping.reviewDate ? String(row[fieldMapping.reviewDate] || '') : ''
                              };
                              
                              return (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-sm align-top">{index + 1}</td>
                                  <td className="px-3 py-2 text-sm w-1/3 align-top">
                                    <div className="whitespace-pre-wrap break-words">
                                      {reviewData.comment || <span className="text-gray-400">—</span>}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-sm align-top">{reviewData.businessName || <span className="text-gray-400">—</span>}</td>
                                  <td className="px-3 py-2 text-sm align-top">{reviewData.userName || <span className="text-gray-400">—</span>}</td>
                                  <td className="px-3 py-2 text-sm align-top">{reviewData.rating || <span className="text-gray-400">—</span>}</td>
                                  <td className="px-3 py-2 text-sm align-top">{reviewData.reviewDate || <span className="text-gray-400">—</span>}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Import Preview Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Import Preview
                      </CardTitle>
                      <CardDescription>
                        Ready to import with duplicate detection automatically enabled
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {csvPreview.totalRows}
                          </div>
                          <div className="text-sm text-blue-600">Total Reviews</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {csvPreview.businessMatches.filter(m => m.matchedBusiness).length}
                          </div>
                          <div className="text-sm text-green-600">Business Matches</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {csvPreview.businessMatches.filter(m => m.matchedBusiness?.canAcceptReviews).length}
                          </div>
                          <div className="text-sm text-purple-600">Ready to Import</div>
                        </div>
                      </div>

                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Automatic Duplicate Detection:</strong> During import, the system will automatically:
                          <ul className="mt-2 space-y-1 text-sm">
                            <li>• Skip reviews with exact matching review IDs</li>
                            <li>• Skip reviews with 90%+ similar content from the same reviewer</li>
                            <li>• Prioritize Google Place ID for 100% accurate business matching</li>
                            <li>• Respect plan-based review limits for each business</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  {/* Business Matching Results */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Business Matching Results</h4>
                    <div className="space-y-3">
                      {csvPreview.businessMatches.map((match, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{match.csvBusinessName}</p>
                                <p className="text-sm text-muted-foreground">From CSV</p>
                              </div>
                              {match.matchedBusiness ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  {match.matchedBusiness.confidence}% Match
                                </Badge>
                              ) : (
                                <Badge variant="destructive">No Match</Badge>
                              )}
                            </div>
                            
                            {match.matchedBusiness && (
                              <div className={`p-3 rounded-md ${match.matchedBusiness.canAcceptReviews ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <p className={`text-sm font-medium ${match.matchedBusiness.canAcceptReviews ? 'text-green-800' : 'text-yellow-800'}`}>
                                    Best Match:
                                  </p>
                                  {match.matchedBusiness.planTier && (
                                    <Badge variant="outline" className="text-xs">
                                      {match.matchedBusiness.planTier.toUpperCase()}
                                    </Badge>
                                  )}
                                </div>
                                <p className={`text-sm ${match.matchedBusiness.canAcceptReviews ? 'text-green-700' : 'text-yellow-700'}`}>
                                  {match.matchedBusiness.name} - {match.matchedBusiness.city}
                                </p>
                                {match.matchedBusiness.currentReviews !== undefined && (
                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-gray-600">
                                      Reviews: {match.matchedBusiness.currentReviews}/{match.matchedBusiness.reviewLimit}
                                    </span>
                                    {!match.matchedBusiness.canAcceptReviews && (
                                      <Badge variant="destructive" className="text-xs">
                                        At Limit
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {match.possibleMatches.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">
                                  {match.matchedBusiness ? 'Other Possible Matches:' : 'Possible Matches:'}
                                </p>
                                <div className="space-y-1">
                                  {match.possibleMatches.slice(0, 3).map((possible, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                      <span>{possible.name} - {possible.city}</span>
                                      <Badge variant="outline">{possible.confidence}%</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Import Options */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Import Options</CardTitle>
                      <CardDescription>Configure how reviews are processed during import</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="skip-duplicates" className="text-sm font-medium">Skip duplicates</Label>
                          <p className="text-xs text-muted-foreground">Skip reviews with exact IDs or 90%+ similar content</p>
                        </div>
                        <input
                          id="skip-duplicates"
                          type="checkbox"
                          checked={importOptions.skipDuplicates}
                          onChange={(e) => setImportOptions(prev => ({
                            ...prev,
                            skipDuplicates: e.target.checked
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="require-match" className="text-sm font-medium">Require business match</Label>
                          <p className="text-xs text-muted-foreground">Only import reviews for businesses found in database</p>
                        </div>
                        <input
                          id="require-match"
                          type="checkbox"
                          checked={importOptions.requireBusinessMatch}
                          onChange={(e) => setImportOptions(prev => ({
                            ...prev,
                            requireBusinessMatch: e.target.checked
                          }))}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Plan Limit Warnings */}
                  {csvPreview.businessMatches.some(m => m.matchedBusiness && !m.matchedBusiness.canAcceptReviews) && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Some businesses are at their review limits:</p>
                          {csvPreview.businessMatches
                            .filter(m => m.matchedBusiness && !m.matchedBusiness.canAcceptReviews)
                            .map((match, idx) => (
                              <p key={idx} className="text-sm">
                                • {match.matchedBusiness!.name} ({match.matchedBusiness!.planTier?.toUpperCase()} plan: {match.matchedBusiness!.currentReviews}/{match.matchedBusiness!.reviewLimit} reviews)
                              </p>
                            ))}
                          <p className="text-sm mt-2">These reviews will be skipped during import. Consider upgrading these businesses to higher tiers.</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button onClick={handleImport} className="flex-1">
                      <Upload className="h-4 w-4 mr-2" />
                      Import {csvPreview.totalRows} Reviews
                    </Button>
                    <Button variant="outline" onClick={resetImport}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {progress.status === "completed" && progress.results && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Import completed successfully! {progress.results.successful} reviews imported.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{progress.results.successful}</div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{progress.results.failed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{progress.results.skipped}</div>
                      <div className="text-sm text-muted-foreground">Skipped</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{progress.results.businessesMatched}</div>
                      <div className="text-sm text-muted-foreground">Businesses Matched</div>
                    </div>
                  </div>

                  <Button onClick={resetImport} className="w-full" variant="outline">
                    Import Another File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Import Statistics Overview */}
          {reviewImportStats && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reviewImportStats.totalReviews}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reviewImportStats.averageRating.toFixed(1)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Verified Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reviewImportStats.verifiedReviews}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">With Replies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reviewImportStats.reviewsWithReplies}</div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Review Import History</CardTitle>
              <CardDescription>
                Track your review import batches and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviewBatches?.map((batch) => (
                  <div key={batch._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {batch.status === "completed" && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {batch.status === "failed" && <AlertCircle className="h-5 w-5 text-red-600" />}
                      {batch.status === "pending" && <RefreshCw className="h-5 w-5 text-yellow-600 animate-spin" />}
                      
                      <div>
                        <p className="font-medium">Review Import</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(batch.importedAt).toLocaleDateString()} at {new Date(batch.importedAt).toLocaleTimeString()}
                        </p>
                        {batch.results && (
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {batch.results.created} created
                            </span>
                            {batch.results.failed > 0 && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                {batch.results.failed} failed
                              </span>
                            )}
                            {batch.results.duplicates > 0 && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                {batch.results.duplicates} duplicates
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">{batch.reviewCount || 0} reviews</p>
                      <Badge variant={batch.status === "completed" ? "default" : batch.status === "failed" ? "destructive" : "secondary"}>
                        {batch.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {(!reviewBatches || reviewBatches.length === 0) && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No review imports yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Source Distribution */}
          {reviewImportStats && reviewImportStats.sourceStats && (
            <Card>
              <CardHeader>
                <CardTitle>Reviews by Source</CardTitle>
                <CardDescription>
                  Distribution of imported reviews by platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(reviewImportStats.sourceStats).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="capitalize">{source.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / reviewImportStats.totalReviews) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV Templates for Review Import</CardTitle>
              <CardDescription>
                Download platform-specific templates or a generic template for review imports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Google My Business</h4>
                  <p className="text-sm text-muted-foreground mb-3">Template for GMB review exports</p>
                  <Button className="w-full" variant="outline" onClick={() => downloadPlatformTemplate('gmb')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download GMB Template
                  </Button>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Yelp Reviews</h4>
                  <p className="text-sm text-muted-foreground mb-3">Template for Yelp review data</p>
                  <Button className="w-full" variant="outline" onClick={() => downloadPlatformTemplate('yelp')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Yelp Template
                  </Button>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Generic Format</h4>
                  <p className="text-sm text-muted-foreground mb-3">Universal template for any platform</p>
                  <Button className="w-full" variant="outline" onClick={downloadCSVTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Generic Template
                  </Button>
                </Card>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Required Columns (Generic Format):</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm"><strong>businessName</strong> - Name of the business</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-red-600" />
                    <span className="text-sm"><strong>placeId</strong> - Google Place ID (recommended for accurate matching)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm"><strong>rating</strong> - Rating (1-5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="text-sm"><strong>comment</strong> - Review text</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-600" />
                    <span className="text-sm"><strong>userName</strong> - Reviewer name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm"><strong>reviewDate</strong> - Date of review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm"><strong>source</strong> - Review source (google, yelp, etc.)</span>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Business Matching:</strong> For best results, include the Google Place ID for 100% accurate matching. Business names will be used as fallback with fuzzy matching.</p>
                    <p><strong>Plan Limits:</strong> Each business tier has review limits - Starter: 15, Pro: 40, Power: 100 reviews.</p>
                    <p><strong>AI Analysis:</strong> Imported reviews will be automatically analyzed for sentiment and performance mentions.</p>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}