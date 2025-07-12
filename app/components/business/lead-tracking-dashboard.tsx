import { useState } from "react";
import { CalendarDays, MessageSquare, Phone, Mail, Clock, TrendingUp, Filter, Download, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { FeatureGate } from "~/components/FeatureGate";
import type { PlanTier } from "~/config/features";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  service?: string;
  status: "new" | "contacted" | "converted";
  createdAt: number;
}

interface LeadTrackingDashboardProps {
  businessId: string;
  planTier: PlanTier;
  leads: Lead[];
  isLoading?: boolean;
  onStatusChange?: (leadId: string, status: Lead["status"]) => void;
  onExportLeads?: () => void;
}

export function LeadTrackingDashboard({ 
  businessId, 
  planTier, 
  leads, 
  isLoading = false,
  onStatusChange,
  onExportLeads
}: LeadTrackingDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("30");

  // Filter leads based on status and search
  const filteredLeads = leads.filter(lead => {
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSearch = !searchTerm || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter
    const daysAgo = parseInt(dateRange);
    const cutoff = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);
    const matchesDate = lead.createdAt >= cutoff;
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  // Calculate metrics
  const metrics = {
    total: filteredLeads.length,
    new: filteredLeads.filter(l => l.status === "new").length,
    contacted: filteredLeads.filter(l => l.status === "contacted").length,
    converted: filteredLeads.filter(l => l.status === "converted").length,
    conversionRate: filteredLeads.length > 0 ? 
      (filteredLeads.filter(l => l.status === "converted").length / filteredLeads.length * 100).toFixed(1) : "0",
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "converted": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanLimit = (tier: PlanTier) => {
    switch (tier) {
      case "free": return 5;
      case "pro": return 50;
      case "power": return -1; // unlimited
      default: return 0;
    }
  };

  const planLimit = getPlanLimit(planTier);
  const isNearLimit = planLimit > 0 && leads.length >= planLimit * 0.8;

  return (
    <FeatureGate featureId="leads" planTier={planTier}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Lead Management</h2>
            <p className="text-muted-foreground">
              Track and manage customer inquiries and leads
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {planTier === "power" && (
              <Button variant="outline" onClick={onExportLeads}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            <Badge variant={isNearLimit ? "destructive" : "secondary"}>
              {planLimit > 0 ? `${leads.length}/${planLimit}` : `${leads.length} leads`}
            </Badge>
          </div>
        </div>

        {/* Lead Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">
                Last {dateRange} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.new}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.contacted}</div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Leads to customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lead Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Leads ({metrics.total})</TabsTrigger>
            <TabsTrigger value="new">New ({metrics.new})</TabsTrigger>
            <TabsTrigger value="contacted">Contacted ({metrics.contacted})</TabsTrigger>
            <TabsTrigger value="converted">Converted ({metrics.converted})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Leads</CardTitle>
                <CardDescription>
                  Complete list of customer inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead._id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span className="text-sm">{lead.email}</span>
                            </div>
                            {lead.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span className="text-sm">{lead.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{lead.service || "General"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(lead.createdAt)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {lead.message}
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={lead.status} 
                            onValueChange={(value) => onStatusChange?.(lead._id, value as Lead["status"])}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredLeads.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No leads found matching your criteria.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>New Leads</CardTitle>
                <CardDescription>
                  Recent inquiries that need your attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLeads.filter(lead => lead.status === "new").map((lead) => (
                    <Card key={lead._id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{lead.name}</h4>
                              <Badge variant="secondary">{lead.service || "General"}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{lead.message}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{lead.email}</span>
                              </div>
                              {lead.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{lead.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <CalendarDays className="h-3 w-3" />
                                <span>{formatDate(lead.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => onStatusChange?.(lead._id, "contacted")}
                            >
                              Mark Contacted
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacted" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contacted Leads</CardTitle>
                <CardDescription>
                  Leads you've reached out to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLeads.filter(lead => lead.status === "contacted").map((lead) => (
                    <Card key={lead._id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{lead.name}</h4>
                              <Badge variant="secondary">{lead.service || "General"}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{lead.message}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{lead.email}</span>
                              </div>
                              {lead.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{lead.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <CalendarDays className="h-3 w-3" />
                                <span>{formatDate(lead.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onStatusChange?.(lead._id, "new")}
                            >
                              Mark New
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => onStatusChange?.(lead._id, "converted")}
                            >
                              Mark Converted
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="converted" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Converted Leads</CardTitle>
                <CardDescription>
                  Leads that became customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLeads.filter(lead => lead.status === "converted").map((lead) => (
                    <Card key={lead._id} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{lead.name}</h4>
                              <Badge variant="secondary">{lead.service || "General"}</Badge>
                              <Badge className="bg-green-100 text-green-800">Converted</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{lead.message}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{lead.email}</span>
                              </div>
                              {lead.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{lead.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <CalendarDays className="h-3 w-3" />
                                <span>{formatDate(lead.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FeatureGate>
  );
}