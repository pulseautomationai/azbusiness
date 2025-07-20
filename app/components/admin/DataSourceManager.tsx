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
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Progress } from "~/components/ui/progress";
import { 
  Database, 
  Settings, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Eye,
  Download,
  TrendingUp,
  Filter,
  Search,
  Zap,
  Shield
} from "lucide-react";
import { toast } from "~/hooks/use-toast";

interface DataSourceSummary {
  totalFields: number;
  fieldsBySource: Record<string, number>;
  lockedFields: number;
  fieldsWithConflicts: number;
  fields: Array<{
    fieldName: string;
    currentSource: string;
    sourceCount: number;
    hasConflict: boolean;
    locked: boolean;
    preferredSource?: string;
  }>;
}

interface ConflictSummary {
  businessId: Id<"businesses">;
  businessName: string;
  conflicts: Array<{
    fieldName: string;
    sources: Array<{
      source: string;
      value: any;
      updatedAt: number;
      confidence?: number;
    }>;
  }>;
}

export function DataSourceManager() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBusinessId, setSelectedBusinessId] = useState<Id<"businesses"> | null>(null);
  const [conflictFilter, setConflictFilter] = useState<"all" | "conflicts" | "locked">("all");

  // Get global data source statistics
  const businesses = useQuery(api.businesses.getBusinessesForAdmin, { limit: 100 });
  
  // Get sample business data sources for overview
  const sampleDataSources = useQuery(
    api.dataSourceManager.getBusinessDataSourceSummary,
    selectedBusinessId ? { businessId: selectedBusinessId } : "skip"
  );

  // Mock data for demonstration (in real implementation, we'd have dedicated queries)
  const mockGlobalStats = {
    totalBusinesses: businesses?.length || 0,
    sourceDistribution: {
      "gmb_api": Math.floor((businesses?.length || 0) * 0.4),
      "admin_import": Math.floor((businesses?.length || 0) * 0.35),
      "user_manual": Math.floor((businesses?.length || 0) * 0.15),
      "csv_upload": Math.floor((businesses?.length || 0) * 0.1),
    },
    conflictStats: {
      totalConflicts: 23,
      resolvedConflicts: 18,
      pendingConflicts: 5,
    },
    fieldStats: {
      totalFields: (businesses?.length || 0) * 12, // Average 12 fields per business
      lockedFields: Math.floor((businesses?.length || 0) * 2),
      fieldsWithPreferences: Math.floor((businesses?.length || 0) * 1.5),
    }
  };

  const resolveConflicts = useMutation(api.dataSourceManager.resolveBusinessDataConflicts);
  const bulkUpdatePreferences = useMutation(api.dataSourceManager.bulkUpdateFieldPreferences);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "gmb_api": return "🔗";
      case "admin_import": return "📥";
      case "user_manual": return "✏️";
      case "csv_upload": return "📄";
      default: return "⚙️";
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "gmb_api": return "Google My Business (Live)";
      case "admin_import": return "Admin Import";
      case "user_manual": return "Manual Entry";
      case "csv_upload": return "CSV Upload";
      default: return source;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "gmb_api": return "bg-blue-100 text-blue-800";
      case "admin_import": return "bg-green-100 text-green-800";
      case "user_manual": return "bg-purple-100 text-purple-800";
      case "csv_upload": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleResolveConflicts = async (businessId: Id<"businesses">) => {
    try {
      await resolveConflicts({ businessId, forceUpdate: true });
      toast({
        title: "Conflicts resolved",
        description: "All data conflicts have been resolved using priority rules",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve conflicts",
        variant: "destructive",
      });
    }
  };

  const handleBulkLockFields = async (fieldNames: string[], locked: boolean) => {
    if (!selectedBusinessId) return;

    try {
      const updates = fieldNames.map(fieldName => ({
        fieldName,
        locked,
      }));

      await bulkUpdatePreferences({
        businessId: selectedBusinessId,
        updates,
      });

      toast({
        title: locked ? "Fields locked" : "Fields unlocked",
        description: `${fieldNames.length} fields have been ${locked ? 'locked' : 'unlocked'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update field locks",
        variant: "destructive",
      });
    }
  };

  // Filter businesses based on search
  const filteredBusinesses = businesses?.filter(business => 
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.city.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Global Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGlobalStats.totalBusinesses}</div>
            <p className="text-xs text-muted-foreground">
              With multi-source data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {mockGlobalStats.conflictStats.pendingConflicts}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockGlobalStats.conflictStats.resolvedConflicts} resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Fields</CardTitle>
            <Lock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mockGlobalStats.fieldStats.lockedFields}
            </div>
            <p className="text-xs text-muted-foreground">
              Protected from auto-updates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Field Preferences</CardTitle>
            <Settings className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockGlobalStats.fieldStats.fieldsWithPreferences}
            </div>
            <p className="text-xs text-muted-foreground">
              Custom source preferences
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Conflicts
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sources
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Source Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Data Source Distribution</CardTitle>
              <CardDescription>
                How business data is distributed across different sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(mockGlobalStats.sourceDistribution).map(([source, count]) => {
                  const percentage = (count / mockGlobalStats.totalBusinesses) * 100;
                  return (
                    <div key={source} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getSourceIcon(source)}</span>
                          <span className="font-medium">{getSourceLabel(source)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {count} businesses
                          </span>
                          <Badge className={getSourceColor(source)}>
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Priority Order */}
          <Card>
            <CardHeader>
              <CardTitle>Data Source Priority Order</CardTitle>
              <CardDescription>
                System-wide priority order for resolving data conflicts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <span className="font-bold text-purple-800">1.</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    ✏️ User Manual Entry
                  </Badge>
                  <span className="text-sm text-purple-700">Highest priority - user edits</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="font-bold text-blue-800">2.</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    🔗 Google My Business (Live)
                  </Badge>
                  <span className="text-sm text-blue-700">Real-time API data</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="font-bold text-green-800">3.</span>
                  <Badge className="bg-green-100 text-green-800">
                    📥 Admin Import
                  </Badge>
                  <span className="text-sm text-green-700">Verified admin imports</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <span className="font-bold text-orange-800">4.</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    📄 CSV Upload
                  </Badge>
                  <span className="text-sm text-orange-700">Bulk CSV imports</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          {/* Business Search */}
          <Card>
            <CardHeader>
              <CardTitle>Conflict Resolution</CardTitle>
              <CardDescription>
                Identify and resolve data conflicts across businesses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search businesses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={conflictFilter} onValueChange={(value: "all" | "conflicts" | "locked") => setConflictFilter(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Businesses</SelectItem>
                      <SelectItem value="conflicts">With Conflicts</SelectItem>
                      <SelectItem value="locked">With Locked Fields</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Business List */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Data Sources</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBusinesses.slice(0, 10).map((business) => (
                        <TableRow key={business._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{business.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {business.address}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{business.city}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {business.planTier}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Badge className={getSourceColor(business.dataSource?.primary || "system")}>
                                {getSourceIcon(business.dataSource?.primary || "system")}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                +2 sources
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Synced</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedBusinessId(business._id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResolveConflicts(business._id)}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          {/* Source Management */}
          <Card>
            <CardHeader>
              <CardTitle>Source Configuration</CardTitle>
              <CardDescription>
                Configure data source settings and priorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Auto-sync Settings */}
                <div>
                  <h4 className="font-medium mb-3">Auto-sync Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">GMB Auto-sync</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically sync data from Google My Business API
                        </p>
                      </div>
                      <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Conflict Auto-resolution</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically resolve conflicts using priority rules
                        </p>
                      </div>
                      <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">User Edit Protection</p>
                        <p className="text-sm text-muted-foreground">
                          Protect user edits from being overwritten
                        </p>
                      </div>
                      <Switch checked={true} />
                    </div>
                  </div>
                </div>

                {/* Confidence Thresholds */}
                <div>
                  <h4 className="font-medium mb-3">Confidence Thresholds</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">GMB API Data</label>
                      <Input type="number" defaultValue="95" min="1" max="100" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Admin Import</label>
                      <Input type="number" defaultValue="85" min="1" max="100" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">CSV Upload</label>
                      <Input type="number" defaultValue="75" min="1" max="100" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">User Manual</label>
                      <Input type="number" defaultValue="100" min="1" max="100" disabled />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Global Data Management</CardTitle>
              <CardDescription>
                System-wide data management and cleanup tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    These operations affect all businesses in the system. Use with caution.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Resolve All Conflicts
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Cleanup Orphaned Data
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Data Sources
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Recalculate Priorities
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}