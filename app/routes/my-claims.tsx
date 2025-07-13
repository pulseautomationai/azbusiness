import { useQuery } from "convex/react";
import { useUser } from "@clerk/react-router";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router";

export default function MyClaims() {
  const { user } = useUser();
  
  // Get user's claims
  const userClaims = useQuery(
    user ? api.moderation.getUserClaims : "skip"
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to view your business claim status.
          </p>
          <Link 
            to="/sign-in" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (userClaims === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Business Claims</h1>
              <p className="text-gray-600 mt-1">Track the status of your business claim submissions</p>
            </div>
            <Link 
              to="/claim-business"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit New Claim
            </Link>
          </div>
        </div>

        {/* Claims List */}
        {userClaims?.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't submitted any business claims yet. Start by claiming a business listing.
            </p>
            <Link 
              to="/claim-business"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Claim a Business
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {userClaims?.map((claim) => (
              <div key={claim._id} className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {claim.businessName || 'Business Claim'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Submitted:</span>
                        <span className="ml-2 text-gray-600">
                          {new Date(claim.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Verification Method:</span>
                        <span className="ml-2 text-gray-600 capitalize">
                          {claim.verificationMethod}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Role:</span>
                        <span className="ml-2 text-gray-600 capitalize">
                          {claim.userRole}
                        </span>
                      </div>
                      {claim.reviewedAt && (
                        <div>
                          <span className="font-medium text-gray-700">Reviewed:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(claim.reviewedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                      claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      claim.status === 'info_requested' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {claim.status === 'approved' ? '✓ Approved' :
                       claim.status === 'rejected' ? '✗ Rejected' :
                       claim.status === 'info_requested' ? '📝 Info Requested' :
                       '⏳ Pending Review'}
                    </span>
                  </div>
                </div>

                {/* Admin Notes */}
                {claim.adminNotes && claim.adminNotes.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Communication History</h4>
                    <div className="space-y-3">
                      {claim.adminNotes.map((note, index) => (
                        <div key={index} className={`p-3 rounded-lg ${
                          note.action === 'approved' ? 'bg-green-50 border border-green-200' :
                          note.action === 'rejected' ? 'bg-red-50 border border-red-200' :
                          note.action === 'info_requested' ? 'bg-yellow-50 border border-yellow-200' :
                          'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900">{note.admin}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  note.action === 'approved' ? 'bg-green-100 text-green-700' :
                                  note.action === 'rejected' ? 'bg-red-100 text-red-700' :
                                  note.action === 'info_requested' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {note.action?.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              <p className="text-gray-700">{note.note}</p>
                              {note.requestedInfo && note.requestedInfo.length > 0 && (
                                <div className="mt-2">
                                  <span className="font-medium text-gray-700">Requested Information:</span>
                                  <ul className="list-disc list-inside mt-1 text-gray-600">
                                    {note.requestedInfo.map((info, i) => (
                                      <li key={i}>{info}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 ml-4">
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
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {claim.nextSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t pt-4 mt-4 flex space-x-3">
                  {claim.status === 'info_requested' && (
                    <Link
                      to={`/upload-documents?claim=${claim._id}`}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                    >
                      Upload Documents
                    </Link>
                  )}
                  {claim.status === 'rejected' && (
                    <Link
                      to="/claim-business"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Submit New Claim
                    </Link>
                  )}
                  {claim.status === 'approved' && (
                    <Link
                      to={`/business/${claim.businessId}`}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Manage Listing
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}