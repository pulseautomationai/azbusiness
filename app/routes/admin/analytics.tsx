/**
 * Analytics Dashboard - Main Route
 * Comprehensive analytics platform with tabbed navigation
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Building, 
  Zap, 
  BarChart3,
  Activity,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';

// Import analytics sections
import { OverviewDashboard } from '~/components/analytics/overview/OverviewDashboard';
import { UserAnalytics } from '~/components/analytics/users/UserAnalytics';
import { BusinessIntelligence } from '~/components/analytics/business/BusinessIntelligence';
import { PerformanceMonitoring } from '~/components/analytics/performance/PerformanceMonitoring';

// Import hooks
import { useRealTimeMetrics } from '~/hooks/useRealTimeData';
import { useAnalytics } from '~/hooks/useAnalytics';

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { metrics, isLoading, refresh } = useRealTimeMetrics();
  const { track } = useAnalytics();

  // Track tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    track('analytics_tab_changed', {
      tab: value,
      timestamp: new Date().toISOString(),
    });
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    track('analytics_refreshed', {
      tab: activeTab,
      timestamp: new Date().toISOString(),
    });
    
    await refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Handle data export
  const handleExport = () => {
    track('analytics_exported', {
      tab: activeTab,
      format: 'csv',
      timestamp: new Date().toISOString(),
    });
    
    // TODO: Implement actual export functionality
    console.log('Exporting analytics data...');
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive business intelligence and performance insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Live Data
          </Badge>
          <Button
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline" 
            size="sm" 
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Real-time Status Bar */}
      {metrics && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Live Metrics</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Users: <span className="font-semibold text-foreground">{metrics.activeUsers}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Today's Revenue: <span className="font-semibold text-foreground">${metrics.revenueToday.toFixed(0)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Conversion Rate: <span className="font-semibold text-foreground">{metrics.conversionRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated: {metrics.lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabbed Analytics Dashboard */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewDashboard />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserAnalytics />
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <BusinessIntelligence />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceMonitoring />
        </TabsContent>
      </Tabs>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading analytics data...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}