/**
 * Admin Dashboard Overview - Phase 5.1.3
 * Main admin dashboard with platform metrics and quick actions
 */

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from "lucide-react";
import { Link } from "react-router";

export default function AdminDashboard() {
  const platformOverview = useQuery(api.admin.getPlatformOverview, {});
  const recentAdminActions = useQuery(api.admin.getAdminActionHistory, { limit: 10 });

  if (platformOverview === undefined) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { realTimeCounts, metrics } = platformOverview;

  // Calculate conversion rates and trends
  const businessConversionRate = realTimeCounts.totalBusinesses > 0 
    ? ((realTimeCounts.proBusinesses + realTimeCounts.powerBusinesses) / realTimeCounts.totalBusinesses) * 100 
    : 0;

  const powerTierRate = realTimeCounts.totalBusinesses > 0
    ? (realTimeCounts.powerBusinesses / realTimeCounts.totalBusinesses) * 100
    : 0;

  // Key metrics for overview cards
  const overviewMetrics = [
    {
      title: "Total Businesses",
      value: realTimeCounts.totalBusinesses.toLocaleString(),
      change: metrics ? realTimeCounts.totalBusinesses - metrics.totalBusinesses : 0,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Platform Users",
      value: realTimeCounts.totalUsers.toLocaleString(),
      change: metrics ? realTimeCounts.totalUsers - metrics.totalUsers : 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Revenue (Today)",
      value: `$${metrics?.totalRevenue?.toLocaleString() || "0"}`,
      change: 0, // Would need historical data for comparison
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Pending Reviews",
      value: realTimeCounts.pendingModerationCount.toString(),
      change: 0,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      urgent: realTimeCounts.pendingModerationCount > 10,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">
            Platform metrics and administrative controls for AZ Business Services
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date(platformOverview.lastUpdated).toLocaleTimeString()}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className={metric.urgent ? "border-orange-200 bg-orange-50" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${metric.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.change !== 0 && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    {metric.change > 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    {Math.abs(metric.change)} from yesterday
                  </div>
                )}
                {metric.urgent && (
                  <Badge variant="destructive" className="mt-2 text-xs">
                    Needs Attention
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Business Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Plan Distribution</CardTitle>
            <CardDescription>
              Breakdown of businesses by subscription tier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-sm">Free Tier</span>
                </div>
                <div className="text-sm font-medium">
                  {realTimeCounts.freeBusinesses} ({((realTimeCounts.freeBusinesses / realTimeCounts.totalBusinesses) * 100).toFixed(1)}%)
                </div>
              </div>
              <Progress 
                value={(realTimeCounts.freeBusinesses / realTimeCounts.totalBusinesses) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm">Pro Tier</span>
                </div>
                <div className="text-sm font-medium">
                  {realTimeCounts.proBusinesses} ({((realTimeCounts.proBusinesses / realTimeCounts.totalBusinesses) * 100).toFixed(1)}%)
                </div>
              </div>
              <Progress 
                value={(realTimeCounts.proBusinesses / realTimeCounts.totalBusinesses) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-sm">Power Tier</span>
                </div>
                <div className="text-sm font-medium">
                  {realTimeCounts.powerBusinesses} ({powerTierRate.toFixed(1)}%)
                </div>
              </div>
              <Progress 
                value={powerTierRate} 
                className="h-2"
              />
            </div>
            
            <div className="pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Conversion Rate (Free → Paid)</span>
                <span className="font-medium text-green-600">
                  {businessConversionRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/admin/moderation?status=pending_review">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Review Pending Businesses ({realTimeCounts.pendingModerationCount})
              </Link>
            </Button>
            
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/admin/businesses?filter=recently_claimed">
                <Clock className="h-4 w-4 mr-2" />
                Recent Business Claims
              </Link>
            </Button>
            
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/admin/users?filter=new_signups">
                <Users className="h-4 w-4 mr-2" />
                New User Signups
              </Link>
            </Button>
            
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/admin/analytics">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admin Actions</CardTitle>
          <CardDescription>
            Latest administrative activities across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAdminActions === undefined ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentAdminActions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p>No recent admin actions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAdminActions.map((action, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {action.adminName} performed "{action.action}"
                    </div>
                    <div className="text-xs text-gray-500">
                      Target: {action.targetType} • {new Date(action.timestamp).toLocaleString()}
                      {action.reason && ` • ${action.reason}`}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {action.targetType}
                  </Badge>
                </div>
              ))}
              
              <div className="pt-3 text-center">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/actions">
                    View All Actions
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}