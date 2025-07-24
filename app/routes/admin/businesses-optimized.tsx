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
import { Building, Search, Eye, Edit, Trash2, CheckCircle, XCircle, Star, StarOff, Plus, ChevronDown, Trash, Settings, MoreHorizontal, Download, Copy, Database, RefreshCw, Clock, AlertCircle, Filter, Brain, Sparkles } from "lucide-react";
import { toast } from "~/hooks/use-toast";
import { Link, useNavigate } from "react-router";
import { SlugGenerator } from "~/utils/slug-generator";
import { useBusinessFiltering, getFilterOptions, type BusinessFilters } from "~/hooks/useBusinessFiltering";
import { useBusinessPagination } from "~/hooks/useBusinessPagination";
import { Progress } from "~/components/ui/progress";

export default function AdminBusinessesOptimized() {
  const navigate = useNavigate();
  
  // Filter state
  const [filters, setFilters] = useState<BusinessFilters>({
    search: "",
    planTier: "all",
    statusFilter: "all",
    verificationFilter: "all",
    reviewCountFilter: "all",
    cityFilter: "all",
    zipcodeFilter: "all",
    categoryFilter: "all",
    sourceFilter: "all",
    dateFilter: "all",
    claimFilter: "all",
  });

  // Bulk selection state
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<Id<"businesses">>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    business: true,
    category: true,
    city: true,
    zip: true,
    plan: true,
    reviews: true,
    verification: true,
    dataSource: true,
    placeId: true,
    reviewSync: true,
    aiInsights: true, // Add AI insights column
    status: true,
    featured: true,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Use paginated loading to avoid memory limits
  const { 
    businesses: allBusinesses, 
    isLoading, 
    loadingProgress,
    totalCount: totalBusinessCount,
    reset: resetPagination
  } = useBusinessPagination();
  
  // Get filter options from the data
  const filterOptions = getFilterOptions(allBusinesses);
  
  // Debug: Log unique categories when data changes
  useEffect(() => {
    if (allBusinesses.length > 0) {
      const uniqueCategories = [...new Set(allBusinesses.map(b => b.categoryId))];
      const duplicateCheck = allBusinesses.map(b => b._id);
      const uniqueIds = new Set(duplicateCheck);
      
      console.log("Data integrity check:", {
        totalBusinesses: allBusinesses.length,
        uniqueBusinessIds: uniqueIds.size,
        hasDuplicates: allBusinesses.length !== uniqueIds.size,
        duplicateCount: allBusinesses.length - uniqueIds.size,
        uniqueCategoryCount: uniqueCategories.length
      });
      
      if (allBusinesses.length !== uniqueIds.size) {
        console.error("DUPLICATES DETECTED in allBusinesses array!");
      }
    }
  }, [allBusinesses.length]);
  
  // Apply client-side filtering - pass all businesses even if still loading more
  const {
    businesses: filteredBusinesses,
    totalCount,
    currentPage: displayedBusinesses,
  } = useBusinessFiltering(
    allBusinesses, // Always pass the array, even if empty
    filters, 
    pageSize
  );
  
  // Debug the actual data being used
  console.log("Component state:", {
    allBusinessesCount: allBusinesses.length,
    filteredBusinessesCount: filteredBusinesses?.length || 0,
    displayedBusinessesCount: displayedBusinesses?.length || 0,
    activeFilter: filters.categoryFilter,
    isLoading
  });

  // Mutations for business operations
  const updateBusinessStatus = useMutation(api.businesses.updateBusinessStatus);
  const updateBusiness = useMutation(api.businesses.updateBusiness);
  const deleteBusiness = useMutation(api.businesses.deleteBusiness);
  const deleteMultipleBusinesses = useMutation(api.businesses.deleteMultipleBusinesses);
  const syncBusinessReviews = useAction(api.reviewSync.syncBusinessReviews);
  const bulkAddToQueue = useMutation(api.geoScraperQueue.bulkAddToQueue);
  const processQueue = useAction(api.geoScraperProcessor.processQueue);
  const processBusinessReviews = useAction(api.aiAnalysisIntegration.processBusinessReviews);

  // Helper function to update filters
  const updateFilter = <K extends keyof BusinessFilters>(key: K, value: BusinessFilters[K]) => {
    console.log(`Updating filter ${key} to:`, value);
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      console.log("New filters state:", newFilters);
      return newFilters;
    });
    setCurrentPage(1); // Reset to first page when filtering
    setSelectedBusinesses(new Set()); // Clear selection when filtering
    setIsAllSelected(false);
  };

  // Column visibility toggle
  const toggleColumn = (columnKey: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Business operation handlers
  const handleStatusToggle = async (businessId: Id<"businesses">, currentStatus: boolean) => {
    try {
      await updateBusinessStatus({
        businessId,
        action: currentStatus ? "deactivate" : "activate",
      });
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
        updates: { planTier: newPlan as "free" | "starter" | "pro" | "power" },
      });
      
      // Refresh the business data to show the updated value
      resetPagination();
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBusiness = async (businessId: Id<"businesses">, businessName: string) => {
    if (!confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteBusiness({ businessId });
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
      const allIds = new Set(displayedBusinesses.map(b => b._id));
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
    setIsAllSelected(newSelection.size === displayedBusinesses.length);
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedBusinesses.size === 0) return;
    
    const selectedCount = selectedBusinesses.size;
    if (!confirm(`Are you sure you want to delete ${selectedCount} businesses? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const result = await deleteMultipleBusinesses({ businessIds: Array.from(selectedBusinesses) });
      setSelectedBusinesses(new Set());
      setIsAllSelected(false);
      
      if (result && result.errorCount > 0) {
        toast({
          title: "Partial deletion completed",
          description: `${result.successCount} businesses deleted, ${result.errorCount} failed`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some businesses",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusUpdate = async (newStatus: boolean) => {
    if (selectedBusinesses.size === 0) return;
    
    const action = newStatus ? "activate" : "deactivate";
    
    try {
      await Promise.all(
        Array.from(selectedBusinesses).map(businessId =>
          updateBusinessStatus({ businessId, action })
        )
      );
      
      setSelectedBusinesses(new Set());
      setIsAllSelected(false);
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
    
    try {
      await Promise.all(
        Array.from(selectedBusinesses).map(businessId =>
          updateBusiness({ businessId, updates: { planTier: newPlan as "free" | "starter" | "pro" | "power" } })
        )
      );
      
      setSelectedBusinesses(new Set());
      setIsAllSelected(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update some business plans",
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
        // Refresh the data
        resetPagination();
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

  // Show loading state while data is being fetched
  if (isLoading && allBusinesses.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <p className="text-muted-foreground">Loading businesses...</p>
            </div>
            <div className="w-64">
              <Progress value={loadingProgress} />
              <p className="text-xs text-muted-foreground text-center mt-2">
                {loadingProgress}% complete
              </p>
            </div>
          </div>
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
            Manage all business listings with instant filtering
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
          <div className="flex items-center gap-1">
            <Badge variant="outline">{totalBusinessCount} total</Badge>
            {!isLoading && (
              <>
                <Badge variant="secondary">{totalCount} filtered</Badge>
                <Badge variant="default">{displayedBusinesses.length} shown</Badge>
              </>
            )}
            {isLoading && (
              <Badge variant="outline" className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Loading...
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Instant Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Instant Filters
          </CardTitle>
          <CardDescription>
            {isLoading ? (
              <span className="text-yellow-600">
                Data is still loading... Filters will work once all data is loaded
              </span>
            ) : (
              "All filtering happens instantly on the client - no server calls needed"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search businesses... (Try 'Stanley Brothers')"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Plan Tier</label>
              <Select value={filters.planTier} onValueChange={(value: any) => updateFilter("planTier", value)}>
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
              <Select value={filters.statusFilter} onValueChange={(value: any) => updateFilter("statusFilter", value)}>
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
              <Select value={filters.verificationFilter} onValueChange={(value: any) => updateFilter("verificationFilter", value)}>
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
              <Select value={filters.reviewCountFilter} onValueChange={(value: any) => updateFilter("reviewCountFilter", value)}>
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
              <Select value={filters.cityFilter} onValueChange={(value) => updateFilter("cityFilter", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {filterOptions.cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={filters.categoryFilter} onValueChange={(value) => updateFilter("categoryFilter", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {filterOptions.categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Source</label>
              <Select value={filters.sourceFilter} onValueChange={(value: any) => updateFilter("sourceFilter", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="admin_import">Admin Import</SelectItem>
                  <SelectItem value="gmb_api">GMB API</SelectItem>
                  <SelectItem value="user_manual">User Manual</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Created</label>
              <Select value={filters.dateFilter} onValueChange={(value: any) => updateFilter("dateFilter", value)}>
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
            <div>
              <label className="text-sm font-medium mb-2 block">Claimed</label>
              <Select value={filters.claimFilter} onValueChange={(value: any) => updateFilter("claimFilter", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Claims" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="unclaimed">Unclaimed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({
                    search: "",
                    planTier: "all",
                    statusFilter: "all",
                    verificationFilter: "all",
                    reviewCountFilter: "all",
                    cityFilter: "all",
                    zipcodeFilter: "all",
                    categoryFilter: "all",
                    sourceFilter: "all",
                    dateFilter: "all",
                    claimFilter: "all",
                  });
                  setCurrentPage(1);
                }}
              >
                Clear All Filters
              </Button>
              <span className="text-sm text-muted-foreground">
                {isLoading ? (
                  `Showing ${displayedBusinesses.length} of ${totalCount} loaded so far (${totalBusinessCount} total, still loading...)`
                ) : (
                  `Showing ${displayedBusinesses.length} of ${totalCount} filtered (${totalBusinessCount} total)`
                )}
              </span>
              {/* Additional debug info */}
              <span className="text-xs text-red-500 ml-2">
                Debug: displayedBiz={displayedBusinesses.length}, filtered={filteredBusinesses?.length || 0}, all={allBusinesses.length}
              </span>
              {/* Debug info */}
              {filters.cityFilter !== "all" && (
                <Badge variant="secondary">City: {filters.cityFilter}</Badge>
              )}
              {filters.categoryFilter !== "all" && (
                <Badge variant="secondary">
                  Category: {filterOptions.categories.find(c => c.id === filters.categoryFilter)?.name || filters.categoryFilter}
                </Badge>
              )}
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
        </CardContent>
      </Card>

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
              {displayedBusinesses && displayedBusinesses.length > 0 ? (
                displayedBusinesses.map((business) => (
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
                      {business.categoryName}
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
                        value={business.planTier || "free"}
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
                          {business.reviewCount}
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
                        <Badge className={`text-xs ${getSourceBadge(business.dataSource.primary).color}`}>
                          <span className="mr-1">{getSourceBadge(business.dataSource.primary).icon}</span>
                          {getSourceBadge(business.dataSource.primary).label}
                        </Badge>
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
                        <Badge className="text-xs bg-gray-100 text-gray-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Sync Available
                        </Badge>
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
                        <DropdownMenuItem onClick={() => {
                          const categorySlug = SlugGenerator.generateCategorySlug(business.categoryName);
                          const citySlug = SlugGenerator.generateCitySlug(business.city);
                          const businessSlug = SlugGenerator.generateBusinessNameSlug(business.name);
                          const url = `/${categorySlug}/${citySlug}/${businessSlug}`;
                          window.open(url, '_blank');
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Public Page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/businesses/edit/${business._id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
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
              ))
            ) : null}
            </TableBody>
          </Table>
          {displayedBusinesses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-lg font-medium">No businesses found</p>
                <p className="text-muted-foreground mt-2">
                  {filters.cityFilter !== "all" && filters.categoryFilter !== "all" ? (
                    <>
                      No businesses match both <Badge variant="secondary">{filters.cityFilter}</Badge> city 
                      and your selected category
                    </>
                  ) : filters.cityFilter !== "all" ? (
                    <>No businesses found in <Badge variant="secondary">{filters.cityFilter}</Badge></>
                  ) : filters.categoryFilter !== "all" ? (
                    <>No businesses found in the selected category</>
                  ) : (
                    "Try adjusting your filters"
                  )}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    setFilters({
                      search: "",
                      planTier: "all",
                      statusFilter: "all",
                      verificationFilter: "all",
                      reviewCountFilter: "all",
                      cityFilter: "all",
                      zipcodeFilter: "all",
                      categoryFilter: "all",
                      sourceFilter: "all",
                      dateFilter: "all",
                      claimFilter: "all",
                    });
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}