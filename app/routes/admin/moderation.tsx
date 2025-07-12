/**
 * Admin Moderation & Claim Verification - Phase 5.1.5 & 5.1.6
 * Business claim verification workflows and content moderation systems
 */

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Flag,
  Shield,
  User,
  Building2,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

export default function AdminModeration() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [moderationAction, setModerationAction] = useState<string>("");
  const [moderationNotes, setModerationNotes] = useState<string>("");
  
  // Filter state
  const activeTab = searchParams.get("tab") || "queue";
  const statusFilter = searchParams.get("status") || "pending_review";
  const priorityFilter = searchParams.get("priority") || "all";

  // Data queries
  const moderationQueue = useQuery(api.moderation.getModerationQueue, {
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    priority: priorityFilter !== "all" ? priorityFilter as any : undefined,
    limit: 50,
  });

  const claimRequests = useQuery(api.moderation.getClaimRequests, {
    status: "pending",
    limit: 25,
  });

  const flaggedContent = useQuery(api.moderation.getFlaggedContent, {
    limit: 25,
  });

  // Mutations
  const processClaimRequest = useMutation(api.moderation.processClaimRequest);
  const updateModerationStatus = useMutation(api.moderation.updateModerationStatus);
  const assignModerator = useMutation(api.moderation.assignModerator);

  const handleClaimAction = async (claimId: string, action: "approve" | "reject", notes?: string) => {
    try {
      await processClaimRequest({
        claimId,
        action,
        adminNotes: notes || moderationNotes,
      });
      
      toast.success(`Claim ${action}d successfully`);
      setModerationNotes("");
    } catch (error) {
      toast.error(`Failed to ${action} claim`);
    }
  };

  const handleModerationAction = async (itemId: string, action: string) => {
    try {
      await updateModerationStatus({
        itemId,
        status: action as any,
        adminNotes: moderationNotes,
      });
      
      toast.success("Moderation action completed");
      setSelectedItem(null);
      setModerationNotes("");
    } catch (error) {
      toast.error("Failed to complete moderation action");
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200",
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors] || colors.medium}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending_review: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      flagged: { color: "bg-red-100 text-red-800", icon: Flag },
      needs_changes: { color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
    };
    
    const config = configs[status as keyof typeof configs] || configs.pending_review;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  if (moderationQueue === undefined) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Content Moderation</h1>
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600">
            Review business claims, moderate content, and manage platform quality
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {moderationQueue?.length || 0} pending items
          </Badge>
        </div>
      </div>

      {/* Moderation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
          <TabsTrigger value="claims">Claim Requests</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Moderation Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Queue Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex space-x-4">
              <Select value={statusFilter} onValueChange={(value) => setSearchParams({ ...Object.fromEntries(searchParams), status: value })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="needs_changes">Needs Changes</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={(value) => setSearchParams({ ...Object.fromEntries(searchParams), priority: value })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Queue Items */}
          <div className="space-y-4">
            {moderationQueue?.map((item) => (
              <Card key={item._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Building2 className="h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-medium">
                          {item.business?.name || "Unknown Business"}
                        </h3>
                        {getStatusBadge(item.status)}
                        {getPriorityBadge(item.priority)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2 text-sm">
                          {item.business?.city && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {item.business.city}
                            </div>
                          )}
                          {item.business?.phone && (
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {item.business.phone}
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            Submitted: {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          {item.flags.length > 0 && (
                            <div>
                              <span className="font-medium text-red-700">Flags: </span>
                              {item.flags.join(", ")}
                            </div>
                          )}
                          {item.submittedBy && (
                            <div className="flex items-center text-gray-600">
                              <User className="h-4 w-4 mr-2" />
                              Submitted by: {item.submittedBy}
                            </div>
                          )}
                          {item.assignedToAdmin && (
                            <div className="flex items-center text-gray-600">
                              <Shield className="h-4 w-4 mr-2" />
                              Assigned to: {item.assignedToAdmin}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {item.adminNotes && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <span className="text-sm font-medium text-gray-700">Admin Notes: </span>
                          <span className="text-sm text-gray-600">{item.adminNotes}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/businesses/${item.businessId}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      
                      <Select value={selectedItem === item._id ? moderationAction : ""} 
                              onValueChange={(value) => {
                                setSelectedItem(item._id);
                                setModerationAction(value);
                              }}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approve</SelectItem>
                          <SelectItem value="rejected">Reject</SelectItem>
                          <SelectItem value="needs_changes">Needs Changes</SelectItem>
                          <SelectItem value="flagged">Flag</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {selectedItem === item._id && moderationAction && (
                        <Button 
                          onClick={() => handleModerationAction(item._id, moderationAction)}
                          size="sm"
                          className="ml-2"
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {selectedItem === item._id && (
                    <div className="mt-4 pt-4 border-t">
                      <Textarea
                        placeholder="Add notes for this moderation action..."
                        value={moderationNotes}
                        onChange={(e) => setModerationNotes(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {moderationQueue?.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-600">No items in the moderation queue.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Claim Requests Tab */}
        <TabsContent value="claims" className="space-y-4">
          <div className="space-y-4">
            {claimRequests?.map((claim) => (
              <Card key={claim._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <User className="h-5 w-5 text-blue-500" />
                        <h3 className="text-lg font-medium">
                          Business Claim Request
                        </h3>
                        <Badge variant="outline">Pending Verification</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Business: </span>
                            {claim.business?.name}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Claimant: </span>
                            {claim.claimantName} ({claim.claimantEmail})
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Role: </span>
                            {claim.relationship}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Submitted: </span>
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </div>
                          {claim.verificationDocuments && (
                            <div className="text-sm">
                              <span className="font-medium">Documents: </span>
                              <Button variant="link" size="sm" className="p-0 h-auto">
                                View Documents
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {claim.message && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-4">
                          <span className="text-sm font-medium text-blue-700">Message: </span>
                          <span className="text-sm text-blue-600">{claim.message}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        onClick={() => handleClaimAction(claim._id, "approve")}
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      
                      <Button 
                        onClick={() => handleClaimAction(claim._id, "reject")}
                        size="sm" 
                        variant="destructive"
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {claimRequests?.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending claims</h3>
                  <p className="text-gray-600">All business claim requests have been processed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Flagged Content Tab */}
        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Flag className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Flagged Content Review</h3>
              <p className="text-gray-600">Content flagging system will be implemented in Phase 5.2</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Moderation History</h3>
              <p className="text-gray-600">
                View detailed history in the <Link to="/admin" className="text-blue-600 hover:underline">main dashboard</Link>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}