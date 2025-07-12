import { 
  BarChart3, TrendingUp, Eye, Phone, Mail, MapPin, 
  Users, Clock, Star, Globe, Smartphone, Monitor,
  Calendar, Target, Award, Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { FeatureGate } from "~/components/FeatureGate";

interface InsightsTabProps {
  business: any;
  businessContent: any;
  isOwner: boolean;
}

export function InsightsTab({ business, businessContent, isOwner }: InsightsTabProps) {
  // Mock analytics data for demo - define all data before any conditional returns
  const mockAnalytics = {
    pageViews: 1247,
    phoneClicks: 89,
    emailClicks: 23,
    directionsClicks: 156,
    websiteClicks: 34,
    leads: 12,
    conversionRate: 2.3,
    avgSessionDuration: 185, // seconds
    returningVisitors: 34,
    deviceBreakdown: {
      mobile: 68,
      desktop: 28,
      tablet: 4
    },
    monthlyTrend: [
      { month: 'Aug', views: 890, leads: 8 },
      { month: 'Sep', views: 1020, leads: 9 },
      { month: 'Oct', views: 1180, leads: 11 },
      { month: 'Nov', views: 1247, leads: 12 },
    ]
  };

  // Check if user has access to insights
  const hasAccess = business.planTier === "pro" || business.planTier === "power";
  
  // Show locked state for Free tier
  if (!hasAccess) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Insights Tab Locked</h3>
          <p className="text-muted-foreground mb-4">
            Upgrade to Pro to access business insights, analytics, and performance data
          </p>
          <Button>Upgrade to Pro</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Overview
            <Badge variant="secondary" className="text-xs">
              Last 30 Days
            </Badge>
          </CardTitle>
          <CardDescription>
            Key metrics for your business listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Page Views</span>
              </div>
              <div className="text-2xl font-bold">{mockAnalytics.pageViews.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-3 w-3" />
                +15% from last month
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Phone Calls</span>
              </div>
              <div className="text-2xl font-bold">{mockAnalytics.phoneClicks}</div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-3 w-3" />
                +8% from last month
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Leads</span>
              </div>
              <div className="text-2xl font-bold">{mockAnalytics.leads}</div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-3 w-3" />
                +25% from last month
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Conversion Rate</span>
              </div>
              <div className="text-2xl font-bold">{mockAnalytics.conversionRate}%</div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-3 w-3" />
                +0.3% from last month
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Analytics for Power Users */}
      {business.planTier === "power" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Advanced Analytics
              <Badge variant="secondary" className="text-xs">
                Power Plan
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Traffic Sources */}
              <div>
                <h4 className="font-medium mb-3">Traffic Sources</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Google Search</span>
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-20 h-2" />
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Direct Traffic</span>
                    <div className="flex items-center gap-2">
                      <Progress value={20} className="w-20 h-2" />
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Social Media</span>
                    <div className="flex items-center gap-2">
                      <Progress value={10} className="w-20 h-2" />
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Referrals</span>
                    <div className="flex items-center gap-2">
                      <Progress value={5} className="w-20 h-2" />
                      <span className="text-sm font-medium">5%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Breakdown */}
              <div>
                <h4 className="font-medium mb-3">Device Usage</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Smartphone className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-lg font-bold">{mockAnalytics.deviceBreakdown.mobile}%</div>
                    <div className="text-sm text-blue-700">Mobile</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Monitor className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-lg font-bold">{mockAnalytics.deviceBreakdown.desktop}%</div>
                    <div className="text-sm text-green-700">Desktop</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-2xl block mb-2">📱</span>
                    <div className="text-lg font-bold">{mockAnalytics.deviceBreakdown.tablet}%</div>
                    <div className="text-sm text-orange-700">Tablet</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Avg. Session Duration</span>
                </div>
                <span className="font-medium">
                  {Math.floor(mockAnalytics.avgSessionDuration / 60)}m {mockAnalytics.avgSessionDuration % 60}s
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Page Views per Session</span>
                </div>
                <span className="font-medium">2.4</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Returning Visitors</span>
                </div>
                <span className="font-medium">{mockAnalytics.returningVisitors}%</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Directions Requested</span>
                </div>
                <span className="font-medium">{mockAnalytics.directionsClicks}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Website Visits</span>
                </div>
                <span className="font-medium">{mockAnalytics.websiteClicks}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email Clicks</span>
                </div>
                <span className="font-medium">{mockAnalytics.emailClicks}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Audit - Power tier only */}
      {business.planTier === "power" && businessContent?.seoAudit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              SEO Health Check
              <Badge variant="secondary" className="text-xs">
                AI Powered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {businessContent.seoAudit.metaScore}/100
                  </div>
                  <div className="text-sm text-green-700">Meta Tags</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {businessContent.seoAudit.performanceScore}/100
                  </div>
                  <div className="text-sm text-blue-700">Performance</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {businessContent.seoAudit.mobileScore}/100
                  </div>
                  <div className="text-sm text-purple-700">Mobile</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Improvement Suggestions</h4>
                <div className="space-y-2">
                  {businessContent.seoAudit.suggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-orange-600">•</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitive Analysis - Power tier only */}
      {business.planTier === "power" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Competitive Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Your Ranking</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-lg px-3 py-1">
                      #3
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      out of 47 {business.category?.name || 'businesses'} in {business.city}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Average Rating</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{business.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-green-600">+0.3 above average</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Strengths</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">Above average customer rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">Strong online presence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">Fast response time</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>
            Steps to improve your listing performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Update your business description</p>
                <p className="text-sm text-muted-foreground">
                  Add more details about your services to improve search visibility
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Encourage more reviews</p>
                <p className="text-sm text-muted-foreground">
                  Ask satisfied customers to leave reviews to boost your rating
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Add more photos</p>
                <p className="text-sm text-muted-foreground">
                  Upload high-quality photos of your work to attract more customers
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}