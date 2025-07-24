"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "~/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Building, Search, Eye, Edit, Trash2, CheckCircle, XCircle, Star, StarOff, Plus, ChevronDown, Trash, Settings, MoreHorizontal, Download, Copy, Database, RefreshCw, Clock, AlertCircle, Brain, Sparkles } from "lucide-react";
import { toast } from "~/hooks/use-toast";
import { Link, useNavigate } from "react-router";
import { SlugGenerator } from "~/utils/slug-generator";

export default function AdminBusinesses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "starter" | "pro" | "power">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "unverified">("all");
  const [reviewCountFilter, setReviewCountFilter] = useState<"all" | "none" | "few" | "moderate" | "many" | "lots">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [zipcodeFilter, setZipcodeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "gmb_api" | "admin_import" | "user_manual" | "system">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  
  // Bulk selection state
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<Id<"businesses">>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // Column visibility state - check localStorage for saved preferences
  const savedColumns = typeof window !== 'undefined' ? localStorage.getItem('adminBusinessColumns') : null;
  const defaultColumns = {
    business: true,
    category: true,
    city: true,
    zip: true,
    plan: true,
    reviews: true,
    verification: true,
    dataSource: true,
    placeId: true, // Add place_id column
    reviewSync: true, // Add review sync column
    aiInsights: true, // Add AI insights column
    status: true,
    featured: true,
  };
  
  // Parse saved columns and ensure all default columns are present
  let initialColumns = defaultColumns;
  if (savedColumns) {
    try {
      const parsed = JSON.parse(savedColumns);
      // Merge with defaults to ensure new columns are included
      initialColumns = { ...defaultColumns };
      // Only override with saved values for columns that exist in saved data
      Object.keys(defaultColumns).forEach(key => {
        if (key in parsed) {
          initialColumns[key] = parsed[key];
        }
      });
    } catch (e) {
      console.error('Failed to parse saved columns:', e);
    }
  }
  
  const [visibleColumns, setVisibleColumns] = useState(initialColumns);

  // Debounce search to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // Get filter options
  const categories = useQuery(api.categories.getAllCategoriesForAdmin);
  const cities = useQuery(api.businesses.getUniqueCities);
  const zipcodes = useQuery(api.businesses.getUniqueZipcodes);

  // Get businesses for admin view - reduced limit due to memory constraints
  const businesses = useQuery(api.businesses.getBusinessesForAdmin, {
    search: debouncedSearch || undefined,
    planTier: planFilter === "all" ? undefined : planFilter,
    active: statusFilter === "all" ? undefined : statusFilter === "active",
    verificationStatus: verificationFilter === "all" ? undefined : verificationFilter,
    reviewCountFilter: reviewCountFilter === "all" ? undefined : reviewCountFilter,
    city: cityFilter === "all" ? undefined : cityFilter,
    zipcode: zipcodeFilter === "all" ? undefined : zipcodeFilter,
    categoryId: categoryFilter === "all" ? undefined : categoryFilter as Id<"categories">,
    dataSource: sourceFilter === "all" ? undefined : sourceFilter,
    createdAfter: dateFilter === "all" ? undefined : 
      dateFilter === "today" ? Date.now() - (24 * 60 * 60 * 1000) :
      dateFilter === "week" ? Date.now() - (7 * 24 * 60 * 60 * 1000) :
      dateFilter === "month" ? Date.now() - (30 * 24 * 60 * 60 * 1000) : undefined,
    limit: 25, // Reduced from 100 to 25 for memory efficiency
  });

  const updateBusinessStatus = useMutation(api.businesses.updateBusinessStatus);
  const updateBusiness = useMutation(api.businesses.updateBusiness);
  const deleteBusiness = useMutation(api.businesses.deleteBusiness);
  const deleteMultipleBusinesses = useMutation(api.businesses.deleteMultipleBusinesses);
  const syncBusinessReviews = useAction(api.reviewSync.syncBusinessReviews);
  const bulkAddToQueue = useMutation(api.geoScraperQueue.bulkAddToQueue);
  const processQueue = useAction(api.geoScraperProcessor.processQueue);
  const processBusinessReviews = useAction(api.aiAnalysisIntegration.processBusinessReviews);

  // Column visibility toggle
  const toggleColumn = (columnKey: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => {
      const newColumns = {
        ...prev,
        [columnKey]: !prev[columnKey]
      };
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminBusinessColumns', JSON.stringify(newColumns));
      }
      return newColumns;
    });
  };

  const handleStatusToggle = async (businessId: Id<"businesses">, currentStatus: boolean) => {
    try {
      await updateBusinessStatus({
        businessId,
        action: currentStatus ? "deactivate" : "activate",
      });
      // Success - no toast notification needed
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business status",
        variant: "destructive",
      });
    }
  };

  const handleFeatureToggle = async (businessId: Id<"businesses">, currentFeatured: boolean) => {
    try {
      await updateBusinessStatus({
        businessId,
        action: currentFeatured ? "unfeature" : "feature",
      });
      // Success - no toast notification needed
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  const handlePlanChange = async (businessId: Id<"businesses">, newPlan: string) => {
    try {
      await updateBusiness({
        businessId,
        updates: {
          planTier: newPlan,
        },
      });
      // Success - no toast notification needed
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plan",
        variant: "destructive",
      });
    }
  };

  const handleVerificationToggle = async (businessId: Id<"businesses">, currentlyVerified: boolean) => {
    try {
      await updateBusinessStatus({
        businessId,
        action: currentlyVerified ? "unverify" : "verify",
      });
      // Success - no toast notification needed
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBusiness = async (businessId: Id<"businesses">, businessName: string) => {
    if (!confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone and will remove the business listing page.`)) {
      return;
    }
    
    try {
      await deleteBusiness({ businessId });
      // Success - no toast notification needed
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete business",
        variant: "destructive",
      });
    }
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBusinesses(new Set());
      setIsAllSelected(false);
    } else {
      const allIds = new Set(businesses?.map(b => b._id) || []);
      setSelectedBusinesses(allIds);
      setIsAllSelected(true);
    }
  };

  const handleSelectBusiness = (businessId: Id<"businesses">) => {
    const newSelection = new Set(selectedBusinesses);
    if (newSelection.has(businessId)) {
      newSelection.delete(businessId);
    } else {
      newSelection.add(businessId);
    }
    setSelectedBusinesses(newSelection);
    setIsAllSelected(newSelection.size === businesses?.length);
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedBusinesses.size === 0) return;
    
    const selectedCount = selectedBusinesses.size;
    if (!confirm(`Are you sure you want to delete ${selectedCount} businesses? This action cannot be undone and will remove their listing pages.`)) {
      return;
    }
    
    try {
      const result = await deleteMultipleBusinesses({ businessIds: Array.from(selectedBusinesses) });
      setSelectedBusinesses(new Set());
      setIsAllSelected(false);
      
      // Check if any deletions failed
      if (result && result.results) {
        const failedCount = result.results.filter(r => !r.success).length;
        if (failedCount > 0) {
          toast({
            title: "Partial deletion completed",
            description: `${result.successCount} businesses deleted, ${failedCount} failed`,
            variant: "destructive",
          });
        } else {
          // Success - no toast notification needed
        }
      } else {
        // Success - no toast notification needed
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete some businesses",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusUpdate = async (newStatus: boolean) => {
    if (selectedBusinesses.size === 0) return;
    
    const action = newStatus ? "activate" : "deactivate";
    const selectedCount = selectedBusinesses.size;
    
    try {
      // Update each selected business
      await Promise.all(
        Array.from(selectedBusinesses).map(businessId =>
          updateBusinessStatus({ businessId, action })
        )
      );
      
      setSelectedBusinesses(new Set());
      setIsAllSelected(false);
      toast({
        title: `Businesses ${action}d`,
        description: `${selectedCount} businesses have been ${action}d`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} some businesses`,
        variant: "destructive",
      });
    }
  };

  const handleBulkPlanUpdate = async (newPlan: string) => {
    if (selectedBusinesses.size === 0) return;
    
    const selectedCount = selectedBusinesses.size;
    
    try {
      // Update each selected business
      await Promise.all(
        Array.from(selectedBusinesses).map(businessId =>
          updateBusiness({ businessId, updates: { planTier: newPlan } })
        )
      );
      
      setSelectedBusinesses(new Set());
      setIsAllSelected(false);
      // Success - no toast notification needed
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update some business plans",
        variant: "destructive",
      });
    }
  };

  const handleCloneBusiness = async (businessId: Id<"businesses">, businessName: string) => {
    try {
      // For now, just show a message. In a full implementation, this would:
      // 1. Fetch the business details
      // 2. Navigate to create form with pre-filled data
      toast({
        title: "Clone feature coming soon",
        description: `This will create a copy of "${businessName}"`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clone business",
        variant: "destructive",
      });
    }
  };

  const handleSyncReviews = async (businessId: Id<"businesses">, businessName: string, placeId?: string) => {
    if (!placeId) {
      toast({
        title: "Cannot sync reviews",
        description: "This business has no Google Place ID",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Syncing reviews...",
        description: `Starting review sync for ${businessName}`,
      });

      const result = await syncBusinessReviews({ businessId });

      if (result.success) {
        toast({
          title: "Reviews synced successfully",
          description: `Imported ${result.imported} new reviews (${result.fetched} fetched, ${result.duplicates} duplicates)`,
        });
      } else {
        toast({
          title: "Sync failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync error",
        description: "Failed to sync reviews. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkSync = async () => {
    const selectedCount = selectedBusinesses.size;
    if (selectedCount === 0) return;

    try {
      // Get businesses with place IDs
      const businessesToSync = businesses
        ?.filter(b => selectedBusinesses.has(b._id) && b.placeId)
        .map(b => ({ businessId: b._id, placeId: b.placeId! })) || [];

      if (businessesToSync.length === 0) {
        toast({
          title: "No businesses to sync",
          description: "None of the selected businesses have Place IDs",
          variant: "destructive",
        });
        return;
      }

      // Add businesses to queue
      await bulkAddToQueue({
        businesses: businessesToSync,
        priority: 5,
      });

      // Start processing the queue
      const processResult = await processQueue({ maxItems: 10 });

      // No success toast - user can see progress in Recent Activity
      setSelectedBusinesses(new Set());
      setIsAllSelected(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to queue businesses for sync",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateAIInsights = async (businessId: Id<"businesses">, businessName: string) => {
    try {
      toast({
        title: "Generating AI insights...",
        description: `Processing reviews for ${businessName}`,
      });

      const result = await processBusinessReviews({ 
        businessId,
        skipExisting: false // Force regeneration
      });

      if (result.success) {
        toast({
          title: "AI insights generated",
          description: result.message,
        });
      } else {
        toast({
          title: "Generation failed",
          description: result.message || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast({
        title: "Generation error",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportBusiness = async (businessId: Id<"businesses">, businessName: string) => {
    try {
      // Get the business data
      const business = businesses?.find(b => b._id === businessId);
      if (!business) return;
      
      // Create a cleaned version for export
      const exportData = {
        name: business.name,
        address: business.address,
        city: business.city,
        state: business.state,
        zip: business.zip,
        phone: business.phone,
        website: business.website,
        email: business.email,
        description: business.description,
        services: business.services,
        hours: business.hours,
        category: business.category?.name,
        planTier: business.planTier,
        active: business.active,
        verified: business.verified,
        featured: business.featured,
        rating: business.rating,
        reviewCount: business.reviewCount,
        // GMB Identifiers
        placeId: business.placeId,
        gmbUrl: business.gmbUrl,
        cid: business.cid,
        gmbClaimed: business.gmbClaimed,
        exportedAt: new Date().toISOString(),
      };
      
      // Convert to JSON and download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${businessName.toLowerCase().replace(/\s+/g, '-')}-export.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Business exported",
        description: `Downloaded ${exportFileDefaultName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export business data",
        variant: "destructive",
      });
    }
  };

  const getPlanBadgeColor = (planTier: string) => {
    switch (planTier) {
      case "power":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "pro":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "starter":
        return "bg-green-100 text-green-800 border-green-200";
      case "free":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "gmb_api":
        return { icon: "🔗", label: "GMB API", color: "bg-blue-100 text-blue-800" };
      case "admin_import":
        return { icon: "📥", label: "Admin Import", color: "bg-green-100 text-green-800" };
      case "user_manual":
        return { icon: "✏️", label: "Manual", color: "bg-purple-100 text-purple-800" };
      default:
        return { icon: "⚙️", label: "System", color: "bg-gray-100 text-gray-800" };
    }
  };

  if (!businesses || !categories) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Business Management</h1>
          <p className="text-muted-foreground">
            Manage all business listings in the directory
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedBusinesses.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Actions ({selectedBusinesses.size})
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate(false)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Deactivate Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPlanUpdate("free")}>
                  <Badge className="h-4 w-4 mr-2" />
                  Set to Free Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPlanUpdate("starter")}>
                  <Badge className="h-4 w-4 mr-2" />
                  Set to Starter Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPlanUpdate("pro")}>
                  <Badge className="h-4 w-4 mr-2" />
                  Set to Pro Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPlanUpdate("power")}>
                  <Badge className="h-4 w-4 mr-2" />
                  Set to Power Plan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleBulkSync}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Reviews
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  const selectedCount = selectedBusinesses.size;
                  if (selectedCount === 0) return;
                  
                  const eligibleBusinesses = businesses
                    ?.filter(b => selectedBusinesses.has(b._id) && b.reviewCount && b.reviewCount >= 5) || [];
                  
                  if (eligibleBusinesses.length === 0) {
                    toast({
                      title: "No eligible businesses",
                      description: "Selected businesses need at least 5 reviews for AI analysis",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  toast({
                    title: "Processing AI insights...",
                    description: `Analyzing ${eligibleBusinesses.length} businesses`,
                  });
                  
                  let successCount = 0;
                  let errorCount = 0;
                  
                  for (const business of eligibleBusinesses) {
                    try {
                      await processBusinessReviews({ 
                        businessId: business._id,
                        skipExisting: false
                      });
                      successCount++;
                    } catch (error) {
                      errorCount++;
                      console.error(`Failed to process ${business.name}:`, error);
                    }
                  }
                  
                  setSelectedBusinesses(new Set());
                  setIsAllSelected(false);
                  
                  toast({
                    title: "AI insights completed",
                    description: `Successfully processed ${successCount} businesses${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
                    variant: errorCount > 0 ? "destructive" : "default",
                  });
                }}>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate AI Insights
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button onClick={() => navigate("/admin/businesses/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Business
          </Button>
          <Badge variant="outline">{businesses.length} businesses</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by name, city, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Plan Tier</label>
              <Select value={planFilter || "all"} onValueChange={(value: any) => setPlanFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="power">Power</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter || "all"} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Verification</label>
              <Select value={verificationFilter || "all"} onValueChange={(value: any) => setVerificationFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Reviews</label>
              <Select value={reviewCountFilter || "all"} onValueChange={(value: any) => setReviewCountFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Review Counts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="none">No Reviews (0)</SelectItem>
                  <SelectItem value="few">Few (1-10)</SelectItem>
                  <SelectItem value="moderate">Moderate (11-50)</SelectItem>
                  <SelectItem value="many">Many (51-100)</SelectItem>
                  <SelectItem value="lots">Lots (100+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <Select value={cityFilter || "all"} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities?.filter(city => city && city.trim() !== '').map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Zipcode</label>
              <Select value={zipcodeFilter || "all"} onValueChange={setZipcodeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Zipcodes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zipcodes</SelectItem>
                  {zipcodes?.filter(zipcode => zipcode && zipcode.trim() !== '').map((zipcode) => (
                    <SelectItem key={zipcode} value={zipcode}>
                      {zipcode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={categoryFilter || "all"} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Source</label>
              <Select value={sourceFilter || "all"} onValueChange={(value: any) => setSourceFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="admin_import">Admin Import (CSV & Manual)</SelectItem>
                  <SelectItem value="gmb_api">GMB API</SelectItem>
                  <SelectItem value="user_manual">User Manual</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Created</label>
              <Select value={dateFilter || "all"} onValueChange={(value: any) => setDateFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Column Settings */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Showing {businesses?.length || 0} businesses (max 25 per query)
          </span>
          <span className="text-xs text-muted-foreground">
            Use filters to narrow results
          </span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Columns
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm font-semibold">
              Visible Columns
            </div>
            <DropdownMenuSeparator />
            {Object.entries(visibleColumns).map(([key, isVisible]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => toggleColumn(key as keyof typeof visibleColumns)}
                className="flex items-center justify-between"
              >
                <span className="capitalize">
                  {key === 'placeId' ? 'Place ID' : 
                   key === 'aiInsights' ? 'AI Insights' :
                   key.replace(/([A-Z])/g, ' $1')}
                </span>
                <Checkbox 
                  checked={isVisible}
                  onChange={() => {}}
                  className="pointer-events-none"
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Business Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all businesses"
                  />
                </TableHead>
                {visibleColumns.business && <TableHead>Business</TableHead>}
                {visibleColumns.category && <TableHead>Category</TableHead>}
                {visibleColumns.city && <TableHead>City</TableHead>}
                {visibleColumns.zip && <TableHead>ZIP</TableHead>}
                {visibleColumns.plan && <TableHead>Plan</TableHead>}
                {visibleColumns.reviews && <TableHead>Reviews</TableHead>}
                {visibleColumns.verification && <TableHead>Verification</TableHead>}
                {visibleColumns.dataSource && <TableHead>Data Source</TableHead>}
                {visibleColumns.placeId && <TableHead>Place ID</TableHead>}
                {visibleColumns.reviewSync && <TableHead>Review Sync</TableHead>}
                {visibleColumns.aiInsights && <TableHead>AI Insights</TableHead>}
                {visibleColumns.status && <TableHead>Status</TableHead>}
                {visibleColumns.featured && <TableHead>Featured</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business: any) => (
                <TableRow key={business._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedBusinesses.has(business._id)}
                      onCheckedChange={() => handleSelectBusiness(business._id)}
                      aria-label={`Select ${business.name}`}
                    />
                  </TableCell>
                  {visibleColumns.business && (
                    <TableCell>
                      <div>
                        <p className="font-medium">{business.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {business.address}
                        </p>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.category && (
                    <TableCell>
                      {business.category?.name || "Uncategorized"}
                    </TableCell>
                  )}
                  {visibleColumns.city && (
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{business.city}</p>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.zip && (
                    <TableCell>
                      <span className="text-sm font-mono">{business.zip}</span>
                    </TableCell>
                  )}
                  {visibleColumns.plan && (
                    <TableCell>
                      <Select
                        key={`plan-${business._id}`}
                        value={business.planTier && business.planTier.trim() !== '' ? business.planTier : "free"}
                        onValueChange={(value) => handlePlanChange(business._id, value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Free" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="power">Power</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}
                  {visibleColumns.reviews && (
                    <TableCell>
                      <div className="text-center">
                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full ${
                          business.reviewCount === 0 ? 'bg-gray-100 text-gray-700' :
                          business.reviewCount <= 10 ? 'bg-blue-100 text-blue-700' :
                          business.reviewCount <= 50 ? 'bg-green-100 text-green-700' :
                          business.reviewCount <= 100 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {business.reviewCount || 0}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.verification && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerificationToggle(business._id, business.verified)}
                        className={business.verified ? "text-green-600" : "text-gray-400"}
                      >
                        {business.verified ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">Unverified</span>
                          </>
                        )}
                      </Button>
                    </TableCell>
                  )}
                  {visibleColumns.dataSource && (
                    <TableCell>
                      {business.dataSource?.primary ? (
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getSourceBadge(business.dataSource.primary).color}`}>
                            <span className="mr-1">{getSourceBadge(business.dataSource.primary).icon}</span>
                            {getSourceBadge(business.dataSource.primary).label}
                          </Badge>
                          {business.dataSource.lastSyncedAt && (
                            <div className="flex items-center gap-1">
                              <Database className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(business.dataSource.lastSyncedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Badge className="text-xs bg-gray-100 text-gray-800">
                          <span className="mr-1">⚙️</span>
                          System
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.placeId && (
                    <TableCell>
                      {business.placeId ? (
                        <div className="text-xs font-mono max-w-32">
                          <span className="text-muted-foreground block truncate" title={business.placeId}>
                            {business.placeId}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.reviewSync && (
                    <TableCell>
                      {business.placeId ? (
                        <div className="flex items-center gap-2">
                          {business.syncStatus === "syncing" ? (
                            <Badge className="text-xs bg-blue-100 text-blue-800">
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              Syncing...
                            </Badge>
                          ) : business.syncStatus === "error" ? (
                            <Badge className="text-xs bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Error
                            </Badge>
                          ) : business.lastReviewSync ? (
                            <div className="flex items-center gap-1">
                              {Date.now() - business.lastReviewSync < 24 * 60 * 60 * 1000 ? (
                                <div className="w-2 h-2 bg-green-500 rounded-full" title="Synced recently" />
                              ) : Date.now() - business.lastReviewSync < 7 * 24 * 60 * 60 * 1000 ? (
                                <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Synced this week" />
                              ) : (
                                <div className="w-2 h-2 bg-red-500 rounded-full" title="Sync needed" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(business.lastReviewSync).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <Badge className="text-xs bg-gray-100 text-gray-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Never
                            </Badge>
                          )}
                          {business.placeId && business.syncStatus !== "syncing" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSyncReviews(business._id, business.name, business.placeId)}
                              className="h-6 px-2"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No Place ID</span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.aiInsights && (
                    <TableCell>
                      {business.overallScore && business.overallScore > 0 ? (
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-green-100 text-green-800">
                            <Brain className="h-3 w-3 mr-1" />
                            {business.overallScore.toFixed(1)}/100
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegenerateAIInsights(business._id, business.name)}
                            className="h-6 px-2"
                            title="Regenerate AI insights"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : business.reviewCount && business.reviewCount >= 5 ? (
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-gray-100 text-gray-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Not analyzed
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegenerateAIInsights(business._id, business.name)}
                            className="h-6 px-2 text-blue-600 hover:text-blue-700"
                            title="Generate AI insights"
                          >
                            <Sparkles className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {business.reviewCount || 0} reviews (min 5)
                        </span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.status && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusToggle(business._id, business.active)}
                        className={business.active ? "text-green-600" : "text-red-600"}
                      >
                        {business.active ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  )}
                  {visibleColumns.featured && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeatureToggle(business._id, business.featured)}
                        className={business.featured ? "text-yellow-600" : "text-gray-400"}
                      >
                        {business.featured ? (
                          <Star className="h-4 w-4 fill-current" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => {
                            // Use urlPath if available, otherwise generate URL using SlugGenerator
                            let url;
                            if (business.urlPath) {
                              url = business.urlPath;
                            } else {
                              const categorySlug = SlugGenerator.generateCategorySlug(business.category?.name || 'uncategorized');
                              const citySlug = SlugGenerator.generateCitySlug(business.city);
                              const businessSlug = SlugGenerator.generateBusinessNameSlug(business.name);
                              url = `/${categorySlug}/${citySlug}/${businessSlug}`;
                            }
                            window.open(url, '_blank');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Public Page
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            navigate(`/admin/businesses/edit/${business._id}`);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCloneBusiness(business._id, business.name)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Clone Business
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportBusiness(business._id, business.name)}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          window.open(`/admin/imports?business=${business._id}`, '_blank');
                        }}>
                          <Database className="h-4 w-4 mr-2" />
                          View Data Sources
                        </DropdownMenuItem>
                        {business.placeId && (
                          <DropdownMenuItem onClick={() => handleSyncReviews(business._id, business.name, business.placeId)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync Reviews
                          </DropdownMenuItem>
                        )}
                        {business.reviewCount && business.reviewCount >= 5 && (
                          <DropdownMenuItem onClick={() => handleRegenerateAIInsights(business._id, business.name)}>
                            <Brain className="h-4 w-4 mr-2" />
                            {business.overallScore && business.overallScore > 0 ? 'Regenerate' : 'Generate'} AI Insights
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteBusiness(business._id, business.name)}
                          className="text-red-600 hover:text-red-700 focus:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Business
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {businesses.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No businesses found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}