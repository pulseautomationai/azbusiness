import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { 
  CheckCircle, Clock, AlertCircle, XCircle, ArrowRight, 
  Phone, Mail, Upload, Crown, ExternalLink, RefreshCw,
  MessageSquare, FileText, User, Calendar
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    title: "Claim Pending",
    description: "Your claim is being reviewed"
  },
  in_review: {
    icon: RefreshCw,
    color: "text-blue-600", 
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    title: "Under Review",
    description: "An admin is reviewing your claim"
  },
  info_requested: {
    icon: MessageSquare,
    color: "text-orange-600",
    bgColor: "bg-orange-50", 
    borderColor: "border-orange-200",
    title: "Information Requested",
    description: "Additional information is needed"
  },
  approved: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200", 
    title: "Claim Approved",
    description: "Congratulations! Your claim has been approved"
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    title: "Claim Rejected", 
    description: "Your claim was not approved"
  }
};

export default function ClaimStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const claimId = searchParams.get("claimId");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get claim status
  const claimStatus = useQuery(
    api.moderation.getClaimStatus,
    claimId ? { businessId: "placeholder" as Id<"businesses"> } : "skip"
  );

  // Get business info if we have it
  const business = useQuery(
    api.businesses.getBusinessById,
    claimStatus?.businessId ? { businessId: claimStatus.businessId } : "skip"
  );

  useEffect(() => {
    if (!claimId) {
      navigate("/");
    }
  }, [claimId, navigate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // The query will automatically refetch
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (!claimId) {
    return null;
  }

  if (!claimStatus) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Loading Claim Status</h2>
              <p className="text-muted-foreground">Fetching your claim information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[claimStatus.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Claim Status</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Track the progress of your business claim
          </p>
        </div>

        {/* Status Card */}
        <Card className={cn("mb-8", statusConfig.borderColor, statusConfig.bgColor)}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                statusConfig.bgColor,
                statusConfig.color
              )}>
                <StatusIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold">{statusConfig.title}</h2>
                  <Badge variant="outline" className={cn(statusConfig.color)}>
                    {claimStatus.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  {statusConfig.description}
                </p>
                
                {/* Business Info */}
                {business && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Claim for:</span>
                    <Link 
                      to={`/business/${business.slug}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {business.name}
                    </Link>
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Claim Details */}
            <Card>
              <CardHeader>
                <CardTitle>Claim Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Claim ID</p>
                    <p className="text-sm font-mono">{claimStatus.claimId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                    <p className="text-sm">
                      {new Date(claimStatus.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Verification Method</p>
                    <div className="flex items-center gap-2">
                      {claimStatus.verificationMethod === 'phone' && <Phone className="h-3 w-3" />}
                      {claimStatus.verificationMethod === 'email' && <Mail className="h-3 w-3" />}
                      {claimStatus.verificationMethod === 'documents' && <Upload className="h-3 w-3" />}
                      <span className="text-sm capitalize">{claimStatus.verificationMethod}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <p className="text-sm capitalize">{claimStatus.userRole}</p>
                  </div>
                </div>

                {claimStatus.reviewedAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Reviewed</p>
                    <p className="text-sm">
                      {new Date(claimStatus.reviewedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Notes */}
            {claimStatus.adminNotes && claimStatus.adminNotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Updates & Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {claimStatus.adminNotes.map((note: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{note.admin}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{note.note}</p>
                        {note.requestedInfo && note.requestedInfo.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-muted-foreground">Additional info requested:</p>
                            <ul className="text-xs text-muted-foreground list-disc list-inside">
                              {note.requestedInfo.map((info: string, i: number) => (
                                <li key={i}>{info}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions based on status */}
            {claimStatus.status === "approved" && business && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Claim Approved!</h3>
                  </div>
                  <p className="text-green-700 mb-4">
                    Your business claim has been approved. You can now manage your listing and access all the features.
                  </p>
                  <div className="flex gap-3">
                    <Button asChild>
                      <Link to={`/dashboard/business/${business.slug}`}>
                        <Crown className="h-4 w-4 mr-2" />
                        Manage Listing
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/business/${business.slug}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Listing
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {claimStatus.status === "rejected" && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <XCircle className="h-6 w-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-900">Claim Rejected</h3>
                  </div>
                  <p className="text-red-700 mb-4">
                    Unfortunately, your claim was not approved. Please review the admin notes above 
                    for the reason and consider resubmitting with additional verification.
                  </p>
                  <Button variant="outline" asChild>
                    <Link to={`/claim-business?businessId=${claimStatus.businessId}`}>
                      Try Again
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {claimStatus.status === "info_requested" && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="h-6 w-6 text-orange-600" />
                    <h3 className="text-lg font-semibold text-orange-900">Action Required</h3>
                  </div>
                  <p className="text-orange-700 mb-4">
                    Additional information is required to process your claim. Please check the admin notes 
                    above and provide the requested information.
                  </p>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {claimStatus.nextSteps?.map((step: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">Common Questions</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• How long does verification take?</li>
                    <li>• What documents are accepted?</li>
                    <li>• Can I expedite my claim?</li>
                  </ul>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/help/claiming">
                      <FileText className="h-4 w-4 mr-2" />
                      Help Center
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Claim Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>After Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Edit business information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Respond to customer messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>View analytics and insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Get verified badge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Upgrade to Pro/Power plans</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Questions about your claim? <Link to="/support" className="text-blue-600 hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}