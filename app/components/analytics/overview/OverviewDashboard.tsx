/**
 * Overview Dashboard Component
 * Main analytics dashboard with KPIs, revenue trends, and conversion funnels
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building, 
  Target,
  Zap,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight
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
  Funnel,
  FunnelChart
} from "recharts";

// Hooks
import { useRealTimeMetrics, useConversionFunnel, useRealTimeUserActivity } from "~/hooks/useRealTimeData";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

// Mock data for charts (fallback when real data not available)
const mockRevenueData = [
  { month: 'Jul', revenue: 1200, subscriptions: 15 },
  { month: 'Aug', revenue: 1800, subscriptions: 22 },
  { month: 'Sep', revenue: 2400, subscriptions: 28 },
  { month: 'Oct', revenue: 3200, subscriptions: 35 },
  { month: 'Nov', revenue: 4100, subscriptions: 42 },
  { month: 'Dec', revenue: 5300, subscriptions: 51 },
];

const mockTrafficData = [
  { day: 'Mon', visitors: 245, pageViews: 720 },
  { day: 'Tue', visitors: 312, pageViews: 890 },
  { day: 'Wed', visitors: 178, pageViews: 580 },
  { day: 'Thu', visitors: 290, pageViews: 940 },
  { day: 'Fri', visitors: 445, pageViews: 1250 },
  { day: 'Sat', visitors: 380, pageViews: 980 },
  { day: 'Sun', visitors: 290, pageViews: 750 },
];

const mockPlanDistributionData = [
  { name: 'Free', value: 65, color: '#94a3b8' },
  { name: 'Starter', value: 20, color: '#3b82f6' },
  { name: 'Pro', value: 12, color: '#10b981' },
  { name: 'Power', value: 3, color: '#f59e0b' },
];

export function OverviewDashboard() {
  const { metrics, isLoading } = useRealTimeMetrics();
  const funnelData = useConversionFunnel();
  const { activity } = useRealTimeUserActivity();
  const adminMetrics = useQuery(api.adminAnalyticsLite.getAdminDashboardMetricsLite);
  
  // Real data from Convex - using lite versions to avoid byte limit issues
  const realRevenueData = useQuery(api.adminAnalyticsLite.getRevenueHistoryLite);
  const realPlanDistribution = useQuery(api.adminAnalyticsLite.getPlanDistributionLite);
  // Disabled getRealTimeMetrics due to byte limit issues - using adminMetrics instead
  // const realMetrics = useQuery(api.analytics.getRealTimeMetrics);
  const realMetrics = adminMetrics; // Use the lite version that's already loaded
  const realActivity = useQuery(api.analytics.getRecentActivity); // This one is already limited
  const realFunnelData = useQuery(api.adminAnalyticsLite.getConversionFunnelLite);
  
  // Use real data if available, otherwise fallback to mock
  const revenueData = realRevenueData || mockRevenueData;
  const planDistributionData = realPlanDistribution || mockPlanDistributionData;
  const trafficData = mockTrafficData; // Still mock until PostHog integration

  // Define helper functions before any conditional returns
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading || !adminMetrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading overview data...</p>
        </div>
      </div>
    );
  }
  
  // Use real metrics if available
  const displayMetrics = realMetrics || adminMetrics;
  const displayActivity = realActivity || activity;
  const displayFunnelData = realFunnelData || funnelData;

  return (
    <div className="space-y-6">
      {/* KPI Cards Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (MRR)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(displayMetrics.revenue.total)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(displayMetrics.users?.total || adminMetrics.activeAccounts.total).toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +8.2% from last month
            </div>
          </CardContent>
        </Card>

        {/* Total Businesses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayMetrics.businesses.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +15.3% from last month
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayFunnelData.rates.overall.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +2.1% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart and Plan Distribution */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>Monthly recurring revenue and subscription growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value as number) : value,
                    name === 'revenue' ? 'Revenue' : 'Subscriptions'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Current subscription tier breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {planDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {planDistributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel and Live Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>User journey from visitor to paying customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Visitors */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Visitors</p>
                  <p className="text-2xl font-bold text-blue-700">{formatNumber(displayFunnelData.visitors)}</p>
                </div>
                <div className="text-blue-600">
                  <Users className="h-8 w-8" />
                </div>
              </div>

              {/* Signups */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Signups</p>
                  <p className="text-2xl font-bold text-green-700">{formatNumber(displayFunnelData.signups)}</p>
                  <p className="text-sm text-green-600">{displayFunnelData.rates.visitorToSignup.toFixed(1)}% conversion</p>
                </div>
                <div className="text-green-600">
                  <Target className="h-8 w-8" />
                </div>
              </div>

              {/* Claims */}
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-orange-900">Business Claims</p>
                  <p className="text-2xl font-bold text-orange-700">{formatNumber(displayFunnelData.claimed)}</p>
                  <p className="text-sm text-orange-600">{displayFunnelData.rates.signupToClaim.toFixed(1)}% conversion</p>
                </div>
                <div className="text-orange-600">
                  <Building className="h-8 w-8" />
                </div>
              </div>

              {/* Subscriptions */}
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-900">Paid Subscriptions</p>
                  <p className="text-2xl font-bold text-purple-700">{formatNumber(displayFunnelData.subscribed)}</p>
                  <p className="text-sm text-purple-600">{displayFunnelData.rates.claimToSubscription.toFixed(1)}% conversion</p>
                </div>
                <div className="text-purple-600">
                  <DollarSign className="h-8 w-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Activity
            </CardTitle>
            <CardDescription>Real-time user actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {displayActivity && displayActivity.length > 0 ? displayActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    item.type === 'signup' ? 'bg-green-500' :
                    item.type === 'claim' ? 'bg-blue-500' :
                    item.type === 'subscribe' ? 'bg-purple-500' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.user}</p>
                    <p className="text-muted-foreground">
                      {item.type === 'signup' && 'Created new account'}
                      {item.type === 'claim' && `Claimed ${item.business}`}
                      {item.type === 'subscribe' && 'Upgraded to premium'}
                      {item.type === 'view' && `Viewed ${item.business}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-8">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Traffic Overview</CardTitle>
          <CardDescription>Daily visitors and page views for the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visitors" fill="#3b82f6" name="Unique Visitors" />
              <Bar dataKey="pageViews" fill="#10b981" name="Page Views" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Session Duration</p>
                <p className="text-2xl font-bold">3m 42s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Bounce Rate</p>
                <p className="text-2xl font-bold">42.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ArrowUpRight className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pages per Session</p>
                <p className="text-2xl font-bold">2.8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Goal Completion</p>
                <p className="text-2xl font-bold">23.7%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}