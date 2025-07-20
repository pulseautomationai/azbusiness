"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  BarChart3,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  Download,
  RefreshCw,
  Clock,
  Database,
  Shield,
  Search,
  Map,
  Zap,
  Info
} from "lucide-react";

interface ImportValidationProps {
  batchId: Id<"importBatches">;
  validationResults?: any;
  showCompact?: boolean;
}

export function ImportValidation({ batchId, validationResults, showCompact = false }: ImportValidationProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get validation results if not provided
  const fetchedResults = useQuery(
    api.importValidation.getValidationResults,
    validationResults ? "skip" : { batchId }
  );

  const results = validationResults || fetchedResults;

  if (!results) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">No validation results available</p>
            <p className="text-xs text-gray-500">Run a validation to see detailed results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper functions
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return "default";
    if (score >= 75) return "secondary";
    return "destructive";
  };

  const getCategoryIcon = (categoryKey: string) => {
    switch (categoryKey) {
      case "databaseIntegrity": return Database;
      case "dataQuality": return Shield;
      case "seoCompliance": return Search;
      case "sitemapIntegration": return Map;
      case "functionalSystems": return Zap;
      case "performance": return Clock;
      default: return Info;
    }
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (showCompact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Validation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Score</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${getScoreColor(results.overallScore)}`}>
                  {results.overallScore}/100
                </span>
                <Badge variant={getScoreBadgeVariant(results.overallScore)} className="text-xs">
                  {results.overallScore >= 90 ? 'Excellent' :
                   results.overallScore >= 75 ? 'Good' : 'Issues'}
                </Badge>
              </div>
            </div>

            {/* Category Summary */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(results.categories).map(([categoryKey, category]: [string, any]) => {
                const categoryName = categoryKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const Icon = getCategoryIcon(categoryKey);
                
                return (
                  <div key={categoryKey} className="flex items-center gap-2 text-xs">
                    <Icon className="h-3 w-3 text-gray-500" />
                    <span className="truncate">{categoryName}</span>
                    <Badge variant={category.passed ? "outline" : "destructive"} className="text-xs">
                      {category.score}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="text-xs text-gray-600 space-y-1">
              <div>Validated: {formatTimestamp(results.completedAt || results.startedAt)}</div>
              <div>
                Status: <span className={results.status === "completed" ? "text-green-600" : "text-red-600"}>
                  {results.status}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Import Validation Results
              </CardTitle>
              <CardDescription>
                Comprehensive quality assessment for batch {batchId.slice(-8)}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(results.overallScore)}`}>
                {results.overallScore}
                <span className="text-xl">/100</span>
              </div>
              <Badge variant={getScoreBadgeVariant(results.overallScore)} className="text-sm">
                {results.overallScore >= 90 ? 'Excellent Quality' :
                 results.overallScore >= 75 ? 'Good Quality' : 'Needs Attention'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="samples">Samples</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {results.statistics.successfulCreated}
                </div>
                <p className="text-sm text-gray-600">Businesses Created</p>
                <p className="text-xs text-gray-500">
                  Expected: {results.statistics.expectedBusinesses}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {results.statistics.duplicatesSkipped}
                </div>
                <p className="text-sm text-gray-600">Duplicates Skipped</p>
                <p className="text-xs text-gray-500">
                  Rate: {((results.statistics.duplicatesSkipped / results.statistics.expectedBusinesses) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {results.statistics.failedCreated}
                </div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-xs text-gray-500">
                  Rate: {((results.statistics.failedCreated / results.statistics.expectedBusinesses) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(results.categories).filter((cat: any) => cat.passed).length}
                </div>
                <p className="text-sm text-gray-600">Categories Passed</p>
                <p className="text-xs text-gray-500">
                  Out of {Object.keys(results.categories).length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Validation Time</span>
                  <span className="font-mono text-sm">
                    {formatDuration((results.completedAt || Date.now()) - results.startedAt)}
                  </span>
                </div>
                
                {Object.entries(results.categories).map(([categoryKey, category]: [string, any]) => {
                  const categoryName = categoryKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  return (
                    <div key={categoryKey} className="flex justify-between items-center">
                      <span className="text-sm">{categoryName}</span>
                      <span className="font-mono text-sm">{formatDuration(category.duration)}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {results.recommendations && results.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-800">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(results.categories).map(([categoryKey, category]: [string, any]) => {
              const categoryName = categoryKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              const Icon = getCategoryIcon(categoryKey);
              
              return (
                <Card key={categoryKey}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5" />
                        {categoryName}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={category.passed ? "default" : "destructive"}>
                          {category.score}/100
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDuration(category.duration)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.checks.map((check: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-start gap-3">
                            {check.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{check.name}</span>
                                <Badge variant={check.passed ? "outline" : "destructive"} className="text-xs">
                                  {check.passed ? "Passed" : "Failed"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                              
                              {check.details && (
                                <details className="mt-2">
                                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                    View Details
                                  </summary>
                                  <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                                    {JSON.stringify(check.details, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Samples Tab */}
        <TabsContent value="samples" className="space-y-4">
          {results.sampleBusinesses && results.sampleBusinesses.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sample Businesses for Testing</CardTitle>
                <CardDescription>
                  Test these randomly selected businesses to verify your import quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.sampleBusinesses.map((business: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{business.name}</h4>
                        <p className="text-sm text-gray-600">{business.city} • {business.category}</p>
                        <p className="text-xs text-gray-500 font-mono">{business.urlPath}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`${window.location.origin}${business.urlPath}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Test Live
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`/admin/businesses/${business._id}`, '_blank')}
                        >
                          View in Admin
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <ExternalLink className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">No sample businesses available</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          {/* Errors and Issues */}
          {results.errors && results.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Errors & Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.errors.map((error: any, index: number) => (
                    <Alert key={index} variant={error.severity === "error" ? "destructive" : "default"}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              error.severity === "error" ? "destructive" :
                              error.severity === "warning" ? "secondary" : "outline"
                            }>
                              {error.severity.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{error.category}</span>
                          </div>
                          <p>{error.message}</p>
                          {error.businessId && (
                            <p className="text-xs text-gray-500">Business ID: {error.businessId}</p>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const filename = `validation-${batchId.slice(-8)}-${timestamp}.json`;
                    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Generate CSV summary
                    const csvRows = [
                      ['Category', 'Passed', 'Score', 'Duration'],
                      ...Object.entries(results.categories).map(([key, cat]: [string, any]) => [
                        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                        cat.passed ? 'Yes' : 'No',
                        cat.score.toString(),
                        formatDuration(cat.duration)
                      ])
                    ];
                    
                    const csvContent = csvRows.map(row => row.join(',')).join('\n');
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const filename = `validation-summary-${batchId.slice(-8)}-${timestamp}.csv`;
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV Summary
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Validation Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Batch ID:</span>
                  <p className="font-mono text-xs">{batchId}</p>
                </div>
                <div>
                  <span className="font-medium">Started:</span>
                  <p>{formatTimestamp(results.startedAt)}</p>
                </div>
                <div>
                  <span className="font-medium">Completed:</span>
                  <p>{results.completedAt ? formatTimestamp(results.completedAt) : 'In Progress'}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p className={results.status === "completed" ? "text-green-600" : "text-red-600"}>
                    {results.status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}