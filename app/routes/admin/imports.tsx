"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { 
  Upload, 
  FileText, 
  Database, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Settings
} from "lucide-react";
import { ImportWizard } from "~/components/admin/ImportWizard";
import { ImportHistory } from "~/components/admin/ImportHistory";
import { DataSourceManager } from "~/components/admin/DataSourceManager";
import { ReviewImportManager } from "~/components/admin/ReviewImportManager";

export default function AdminImports() {
  const [activeTab, setActiveTab] = useState("overview");

  // Get import statistics
  const importBatches = useQuery(api.batchImport.getImportBatches, { limit: 10 });
  const importStats = useQuery(api.batchImport.getImportStats);

  // Calculate metrics from recent batches
  const recentBatches = importBatches?.slice(0, 10) || [];
  const totalImports = recentBatches.length;
  const successfulImports = recentBatches.filter(batch => batch.status === "completed").length;
  const failedImports = recentBatches.filter(batch => batch.status === "failed").length;
  const pendingImports = recentBatches.filter(batch => batch.status === "pending").length;
  const successRate = totalImports > 0 ? Math.round((successfulImports / totalImports) * 100) : 0;

  // Get total businesses imported
  const totalBusinessesImported = recentBatches.reduce((sum, batch) => {
    return sum + (batch.results?.created || 0);
  }, 0);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Import Management</h1>
          <p className="text-muted-foreground">
            Manage CSV imports and data source integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {importStats?.totalBusinesses || 0} Total Businesses
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {successRate}% Success Rate
          </Badge>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Imports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImports}</div>
            <p className="text-xs text-muted-foreground">
              Last 10 batches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {successfulImports} of {totalImports} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Businesses Imported</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalBusinessesImported}</div>
            <p className="text-xs text-muted-foreground">
              From recent imports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Imports</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingImports}</div>
            <p className="text-xs text-muted-foreground">
              {failedImports > 0 && `${failedImports} failed`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload CSV
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Data Sources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Import Activity</CardTitle>
                <CardDescription>
                  Latest import batches and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBatches.slice(0, 5).map((batch) => (
                    <div key={batch._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {batch.status === "completed" && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {batch.status === "failed" && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        {batch.status === "pending" && (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {batch.importType} Import
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(batch.importedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {batch.results?.created || batch.businessCount} businesses
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {batch.source}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentBatches.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No recent imports</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Import Sources Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Import Sources</CardTitle>
                <CardDescription>
                  Distribution of data sources across imports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {importStats && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span className="text-sm">Google My Business</span>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round((importStats.totalBusinesses * 0.6))} businesses
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span className="text-sm">Admin Import</span>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round((importStats.totalBusinesses * 0.3))} businesses
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded"></div>
                          <span className="text-sm">Manual Entry</span>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round((importStats.totalBusinesses * 0.1))} businesses
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common import management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                <Button 
                  onClick={() => setActiveTab("upload")}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Businesses
                </Button>
                <Button 
                  onClick={() => setActiveTab("reviews")}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <FileText className="h-4 w-4" />
                  Import Reviews
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab("history")}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  View History
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab("sources")}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Data Sources
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <ImportWizard />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewImportManager />
        </TabsContent>

        <TabsContent value="history">
          <ImportHistory />
        </TabsContent>

        <TabsContent value="sources">
          <DataSourceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}