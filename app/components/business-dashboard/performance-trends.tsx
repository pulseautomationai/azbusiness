/**
 * Performance Trends - Phase 4.1
 * Visual charts showing performance metrics over time
 */

// import { useQuery } from "convex/react";
// import { api } from "~/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target,
  Calendar,
  Info
} from "lucide-react";
import { useState } from "react";

interface PerformanceTrendsProps {
  business: any;
  planTier: string;
}

// Mock historical performance data - in production this would come from database
const generateMockPerformanceHistory = (currentScores: any) => {
  const history = [];
  const factors = ['speed', 'value', 'quality', 'reliability'];
  
  for (let i = 90; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const dayData: any = {
      date: date.toISOString().split('T')[0],
      dateDisplay: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    
    // Generate realistic score variations
    factors.forEach(factor => {
      const baseScore = currentScores[factor] || 5;
      const variation = (Math.random() - 0.5) * 1.5; // ±0.75 variation
      dayData[factor] = Math.max(0, Math.min(10, baseScore + variation));
    });
    
    history.push(dayData);
  }
  
  return history;
};

export default function PerformanceTrends({ 
  business, 
  planTier 
}: PerformanceTrendsProps) {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("all");

  // Fetch performance metrics
  // const performanceMetrics = useQuery(api.performanceScoring.getBusinessPerformanceScores, {
  //   businessId: business._id,
  // });

  const currentScores = {
    speed: 6.8,
    value: 7.2,
    quality: 8.1,
    reliability: 7.5,
  };

  const performanceHistory = generateMockPerformanceHistory(currentScores);
  
  // Filter history based on time range
  const getFilteredHistory = () => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    return performanceHistory.slice(-days);
  };

  const filteredHistory = getFilteredHistory();

  // Calculate trends
  const calculateTrend = (metric: string) => {
    if (filteredHistory.length < 2) return 0;
    const recent = filteredHistory.slice(-7).reduce((sum, day) => sum + day[metric], 0) / 7;
    const previous = filteredHistory.slice(-14, -7).reduce((sum, day) => sum + day[metric], 0) / 7;
    return recent - previous;
  };

  const getMetricColor = (metric: string) => {
    const colors = {
      speed: "rgb(239, 68, 68)", // red
      value: "rgb(34, 197, 94)", // green
      quality: "rgb(59, 130, 246)", // blue
      reliability: "rgb(168, 85, 247)", // purple
    };
    return colors[metric as keyof typeof colors] || "rgb(156, 163, 175)";
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Trends</h3>
          <p className="text-sm text-muted-foreground">
            Track how your scores change over time
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="speed">Speed</SelectItem>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="reliability">Reliability</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(currentScores).map(([metric, score]) => {
          const trend = calculateTrend(metric);
          const isPositive = trend > 0;
          
          return (
            <Card key={metric}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize">{metric}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{score.toFixed(1)}</div>
                <div className={`flex items-center text-xs ${isPositive ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : trend < 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : null}
                  {trend !== 0 ? `${isPositive ? '+' : ''}${trend.toFixed(1)}` : 'No change'}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Chart
          </CardTitle>
          <CardDescription>
            {selectedMetric === "all" ? "All performance metrics" : `${selectedMetric} performance`} over the last {timeRange}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {planTier === "free" ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Performance Charts</h3>
              <p className="text-muted-foreground mb-4">
                Detailed performance tracking available with paid plans
              </p>
              <Button className="bg-ocotillo-red hover:bg-ocotillo-red/90">
                Upgrade to View Charts
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Chart Area */}
              <div className="h-64 relative">
                <div className="absolute inset-0 flex items-end justify-between px-4">
                  {filteredHistory.map((day, index) => {
                    // Show every 3rd day for 30d, every 7th for 90d to avoid crowding
                    const showLabel = timeRange === "7d" || 
                      (timeRange === "30d" && index % 3 === 0) || 
                      (timeRange === "90d" && index % 7 === 0);
                    
                    return (
                      <div key={day.date} className="flex flex-col items-center gap-2">
                        {/* Data points */}
                        <div className="relative" style={{ height: '200px' }}>
                          {selectedMetric === "all" ? (
                            <div className="flex gap-1">
                              {Object.entries(currentScores).map(([metric], metricIndex) => (
                                <div
                                  key={metric}
                                  className="w-2 rounded-t"
                                  style={{
                                    height: `${(day[metric] / 10) * 200}px`,
                                    backgroundColor: getMetricColor(metric),
                                  }}
                                />
                              ))}
                            </div>
                          ) : (
                            <div
                              className="w-3 rounded-t"
                              style={{
                                height: `${(day[selectedMetric] / 10) * 200}px`,
                                backgroundColor: getMetricColor(selectedMetric),
                              }}
                            />
                          )}
                        </div>
                        
                        {/* Date labels */}
                        {showLabel && (
                          <div className="text-xs text-muted-foreground transform -rotate-45 origin-left whitespace-nowrap">
                            {day.dateDisplay}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
                  <span>10</span>
                  <span>7.5</span>
                  <span>5</span>
                  <span>2.5</span>
                  <span>0</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {selectedMetric === "all" ? (
                  Object.entries(currentScores).map(([metric]) => (
                    <div key={metric} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: getMetricColor(metric) }}
                      />
                      <span className="capitalize">{metric}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: getMetricColor(selectedMetric) }}
                    />
                    <span className="capitalize">{selectedMetric} Score</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights Card */}
      {planTier !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Insights
            </CardTitle>
            <CardDescription>
              AI analysis of your performance trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(currentScores).map(([metric, score]) => {
                const trend = calculateTrend(metric);
                const isImproving = trend > 0.3;
                const isDeclining = trend < -0.3;
                
                return (
                  <div key={metric} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: getMetricColor(metric) }} />
                    <div className="flex-1">
                      <div className="font-medium capitalize flex items-center gap-2">
                        {metric}
                        {isImproving && <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Improving</Badge>}
                        {isDeclining && <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">Attention Needed</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isImproving && `Strong upward trend (+${trend.toFixed(1)}) over the last week`}
                        {isDeclining && `Declining trend (${trend.toFixed(1)}) - consider focusing on this area`}
                        {!isImproving && !isDeclining && `Stable performance at ${score.toFixed(1)}/10`}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {planTier === "power" && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-purple-900">AI Recommendation</div>
                      <div className="text-sm text-purple-700">
                        Your quality scores are consistently high. Consider promoting this strength in your marketing to attract more premium customers.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}