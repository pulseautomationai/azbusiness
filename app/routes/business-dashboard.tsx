/**
 * Business Dashboard - Phase 4 Implementation
 * Performance analytics and insights for business owners
 */

import { useUser } from "@clerk/react-router";
import { Navigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { BarChart, TrendingUp, Users, Star, AlertCircle, Download, Target, Eye } from "lucide-react";
import BusinessPerformanceOverview from "~/components/business-dashboard/business-performance-overview";
import RankingPositionTracker from "~/components/business-dashboard/ranking-position-tracker";
import PerformanceTrends from "~/components/business-dashboard/performance-trends";
import ReviewAnalytics from "~/components/business-dashboard/review-analytics";
import CompetitorComparison from "~/components/business-dashboard/competitor-comparison";
import AIInsightsPanel from "~/components/business-dashboard/ai-insights-panel";

export default function BusinessDashboard() {
  const { user, isLoaded } = useUser();

  // Authentication check
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Fetch user's business data
  const userBusinesses = useQuery(api.businesses.getUserBusinesses, {
    userId: user.id,
  });

  // For now, we'll work with the first business the user owns
  const primaryBusiness = userBusinesses?.[0];

  if (userBusinesses === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocotillo-red mx-auto mb-4"></div>
          <p>Loading your business dashboard...</p>
        </div>
      </div>
    );
  }

  if (!primaryBusiness) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              No Business Found
            </CardTitle>
            <CardDescription>
              You don't have any businesses associated with your account yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>To access your business dashboard, you need to:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Claim your business listing</li>
                <li>Verify ownership</li>
                <li>Choose a subscription plan</li>
              </ul>
              <div className="flex gap-4">
                <Button asChild>
                  <a href="/claim-business">Claim Your Business</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/pricing">View Plans</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get plan tier for feature gating
  const planTier = primaryBusiness.planTier || "free";
  const isStarterPlus = ["starter", "pro", "power"].includes(planTier);
  const isProPlus = ["pro", "power"].includes(planTier);
  const isPowerTier = planTier === "power";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ironwood-charcoal mb-2">
              {primaryBusiness.name}
            </h1>
            <div className="flex items-center gap-4">
              <Badge
                variant={planTier === "power" ? "default" : "secondary"}
                className={
                  planTier === "power"
                    ? "bg-ocotillo-red text-white"
                    : planTier === "pro"
                    ? "bg-prickly-pear-pink text-ironwood-charcoal"
                    : "bg-gray-100 text-gray-600"
                }
              >
                {planTier.toUpperCase()} PLAN
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium">{primaryBusiness.rating}</span>
                <span className="text-gray-500">({primaryBusiness.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            {isPowerTier && (
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            )}
            <Button className="bg-ocotillo-red hover:bg-ocotillo-red/90">
              <Eye className="h-4 w-4 mr-2" />
              View Public Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isStarterPlus && <TabsTrigger value="rankings">Rankings</TabsTrigger>}
          {isStarterPlus && <TabsTrigger value="reviews">Reviews</TabsTrigger>}
          {isProPlus && <TabsTrigger value="competitors">Competitors</TabsTrigger>}
          {isPowerTier && <TabsTrigger value="insights">AI Insights</TabsTrigger>}
        </TabsList>

        {/* Overview Tab - Available to all tiers */}
        <TabsContent value="overview">
          <BusinessPerformanceOverview business={primaryBusiness} planTier={planTier} />
        </TabsContent>

        {/* Rankings Tab - Starter+ */}
        {isStarterPlus && (
          <TabsContent value="rankings" className="space-y-6">
            <RankingPositionTracker business={primaryBusiness} planTier={planTier} />
            <PerformanceTrends business={primaryBusiness} planTier={planTier} />
          </TabsContent>
        )}

        {/* Reviews Tab - Starter+ */}
        {isStarterPlus && (
          <TabsContent value="reviews">
            <ReviewAnalytics business={primaryBusiness} planTier={planTier} />
          </TabsContent>
        )}

        {/* Competitors Tab - Pro+ */}
        {isProPlus && (
          <TabsContent value="competitors">
            <CompetitorComparison business={primaryBusiness} planTier={planTier} />
          </TabsContent>
        )}

        {/* AI Insights Tab - Power only */}
        {isPowerTier && (
          <TabsContent value="insights">
            <AIInsightsPanel business={primaryBusiness} planTier={planTier} />
          </TabsContent>
        )}
      </Tabs>

      {/* Upgrade CTA for lower tiers */}
      {!isPowerTier && (
        <Card className="mt-8 border-prickly-pear-pink/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-ocotillo-red" />
              Unlock More Insights
            </CardTitle>
            <CardDescription>
              {planTier === "free" && "Get analytics dashboard with Starter plan"}
              {planTier === "starter" && "Add competitor insights with Pro plan"}
              {planTier === "pro" && "Get AI-powered recommendations with Power plan"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-ocotillo-red hover:bg-ocotillo-red/90">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}