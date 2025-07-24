import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/react-router";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CheckCircle, AlertCircle, FileText, Filter, Eye } from "lucide-react";

type VerificationMethodFilter = "all" | "documents" | "gmb_oauth";
type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminModeration() {
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [verificationFilter, setVerificationFilter] = useState<VerificationMethodFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const { user } = useUser();

  // Mutations for admin setup
  const makeCurrentUserAdmin = useMutation(api.makeAdmin.makeCurrentUserAdmin);
  const makeUserAdminByEmail = useMutation(api.makeAdmin.makeUserAdminByEmail);
  const allUsers = useQuery(api.makeAdmin.listAllUsers);

  // Check if current user already has admin access
  const currentUserData = useQuery(user ? api.users.getCurrentUser : "skip");

  // Update hasAdminAccess when we get user data
  useEffect(() => {
    if (currentUserData?.role === "admin") {
      setHasAdminAccess(true);
    }
  }, [currentUserData]);

  // Query business claims with filters - only when user is loaded and has admin access
  const businessClaims = useQuery(
    user && hasAdminAccess ? api.businessClaims.getClaimsForModeration : "skip", 
    user && hasAdminAccess ? { 
      status: statusFilter === "all" ? undefined : statusFilter,
      verificationMethod: verificationFilter === "all" ? undefined : verificationFilter,
      limit: 50 
    } : "skip"
  );

  // Mutations for processing claims
  const approveClaimManually = useMutation(api.businessClaims.approveClaimManually);
  const rejectClaim = useMutation(api.businessClaims.rejectClaim);

  const handleClaimAction = async (claimId: string, action: "approve" | "reject") => {
    setIsProcessing(true);
    try {
      if (action === "approve") {
        await approveClaimManually({
          claimId: claimId as Id<"businessClaims">,
          adminNotes: adminNotes.trim() || "Claim approved manually by admin"
        });
      } else if (action === "reject") {
        await rejectClaim({
          claimId: claimId as Id<"businessClaims">,
          reason: "Admin reviewed and rejected",
          adminNotes: adminNotes.trim() || "Claim rejected by admin"
        });
      }

      setSelectedClaim(null);
      setAdminNotes("");
    } catch (error) {
      console.error("Error processing claim:", error);
      alert(`Failed to ${action} claim: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMakeAdmin = async () => {
    try {
      const result = await makeCurrentUserAdmin();
      alert(`Success: ${result.message}`);
      setHasAdminAccess(true); // Set admin access flag
      window.location.reload(); // Reload to refresh the data
    } catch (error) {
      console.error("Error making admin:", error);
      alert(`Failed to make admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Show admin setup interface for users without admin access
  if (!hasAdminAccess && !user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-yellow-800 mb-4">Authentication Required</h1>
          <p className="text-yellow-700">Please sign in to access the admin moderation dashboard.</p>
        </div>
      </div>
    );
  }

  // Show admin setup if there's likely an access error (for now, always show it first)
  if (!hasAdminAccess) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h1 className="text-xl font-bold text-red-800 mb-4">Admin Access Required</h1>
          <p className="text-red-700 mb-4">
            You need admin permissions to access the moderation dashboard.
          </p>
          <button
            onClick={handleMakeAdmin}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Grant Admin Access (Development)
          </button>
        </div>

        {/* Show user list for debugging */}
        {allUsers && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">All Users (Debug)</h2>
            <div className="space-y-2">
              {allUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{user.name || user.email}</div>
                    <div className="text-sm text-gray-600">Role: {user.role || "none"}</div>
                    <div className="text-xs text-gray-500 font-mono">{user._id}</div>
                  </div>
                  {user.role !== "admin" && (
                    <button
                      onClick={() => {
                        if (user.email) {
                          makeUserAdminByEmail({ email: user.email })
                            .then(() => {
                              alert(`Made ${user.email} an admin`);
                              window.location.reload();
                            })
                            .catch((error) => {
                              alert(`Failed: ${error.message}`);
                            });
                        }
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Make Admin
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (businessClaims === undefined) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Business Claim Moderation</h1>
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
          <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
          <div className="bg-gray-200 rounded-lg h-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Claim Moderation</h1>
        <p className="text-gray-600 mt-2">
          Review and process business claim requests with GMB OAuth and document verification
        </p>
        
        {/* Filters */}
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Verification:</label>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value as VerificationMethodFilter)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="all">All Methods</option>
                <option value="documents">Document Upload</option>
                <option value="gmb_oauth">GMB OAuth</option>
              </select>
            </div>
            
            <div className="ml-auto bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <p className="text-blue-800 text-sm">
                📋 <strong>{businessClaims?.length || 0}</strong> claims found
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {businessClaims?.map((claim) => (
          <div key={claim._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {/* Business Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    {claim.verification_method === "gmb_oauth" ? (
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        </svg>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {claim.business?.name || "Business Claim"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {claim.business?.city}, {claim.business?.state}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      claim.verification_method === "gmb_oauth" ? 'bg-blue-100 text-blue-800' :
                      claim.verification_method === "documents" ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {claim.verification_method === "gmb_oauth" ? "GMB OAuth" :
                       claim.verification_method === "documents" ? "Documents" :
                       "Pending"}
                    </span>
                    
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {claim.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Basic Claim Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Claim Details</h4>
                    
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Submitted:</span>
                        <div className="text-gray-600">
                          {new Date(claim.submittedAt).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">User Role:</span>
                        <div className="capitalize text-gray-600">{claim.userRole}</div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">Contact:</span>
                        <div className="text-gray-600">
                          {claim.contactInfo?.email && (
                            <div>📧 {claim.contactInfo.email}</div>
                          )}
                          {claim.contactInfo?.phone && (
                            <div>📞 {claim.contactInfo.phone}</div>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">User:</span>
                        <div className="text-gray-600">{claim.user?.name || claim.user?.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* GMB Verification Details */}
                  {claim.gmb_verification && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        GMB Verification
                      </h4>
                      
                      <div className="text-sm space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">Google Account:</span>
                          <div className="text-gray-600">{claim.gmb_verification.google_account_email}</div>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">Match Confidence:</span>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              claim.gmb_verification.match_confidence >= 85 ? 'bg-green-100 text-green-800' :
                              claim.gmb_verification.match_confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {claim.gmb_verification.match_confidence}%
                            </div>
                            {claim.gmb_verification.requires_manual_review && (
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </div>

                        {claim.gmb_verification.matched_business_name && (
                          <div>
                            <span className="font-medium text-gray-700">Matched Business:</span>
                            <div className="text-gray-600">{claim.gmb_verification.matched_business_name}</div>
                          </div>
                        )}

                        <div>
                          <span className="font-medium text-gray-700">Match Details:</span>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Name: {claim.gmb_verification.verification_details.name_match}%</div>
                            <div>Address: {claim.gmb_verification.verification_details.address_match}%</div>
                            <div>Phone: {claim.gmb_verification.verification_details.phone_match ? "✓" : "✗"}</div>
                          </div>
                        </div>

                        {claim.gmb_verification.failure_reason && (
                          <div>
                            <span className="font-medium text-red-700">Failure Reason:</span>
                            <div className="text-red-600 text-xs">{claim.gmb_verification.failure_reason}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Business Info */}
                  {claim.business && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Business Info</h4>
                      
                      <div className="text-sm space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">Address:</span>
                          <div className="text-gray-600">{claim.business.address}</div>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">Phone:</span>
                          <div className="text-gray-600">{claim.business.phone}</div>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">Current Status:</span>
                          <div className="text-gray-600">
                            {claim.business.verified ? "Verified" : "Unverified"} | 
                            {claim.business.verified ? " Verified" : " Unverified"}
                          </div>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">Plan Tier:</span>
                          <div className="capitalize text-gray-600">{claim.business.planTier}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {claim.admin_notes && claim.admin_notes.length > 0 && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-3">
                    <span className="font-medium text-blue-700">Admin Notes:</span>
                    <div className="mt-2 space-y-2">
                      {claim.admin_notes.map((note, index) => (
                        <div key={index} className="text-blue-600 text-sm">
                          <strong>{note.admin}</strong> ({note.action}): {note.note}
                          <span className="text-blue-500 ml-2">
                            {new Date(note.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="ml-6 flex-shrink-0">
                {selectedClaim === claim._id ? (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Add notes for this action..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    
                    {/* Quick actions for GMB claims with high confidence */}
                    {claim.gmb_verification && claim.gmb_verification.match_confidence >= 85 && !claim.gmb_verification.requires_manual_review && (
                      <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                        ✓ High confidence GMB match - safe to auto-approve
                      </div>
                    )}
                    
                    {claim.gmb_verification && claim.gmb_verification.requires_manual_review && (
                      <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        ⚠ Manual review required - moderate confidence match
                      </div>
                    )}

                    <div className="flex space-x-2 mb-3">
                      <button
                        onClick={() => handleClaimAction(claim._id, "approve")}
                        disabled={isProcessing}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-sm font-medium"
                      >
                        {isProcessing ? "Processing..." : "✓ Approve"}
                      </button>
                      
                      <button
                        onClick={() => handleClaimAction(claim._id, "reject")}
                        disabled={isProcessing}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 text-sm font-medium"
                      >
                        {isProcessing ? "Processing..." : "✗ Reject"}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedClaim(null);
                        setAdminNotes("");
                      }}
                      className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedClaim(claim._id)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Review Claim
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {businessClaims?.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">
              No business claims found matching the current filters.
              {statusFilter !== "all" && (
                <span className="block mt-1 text-sm">
                  Try changing the status filter to see more claims.
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}