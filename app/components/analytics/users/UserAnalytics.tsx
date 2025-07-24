/**
 * User Analytics Component
 * User acquisition, behavior, retention, and geographic distribution analytics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Progress } from "~/components/ui/progress";
import { 
  Users, 
  Globe, 
  Smartphone, 
  Monitor, 
  Clock,
  TrendingUp,
  TrendingDown,
  UserPlus,
  UserCheck,
  Share2,
  MousePointer,
  Calendar,
  ChevronRight,
  Filter
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
  RadialBarChart,
  RadialBar,
  Sankey
} from "recharts";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

// Mock data for user acquisition
const acquisitionData = [
  { channel: 'Organic Search', users: 3240, percentage: 42, trend: 'up' },
  { channel: 'Direct', users: 2180, percentage: 28, trend: 'up' },
  { channel: 'Social Media', users: 1390, percentage: 18, trend: 'down' },
  { channel: 'Email', users: 620, percentage: 8, trend: 'up' },
  { channel: 'Referral', users: 310, percentage: 4, trend: 'stable' },
];

// Mock data for user retention
const retentionData = [
  { cohort: 'Week 1', week1: 100, week2: 85, week3: 72, week4: 65, week5: 58, week6: 52, week7: 48, week8: 45 },
  { cohort: 'Week 2', week1: 100, week2: 82, week3: 70, week4: 63, week5: 55, week6: 50, week7: 46 },
  { cohort: 'Week 3', week1: 100, week2: 88, week3: 75, week4: 68, week5: 60, week6: 54 },
  { cohort: 'Week 4', week1: 100, week2: 90, week3: 78, week4: 70, week5: 62 },
  { cohort: 'Week 5', week1: 100, week2: 87, week3: 76, week4: 69 },
  { cohort: 'Week 6', week1: 100, week2: 91, week3: 80 },
  { cohort: 'Week 7', week1: 100, week2: 89 },
  { cohort: 'Week 8', week1: 100 },
];

// Mock data for user behavior
const behaviorData = [
  { action: 'View Business', count: 8420, avgPerUser: 12.3 },
  { action: 'Search', count: 5230, avgPerUser: 7.6 },
  { action: 'Contact Business', count: 1820, avgPerUser: 2.7 },
  { action: 'Claim Listing', count: 420, avgPerUser: 0.6 },
  { action: 'Write Review', count: 310, avgPerUser: 0.5 },
];

// Mock data for geographic distribution
const geoData = [
  { city: 'Phoenix', users: 2840, percentage: 35 },
  { city: 'Tucson', users: 1620, percentage: 20 },
  { city: 'Mesa', users: 1215, percentage: 15 },
  { city: 'Chandler', users: 810, percentage: 10 },
  { city: 'Scottsdale', users: 648, percentage: 8 },
  { city: 'Glendale', users: 486, percentage: 6 },
  { city: 'Other', users: 486, percentage: 6 },
];

// Mock data for device breakdown
const deviceData = [
  { name: 'Mobile', value: 68, color: '#3b82f6' },
  { name: 'Desktop', value: 28, color: '#10b981' },
  { name: 'Tablet', value: 4, color: '#f59e0b' },
];

// Mock data for user growth
const userGrowthData = [
  { month: 'Jan', newUsers: 320, activeUsers: 2100, churnedUsers: 45 },
  { month: 'Feb', newUsers: 380, activeUsers: 2435, churnedUsers: 52 },
  { month: 'Mar', newUsers: 450, activeUsers: 2833, churnedUsers: 48 },
  { month: 'Apr', newUsers: 420, activeUsers: 3205, churnedUsers: 61 },
  { month: 'May', newUsers: 510, activeUsers: 3654, churnedUsers: 58 },
  { month: 'Jun', newUsers: 580, activeUsers: 4176, churnedUsers: 72 },
];

export function UserAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedCohort, setSelectedCohort] = useState('all');
  
  const adminMetrics = useQuery(api.adminAnalytics.getAdminDashboardMetrics);

  if (!adminMetrics) {
    return <div>Loading user analytics...</div>;
  }

  // Calculate retention color based on percentage
  const getRetentionColor = (value: number) => {
    if (value >= 80) return '#10b981';
    if (value >= 60) return '#3b82f6';
    if (value >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">User Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive user acquisition, behavior, and retention analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* User Growth Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminMetrics.customers.new + adminMetrics.activeAccounts.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+{adminMetrics.customers.growth.toFixed(1)}%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminMetrics.customers.new}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminMetrics.activeAccounts.total}</div>
            <p className="text-xs text-muted-foreground">Monthly active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3m 42s</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+15s</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Acquisition & User Growth */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* User Acquisition Sources */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>User Acquisition Channels</CardTitle>
            <CardDescription>How users find and join your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {acquisitionData.map((channel) => (
                <div key={channel.channel} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{channel.channel}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{channel.users.toLocaleString()} users</span>
                        {channel.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                        {channel.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                      </div>
                    </div>
                    <Progress value={channel.percentage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
            <CardDescription>New users, active users, and churn over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="newUsers" stroke="#10b981" name="New Users" strokeWidth={2} />
                <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" name="Active Users" strokeWidth={2} />
                <Line type="monotone" dataKey="churnedUsers" stroke="#ef4444" name="Churned" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Retention Cohort Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>User Retention Cohort Analysis</CardTitle>
          <CardDescription>Weekly retention rates by user signup cohort</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cohort</th>
                  <th className="text-center p-2">Week 1</th>
                  <th className="text-center p-2">Week 2</th>
                  <th className="text-center p-2">Week 3</th>
                  <th className="text-center p-2">Week 4</th>
                  <th className="text-center p-2">Week 5</th>
                  <th className="text-center p-2">Week 6</th>
                  <th className="text-center p-2">Week 7</th>
                  <th className="text-center p-2">Week 8</th>
                </tr>
              </thead>
              <tbody>
                {retentionData.map((cohort) => (
                  <tr key={cohort.cohort} className="border-b">
                    <td className="p-2 font-medium">{cohort.cohort}</td>
                    {['week1', 'week2', 'week3', 'week4', 'week5', 'week6', 'week7', 'week8'].map((week) => (
                      <td key={week} className="text-center p-2">
                        {cohort[week as keyof typeof cohort] !== undefined ? (
                          <div
                            className="inline-flex items-center justify-center w-12 h-8 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: getRetentionColor(cohort[week as keyof typeof cohort] as number) }}
                          >
                            {cohort[week as keyof typeof cohort]}%
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Behavior & Geographic Distribution */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* User Behavior */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Behavior Analysis</CardTitle>
            <CardDescription>Most common user actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={behaviorData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="action" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Users by Arizona cities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {geoData.map((city) => (
                <div key={city.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{city.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{city.users.toLocaleString()}</span>
                    <Badge variant="secondary">{city.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device & Session Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Device Breakdown */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Device Usage</CardTitle>
            <CardDescription>Platform access by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {deviceData.map((device) => (
                <div key={device.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }} />
                  <span className="text-sm">{device.name}: {device.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session Metrics */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Session Metrics</CardTitle>
            <CardDescription>User engagement and session quality indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Bounce Rate</span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">42.3%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Avg. Duration</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">3:42</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">Pages/Session</span>
                  </div>
                  <span className="text-lg font-bold text-purple-700">2.8</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Share Rate</span>
                  </div>
                  <span className="text-lg font-bold text-orange-700">8.7%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}