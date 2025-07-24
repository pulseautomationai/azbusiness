/**
 * Business Intelligence Component
 * Product usage analytics, AI metrics, subscription analytics, and customer insights
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  Building, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Sparkles,
  Brain,
  CreditCard,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Package,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

// Chart components
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from "recharts";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

// Mock data for subscription analytics
const subscriptionData = [
  { month: 'Jul', starter: 12, pro: 8, power: 2, revenue: 1020 },
  { month: 'Aug', starter: 18, pro: 12, power: 3, revenue: 1590 },
  { month: 'Sep', starter: 25, pro: 18, power: 5, revenue: 2430 },
  { month: 'Oct', starter: 32, pro: 24, power: 8, revenue: 3480 },
  { month: 'Nov', starter: 38, pro: 28, power: 12, revenue: 4380 },
  { month: 'Dec', starter: 45, pro: 35, power: 15, revenue: 5550 },
];

// Mock data for AI usage
const aiUsageData = [
  { feature: 'Content Generation', usage: 3420, cost: 128.50, avgPerUser: 8.2 },
  { feature: 'Review Analysis', usage: 2180, cost: 54.20, avgPerUser: 5.3 },
  { feature: 'SEO Audit', usage: 1560, cost: 78.30, avgPerUser: 3.8 },
  { feature: 'Competitor Analysis', usage: 890, cost: 44.50, avgPerUser: 2.1 },
  { feature: 'Social Content', usage: 620, cost: 15.50, avgPerUser: 1.5 },
];

// Mock data for customer lifetime value
const clvData = [
  { tier: 'Starter', avgCLV: 108, avgMonths: 12, churnRate: 8.3 },
  { tier: 'Pro', avgCLV: 522, avgMonths: 18, churnRate: 5.6 },
  { tier: 'Power', avgCLV: 2328, avgMonths: 24, churnRate: 4.2 },
];

// Mock data for feature adoption
const featureAdoptionData = [
  { name: 'Business Claim', value: 82 },
  { name: 'Profile Customization', value: 68 },
  { name: 'Review Management', value: 45 },
  { name: 'AI Content', value: 38 },
  { name: 'Analytics Dashboard', value: 72 },
  { name: 'Lead Capture', value: 25 },
];

// Mock data for business performance
const businessPerformanceData = [
  { category: 'Plumbing', businesses: 145, avgRating: 4.3, claimRate: 68 },
  { category: 'HVAC', businesses: 132, avgRating: 4.5, claimRate: 72 },
  { category: 'Electrical', businesses: 98, avgRating: 4.2, claimRate: 65 },
  { category: 'Landscaping', businesses: 87, avgRating: 4.4, claimRate: 58 },
  { category: 'Roofing', businesses: 76, avgRating: 4.1, claimRate: 62 },
];

// Mock data for review sentiment
const reviewSentimentData = [
  { month: 'Jul', positive: 145, neutral: 32, negative: 18 },
  { month: 'Aug', positive: 168, neutral: 28, negative: 15 },
  { month: 'Sep', positive: 192, neutral: 35, negative: 12 },
  { month: 'Oct', positive: 215, neutral: 42, negative: 20 },
  { month: 'Nov', positive: 248, neutral: 38, negative: 18 },
  { month: 'Dec', positive: 285, neutral: 45, negative: 22 },
];

// Mock data for lead generation
const leadGenData = [
  { source: 'Contact Form', leads: 342, conversion: 23.4 },
  { source: 'Phone Clicks', leads: 428, conversion: 18.2 },
  { source: 'Email Clicks', leads: 156, conversion: 15.8 },
  { source: 'Direct Message', leads: 89, conversion: 28.9 },
];

export function BusinessIntelligence() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const adminMetrics = useQuery(api.adminAnalytics.getAdminDashboardMetrics);

  if (!adminMetrics) {
    return <div>Loading business intelligence...</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total AI cost
  const totalAICost = aiUsageData.reduce((sum, item) => sum + item.cost, 0);
  const totalAIUsage = aiUsageData.reduce((sum, item) => sum + item.usage, 0);

  return (
    <div className="space-y-6">
      {/* Business Intelligence Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Business Intelligence</h3>
          <p className="text-sm text-muted-foreground">
            Product usage, AI metrics, subscription analytics, and customer insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Business Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(adminMetrics.revenue.total)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+{adminMetrics.revenue.growth || 15.3}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminMetrics.subscriptions.active}</div>
            <p className="text-xs text-muted-foreground">
              {adminMetrics.subscriptions.plans.pro || 0} Pro, {adminMetrics.subscriptions.plans.power || 0} Power
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Usage</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAIUsage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalAICost)} in costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Revenue/User</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(adminMetrics.revenue.total / Math.max(adminMetrics.activeAccounts.total, 1))}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+8.7%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Analytics & Revenue Trends */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Subscription Growth & Revenue</CardTitle>
            <CardDescription>Monthly subscription tiers and revenue trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={subscriptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="starter"
                  stackId="1"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  name="Starter"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="pro"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  name="Pro"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="power"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  name="Power"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Customer Lifetime Value</CardTitle>
            <CardDescription>Average CLV by subscription tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clvData.map((tier) => (
                <div key={tier.tier} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{tier.tier}</span>
                    </div>
                    <span className="text-lg font-bold">{formatCurrency(tier.avgCLV)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{tier.avgMonths} months avg retention</span>
                    <span>{tier.churnRate}% churn</span>
                  </div>
                  <Progress value={100 - tier.churnRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>AI Feature Usage & Costs</CardTitle>
          <CardDescription>Breakdown of AI-powered features usage and associated costs</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="usage" className="space-y-4">
            <TabsList>
              <TabsTrigger value="usage">Usage Metrics</TabsTrigger>
              <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
              <TabsTrigger value="trends">Usage Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usage" className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aiUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feature" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#3b82f6" name="Total Usage" />
                  <Bar dataKey="avgPerUser" fill="#10b981" name="Avg per User" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="costs" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  {aiUsageData.map((feature) => (
                    <div key={feature.feature} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{feature.feature}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(feature.cost)}</p>
                        <p className="text-xs text-muted-foreground">{feature.usage} uses</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm text-blue-700">Total AI Costs</p>
                        <p className="text-3xl font-bold text-blue-900">{formatCurrency(totalAICost)}</p>
                        <p className="text-sm text-blue-600 mt-2">This Month</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm text-green-700">Cost per Active User</p>
                        <p className="text-3xl font-bold text-green-900">
                          {formatCurrency(totalAICost / adminMetrics.activeAccounts.total)}
                        </p>
                        <p className="text-sm text-green-600 mt-2">Average</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <p className="text-sm text-muted-foreground">AI usage trends visualization coming soon...</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Feature Adoption & Business Performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Feature Adoption */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Feature Adoption Rate</CardTitle>
            <CardDescription>Percentage of users using each feature</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={featureAdoptionData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" className="text-xs" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Adoption %" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Business Performance by Category */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Business Performance by Category</CardTitle>
            <CardDescription>Category distribution and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {businessPerformanceData.map((category) => (
                <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{category.category}</span>
                      <Badge variant="secondary">{category.businesses} businesses</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span>Avg: {category.avgRating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{category.claimRate}% claimed</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Sentiment & Lead Generation */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Review Sentiment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Review Sentiment Trends</CardTitle>
            <CardDescription>Monthly breakdown of review sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reviewSentimentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="positive"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  name="Positive"
                />
                <Area
                  type="monotone"
                  dataKey="neutral"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  name="Neutral"
                />
                <Area
                  type="monotone"
                  dataKey="negative"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  name="Negative"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Generation Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Generation Performance</CardTitle>
            <CardDescription>Lead sources and conversion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadGenData.map((source) => (
                <div key={source.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{source.source}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{source.leads} leads</Badge>
                      <Badge variant={source.conversion > 20 ? "default" : "secondary"}>
                        {source.conversion}% conv
                      </Badge>
                    </div>
                  </div>
                  <Progress value={source.conversion} className="h-2" />
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Leads Generated</span>
                  <span className="font-bold">{leadGenData.reduce((sum, s) => sum + s.leads, 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Average Conversion Rate</span>
                  <span className="font-bold">
                    {(leadGenData.reduce((sum, s) => sum + s.conversion, 0) / leadGenData.length).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}