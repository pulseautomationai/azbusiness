"use client";

import { useState } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Progress } from "~/components/ui/progress";
import { toast } from "~/hooks/use-toast";
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Activity,
  BarChart3,
  Users,
  TrendingUp,
  Database,
  Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BulkSyncInterface } from "~/components/admin/BulkSyncInterface";

export default function ReviewSyncDashboard() {
  const [processingQueue, setProcessingQueue] = useState(false);

  // Queries
  const queueStatus = useQuery(api.geoScraperQueue.getQueueStatus);
  const recentActivity = useQuery(api.reviewSync.getRecentSyncActivity, { limit: 20 });
  const metrics = useQuery(api.geoScraperMetrics.getMetricsSummary, { timeRange: "day" });
  const hourlyMetrics = useQuery(api.geoScraperMetrics.getHourlyMetrics, { hours: 24 });
  const currentQueueMetrics = useQuery(api.geoScraperMetrics.getCurrentQueueMetrics);
  const recentErrors = useQuery(api.bulkSync.getRecentSyncErrors, { limit: 10 });

  // Actions
  const processQueue = useAction(api.geoScraperProcessor.processQueue);
  const dailySync = useAction(api.reviewSync.dailyReviewSync);

  // Mutations
  const clearStuckItems = useMutation(api.geoScraperQueue.clearStuckItems);

  const handleProcessQueue = async () => {
    setProcessingQueue(true);
    try {
      const result = await processQueue({ maxItems: 10 });
      toast({
        title: "Queue processed",
        description: `Processed ${result.processed} items, ${result.failed} failed, ${result.remaining} remaining`,
      });
    } catch (error) {
      toast({
        title: "Error processing queue",
        description: "Failed to process queue items",
        variant: "destructive",
      });
    } finally {
      setProcessingQueue(false);
    }
  };

  const handleDailySync = async () => {
    try {
      toast({
        title: "Starting daily sync...",
        description: "This may take a few minutes",
      });
      
      const result = await dailySync({});
      
      toast({
        title: "Daily sync completed",
        description: `Found ${result.businessesFound} businesses, added ${result.addedToQueue} to queue, processed ${result.processed}`,
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to run daily sync",
        variant: "destructive",
      });
    }
  };

  const handleClearStuck = async () => {
    try {
      const result = await clearStuckItems({});
      toast({
        title: "Cleared stuck items",
        description: `Cleared ${result.cleared} stuck items from queue`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear stuck items",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateSuccessRate = () => {
    if (!metrics) return 0;
    const total = metrics.successfulRequests + metrics.failedRequests;
    return total > 0 ? Math.round((metrics.successfulRequests / total) * 100) : 0;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Review Sync Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage Google review synchronization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleClearStuck}
            disabled={!currentQueueMetrics || currentQueueMetrics.activeConnections === 0}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Clear Stuck
          </Button>
          <Button
            variant="outline"
            onClick={handleDailySync}
          >
            <Clock className="h-4 w-4 mr-2" />
            Run Daily Sync
          </Button>
          <Button
            onClick={handleProcessQueue}
            disabled={processingQueue || !queueStatus || queueStatus.pendingCount === 0}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${processingQueue ? 'animate-spin' : ''}`} />
            Process Queue
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queueStatus?.pendingCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              items pending
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {queueStatus?.processingCount || 0} processing
              </Badge>
              <Badge variant="outline" className="text-xs">
                {queueStatus?.maxConnections || 3} max
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateSuccessRate()}%
            </div>
            <p className="text-xs text-muted-foreground">
              last 24 hours
            </p>
            <Progress value={calculateSuccessRate()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Synced</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalReviewsImported || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              from {metrics?.totalReviewsFetched || 0} fetched
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentQueueMetrics?.avgProcessingTime || 0}s
            </div>
            <p className="text-xs text-muted-foreground">
              per business
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Sync</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync Activity</CardTitle>
              <CardDescription>
                Latest review sync operations across all businesses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity?.map((log: any) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-medium">
                        {log.businessName}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(log.syncStarted), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {log.syncCompleted ? 
                          `${Math.round((log.syncCompleted - log.syncStarted) / 1000)}s` : 
                          '—'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{log.reviewsImported}</span>
                          <span className="text-muted-foreground"> / {log.reviewsFetched}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getStatusColor(log.status)}`}>
                          {log.status === "success" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {log.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                          {log.status === "partial" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!recentActivity || recentActivity.length === 0) && (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No recent sync activity</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Error Details Card */}
          {recentErrors && recentErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Recent Sync Errors</CardTitle>
                <CardDescription>
                  Error details for failed sync attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentErrors.map((error: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3 bg-red-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{error.businessName}</h4>
                        <Badge variant="destructive" className="text-xs">
                          {error.retryCount} retries
                        </Badge>
                      </div>
                      <p className="text-sm text-red-600 font-mono mb-1">{error.error}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Place ID: {error.placeId}</span>
                        <span>Failed: {formatDistanceToNow(new Date(error.failedAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Sync Metrics</CardTitle>
              <CardDescription>
                API requests and review imports over the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hourlyMetrics?.slice(-12).map((hour: any) => (
                  <div key={hour.hour} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">
                      {new Date(hour.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {hour.requests} requests
                        </Badge>
                        <Badge variant="outline" className="text-xs text-green-600">
                          {hour.successes} success
                        </Badge>
                        {hour.errors > 0 && (
                          <Badge variant="outline" className="text-xs text-red-600">
                            {hour.errors} errors
                          </Badge>
                        )}
                      </div>
                      <Progress 
                        value={hour.requests > 0 ? (hour.successes / hour.requests) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{hour.reviewsImported}</span>
                      <span className="text-muted-foreground"> reviews</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
              <CardDescription>
                Error rates by type over the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics?.errorRates && Object.entries(metrics.errorRates).map(([type, rate]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{type}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round((rate as number) * 100)}%
                    </Badge>
                  </div>
                ))}
                {(!metrics?.errorRates || Object.keys(metrics.errorRates).length === 0) && (
                  <p className="text-sm text-muted-foreground">No errors in the last 24 hours</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Configuration</CardTitle>
              <CardDescription>
                Manage automated review sync settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Scheduled Sync</h3>
                <p className="text-sm text-muted-foreground">
                  Daily sync runs at 2:00 AM MST
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Concurrency Limit</h3>
                <p className="text-sm text-muted-foreground">
                  Maximum 3 concurrent API connections
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Priority Order</h3>
                <div className="space-y-1">
                  <Badge className="bg-purple-100 text-purple-800">Power</Badge>
                  <span className="text-sm text-muted-foreground"> → </span>
                  <Badge className="bg-blue-100 text-blue-800">Pro</Badge>
                  <span className="text-sm text-muted-foreground"> → </span>
                  <Badge className="bg-green-100 text-green-800">Starter</Badge>
                  <span className="text-sm text-muted-foreground"> → </span>
                  <Badge className="bg-gray-100 text-gray-800">Free</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <BulkSyncInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
}