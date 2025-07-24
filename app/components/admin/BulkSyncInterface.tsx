import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Progress } from "~/components/ui/progress";
import { IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconFilter, IconRefresh, IconReload } from "@tabler/icons-react";
import { toast } from "~/hooks/use-toast";
import { Badge } from "~/components/ui/badge";
import { Slider } from "~/components/ui/slider";

export function BulkSyncInterface() {
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlanTier, setSelectedPlanTier] = useState<string>("all");
  const [lastSyncFilter, setLastSyncFilter] = useState<string>("all");
  const [concurrency, setConcurrency] = useState<number>(3);
  // Remove local isRunning state - we'll use bulkSyncStatus.isActive instead
  const [skipErrors, setSkipErrors] = useState(true);
  
  // Get filter options
  const cities = useQuery(api.cities.getAllCities);
  const categories = useQuery(api.categories.getAllCategories);
  const bulkSyncStatus = useQuery(api.bulkSync.getBulkSyncStatus);
  
  const startBulkSync = useAction(api.bulkSync.startBulkSync);
  const pauseBulkSync = useMutation(api.bulkSync.pauseBulkSync);
  const cancelBulkSync = useMutation(api.bulkSync.cancelBulkSync);
  const retryFailedSyncs = useMutation(api.bulkSync.retryFailedSyncs);
  const processQueue = useAction(api.geoScraperProcessor.processQueue);
  
  const handleStartSync = async () => {
    try {
      await startBulkSync({
        filters: {
          city: selectedCity !== "all" ? selectedCity : undefined,
          categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
          planTier: selectedPlanTier !== "all" ? selectedPlanTier : undefined,
          lastSyncBefore: lastSyncFilter !== "all" ? 
            (lastSyncFilter === "never" ? -1 : Date.now() - (parseInt(lastSyncFilter) * 24 * 60 * 60 * 1000)) : 
            undefined,
        },
        concurrency,
        skipErrors,
      });
      
      toast({
        title: "Bulk sync started",
        description: "Processing businesses based on your filters",
      });
    } catch (error) {
      toast({
        title: "Failed to start bulk sync",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };
  
  const handlePauseSync = async () => {
    try {
      await pauseBulkSync();
      toast({
        title: "Bulk sync paused",
        description: "You can resume the sync at any time",
      });
    } catch (error) {
      toast({
        title: "Failed to pause sync",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };
  
  const handleCancelSync = async () => {
    try {
      await cancelBulkSync();
      toast({
        title: "Bulk sync cancelled",
        description: "All pending items have been removed from the queue",
      });
    } catch (error) {
      toast({
        title: "Failed to cancel sync",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };
  
  const handleRetryFailed = async () => {
    try {
      const result = await retryFailedSyncs();
      toast({
        title: "Retrying failed syncs",
        description: `${result.retried} failed items have been queued for retry`,
      });
      
      // Start processing the retried items
      if (result.retried > 0) {
        await processQueue({ maxItems: Math.min(concurrency * 5, 20) });
      }
    } catch (error) {
      toast({
        title: "Failed to retry syncs",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };
  
  const progressPercentage = bulkSyncStatus 
    ? (bulkSyncStatus.processed / bulkSyncStatus.total) * 100 
    : 0;
    
  const estimatedTimeRemaining = bulkSyncStatus && bulkSyncStatus.avgProcessingTime
    ? Math.ceil((bulkSyncStatus.remaining * bulkSyncStatus.avgProcessingTime) / 60000) // minutes
    : null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Review Sync</CardTitle>
        <CardDescription>
          Sync reviews for multiple businesses at once with advanced filtering
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city-filter">City</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger id="city-filter">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities?.map((city) => (
                  <SelectItem key={city._id} value={city.name}>
                    {city.name} ({city.businessCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category-filter">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name} ({category.businessCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plan-filter">Plan Tier</Label>
            <Select value={selectedPlanTier} onValueChange={setSelectedPlanTier}>
              <SelectTrigger id="plan-filter">
                <SelectValue placeholder="Select plan tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="power">Power</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sync-filter">Last Sync</Label>
            <Select value={lastSyncFilter} onValueChange={setLastSyncFilter}>
              <SelectTrigger id="sync-filter">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="1">Not synced in 24 hours</SelectItem>
                <SelectItem value="7">Not synced in 7 days</SelectItem>
                <SelectItem value="30">Not synced in 30 days</SelectItem>
                <SelectItem value="never">Never synced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Concurrency Control */}
        <div className="space-y-2">
          <Label htmlFor="concurrency">
            Concurrent Connections: {concurrency}
          </Label>
          <Slider
            id="concurrency"
            min={1}
            max={3}
            step={1}
            value={[concurrency]}
            onValueChange={(value) => setConcurrency(value[0])}
            disabled={bulkSyncStatus?.isActive}
          />
        </div>
        
        {/* Skip Errors Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="skip-errors"
            checked={skipErrors}
            onChange={(e) => setSkipErrors(e.target.checked)}
            disabled={bulkSyncStatus?.isActive}
            className="rounded border-gray-300"
          />
          <Label htmlFor="skip-errors">
            Skip errors and continue processing
          </Label>
        </div>
        
        {/* Progress Section */}
        {bulkSyncStatus && bulkSyncStatus.isActive && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{bulkSyncStatus.processed} / {bulkSyncStatus.total}</span>
              </div>
              <Progress value={progressPercentage} />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Success</p>
                <p className="font-medium text-green-600">{bulkSyncStatus.successful}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Failed</p>
                <p className="font-medium text-red-600">{bulkSyncStatus.failed}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ETA</p>
                <p className="font-medium">
                  {estimatedTimeRemaining 
                    ? `~${estimatedTimeRemaining} min` 
                    : "Calculating..."}
                </p>
              </div>
            </div>
            
            {bulkSyncStatus.currentBusiness && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Processing</Badge>
                <span className="text-sm">{bulkSyncStatus.currentBusiness}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          {!bulkSyncStatus?.isActive ? (
            <>
              <Button 
                onClick={handleStartSync}
                disabled={bulkSyncStatus?.isActive}
              >
                <IconPlayerPlay className="mr-2 h-4 w-4" />
                Start Bulk Sync
              </Button>
              {bulkSyncStatus?.failed > 0 && (
                <Button
                  variant="outline"
                  onClick={handleRetryFailed}
                >
                  <IconReload className="mr-2 h-4 w-4" />
                  Retry {bulkSyncStatus.failed} Failed
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={handlePauseSync}
              >
                <IconPlayerPause className="mr-2 h-4 w-4" />
                Pause
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelSync}
              >
                <IconPlayerStop className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}