"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Progress } from "~/components/ui/progress";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  Filter,
  Calendar,
  User,
  Database,
  BarChart3,
  Shield,
  ExternalLink
} from "lucide-react";
import { toast } from "~/hooks/use-toast";

interface ImportBatch {
  _id: Id<"importBatches">;
  importType: string;
  importedBy: Id<"users">;
  importedByName: string;
  importedByEmail: string;
  source: string;
  sourceMetadata?: any;
  businessCount: number;
  reviewCount?: number;
  importedAt: number;
  status: string;
  results?: {
    created: number;
    updated: number;
    failed: number;
    duplicates: number;
  };
  errors?: string[];
  createdAt: number;
  completedAt?: number;
}

export function ImportHistory() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<ImportBatch | null>(null);

  // Get import batches with filtering
  const importBatches = useQuery(api.batchImport.getImportBatches, {
    limit: 50,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  // Get all validation results for the displayed batches
  const allValidationResults = useQuery(api.importValidation.getAllValidationResults);

  // Create a map of batchId to validation results for quick lookup
  const validationResultsMap = new Map();
  allValidationResults?.forEach(result => {
    validationResultsMap.set(result.batchId, result);
  });

  // Mutations for validation actions
  const validateImportBatch = useMutation(api.importValidation.validateImportBatch);
  const cleanupOldImports = useMutation(api.batchImport.cleanupOldImports);
  const fixPendingImports = useMutation(api.batchImport.fixPendingImports);

  // Filter batches based on search and source
  const filteredBatches = importBatches?.filter(batch => {
    const matchesSearch = searchTerm === "" || 
      batch.importType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.importedByName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = sourceFilter === "all" || batch.source === sourceFilter;
    
    return matchesSearch && matchesSource;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "text-xs font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "gmb_api":
        return "bg-blue-100 text-blue-800";
      case "admin_import":
        return "bg-green-100 text-green-800";
      case "gmb_scraped":
        return "bg-purple-100 text-purple-800";
      case "csv_upload":
        return "bg-orange-100 text-orange-800";
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

  const calculateSuccessRate = (results?: ImportBatch['results']) => {
    if (!results) return 0;
    const total = results.created + results.failed + results.duplicates;
    return total > 0 ? Math.round((results.created / total) * 100) : 0;
  };

  // Validation status helpers
  const getValidationStatus = (batchId: string) => {
    const validation = validationResultsMap.get(batchId);
    if (!validation) return "not_validated";
    return validation.status;
  };

  const getValidationScore = (batchId: string) => {
    const validation = validationResultsMap.get(batchId);
    return validation?.overallScore || 0;
  };

  const getValidationBadge = (batchId: string) => {
    const status = getValidationStatus(batchId);
    const score = getValidationScore(batchId);
    
    switch (status) {
      case "completed":
        if (score >= 90) return { variant: "default" as const, text: `${score}/100`, color: "text-green-600" };
        if (score >= 75) return { variant: "secondary" as const, text: `${score}/100`, color: "text-yellow-600" };
        return { variant: "destructive" as const, text: `${score}/100`, color: "text-red-600" };
      case "running":
        return { variant: "outline" as const, text: "Running...", color: "text-blue-600" };
      case "failed":
        return { variant: "destructive" as const, text: "Failed", color: "text-red-600" };
      default:
        return { variant: "outline" as const, text: "Not Validated", color: "text-gray-500" };
    }
  };

  const handleRunValidation = async (batchId: string) => {
    try {
      await validateImportBatch({
        batchId: batchId as any,
        runFullValidation: false,
      });
      
      toast({
        title: "Validation started",
        description: "Running quality assurance checks...",
      });
    } catch (error) {
      toast({
        title: "Validation failed",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const handleExportBatch = (batch: ImportBatch) => {
    // Create export data
    const exportData = {
      batchId: batch._id,
      importType: batch.importType,
      source: batch.source,
      importedBy: batch.importedByName,
      importedAt: new Date(batch.importedAt).toISOString(),
      status: batch.status,
      businessCount: batch.businessCount,
      results: batch.results,
      errors: batch.errors,
      sourceMetadata: batch.sourceMetadata,
      duration: formatDuration(batch.importedAt, batch.completedAt),
      exportedAt: new Date().toISOString(),
    };

    // Download as JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `import-batch-${batch._id}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Batch exported",
      description: `Downloaded ${exportFileDefaultName}`,
    });
  };

  const handleRetryBatch = (batch: ImportBatch) => {
    // TODO: Implement retry functionality
    toast({
      title: "Retry functionality",
      description: "This feature will be available soon",
    });
  };

  const handleFixPendingImports = async () => {
    try {
      const result = await fixPendingImports();
      toast({
        title: "Fix completed",
        description: `Fixed ${result.fixedCount} pending imports`,
      });
    } catch (error) {
      toast({
        title: "Fix failed",
        description: "Failed to fix pending imports",
        variant: "destructive",
      });
    }
  };

  const handleCleanupOldImports = async () => {
    try {
      const result = await cleanupOldImports();
      toast({
        title: "Cleanup completed",
        description: `Removed ${result.deletedCount} old failed/pending imports`,
      });
    } catch (error) {
      toast({
        title: "Cleanup failed",
        description: "Failed to cleanup old imports",
        variant: "destructive",
      });
    }
  };

  const uniqueSources = Array.from(new Set(importBatches?.map(batch => batch.source) || []));

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search imports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Source</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {uniqueSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {filteredBatches.length} imports found
              </Badge>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleFixPendingImports}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Fix Pending
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCleanupOldImports}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Cleanup Old
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            Complete history of all CSV imports and data batches
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Import Details</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Imported By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Results</TableHead>
                <TableHead>Validation</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.map((batch) => (
                <TableRow key={batch._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{batch.importType.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        {batch.businessCount} businesses
                        {batch.reviewCount && `, ${batch.reviewCount} reviews`}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSourceBadge(batch.source)}>
                      {batch.source.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{batch.importedByName}</p>
                        <p className="text-xs text-muted-foreground">{batch.importedByEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">
                          {new Date(batch.importedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(batch.importedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(batch.status)}
                      <Badge className={getStatusBadge(batch.status)}>
                        {batch.status.toUpperCase()}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {batch.results ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-sm">{batch.results.created} created</span>
                        </div>
                        {batch.results.failed > 0 && (
                          <div className="flex items-center gap-2">
                            <XCircle className="h-3 w-3 text-red-600" />
                            <span className="text-sm">{batch.results.failed} failed</span>
                          </div>
                        )}
                        {batch.results.duplicates > 0 && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                            <span className="text-sm">{batch.results.duplicates} skipped</span>
                          </div>
                        )}
                        <div className="mt-1">
                          <Progress 
                            value={calculateSuccessRate(batch.results)} 
                            className="h-1" 
                          />
                          <span className="text-xs text-muted-foreground">
                            {calculateSuccessRate(batch.results)}% success rate
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No results</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {(() => {
                        const validationBadge = getValidationBadge(batch._id);
                        const validationStatus = getValidationStatus(batch._id);
                        
                        return (
                          <div className="flex items-center gap-2">
                            {validationStatus === "completed" && (
                              <Shield className="h-3 w-3 text-green-600" />
                            )}
                            {validationStatus === "running" && (
                              <RefreshCw className="h-3 w-3 text-blue-600 animate-spin" />
                            )}
                            {validationStatus === "failed" && (
                              <AlertTriangle className="h-3 w-3 text-red-600" />
                            )}
                            {validationStatus === "not_validated" && (
                              <BarChart3 className="h-3 w-3 text-gray-400" />
                            )}
                            <Badge variant={validationBadge.variant} className="text-xs">
                              {validationBadge.text}
                            </Badge>
                          </div>
                        );
                      })()}
                      
                      {getValidationStatus(batch._id) === "not_validated" && batch.status === "completed" && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 px-2 text-xs"
                          onClick={() => handleRunValidation(batch._id)}
                        >
                          Run QA
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatDuration(batch.importedAt, batch.completedAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedBatch(batch)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleExportBatch(batch)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      {getValidationStatus(batch._id) === "completed" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const validation = validationResultsMap.get(batch._id);
                            if (validation) {
                              // Open validation details in new tab or modal
                              window.open(`/admin/imports/${batch._id}`, '_blank');
                            }
                          }}
                          title="View validation details"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {batch.status === "failed" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRetryBatch(batch)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredBatches.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">No import batches found</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Details Dialog */}
      {selectedBatch && (
        <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Batch Details</DialogTitle>
              <DialogDescription>
                Detailed information for import batch {selectedBatch._id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Import Type</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedBatch.importType.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Source</label>
                  <Badge className={getSourceBadge(selectedBatch.source)}>
                    {selectedBatch.source.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Imported By</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedBatch.importedByName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedBatch.status)}
                    <Badge className={getStatusBadge(selectedBatch.status)}>
                      {selectedBatch.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Results */}
              {selectedBatch.results && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Import Results</label>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {selectedBatch.results.created}
                      </p>
                      <p className="text-sm text-green-700">Created</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedBatch.results.updated}
                      </p>
                      <p className="text-sm text-blue-700">Updated</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedBatch.results.duplicates}
                      </p>
                      <p className="text-sm text-yellow-700">Skipped</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {selectedBatch.results.failed}
                      </p>
                      <p className="text-sm text-red-700">Failed</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {selectedBatch.errors && selectedBatch.errors.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Errors</label>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {selectedBatch.errors.slice(0, 5).map((error, index) => (
                          <div key={index} className="text-sm">
                            • {error}
                          </div>
                        ))}
                        {selectedBatch.errors.length > 5 && (
                          <div className="text-sm text-muted-foreground">
                            ... and {selectedBatch.errors.length - 5} more errors
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Source Metadata */}
              {selectedBatch.sourceMetadata && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Source Metadata</label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(selectedBatch.sourceMetadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}