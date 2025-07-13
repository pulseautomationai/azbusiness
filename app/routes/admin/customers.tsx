"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "~/components/ui/alert-dialog";
import { Trash2, Search, Building, User } from "lucide-react";
import { toast } from "~/hooks/use-toast";

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedBusinessToUnclaim, setSelectedBusinessToUnclaim] = useState<{
    businessId: Id<"businesses">;
    businessName: string;
    userName: string;
  } | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Use a stable query args object to prevent re-renders
  const queryArgs = debouncedSearch.length > 0 
    ? { search: debouncedSearch, limit: 100 } 
    : { limit: 100 };
    
  const usersWithBusinesses = useQuery(api.users.getUsersWithBusinesses, queryArgs);

  const updatePlanTier = useMutation(api.users.updateUserBusinessPlanTier);
  const removeBusinessClaim = useMutation(api.users.removeBusinessClaim);

  const handlePlanTierChange = async (businessId: Id<"businesses">, newPlanTier: "free" | "pro" | "power") => {
    try {
      await updatePlanTier({
        businessId,
        planTier: newPlanTier,
      });
      toast({
        title: "Plan tier updated",
        description: `Business plan tier changed to ${newPlanTier}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plan tier",
        variant: "destructive",
      });
    }
  };

  const handleRemoveClaim = async () => {
    if (!selectedBusinessToUnclaim) return;

    try {
      await removeBusinessClaim({
        businessId: selectedBusinessToUnclaim.businessId,
      });
      toast({
        title: "Claim removed",
        description: `${selectedBusinessToUnclaim.businessName} has been unclaimed`,
      });
      setSelectedBusinessToUnclaim(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove claim",
        variant: "destructive",
      });
    }
  };

  const getPlanTierColor = (planTier: string) => {
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

  if (usersWithBusinesses === undefined) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (usersWithBusinesses === null) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Error loading customers. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage customer accounts and business claims
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Search Customers</h2>
        </div>
        <Input
          key="customer-search-input"
          placeholder="Search by name, email, or business name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
          autoComplete="off"
        />
      </div>

      {/* Users and Businesses */}
      <div className="grid gap-4 min-h-[200px]">
        {!usersWithBusinesses ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : usersWithBusinesses.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-6">
              <p className="text-muted-foreground">
                {debouncedSearch ? `No customers found for "${debouncedSearch}"` : "No customers found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          usersWithBusinesses.map((user: any) => (
          <Card key={user._id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {user.name || "Unnamed User"}
              </CardTitle>
              <CardDescription>
                {user.email} • {user.claimedBusinesses.length} claimed business{user.claimedBusinesses.length !== 1 ? 'es' : ''}
                {user.role && (
                  <Badge variant="outline" className="ml-2">
                    {user.role}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.claimedBusinesses.length === 0 ? (
                <p className="text-muted-foreground text-sm">No claimed businesses</p>
              ) : (
                <div className="space-y-3">
                  {user.claimedBusinesses.map((business: any) => (
                    <div
                      key={business._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{business.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {business.city}, {business.state}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={getPlanTierColor(business.planTier)}
                        >
                          {business.planTier.toUpperCase()}
                        </Badge>
                        {business.verified && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={business.planTier}
                          onValueChange={(value: "free" | "pro" | "power") =>
                            handlePlanTierChange(business._id, value)
                          }
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setSelectedBusinessToUnclaim({
                                  businessId: business._id,
                                  businessName: business.name,
                                  userName: user.name || "Unknown User",
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Business Claim</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove the claim for "{selectedBusinessToUnclaim?.businessName}" 
                                from {selectedBusinessToUnclaim?.userName}? This will reset the business to free tier and 
                                make it unverified.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setSelectedBusinessToUnclaim(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={handleRemoveClaim}>
                                Remove Claim
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </div>
  );
}