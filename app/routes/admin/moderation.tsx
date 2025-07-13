import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/react-router";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export default function AdminModeration() {
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
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

  // Only query pending claims if we have admin access
  const pendingClaims = useQuery(
    hasAdminAccess ? api.moderation.getPendingClaims : "skip", 
    hasAdminAccess ? { limit: 50, status: "pending" } : "skip"
  );

  // Mutation for processing claims
  const processClaimRequest = useMutation(api.moderation.processClaimRequest);

  const handleClaimAction = async (claimId: string, action: "approve" | "reject" | "request_info") => {
    if (!adminNotes.trim() && action !== "approve") {
      alert("Please add notes for this action");
      return;
    }

    setIsProcessing(true);
    try {
      await processClaimRequest({
        claimId: claimId as Id<"businessModerationQueue">,
        action,
        adminNotes: adminNotes.trim() || "Claim processed",
      });

      alert(`Claim ${action}d successfully`);
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

  if (pendingClaims === undefined) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Moderation</h1>
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
          <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
          <div className="bg-gray-200 rounded-lg h-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Claim Moderation</h1>
        <p className="text-gray-600 mt-2">
          Review and process business claim requests
        </p>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            📋 <strong>{pendingClaims?.length || 0}</strong> pending claims require review
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {pendingClaims?.map((claim) => (
          <div key={claim._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Business Claim Request
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Business ID:</span>
                      <span className="ml-2 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {claim.businessId}
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Submitted:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(claim.submittedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Verification Method:</span>
                      <span className="ml-2 capitalize text-gray-600">
                        {claim.claimData?.verificationMethod}
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium text-gray-700">User Role:</span>
                      <span className="ml-2 capitalize text-gray-600">
                        {claim.claimData?.userRole}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Contact Info:</span>
                      <div className="ml-2 text-gray-600">
                        {claim.claimData?.contactInfo?.email && (
                          <div>📧 {claim.claimData.contactInfo.email}</div>
                        )}
                        {claim.claimData?.contactInfo?.phone && (
                          <div>📞 {claim.claimData.contactInfo.phone}</div>
                        )}
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {claim.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Priority:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        claim.priority === 'high' ? 'bg-red-100 text-red-800' :
                        claim.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {claim.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {claim.claimData?.verificationData?.additionalNotes && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded p-3">
                    <span className="font-medium text-gray-700">Additional Notes:</span>
                    <p className="text-gray-600 mt-1">
                      {claim.claimData.verificationData.additionalNotes}
                    </p>
                  </div>
                )}

                {claim.adminNotes && claim.adminNotes.length > 0 && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
                    <span className="font-medium text-blue-700">Admin Notes:</span>
                    <div className="mt-2 space-y-2">
                      {claim.adminNotes.map((note, index) => (
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
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleClaimAction(claim._id, "approve")}
                        disabled={isProcessing}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-sm"
                      >
                        {isProcessing ? "Processing..." : "✓ Approve"}
                      </button>
                      
                      <button
                        onClick={() => handleClaimAction(claim._id, "reject")}
                        disabled={isProcessing}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 text-sm"
                      >
                        {isProcessing ? "Processing..." : "✗ Reject"}
                      </button>
                    </div>

                    <button
                      onClick={() => handleClaimAction(claim._id, "request_info")}
                      disabled={isProcessing}
                      className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 text-sm"
                    >
                      {isProcessing ? "Processing..." : "📝 Request Info"}
                    </button>

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

        {pendingClaims?.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending business claims to review.</p>
          </div>
        )}
      </div>
    </div>
  );
}