import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { 
  Users, Mail, Phone, MessageSquare, TrendingUp, 
  Clock, CheckCircle, XCircle, Filter, ChevronDown,
  Calendar, Eye, BarChart3, PieChart
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Progress } from "~/components/ui/progress";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface LeadDashboardProps {
  businessId: Id<"businesses">;
  timeRange?: "week" | "month" | "quarter" | "year";
}

export function LeadDashboard({ businessId, timeRange = "month" }: LeadDashboardProps) {
  const [selectedStatus, setSelectedStatus] = useState<"all" | "new" | "contacted" | "converted">("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  // Get lead data
  const leads = useQuery(api.leads.getBusinessLeads, {
    businessId,
    status: selectedStatus === "all" ? undefined : selectedStatus,
  });

  const analytics = useQuery(api.leads.getLeadAnalytics, {
    businessId,
    timeRange: selectedTimeRange,
  });

  const updateLeadStatus = useMutation(api.leads.updateLeadStatus);

  const handleStatusUpdate = async (leadId: Id<"leads">, newStatus: "new" | "contacted" | "converted") => {
    try {
      await updateLeadStatus({ leadId, status: newStatus });
    } catch (error) {
      console.error("Failed to update lead status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "converted": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new": return <Mail className="h-3 w-3" />;
      case "contacted": return <MessageSquare className="h-3 w-3" />;
      case "converted": return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (!leads || !analytics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lead Management</h2>
          <p className="text-muted-foreground">Track and manage customer inquiries</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={(value: any) => setSelectedTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{analytics.totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Leads</p>
                <p className="text-2xl font-bold">{analytics.newLeads}</p>
              </div>
              <Mail className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Converted</p>
                <p className="text-2xl font-bold">{analytics.convertedLeads}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Breakdown */}
      {Object.keys(analytics.serviceBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Leads by Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.serviceBreakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([service, count]) => {
                  const percentage = (count / analytics.totalLeads) * 100;
                  return (
                    <div key={service} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-32 truncate">{service}</span>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-12">{count}</span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Leads List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Leads
          </CardTitle>
          <CardDescription>
            {leads.length} leads found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No leads yet</h3>
              <p className="text-sm text-muted-foreground">
                Leads will appear here when customers contact your business
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{lead.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                        {lead.phone && (
                          <>
                            <span>•</span>
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(lead.status)}>
                        {getStatusIcon(lead.status)}
                        <span className="ml-1 capitalize">{lead.status}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {lead.service && (
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs">
                        {lead.service}
                      </Badge>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground mb-3">
                    {lead.message}
                  </p>

                  <div className="flex items-center gap-2">
                    {lead.status === "new" && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(lead._id, "contacted")}
                        >
                          Mark as Contacted
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(lead._id, "converted")}
                        >
                          Mark as Converted
                        </Button>
                      </>
                    )}
                    {lead.status === "contacted" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusUpdate(lead._id, "converted")}
                      >
                        Mark as Converted
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Mail className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}