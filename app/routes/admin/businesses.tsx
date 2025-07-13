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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Building, Search, Eye, Edit, Trash2, CheckCircle, XCircle, Star, StarOff } from "lucide-react";
import { toast } from "~/hooks/use-toast";
import { Link } from "react-router";
import { SlugGenerator } from "~/utils/slug-generator";

export default function AdminBusinesses() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "pro" | "power">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [zipcodeFilter, setZipcodeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
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
                    <div>
                      <p className="font-medium">{business.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {business.city}, {business.state}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {business.category?.name || "Uncategorized"}
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
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={(() => {
                          // Use urlPath if available, otherwise generate URL using SlugGenerator
                          if (business.urlPath) {
                            return business.urlPath;
                          }
                          const categorySlug = SlugGenerator.generateCategorySlug(business.category?.name || 'uncategorized');
                          const citySlug = SlugGenerator.generateCitySlug(business.city);
                          const businessSlug = SlugGenerator.generateBusinessNameSlug(business.name);
                          return `/${categorySlug}/${citySlug}/${businessSlug}`;
                        })()}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/businesses/edit/${business._id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
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