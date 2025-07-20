import { useState } from "react";
import { RotateCw as Sync, Database, Edit, Lock, Unlock, Info, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Switch } from "~/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

interface DataSource {
  source: string;
  value: any;
  updatedAt: number;
  confidence?: number;
  metadata?: any;
}

interface BusinessField {
  fieldName: string;
  currentValue: any;
  currentSource: string;
  currentUpdatedAt: number;
  sources: DataSource[];
  locked?: boolean;
  preferredSource?: string;
}

interface DataSourceManagerProps {
  businessId: string;
  businessFields: BusinessField[];
  syncStatus: {
    isGMBConnected: boolean;
    gmbLocationId?: string;
    lastSyncedAt?: number;
    syncStatus?: string;
    canSyncNow: boolean;
  };
  onSyncReviews?: () => void;
  onUpdateFieldSource?: (fieldName: string, source: string) => void;
  onToggleFieldLock?: (fieldName: string, locked: boolean) => void;
  onSetPreferredSource?: (fieldName: string, source: string) => void;
}

export function DataSourceManager({
  businessId,
  businessFields,
  syncStatus,
  onSyncReviews,
  onUpdateFieldSource,
  onToggleFieldLock,
  onSetPreferredSource,
}: DataSourceManagerProps) {
  const [selectedField, setSelectedField] = useState<string>("");

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "gmb_api": return "🔗";
      case "admin_import": return "📥";
      case "user_manual": return "✏️";
      case "system": return "⚙️";
      default: return "📄";
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "gmb_api": return "Google My Business (Live)";
      case "admin_import": return "Admin Import";
      case "user_manual": return "Manual Entry";
      case "system": return "System Generated";
      default: return source;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "gmb_api": return "bg-blue-100 text-blue-800";
      case "admin_import": return "bg-green-100 text-green-800";
      case "user_manual": return "bg-purple-100 text-purple-800";
      case "system": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSyncStatusIcon = () => {
    if (!syncStatus.isGMBConnected) return <XCircle className="h-4 w-4 text-red-500" />;
    if (syncStatus.syncStatus === "synced") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (syncStatus.syncStatus === "pending") return <Clock className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-gray-500" />;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fieldsByPriority = businessFields.sort((a, b) => {
    const priorityOrder = { "name": 0, "phone": 1, "address": 2, "description": 3 };
    const aPriority = priorityOrder[a.fieldName as keyof typeof priorityOrder] ?? 999;
    const bPriority = priorityOrder[b.fieldName as keyof typeof priorityOrder] ?? 999;
    return aPriority - bPriority;
  });

  return (
    <div className="space-y-6">
      {/* Sync Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Source Status
          </CardTitle>
          <CardDescription>
            Manage how your business information is updated and synchronized
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* GMB Connection Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getSyncStatusIcon()}
                <div>
                  <p className="font-medium">Google My Business</p>
                  <p className="text-sm text-muted-foreground">
                    {syncStatus.isGMBConnected 
                      ? `Connected • Last sync: ${syncStatus.lastSyncedAt ? formatDate(syncStatus.lastSyncedAt) : 'Never'}` 
                      : 'Not connected'
                    }
                  </p>
                </div>
              </div>
              {syncStatus.isGMBConnected && (
                <Button 
                  size="sm" 
                  onClick={onSyncReviews}
                  disabled={!syncStatus.canSyncNow}
                  className="flex items-center gap-2"
                >
                  <Sync className="h-3 w-3" />
                  {syncStatus.canSyncNow ? 'Sync Now' : 'Synced Recently'}
                </Button>
              )}
            </div>

            {!syncStatus.isGMBConnected && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Connect your Google My Business account to automatically sync reviews and business information.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Field Management */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information Sources</CardTitle>
          <CardDescription>
            View and manage data sources for each business field
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fieldsByPriority.map((field) => (
              <div key={field.fieldName} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium capitalize">{field.fieldName.replace('_', ' ')}</h4>
                    <Badge className={getSourceColor(field.currentSource)}>
                      <span className="mr-1">{getSourceIcon(field.currentSource)}</span>
                      {getSourceLabel(field.currentSource)}
                    </Badge>
                    {field.locked && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Lock className="h-3 w-3 text-orange-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Field is locked from automatic updates</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Field Actions */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Manage
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Manage {field.fieldName} Sources</DialogTitle>
                          <DialogDescription>
                            Choose your preferred data source and manage automatic updates
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="sources" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="sources">Available Sources</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="sources" className="space-y-4">
                            <div className="space-y-3">
                              {field.sources.map((source, index) => (
                                <div 
                                  key={index} 
                                  className={`p-3 border rounded-lg ${
                                    source.source === field.currentSource ? 'border-blue-500 bg-blue-50' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge className={getSourceColor(source.source)}>
                                        <span className="mr-1">{getSourceIcon(source.source)}</span>
                                        {getSourceLabel(source.source)}
                                      </Badge>
                                      {source.confidence && (
                                        <span className="text-xs text-muted-foreground">
                                          {source.confidence}% confidence
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(source.updatedAt)}
                                      </span>
                                      {source.source !== field.currentSource && (
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => onUpdateFieldSource?.(field.fieldName, source.source)}
                                        >
                                          Use This
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="mt-2">
                                    <p className="text-sm text-muted-foreground truncate">
                                      {typeof source.value === 'string' ? source.value : JSON.stringify(source.value)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="settings" className="space-y-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <label className="text-sm font-medium">Lock Field</label>
                                  <p className="text-xs text-muted-foreground">
                                    Prevent automatic updates to this field
                                  </p>
                                </div>
                                <Switch 
                                  checked={field.locked || false}
                                  onCheckedChange={(checked) => onToggleFieldLock?.(field.fieldName, checked)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Preferred Source</label>
                                <Select 
                                  value={field.preferredSource || "auto"}
                                  onValueChange={(value) => onSetPreferredSource?.(field.fieldName, value === "auto" ? "" : value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select preferred source" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="auto">Auto (Priority Order)</SelectItem>
                                    {field.sources.map((source) => (
                                      <SelectItem key={source.source} value={source.source}>
                                        {getSourceIcon(source.source)} {getSourceLabel(source.source)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                  Override automatic source priority for this field
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {/* Current Value Preview */}
                <div className="bg-gray-50 p-2 rounded text-sm">
                  <span className="text-muted-foreground">Current: </span>
                  <span className="font-mono">
                    {typeof field.currentValue === 'string' 
                      ? field.currentValue.substring(0, 100) + (field.currentValue.length > 100 ? '...' : '')
                      : JSON.stringify(field.currentValue)
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Last updated: {formatDate(field.currentUpdatedAt)}</span>
                  <span>{field.sources.length} source{field.sources.length !== 1 ? 's' : ''} available</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Priority Info */}
      <Card>
        <CardHeader>
          <CardTitle>Data Priority Order</CardTitle>
          <CardDescription>
            How we determine which data to use when multiple sources are available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
              <span className="font-bold text-blue-800">1.</span>
              <Badge className="bg-blue-100 text-blue-800">
                🔗 Google My Business (Live)
              </Badge>
              <span className="text-sm text-blue-700">Highest priority - real-time data</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
              <span className="font-bold text-green-800">2.</span>
              <Badge className="bg-green-100 text-green-800">
                📥 Admin Import
              </Badge>
              <span className="text-sm text-green-700">Verified data from admin imports</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-purple-50 rounded">
              <span className="font-bold text-purple-800">3.</span>
              <Badge className="bg-purple-100 text-purple-800">
                ✏️ Manual Entry
              </Badge>
              <span className="text-sm text-purple-700">User-entered information</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              <span className="font-bold text-gray-800">4.</span>
              <Badge className="bg-gray-100 text-gray-800">
                ⚙️ System Generated
              </Badge>
              <span className="text-sm text-gray-700">Default or calculated values</span>
            </div>
          </div>
          
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              You can override this priority by setting a preferred source or locking individual fields.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}