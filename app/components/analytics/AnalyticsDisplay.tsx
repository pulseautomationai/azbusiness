import { useQuery } from "convex/react";
import { BarChart3, Eye, Phone, Mail, MapPin, TrendingUp, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface AnalyticsDisplayProps {
  businessId: Id<"businesses">;
  timeRange?: "day" | "week" | "month" | "year";
  className?: string;
}

// Main analytics component for Pro/Power tier insights
export function AnalyticsDisplay({ 
  businessId, 
  timeRange = "month", 
  className = "" 
}: AnalyticsDisplayProps) {
  const analytics = useQuery(api.analytics.getBusinessAnalytics, {
    businessId,
    timeRange,
  });

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeRangeLabels = {
    day: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year"
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics Overview
          <Badge variant="secondary" className="text-xs">
            {timeRangeLabels[timeRange]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Page Views</span>
            </div>
            <div className="text-2xl font-bold">
              {analytics.eventCounts.page_view || 0}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Phone Clicks</span>
            </div>
            <div className="text-2xl font-bold">
              {analytics.eventCounts.phone_click || 0}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Leads</span>
            </div>
            <div className="text-2xl font-bold">
              {analytics.eventCounts.lead_submit || 0}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Directions</span>
            </div>
            <div className="text-2xl font-bold">
              {analytics.eventCounts.directions_click || 0}
            </div>
          </div>
        </div>

        {/* Device Breakdown */}
        {Object.keys(analytics.deviceTypes).length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Device Types</h4>
            <div className="space-y-3">
              {Object.entries(analytics.deviceTypes).map(([device, count]) => {
                const percentage = Math.round((count / analytics.totalEvents) * 100);
                return (
                  <div key={device} className="flex items-center gap-3">
                    <span className="capitalize text-sm w-16">{device}</span>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm font-medium w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Daily Views Chart */}
        {analytics.dailyViews.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Daily Activity</h4>
            <div className="space-y-2">
              {analytics.dailyViews.slice(-7).map((day, index) => {
                const maxViews = Math.max(...analytics.dailyViews.map(d => d.count));
                const percentage = maxViews > 0 ? (day.count / maxViews) * 100 : 0;
                
                return (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-sm w-20">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm font-medium w-8">{day.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Event Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Events</span>
              <div className="font-medium">{analytics.totalEvents}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Time Period</span>
              <div className="font-medium">
                {analytics.timeRange.start && 
                  new Date(analytics.timeRange.start).toLocaleDateString()
                } - {
                  new Date(analytics.timeRange.end).toLocaleDateString()
                }
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {analytics.totalEvents === 0 && (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No Analytics Data Yet</h3>
            <p className="text-sm text-muted-foreground">
              Analytics will appear here once customers start viewing your listing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for sidebar display
export function CompactAnalytics({ 
  businessId, 
  className = "" 
}: { businessId: Id<"businesses">; className?: string }) {
  const analytics = useQuery(api.analytics.getBusinessAnalytics, {
    businessId,
    timeRange: "month",
  });

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-6 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          This Month
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Page Views</span>
          <span className="font-medium">{analytics.eventCounts.page_view || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Phone Clicks</span>
          <span className="font-medium">{analytics.eventCounts.phone_click || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Leads</span>
          <span className="font-medium">{analytics.eventCounts.lead_submit || 0}</span>
        </div>
      </CardContent>
    </Card>
  );
}