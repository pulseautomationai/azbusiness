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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "~/components/ui/dropdown-menu";
import { Trash2, Search, Building, User, TrendingUp, TrendingDown, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, Mail, Phone, MapPin, BarChart3, Users, MoreHorizontal, Edit, Eye, UserX, Download, MessageSquare, Shield } from "lucide-react";
import { toast } from "~/hooks/use-toast";

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "pro" | "power">("all");
  const [healthFilter, setHealthFilter] = useState<"all" | "high" | "medium" | "low">("all");
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

  const calculateCustomerHealthScore = (user: any) => {
    let score = 0;
    let maxScore = 100;
    
    // Plan tier scoring (40% of total)
    const planTierScores = { free: 10, pro: 25, power: 40 };
    const businessPlanScores = user.claimedBusinesses.reduce((sum: number, business: any) => {
      return sum + (planTierScores[business.planTier as keyof typeof planTierScores] || 0);
    }, 0);
    score += Math.min(businessPlanScores, 40);
    
    // Business verification (20% of total)
    const verifiedBusinesses = user.claimedBusinesses.filter((business: any) => business.verified).length;
    score += Math.min(verifiedBusinesses * 10, 20);
    
    // Account age (15% of total) - assuming newer accounts have lower scores initially
    const accountAge = user._creationTime ? Date.now() - user._creationTime : 0;
    const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
    score += Math.min(daysSinceCreation / 30 * 15, 15); // Full points after 30 days
    
    // Number of claimed businesses (25% of total)
    score += Math.min(user.claimedBusinesses.length * 5, 25);
    
    return Math.round(score);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getHealthScoreIcon = (score: number) => {
    if (score >= 80) return TrendingUp;
    if (score >= 60) return BarChart3;
    if (score >= 40) return TrendingDown;
    return AlertTriangle;
  };

  const calculateCustomerValue = (user: any) => {
    const planTierValues = { free: 0, pro: 29, power: 97 };
    return user.claimedBusinesses.reduce((sum: number, business: any) => {
      return sum + (planTierValues[business.planTier as keyof typeof planTierValues] || 0);
    }, 0);
  };

  const getCustomerJoinDate = (user: any) => {
    if (!user._creationTime) return "Unknown";
    const date = new Date(user._creationTime);
    return date.toLocaleDateString();
  };

  // Customer action handlers
  const handleViewCustomerDetails = (customerId: Id<"users">) => {
    toast({
      title: "Customer Details",
      description: "Opening detailed customer view...",
    });
    // TODO: Navigate to customer detail page
  };

  const handleEditCustomer = (customerId: Id<"users">) => {
    toast({
      title: "Edit Customer",
      description: "Opening customer edit form...",
    });
    // TODO: Navigate to customer edit page
  };

  const handleEmailCustomer = (customerId: Id<"users">, email: string) => {
    toast({
      title: "Email Customer",
      description: `Opening email composer for ${email}...`,
    });
    // TODO: Open email composer
  };

  const handleExportCustomerData = (customerId: Id<"users">, customerName: string) => {
    toast({
      title: "Export Data",
      description: `Exporting data for ${customerName}...`,
    });
    // TODO: Generate and download customer data export
  };

  const handleSuspendCustomer = (customerId: Id<"users">, customerName: string) => {
    toast({
      title: "Suspend Account",
      description: `Account suspension for ${customerName} - feature coming soon`,
    });
    // TODO: Implement account suspension
  };

  const handleDeleteCustomer = (customerId: Id<"users">, customerName: string) => {
    if (!confirm(`Are you sure you want to delete customer "${customerName}"? This action cannot be undone.`)) {
      return;
    }
    
    toast({
      title: "Delete Customer",
      description: `Customer deletion for ${customerName} - feature coming soon`,
    });
    // TODO: Implement customer deletion
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
        {usersWithBusinesses && (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${usersWithBusinesses.reduce((sum: number, user: any) => sum + calculateCustomerValue(user), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total MRR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{usersWithBusinesses.length}</div>
              <div className="text-sm text-muted-foreground">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {usersWithBusinesses.reduce((sum: number, user: any) => sum + user.claimedBusinesses.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Businesses</div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Search Customers</label>
              <Input
                key="customer-search-input"
                placeholder="Search by name, email, or business name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Plan Filter</label>
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
              <label className="text-sm font-medium mb-2 block">Health Score</label>
              <Select value={healthFilter} onValueChange={(value: any) => setHealthFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">High (80+)</SelectItem>
                  <SelectItem value="medium">Medium (40-79)</SelectItem>
                  <SelectItem value="low">Low (&lt;40)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users and Businesses */}
      <div className="grid gap-4 min-h-[200px]">
        {!usersWithBusinesses ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (() => {
          // Apply filters
          let filteredUsers = usersWithBusinesses;
          
          // Plan filter
          if (planFilter !== "all") {
            filteredUsers = filteredUsers.filter((user: any) => 
              user.claimedBusinesses.some((business: any) => business.planTier === planFilter)
            );
          }
          
          // Health score filter
          if (healthFilter !== "all") {
            filteredUsers = filteredUsers.filter((user: any) => {
              const score = calculateCustomerHealthScore(user);
              if (healthFilter === "high") return score >= 80;
              if (healthFilter === "medium") return score >= 40 && score < 80;
              if (healthFilter === "low") return score < 40;
              return true;
            });
          }
          
          if (filteredUsers.length === 0) {
            return (
              <Card>
                <CardContent className="flex items-center justify-center py-6">
                  <p className="text-muted-foreground">
                    {debouncedSearch ? `No customers found for "${debouncedSearch}"` : "No customers found matching filters"}
                  </p>
                </CardContent>
              </Card>
            );
          }
          
          return filteredUsers.map((user: any) => (
          <Card key={user._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {user.name || "Unnamed User"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {(() => {
                    const healthScore = calculateCustomerHealthScore(user);
                    const HealthIcon = getHealthScoreIcon(healthScore);
                    return (
                      <div className="flex items-center gap-1">
                        <HealthIcon className={`h-4 w-4 ${getHealthScoreColor(healthScore)}`} />
                        <span className={`text-sm font-medium ${getHealthScoreColor(healthScore)}`}>
                          {healthScore}
                        </span>
                      </div>
                    );
                  })()}
                  <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                    ${calculateCustomerValue(user)}/mo
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleViewCustomerDetails(user._id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditCustomer(user._id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Customer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEmailCustomer(user._id, user.email)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportCustomerData(user._id, user.name)}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleSuspendCustomer(user._id, user.name)}>
                        <Shield className="h-4 w-4 mr-2" />
                        Suspend Account
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteCustomer(user._id, user.name)}
                        className="text-red-600 hover:text-red-700 focus:text-red-700"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Delete Customer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {user.claimedBusinesses.length} business{user.claimedBusinesses.length !== 1 ? 'es' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {getCustomerJoinDate(user)}
                  </span>
                  {user.role && (
                    <Badge variant="outline" className="ml-2">
                      {user.role}
                    </Badge>
                  )}
                </div>
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
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={getPlanTierColor(business.planTier)}
                            >
                              {business.planTier.toUpperCase()}
                            </Badge>
                            {business.verified && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {business.planTier !== "free" && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Active Subscription
                              </Badge>
                            )}
                          </div>
                        </div>
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
          ));
        })()}
      </div>
    </div>
  );
}