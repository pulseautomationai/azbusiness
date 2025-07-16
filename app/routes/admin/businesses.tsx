"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { Building, Search, Eye, Edit, Trash2, CheckCircle, XCircle, Star, StarOff, Plus, ChevronDown, Trash, Settings, MoreHorizontal, Download, Copy } from "lucide-react";
import { toast } from "~/hooks/use-toast";
import { Link, useNavigate } from "react-router";
import { SlugGenerator } from "~/utils/slug-generator";

export default function AdminBusinesses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "pro" | "power">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [zipcodeFilter, setZipcodeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Bulk selection state
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<Id<"businesses">>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Get filter options
  const categories = useQuery(api.categories.getAllCategoriesForAdmin);
  const cities = useQuery(api.businesses.getUniqueCities);
  const zipcodes = useQuery(api.businesses.getUniqueZipcodes);

  // Get businesses for admin view
  const businesses = useQuery(api.businesses.getBusinessesForAdmin, {
    search: search || undefined,
    planTier: planFilter === "all" ? undefined : planFilter,
    active: statusFilter === "all" ? undefined : statusFilter === "active",
    city: cityFilter === "all" ? undefined : cityFilter,
    zipcode: zipcodeFilter === "all" ? undefined : zipcodeFilter,
    categoryId: categoryFilter === "all" ? undefined : categoryFilter as Id<"categories">,
    limit: 100,
  });

  const updateBusinessStatus = useMutation(api.businesses.updateBusinessStatus);
  const updateBusiness = useMutation(api.businesses.updateBusiness);
  const deleteBusiness = useMutation(api.businesses.deleteBusiness);
  const deleteMultipleBusinesses = useMutation(api.businesses.deleteMultipleBusinesses);

  const handleStatusToggle = async (businessId: Id<"businesses">, currentStatus: boolean) => {
    try {
      await updateBusinessStatus({
        businessId,
        action: currentStatus ? "deactivate" : "activate",
      });
      toast({
        title: currentStatus ? "Business deactivated" : "Business activated",
        description: "Business status updated successfully",
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
      toast({
        title: currentFeatured ? "Business unfeatured" : "Business featured",
        description: "Featured status updated successfully",
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
        updates: {
          planTier: newPlan,
        },
      });
      toast({
        title: "Plan updated",
        description: `Business plan changed to ${newPlan}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plan",
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
      toast({
        title: "Business deleted",
        description: `${businessName} has been permanently deleted`,
      });
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
      await deleteMultipleBusinesses({ businessIds: Array.from(selectedBusinesses) });
      setSelectedBusinesses(new Set());
      setIsAllSelected(false);
      toast({
        title: "Businesses deleted",
        description: `${selectedCount} businesses have been permanently deleted`,
      });
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
      toast({
        title: "Plans updated",
        description: `${selectedCount} businesses updated to ${newPlan} plan`,
      });
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
      case "free":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!businesses) {
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
                <DropdownMenuItem onClick={() => handleBulkPlanUpdate("pro")}>
                  <Badge className="h-4 w-4 mr-2" />
                  Set to Pro Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPlanUpdate("power")}>
                  <Badge className="h-4 w-4 mr-2" />
                  Set to Power Plan
                </DropdownMenuItem>
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
              <Select value={planFilter} onValueChange={(value: any) => setPlanFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="power">Power</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities?.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Zipcode</label>
              <Select value={zipcodeFilter} onValueChange={setZipcodeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zipcodes</SelectItem>
                  {zipcodes?.map((zipcode) => (
                    <SelectItem key={zipcode} value={zipcode}>
                      {zipcode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
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
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>City</TableHead>
                <TableHead>ZIP</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
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
                  <TableCell>
                    <div>
                      <p className="font-medium">{business.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {business.address}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {business.category?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{business.city}</p>
                      <p className="text-muted-foreground">{business.state}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{business.zip}</span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={business.planTier}
                      onValueChange={(value) => handlePlanChange(business._id, value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="power">Power</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
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