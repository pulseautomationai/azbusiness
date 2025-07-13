import { useSearchParams, Link } from "react-router";
import { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/react-router";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export default function ClaimBusiness() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("businessId");
  const { user, isSignedIn, isLoaded } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitClaimRequest = useMutation(api.moderation.submitClaimRequest);
  const upsertUser = useMutation(api.users.upsertUser);

  // Show loading while auth is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as string;
    const additionalInfo = formData.get('additionalInfo') as string;

    if (!businessId) {
      setSubmitError("Business ID is required");
      setIsSubmitting(false);
      return;
    }

    try {
      // First ensure the user exists in Convex
      console.log('Creating/updating user record...');
      await upsertUser();
      
      console.log('Submitting claim request...');
      const result = await submitClaimRequest({
        businessId: businessId as Id<"businesses">,
        verificationMethod: email ? "email" : "phone", // Use email if provided, otherwise phone
        userRole: role === "owner" ? "owner" : role === "manager" ? "manager" : "representative",
        contactInfo: {
          phone: phone || undefined,
          email: email || undefined,
          preferredContact: email ? "email" : "phone"
        },
        verificationData: {
          additionalNotes: additionalInfo || undefined
        },
        agreesToTerms: true,
        fraudCheckData: {
          ipAddress: "unknown", // Would need to be passed from server
          userAgent: navigator.userAgent,
          submissionTime: Date.now()
        }
      });

      console.log('Claim submission result:', result);
      setSubmitSuccess(true);
      setShowForm(false);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show sign-in prompt if user is not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Claim Your Business</h1>
            
            <div className="mb-6">
              <p className="text-lg text-gray-700 mb-4">
                Sign in to claim and manage your business listing.
              </p>
              
              {businessId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800">
                    📍 Business ID: <span className="font-mono text-sm">{businessId}</span>
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    We'll redirect you back here after sign-in to complete your claim.
                  </p>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Why sign in?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Verify your identity as the business owner
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Track your claim status and updates
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Manage your business profile once approved
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Access premium features and analytics
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link 
                to={`/sign-in?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Sign In to Continue
              </Link>
              
              <Link 
                to={`/sign-up?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Create Account
              </Link>
              
              <button 
                onClick={() => window.location.href = "/"}
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Browse Businesses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Claim Your Business</h1>
          
          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-4">
              Take control of your business listing and start connecting with customers.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800">
                👋 Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-blue-700 text-sm mt-1">
                You're signed in and ready to claim your business.
              </p>
            </div>
            
            {businessId ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  ✓ Business ID: <span className="font-mono text-sm">{businessId}</span>
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Ready to start the claiming process for this business.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  ⚠ No business selected
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Please select a business from our directory to claim.
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => {
                if (businessId) {
                  setShowForm(true);
                } else {
                  alert("Please select a business to claim first.");
                }
              }}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Claiming Process
            </button>
            
            <button 
              onClick={() => window.location.href = "/"}
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Browse Businesses
            </button>
          </div>
          
          {submitError && (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">✗</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">Submission Failed</h3>
                  <p className="text-red-700 mt-1">{submitError}</p>
                  <button 
                    onClick={() => setSubmitError(null)}
                    className="text-red-600 text-sm mt-2 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {submitSuccess && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-green-800">Claim Request Submitted!</h3>
                  <p className="text-green-700 mt-1">
                    Your claim has been submitted to our moderation queue. Our team will review your request and contact you within 24-48 hours.
                  </p>
                  <p className="text-green-600 text-sm mt-2">
                    Business ID: <span className="font-mono">{businessId}</span>
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Status: <span className="font-semibold">Pending Review</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {!showForm && !submitSuccess && (
            <div className="mt-8 text-sm text-gray-600">
              <p className="mb-2">📋 What you'll need:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Business verification documents</li>
                <li>Contact information</li>
                <li>Authority to manage the business</li>
              </ul>
            </div>
          )}

          {showForm && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-xl font-semibold mb-6">Business Claim Form</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role at Business *
                  </label>
                  <select
                    name="role"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your role</option>
                    <option value="owner">Business Owner</option>
                    <option value="manager">Manager</option>
                    <option value="authorized-representative">Authorized Representative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    name="additionalInfo"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional details about your claim..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Claim Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}