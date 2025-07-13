import { useQuery } from "convex/react";
import { useUser } from "@clerk/react-router";
import { api } from "../../../convex/_generated/api";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { 
  IconBuildingStore,
  IconPlus,
  IconUpload,
  IconEdit,
  IconEye
} from "@tabler/icons-react";

export default function ClaimsPage() {
  const { user } = useUser();
  
  // Get user's claims
  const userClaims = useQuery(
    user ? api.moderation.getUserClaims : "skip"
  );

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view your business claim status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/sign-in">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userClaims === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Business Claims</h1>
            <p className="text-muted-foreground">
              Track the status of your business claim submissions
            </p>
          </div>
          <Link to="/claim-business">
            <Button className="flex items-center gap-2">
              <IconPlus className="h-4 w-4" />
              Submit New Claim
            </Button>
          </Link>
        </div>

        {/* Claims List */}
        {userClaims?.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <div className="mb-4">
                <IconBuildingStore className="w-16 h-16 mx-auto text-muted-foreground" />
              </div>
              <CardTitle className="text-lg mb-2">No Claims Yet</CardTitle>
              <CardDescription className="mb-6">
                You haven't submitted any business claims yet. Start by claiming a business listing.
              </CardDescription>
              <Link to="/claim-business">
                <Button className="flex items-center gap-2">
                  <IconBuildingStore className="h-4 w-4" />
                  Claim a Business
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {userClaims?.map((claim) => (
              <Card key={claim._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {claim.businessName || 'Business Claim'}
                      </CardTitle>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Submitted:</span>
                          <span className="ml-2">
                            {new Date(claim.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Verification Method:</span>
                          <span className="ml-2 capitalize">
                            {claim.verificationMethod}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Role:</span>
                          <span className="ml-2 capitalize">
                            {claim.userRole}
                          </span>
                        </div>
                        {claim.reviewedAt && (
                          <div>
                            <span className="font-medium text-muted-foreground">Reviewed:</span>
                            <span className="ml-2">
                              {new Date(claim.reviewedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Badge variant={
                      claim.status === 'approved' ? 'default' :
                      claim.status === 'rejected' ? 'destructive' :
                      claim.status === 'info_requested' ? 'secondary' :
                      'outline'
                    }>
                      {claim.status === 'approved' ? '✓ Approved' :
                       claim.status === 'rejected' ? '✗ Rejected' :
                       claim.status === 'info_requested' ? '📝 Info Requested' :
                       '⏳ Pending Review'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Admin Notes */}
                  {claim.adminNotes && claim.adminNotes.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-3">Communication History</h4>
                      <div className="space-y-3">
                        {claim.adminNotes.map((note, index) => (
                          <div key={index} className={`p-3 rounded-lg border ${
                            note.action === 'approved' ? 'bg-green-50 border-green-200' :
                            note.action === 'rejected' ? 'bg-red-50 border-red-200' :
                            note.action === 'info_requested' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium">{note.admin}</span>
                                  <Badge variant={
                                    note.action === 'approved' ? 'default' :
                                    note.action === 'rejected' ? 'destructive' :
                                    note.action === 'info_requested' ? 'secondary' :
                                    'outline'
                                  } className="text-xs">
                                    {note.action?.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm">{note.note}</p>
                                {note.requestedInfo && note.requestedInfo.length > 0 && (
                                  <div className="mt-2">
                                    <span className="font-medium text-sm">Requested Information:</span>
                                    <ul className="list-disc list-inside mt-1 text-sm text-muted-foreground">
                                      {note.requestedInfo.map((info, i) => (
                                        <li key={i}>{info}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground ml-4">
                                {new Date(note.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {claim.nextSteps && claim.nextSteps.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Next Steps</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {claim.nextSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    {claim.status === 'info_requested' && (
                      <Link to={`/dashboard/documents?claim=${claim._id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <IconUpload className="h-4 w-4" />
                          Upload Documents
                        </Button>
                      </Link>
                    )}
                    {claim.status === 'rejected' && (
                      <Link to="/claim-business">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <IconPlus className="h-4 w-4" />
                          Submit New Claim
                        </Button>
                      </Link>
                    )}
                    {claim.status === 'approved' && (
                      <>
                        <Link to={`/business/${claim.businessId}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <IconEye className="h-4 w-4" />
                            View Listing
                          </Button>
                        </Link>
                        <Link to={`/dashboard/listing/${claim.businessId}`}>
                          <Button size="sm" className="flex items-center gap-2">
                            <IconEdit className="h-4 w-4" />
                            Manage Listing
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}