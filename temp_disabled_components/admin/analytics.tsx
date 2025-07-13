/**
 * Admin Analytics Dashboard - Phase 5.2
 * Comprehensive platform analytics and reporting interface
 */

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Progress } from "~/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  AlertTriangle,
  CheckCircle,
  Crown,
  Zap,
  Globe,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

export default function AdminAnalytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Filter state
  const activeTab = searchParams.get("tab") || "overview";

  // Data queries
  const platformOverview = useQuery(api.platformAnalytics.getPlatformOverviewMetrics, {
    timeRange: selectedTimeRange as any,
  });

  const businessTrends = useQuery(api.platformAnalytics.getBusinessPerformanceTrends, {
    timeRange: selectedTimeRange as any,
  });

  const userEngagement = useQuery(api.userEngagement.getUserEngagementMetrics, {
    timeRange: selectedTimeRange,
    userType: "all",
  });

  const revenueOverview = useQuery(api.revenueAnalytics.getRevenueOverview, {
    timeRange: selectedTimeRange as any,
  });

  const competitiveAnalysis = useQuery(api.competitiveIntelligence.getMarketShareAnalysis, {});

  // Mutations
  const generateHealthReport = useMutation(api.platformAnalytics.generatePlatformHealthReport);
  const generateWeeklyReport = useMutation(api.automatedReporting.generateWeeklyReport);

  const handleGenerateReport = async (reportType: string) => {
    setIsGeneratingReport(true);
    try {
      if (reportType === "health") {
        await generateHealthReport();
        toast.success("Platform health report generated successfully");
      } else if (reportType === "weekly") {
        await generateWeeklyReport();
        toast.success("Weekly report generated successfully");
      }
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getMetricTrend = (current: number, growth: number) => {
    if (growth > 0) return { icon: TrendingUp, color: "text-green-600", direction: "up" };
    if (growth < 0) return { icon: TrendingDown, color: "text-red-600", direction: "down" };
    return { icon: Minus, color: "text-gray-600", direction: "neutral" };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (platformOverview === undefined) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Analytics</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600">
            Comprehensive insights into platform performance and growth
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleGenerateReport("health")}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
            Health Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(platformOverview.business.total)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {(() => {
                const trend = getMetricTrend(platformOverview.business.total, platformOverview.business.growthRate);
                const TrendIcon = trend.icon;
                return (
                  <>
                    <TrendIcon className={`h-3 w-3 mr-1 ${trend.color}`} />
                    {formatPercentage(Math.abs(platformOverview.business.growthRate))} from last period
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueOverview?.revenue.currentMRR || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {(() => {
                const growth = revenueOverview?.revenue.mrrGrowthRate || 0;
                const trend = getMetricTrend(revenueOverview?.revenue.currentMRR || 0, growth);
                const TrendIcon = trend.icon;
                return (
                  <>
                    <TrendIcon className={`h-3 w-3 mr-1 ${trend.color}`} />
                    {formatPercentage(Math.abs(growth))} from last month
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(userEngagement?.overview.activeUsers || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Eye className="h-3 w-3 mr-1" />
              {formatPercentage(userEngagement?.overview.activityRate || 0)} activity rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(platformOverview.leads.conversionRate)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              {formatNumber(platformOverview.leads.converted)} conversions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Health Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Platform Health Score
                </CardTitle>
                <CardDescription>Overall platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Business Growth</span>
                      <span className="text-sm">{formatPercentage(platformOverview.business.growthRate)}</span>
                    </div>
                    <Progress value={Math.max(0, Math.min(100, platformOverview.business.growthRate + 50))} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">User Engagement</span>
                      <span className="text-sm">{formatPercentage(userEngagement?.overview.activityRate || 0)}</span>
                    </div>
                    <Progress value={userEngagement?.overview.activityRate || 0} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Revenue Growth</span>
                      <span className="text-sm">{formatPercentage(revenueOverview?.revenue.mrrGrowthRate || 0)}</span>
                    </div>
                    <Progress value={Math.max(0, Math.min(100, (revenueOverview?.revenue.mrrGrowthRate || 0) + 50))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Plan Distribution
                </CardTitle>
                <CardDescription>Business tier breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
                      <span className="text-sm">Free</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatNumber(platformOverview.plans.free)}</div>
                      <div className="text-xs text-gray-500">
                        {formatPercentage((platformOverview.plans.free / platformOverview.business.total) * 100)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                      <span className="text-sm">Pro</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatNumber(platformOverview.plans.pro)}</div>
                      <div className="text-xs text-gray-500">
                        {formatPercentage((platformOverview.plans.pro / platformOverview.business.total) * 100)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                      <span className="text-sm">Power</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatNumber(platformOverview.plans.power)}</div>
                      <div className="text-xs text-gray-500">
                        {formatPercentage((platformOverview.plans.power / platformOverview.business.total) * 100)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="h-5 w-5 mr-2" />
                Performance Trends
              </CardTitle>
              <CardDescription>Key metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(businessTrends?.summary.totalNewBusinesses || 0)}</div>
                  <div className="text-sm text-gray-600">New Businesses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(businessTrends?.summary.totalLeads || 0)}</div>
                  <div className="text-sm text-gray-600">Total Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(businessTrends?.summary.totalPageViews || 0)}</div>
                  <div className="text-sm text-gray-600">Page Views</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
                <CardDescription>Monthly and annual recurring revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current MRR</span>
                    <span className="font-bold">{formatCurrency(revenueOverview?.revenue.currentMRR || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current ARR</span>
                    <span className="font-bold">{formatCurrency(revenueOverview?.revenue.currentARR || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">MRR Growth</span>
                    <span className={`font-bold ${(revenueOverview?.revenue.mrrGrowthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(revenueOverview?.revenue.mrrGrowthRate || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
                <CardDescription>Customer acquisition and conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Paid Businesses</span>
                    <span className="font-bold">{formatNumber(revenueOverview?.customers.paidBusinesses || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="font-bold">{formatPercentage(revenueOverview?.customers.conversionRate || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Revenue Per Business</span>
                    <span className="font-bold">{formatCurrency(revenueOverview?.value.arpb || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>User activity and retention metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Users</span>
                    <span className="font-bold">{formatNumber(userEngagement?.overview.totalUsers || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Users</span>
                    <span className="font-bold">{formatNumber(userEngagement?.overview.activeUsers || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Activity Rate</span>
                    <span className="font-bold">{formatPercentage(userEngagement?.overview.activityRate || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Retention Rate</span>
                    <span className="font-bold">{formatPercentage(userEngagement?.overview.retentionRate || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
                <CardDescription>User engagement levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userEngagement?.activityDistribution && Object.entries(userEngagement.activityDistribution).map(([level, data]) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{level.replace('Activity', '')}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatNumber(data.count)}</div>
                        <div className="text-xs text-gray-500">{formatPercentage(data.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Metrics</CardTitle>
                <CardDescription>Business growth and quality indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Claim Rate</span>
                    <span className="font-bold">{formatPercentage(platformOverview.business.claimRate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Verification Rate</span>
                    <span className="font-bold">{formatPercentage(platformOverview.business.verificationRate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Rating</span>
                    <span className="font-bold">{platformOverview.content.averageRating.toFixed(1)}/5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Review Coverage</span>
                    <span className="font-bold">{formatPercentage(platformOverview.content.reviewCoverage)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Quality</CardTitle>
                <CardDescription>Review and content metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Reviews</span>
                    <span className="font-bold">{formatNumber(platformOverview.content.totalReviews)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Reviews</span>
                    <span className="font-bold">{formatNumber(platformOverview.content.newReviews)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Businesses with Reviews</span>
                    <span className="font-bold">{formatNumber(platformOverview.content.businessesWithReviews)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Competitive Tab */}
        <TabsContent value="competitive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                  Market Position
                </CardTitle>
                <CardDescription>Competitive positioning analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Market Share</span>
                    <span className="font-bold">{formatPercentage(competitiveAnalysis?.marketMetrics.ourMarketShare || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Market Leadership</span>
                    <Badge variant={competitiveAnalysis?.competitivePosition.marketLeadership === "leader" ? "default" : "secondary"}>
                      {competitiveAnalysis?.competitivePosition.marketLeadership || "Unknown"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quality Position</span>
                    <Badge variant={competitiveAnalysis?.competitivePosition.qualityPosition === "premium" ? "default" : "secondary"}>
                      {competitiveAnalysis?.competitivePosition.qualityPosition || "Unknown"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
                <CardDescription>Market expansion potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {competitiveAnalysis?.marketOpportunities?.map((opportunity, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-sm">{opportunity.type}</div>
                      <div className="text-xs text-gray-600">{opportunity.description}</div>
                      <Badge size="sm" className="mt-1">
                        {opportunity.potential} potential
                      </Badge>
                    </div>
                  )) || (
                    <div className="text-sm text-gray-500">No opportunities identified</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}