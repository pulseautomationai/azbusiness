import { useParams, Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "~/components/ui/breadcrumb";
import { 
  ArrowLeft,
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  FileText,
  User,
  Calendar,
  Database,
  ExternalLink
} from "lucide-react";
import { ImportValidation } from "~/components/admin/ImportValidation";

export default function ImportBatchDetail() {
  const { batchId } = useParams();
  
  // Get batch details
  const batch = useQuery(
    api.batchImport.getImportBatches, 
    { limit: 1 }
  )?.find(b => b._id === batchId);

  // Get validation results
  const validationResults = useQuery(
    api.importValidation.getValidationResults,
    batchId ? { batchId: batchId as Id<"importBatches"> } : "skip"
  );

  // Get businesses imported in this batch
  const businesses = useQuery(
    api.businesses.getBusinesses,
    { limit: 20 }
  )?.filter(business => 
    business.dataSource?.metadata?.importBatchId === batchId
  );

  if (!batchId) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Invalid batch ID. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Import batch not found. It may have been deleted or you may not have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (start: number, end?: number) => {
    if (!end) return "In progress...";
    const duration = end - start;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/imports">Imports</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Batch {batchId.slice(-8)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/admin/imports">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Imports
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Import Batch Details</h1>
            <p className="text-muted-foreground">
              Detailed view and validation results for batch {batchId.slice(-8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(batch.status)}
          <Badge className={getStatusBadge(batch.status)}>
            {batch.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Batch Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Batch Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Batch ID</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                  {batchId}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Import Type</label>
                <p className="text-sm">
                  {batch.importType.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Source</label>
                <Badge variant="outline">
                  {batch.source.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Business Count</label>
                <p className="text-sm">{batch.businessCount} businesses</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Imported By</label>
              </div>
              <p className="text-sm">{batch.importedByName}</p>
              <p className="text-xs text-gray-500">{batch.importedByEmail}</p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Import Timeline</label>
              </div>
              <div className="space-y-1 text-sm">
                <div>Started: {new Date(batch.importedAt).toLocaleString()}</div>
                {batch.completedAt && (
                  <div>Completed: {new Date(batch.completedAt).toLocaleString()}</div>
                )}
                <div>Duration: {formatDuration(batch.createdAt, batch.completedAt)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {batch.results ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {batch.results.created}
                    </div>
                    <p className="text-sm text-green-700">Successfully Created</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {batch.results.updated}
                    </div>
                    <p className="text-sm text-blue-700">Updated</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {batch.results.duplicates}
                    </div>
                    <p className="text-sm text-yellow-700">Duplicates Skipped</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {batch.results.failed}
                    </div>
                    <p className="text-sm text-red-700">Failed</p>
                  </div>
                </div>

                {/* Success Rate */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-sm font-bold">
                      {Math.round((batch.results.created / batch.businessCount) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.round((batch.results.created / batch.businessCount) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No import results available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Errors Section */}
      {batch.errors && batch.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Import Errors ({batch.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {batch.errors.slice(0, 10).map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              ))}
              {batch.errors.length > 10 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  ... and {batch.errors.length - 10} more errors
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source Metadata */}
      {batch.sourceMetadata && (
        <Card>
          <CardHeader>
            <CardTitle>Source Metadata</CardTitle>
            <CardDescription>
              Additional information about the import source
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(batch.sourceMetadata, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Imported Businesses */}
      {businesses && businesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Imported Businesses ({businesses.length})</span>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/admin/businesses?source=${batch.source}&date=all`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {businesses.slice(0, 10).map((business) => (
                <div key={business._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{business.name}</p>
                    <p className="text-sm text-gray-600">
                      {business.city}, {business.state} • {business.phone}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {business.urlPath}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={business.active ? "default" : "secondary"}>
                      {business.active ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={business.urlPath || '#'}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {businesses.length > 10 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  ... and {businesses.length - 10} more businesses
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validationResults ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Validation Results</h2>
          <ImportValidation 
            batchId={batchId as Id<"importBatches">} 
            validationResults={validationResults}
          />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Validation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No validation results available for this batch</p>
              <p className="text-sm text-gray-500 mb-4">
                Run validation from the Import Management interface to assess quality
              </p>
              <Button variant="outline" asChild>
                <Link to="/admin/imports?tab=history">
                  Go to Import History
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}