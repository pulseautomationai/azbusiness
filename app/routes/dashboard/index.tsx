import { useUser } from "@clerk/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { usePlanFeatures } from "~/hooks/usePlanFeatures";
import { FeatureGate } from "~/components/FeatureGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";
import { 
  IconBuildingStore,
  IconUpload,
  IconPhoto,
  IconStar,
  IconTrendingUp,
  IconCrown,
  IconTrophy
} from "@tabler/icons-react";

export default function CustomerDashboard() {
  const { user } = useUser();
  const planFeatures = usePlanFeatures();
  
  // Get user's claims and owned businesses
  const userClaims = useQuery(
    user ? api.moderation.getUserClaims : "skip"
  );

  const userBusinesses = useQuery(
    api.businesses.getUserBusinesses,
    user?.id ? { userId: user.id } : "skip"
  );

  const pendingClaims = userClaims?.filter(claim => claim.status === 'pending') || [];
  const approvedClaims = userClaims?.filter(claim => claim.status === 'approved') || [];
  const ownedBusinesses = userBusinesses || [];
  
  // Total businesses = approved claims + owned businesses
  const totalBusinesses = approvedClaims.length + ownedBusinesses.length;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6 p-6">
        
        {/* Welcome Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
            <Badge variant={planFeatures.planTier === 'power' ? 'default' : planFeatures.planTier === 'pro' ? 'secondary' : 'outline'} className="flex items-center gap-1">
              {planFeatures.planTier === 'power' && <IconCrown className="w-3 h-3" />}
              {planFeatures.planTier.toUpperCase()} Plan
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage your business listings and grow your online presence.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Businesses</CardTitle>
              <IconBuildingStore className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBusinesses}</div>
              <p className="text-xs text-muted-foreground">
                Active business listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claims</CardTitle>
              <IconStar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userClaims?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Business claims made
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingClaims.length}</div>
              <p className="text-xs text-muted-foreground">
                Under review
              </p>
            </CardContent>
          </Card>

          <FeatureGate 
            featureId="leadTracking" 
            fallback={
              <Card className="opacity-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads</CardTitle>
                  <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">
                    Upgrade to Pro
                  </p>
                </CardContent>
              </Card>
            }
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads</CardTitle>
                <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </FeatureGate>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBuildingStore className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks to manage your business presence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/dashboard/claims">
                <Button variant="outline" className="w-full justify-start">
                  <IconBuildingStore className="mr-2 h-4 w-4" />
                  View My Claims
                </Button>
              </Link>
              
              <Link to="/claim-business">
                <Button variant="outline" className="w-full justify-start">
                  <IconBuildingStore className="mr-2 h-4 w-4" />
                  Claim Business
                </Button>
              </Link>

              <Link to="/add-business">
                <Button variant="outline" className="w-full justify-start">
                  <IconBuildingStore className="mr-2 h-4 w-4" />
                  Add New Business
                </Button>
              </Link>

              <Link to="/dashboard/achievements">
                <Button variant="outline" className="w-full justify-start">
                  <IconTrophy className="mr-2 h-4 w-4" />
                  View Achievements
                </Button>
              </Link>

              <FeatureGate featureId="logoUpload">
                <Link to="/dashboard/media">
                  <Button variant="outline" className="w-full justify-start">
                    <IconPhoto className="mr-2 h-4 w-4" />
                    Manage Media
                  </Button>
                </Link>
              </FeatureGate>

              <Link to="/dashboard/documents">
                <Button variant="outline" className="w-full justify-start">
                  <IconUpload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Plan Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCrown className="h-5 w-5" />
                Your Plan Features
              </CardTitle>
              <CardDescription>
                What's included in your {planFeatures.planTier} plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Logo Upload</span>
                <Badge variant="outline" className="text-xs">
                  {planFeatures.logoUpload ? '✓' : '✗'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Lead Tracking</span>
                <Badge variant="outline" className="text-xs">
                  {planFeatures.leadTracking ? '✓' : '✗'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Image Gallery</span>
                <Badge variant="outline" className="text-xs">
                  {planFeatures.imageGallery ? '✓' : '✗'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">AI Content Tools</span>
                <Badge variant="outline" className="text-xs">
                  {planFeatures.aiContentGeneration ? '✓' : '✗'}
                </Badge>
              </div>

              {planFeatures.planTier !== 'power' && (
                <div className="pt-3">
                  <Link to="/pricing">
                    <Button className="w-full">
                      Upgrade Plan
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Your Businesses */}
        {ownedBusinesses && ownedBusinesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Businesses</CardTitle>
              <CardDescription>
                Businesses you own and manage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ownedBusinesses.slice(0, 3).map((business) => (
                  <div key={business._id} className="flex items-center space-x-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {business.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {business.category?.name} • {business.city}, {business.state}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={business.planTier === 'power' ? 'default' : business.planTier === 'pro' ? 'secondary' : 'outline'}>
                        {business.planTier.toUpperCase()}
                      </Badge>
                      {business.verified && (
                        <Badge variant="outline" className="text-green-600">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {userClaims && userClaims.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Claim Activity</CardTitle>
              <CardDescription>
                Your latest business claim updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userClaims.slice(0, 3).map((claim) => (
                  <div key={claim._id} className="flex items-center space-x-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {claim.businessName || 'Business Claim'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted {new Date(claim.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={
                      claim.status === 'approved' ? 'default' :
                      claim.status === 'rejected' ? 'destructive' :
                      claim.status === 'info_requested' ? 'secondary' :
                      'outline'
                    }>
                      {claim.status === 'approved' ? 'Approved' :
                       claim.status === 'rejected' ? 'Rejected' :
                       claim.status === 'info_requested' ? 'Info Requested' :
                       'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
