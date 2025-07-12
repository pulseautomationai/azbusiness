/**
 * Admin Business Management - Phase 5.1.4
 * Bulk business operations and management interface
 */

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  Building2, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  MapPin,
  Phone,
  ExternalLink,
  Download,
  RefreshCw
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

interface BusinessFilterOptions {
  search: string;
  planTier: string;
  status: string;
  city: string;
  category: string;
  claimStatus: string;
}

export default function AdminBusinesses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  
  // Filter state
  const [filters, setFilters] = useState<BusinessFilterOptions>({
    search: searchParams.get("search") || "",
    planTier: searchParams.get("planTier") || "all",
    status: searchParams.get("status") || "all",
    city: searchParams.get("city") || "all",
    category: searchParams.get("category") || "all",
    claimStatus: searchParams.get("claimStatus") || "all",
  });

  // Data queries
  const businesses = useQuery(api.businesses.getBusinessesForAdmin, {
    limit: 50,
    search: filters.search || undefined,
    planTier: filters.planTier !== "all" ? filters.planTier as any : undefined,
    claimStatus: filters.claimStatus !== "all" ? filters.claimStatus as any : undefined,
  });

  const cities = useQuery(api.cities.getActiveCities, {});
  const categories = useQuery(api.categories.getActiveCategories, {});

  // Mutations
  const updateBusinessStatus = useMutation(api.businesses.updateBusinessStatus);
  const bulkUpdateBusinesses = useMutation(api.businesses.bulkUpdateBusinesses);
  const exportBusinesses = useMutation(api.businesses.exportBusinessData);

  const handleFilterChange = (key: keyof BusinessFilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "all") params.set(k, v);
    });
    setSearchParams(params);
  };

  const handleSelectBusiness = (businessId: string, selected: boolean) => {
    if (selected) {
      setSelectedBusinesses([...selectedBusinesses, businessId]);
    } else {
      setSelectedBusinesses(selectedBusinesses.filter(id => id !== businessId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && businesses) {
      setSelectedBusinesses(businesses.map(b => b._id));
    } else {
      setSelectedBusinesses([]);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedBusinesses.length === 0) {
      toast.error("Please select businesses and an action");
      return;
    }

    try {
      await bulkUpdateBusinesses({
        businessIds: selectedBusinesses,
        action: bulkAction as any,
        reason: `Bulk ${bulkAction} via admin dashboard`,
      });
      
      toast.success(`Successfully applied ${bulkAction} to ${selectedBusinesses.length} businesses`);
      setSelectedBusinesses([]);
      setBulkAction("");
    } catch (error) {
      toast.error("Failed to apply bulk action");
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportBusinesses({
        filters: filters,
        selectedIds: selectedBusinesses.length > 0 ? selectedBusinesses : undefined,
      });
      
      if (result.success) {
        toast.success("Export completed! Download will begin shortly.");
        // In a real app, trigger download here
      }
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const getStatusBadge = (business: any) => {
    if (!business.active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (business.claimedByUserId) {
      return <Badge variant="default">Claimed</Badge>;
    }
    return <Badge variant="secondary">Unclaimed</Badge>;
  };

  const getPlanBadge = (planTier: string) => {
    const colors = {
      free: "bg-gray-100 text-gray-800",
      pro: "bg-blue-100 text-blue-800", 
      power: "bg-purple-100 text-purple-800",
    };
    
    return (
      <Badge className={colors[planTier as keyof typeof colors] || colors.free}>
        {planTier.toUpperCase()}
      </Badge>
    );
  };

  if (businesses === undefined) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Business Management</h1>
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Management</h1>
          <p className="text-gray-600">
            Manage and moderate business listings across the platform
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search businesses..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={filters.planTier} onValueChange={(value) => handleFilterChange("planTier", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Plan Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="power">Power</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.claimStatus} onValueChange={(value) => handleFilterChange("claimStatus", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Claim Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
                <SelectItem value="unclaimed">Unclaimed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.city} onValueChange={(value) => handleFilterChange("city", value)}>
              <SelectTrigger>
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities?.map((city) => (
                  <SelectItem key={city._id} value={city.slug}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category._id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedBusinesses.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedBusinesses.length} businesses selected
                </span>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activate">Activate</SelectItem>
                    <SelectItem value="deactivate">Deactivate</SelectItem>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="flag">Flag for Review</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="unfeature">Remove Feature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-x-2">
                <Button onClick={handleBulkAction} disabled={!bulkAction}>
                  Apply Action
                </Button>
                <Button onClick={() => setSelectedBusinesses([])} variant="outline">
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Businesses ({businesses.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedBusinesses.length === businesses.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {businesses.map((business) => (
              <div key={business._id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  checked={selectedBusinesses.includes(business._id)}
                  onCheckedChange={(checked) => handleSelectBusiness(business._id, checked as boolean)}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {business.name}
                    </h3>
                    {getStatusBadge(business)}
                    {getPlanBadge(business.planTier)}
                    {business.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {business.city}
                    </div>
                    {business.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {business.phone}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {business.category?.name || "Uncategorized"}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Created: {new Date(business.createdAt).toLocaleDateString()} • 
                    Updated: {new Date(business.updatedAt).toLocaleDateString()}
                    {business.claimedByUserId && (
                      <> • Claimed by: {business.claimedByUserId}</>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/admin/businesses/${business._id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/${business.category?.slug}/${business.city}/${business.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Live
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            
            {businesses.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search criteria.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}