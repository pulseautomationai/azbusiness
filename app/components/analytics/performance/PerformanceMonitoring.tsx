/**
 * Performance Monitoring Component
 * Core Web Vitals, API response times, error tracking, and system performance
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Gauge,
  Server,
  Database,
  Globe,
  Monitor,
  Smartphone,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Bug,
  RefreshCw,
  Wifi,
  HardDrive,
  Target
} from "lucide-react";

// Chart components
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar,
  Legend
} from "recharts";

import { useState, useEffect } from "react";
import { usePerformanceMonitoring } from "~/hooks/useRealTimeData";

// Mock data for Core Web Vitals
const webVitalsData = [
  { time: '00:00', lcp: 2.1, fid: 85, cls: 0.08 },
  { time: '04:00', lcp: 2.3, fid: 92, cls: 0.09 },
  { time: '08:00', lcp: 2.8, fid: 110, cls: 0.12 },
  { time: '12:00', lcp: 3.2, fid: 125, cls: 0.15 },
  { time: '16:00', lcp: 2.9, fid: 105, cls: 0.11 },
  { time: '20:00', lcp: 2.4, fid: 95, cls: 0.09 },
  { time: '23:59', lcp: 2.2, fid: 88, cls: 0.08 },
];

// Mock data for API response times
const apiResponseData = [
  { endpoint: '/api/businesses', avgTime: 245, p95Time: 480, calls: 12420 },
  { endpoint: '/api/reviews', avgTime: 189, p95Time: 350, calls: 8930 },
  { endpoint: '/api/auth', avgTime: 156, p95Time: 280, calls: 6240 },
  { endpoint: '/api/analytics', avgTime: 342, p95Time: 680, calls: 3120 },
  { endpoint: '/api/ai/generate', avgTime: 1250, p95Time: 2100, calls: 890 },
];

// Mock data for error tracking
const errorData = [
  { type: '404 Not Found', count: 342, trend: 'down', lastOccurred: '2 minutes ago' },
  { type: '500 Server Error', count: 12, trend: 'stable', lastOccurred: '1 hour ago' },
  { type: 'JavaScript Error', count: 89, trend: 'up', lastOccurred: '5 minutes ago' },
  { type: 'Network Timeout', count: 45, trend: 'down', lastOccurred: '20 minutes ago' },
  { type: 'Auth Failed', count: 23, trend: 'stable', lastOccurred: '45 minutes ago' },
];

// Mock data for system resources
const systemResourcesData = [
  { resource: 'CPU Usage', current: 45, average: 38, peak: 78, status: 'healthy' },
  { resource: 'Memory Usage', current: 62, average: 58, peak: 85, status: 'warning' },
  { resource: 'Disk Usage', current: 73, average: 71, peak: 73, status: 'warning' },
  { resource: 'Network I/O', current: 28, average: 32, peak: 95, status: 'healthy' },
];

// Mock data for uptime
const uptimeData = [
  { service: 'Web Application', uptime: 99.98, lastIncident: '15 days ago' },
  { service: 'API Server', uptime: 99.95, lastIncident: '7 days ago' },
  { service: 'Database', uptime: 99.99, lastIncident: '42 days ago' },
  { service: 'CDN', uptime: 100, lastIncident: 'Never' },
];

// Mock data for performance by device
const devicePerformanceData = [
  { device: 'Desktop', lcp: 2.1, fid: 78, cls: 0.05, users: 45 },
  { device: 'Mobile', lcp: 3.8, fid: 142, cls: 0.18, users: 52 },
  { device: 'Tablet', lcp: 2.9, fid: 98, cls: 0.09, users: 3 },
];

// Core Web Vitals thresholds
const WEB_VITALS_THRESHOLDS = {
  lcp: { good: 2.5, needsImprovement: 4.0 }, // Largest Contentful Paint (seconds)
  fid: { good: 100, needsImprovement: 300 }, // First Input Delay (milliseconds)
  cls: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
};

export function PerformanceMonitoring() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [activeAlerts, setActiveAlerts] = useState(2);
  const performanceMetrics = usePerformanceMonitoring();

  // Calculate Core Web Vitals status
  const getVitalStatus = (metric: string, value: number) => {
    const thresholds = WEB_VITALS_THRESHOLDS[metric as keyof typeof WEB_VITALS_THRESHOLDS];
    if (!thresholds) return 'unknown';
    
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.needsImprovement) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'needs-improvement':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'poor':
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Calculate current web vitals
  const currentVitals = webVitalsData[webVitalsData.length - 1];

  return (
    <div className="space-y-6">
      {/* Performance Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Performance Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Real-time performance metrics, Core Web Vitals, and error tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={activeAlerts > 0 ? "destructive" : "secondary"} className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {activeAlerts} Active Alerts
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Alerts */}
      {activeAlerts > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Performance Issues Detected</AlertTitle>
          <AlertDescription>
            High memory usage detected (85% peak). API response times are elevated. 
            <Button variant="link" className="p-0 h-auto ml-2">View details</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Core Web Vitals
          </CardTitle>
          <CardDescription>
            Google's key metrics for user experience quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* LCP - Largest Contentful Paint */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Largest Contentful Paint</h4>
                <Badge variant="outline" className={getStatusColor(getVitalStatus('lcp', currentVitals.lcp))}>
                  {currentVitals.lcp}s
                </Badge>
              </div>
              <Progress 
                value={(WEB_VITALS_THRESHOLDS.lcp.good / currentVitals.lcp) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Target: &lt;2.5s | Current: {currentVitals.lcp}s
              </p>
            </div>

            {/* FID - First Input Delay */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">First Input Delay</h4>
                <Badge variant="outline" className={getStatusColor(getVitalStatus('fid', currentVitals.fid))}>
                  {currentVitals.fid}ms
                </Badge>
              </div>
              <Progress 
                value={(WEB_VITALS_THRESHOLDS.fid.good / currentVitals.fid) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Target: &lt;100ms | Current: {currentVitals.fid}ms
              </p>
            </div>

            {/* CLS - Cumulative Layout Shift */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Cumulative Layout Shift</h4>
                <Badge variant="outline" className={getStatusColor(getVitalStatus('cls', currentVitals.cls))}>
                  {currentVitals.cls}
                </Badge>
              </div>
              <Progress 
                value={(WEB_VITALS_THRESHOLDS.cls.good / currentVitals.cls) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Target: &lt;0.1 | Current: {currentVitals.cls}
              </p>
            </div>
          </div>

          {/* Web Vitals Trend Chart */}
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={webVitalsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line type="monotone" dataKey="lcp" stroke="#3b82f6" name="LCP (s)" strokeWidth={2} />
                <Line type="monotone" dataKey="fid" stroke="#10b981" name="FID (ms)" strokeWidth={2} yAxisId="right" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* API Performance & Error Tracking */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* API Response Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              API Response Times
            </CardTitle>
            <CardDescription>Average and P95 response times by endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apiResponseData.map((endpoint) => (
                <div key={endpoint.endpoint} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs">{endpoint.endpoint}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{endpoint.avgTime}ms avg</Badge>
                      <Badge variant="outline">{endpoint.p95Time}ms p95</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={Math.min((endpoint.avgTime / 500) * 100, 100)} 
                      className="h-1.5 flex-1"
                    />
                    <span className="text-xs text-muted-foreground">{endpoint.calls.toLocaleString()} calls</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Error Tracking
            </CardTitle>
            <CardDescription>Recent errors and their frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errorData.map((error) => (
                <div key={error.type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      error.type.includes('500') ? 'bg-red-100' :
                      error.type.includes('404') ? 'bg-yellow-100' :
                      'bg-orange-100'
                    }`}>
                      <AlertTriangle className={`w-4 h-4 ${
                        error.type.includes('500') ? 'text-red-600' :
                        error.type.includes('404') ? 'text-yellow-600' :
                        'text-orange-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{error.type}</p>
                      <p className="text-xs text-muted-foreground">{error.lastOccurred}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{error.count}</Badge>
                    {error.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-500" />}
                    {error.trend === 'down' && <TrendingDown className="w-3 h-3 text-green-500" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Resources & Uptime */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* System Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Resources
            </CardTitle>
            <CardDescription>Server resource utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemResourcesData.map((resource) => (
                <div key={resource.resource} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {resource.resource === 'CPU Usage' && <Activity className="w-4 h-4" />}
                      {resource.resource === 'Memory Usage' && <HardDrive className="w-4 h-4" />}
                      {resource.resource === 'Disk Usage' && <Database className="w-4 h-4" />}
                      {resource.resource === 'Network I/O' && <Wifi className="w-4 h-4" />}
                      <span className="font-medium">{resource.resource}</span>
                    </div>
                    <Badge variant={resource.status === 'healthy' ? 'default' : 'destructive'}>
                      {resource.current}%
                    </Badge>
                  </div>
                  <Progress 
                    value={resource.current} 
                    className={`h-2 ${resource.current > 80 ? 'bg-red-100' : ''}`}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Avg: {resource.average}%</span>
                    <span>Peak: {resource.peak}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Uptime */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Service Uptime
            </CardTitle>
            <CardDescription>System availability and reliability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uptimeData.map((service) => (
                <div key={service.service} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{service.service}</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-bold text-green-600">{service.uptime}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last incident: {service.lastIncident}
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Uptime</span>
                  <span className="text-lg font-bold text-green-600">99.98%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Device */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Device Type</CardTitle>
          <CardDescription>Core Web Vitals breakdown across different devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {devicePerformanceData.map((device) => (
              <div key={device.device} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {device.device === 'Desktop' && <Monitor className="w-5 h-5" />}
                    {device.device === 'Mobile' && <Smartphone className="w-5 h-5" />}
                    {device.device === 'Tablet' && <Monitor className="w-5 h-5" />}
                    <span className="font-medium">{device.device}</span>
                  </div>
                  <Badge variant="secondary">{device.users}% users</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">LCP</span>
                    <span className={getStatusColor(getVitalStatus('lcp', device.lcp))}>
                      {device.lcp}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">FID</span>
                    <span className={getStatusColor(getVitalStatus('fid', device.fid))}>
                      {device.fid}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">CLS</span>
                    <span className={getStatusColor(getVitalStatus('cls', device.cls))}>
                      {device.cls}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real User Monitoring (RUM) Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Page Load Time</p>
                <p className="text-2xl font-bold">2.3s</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-xs text-green-600 mt-2">
              <TrendingDown className="w-3 h-3 inline mr-1" />
              12% faster than last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Apdex Score</p>
                <p className="text-2xl font-bold">0.89</p>
              </div>
              <Target className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Target: &gt;0.85
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">0.42%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-xs text-green-600 mt-2">
              <TrendingDown className="w-3 h-3 inline mr-1" />
              0.08% improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Throughput</p>
                <p className="text-2xl font-bold">142 req/s</p>
              </div>
              <Zap className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Peak: 285 req/s
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}