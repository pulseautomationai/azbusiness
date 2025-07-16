import { useSearchParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/react-router";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";

type VerificationMethod = "documents" | "gmb_oauth" | null;

export default function ClaimBusiness() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("businessId");
  const gmbError = searchParams.get("error");
  const gmbSuccess = searchParams.get("success");
  const confidence = searchParams.get("confidence");
  const { user, isSignedIn, isLoaded } = useUser();
  
  // Form state
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitClaimRequest = useMutation(api.businessClaims.submitClaimRequest);
  const upsertUser = useMutation(api.users.upsertUser);

  // Handle GMB OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        setSubmitError(`Google OAuth failed: ${error}`);
        return;
      }

      if (code && state) {
        console.log('Processing OAuth callback...', { code: code.substring(0, 20) + '...', state });
        
        try {
          // Parse state to get claim ID
          const [claimId, userId, timestamp] = state.split(':');
          
          if (!claimId || !userId) {
            throw new Error('Invalid OAuth state');
          }

          // Exchange code for access token
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
              client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
              code: code,
              grant_type: 'authorization_code',
              redirect_uri: `${window.location.origin}/claim-business`
            })
          });

          if (!tokenResponse.ok) {
            throw new Error('Failed to exchange OAuth code for tokens');
          }

          const tokens = await tokenResponse.json();
          console.log('Got OAuth tokens');

          // Get user info and GMB locations
          const [userInfoResponse, gmbAccountsResponse] = await Promise.all([
            fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${tokens.access_token}` }
            }),
            fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
              headers: { Authorization: `Bearer ${tokens.access_token}` }
            })
          ]);

          const userInfo = await userInfoResponse.json();
          const gmbAccounts = await gmbAccountsResponse.json();

          console.log('GMB OAuth Success:', {
            userEmail: userInfo.email,
            accountsFound: gmbAccounts.accounts?.length || 0
          });

          // For testing, show success message
          setSubmitSuccess(true);
          setSubmitError(null);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname + '?businessId=' + businessId);
          
          // Redirect to onboarding flow after GMB OAuth success
          setTimeout(() => {
            window.location.href = `/claim-business/onboarding?claimId=${claimId}&businessId=${businessId}&status=verified`;
          }, 2000);

        } catch (error) {
          console.error('OAuth callback error:', error);
          setSubmitError(`OAuth processing failed: ${error.message}`);
        }
      }
    };

    handleOAuthCallback();

    // Legacy handling for old URL params
    if (gmbError) {
      setSubmitError(decodeURIComponent(gmbError));
    } else if (gmbSuccess === "verified") {
      setSubmitSuccess(true);
      setSubmitError(null);
      // Redirect to onboarding flow
      setTimeout(() => {
        window.location.href = `/claim-business/onboarding?businessId=${businessId}&status=verified`;
      }, 2000);
    } else if (gmbSuccess === "review_required") {
      setSubmitSuccess(true);
      setSubmitError(null);
      // Redirect to onboarding flow
      setTimeout(() => {
        window.location.href = `/claim-business/onboarding?businessId=${businessId}&status=pending`;
      }, 2000);
    }
  }, [gmbError, gmbSuccess, businessId]);

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

    if (!verificationMethod) {
      setSubmitError("Please select a verification method");
      setIsSubmitting(false);
      return;
    }

    try {
      // First ensure the user exists in Convex
      console.log('Creating/updating user record...');
      await upsertUser();
      
      if (verificationMethod === "gmb_oauth") {
        // For GMB OAuth, create claim first then start frontend OAuth
        console.log('Creating claim record for GMB OAuth...');
        const result = await submitClaimRequest({
          businessId: businessId as Id<"businesses">,
          verification_method: "pending", // Will be updated during OAuth flow
          userRole: role === "owner" ? "owner" : role === "manager" ? "manager" : "representative",
          contactInfo: {
            phone: phone || undefined,
            email: email || undefined,
            preferredContact: email ? "email" : "phone"
          },
          agreesToTerms: true,
          fraudCheckData: {
            ipAddress: "unknown",
            userAgent: navigator.userAgent,
            duplicateCheck: false
          }
        });

        // Start frontend GMB OAuth flow
        console.log('Starting frontend GMB OAuth flow...');
        await startGMBOAuth(result.claimId);
        return;
      } else {
        // For document verification
        console.log('Submitting claim request with document verification...');
        const result = await submitClaimRequest({
          businessId: businessId as Id<"businesses">,
          verification_method: "documents",
          userRole: role === "owner" ? "owner" : role === "manager" ? "manager" : "representative",
          contactInfo: {
            phone: phone || undefined,
            email: email || undefined,
            preferredContact: email ? "email" : "phone"
          },
          agreesToTerms: true,
          fraudCheckData: {
            ipAddress: "unknown",
            userAgent: navigator.userAgent,
            duplicateCheck: false
          }
        });

        console.log('Claim submission result:', result);
        setSubmitSuccess(true);
        setShowForm(false);
        
        // Redirect to onboarding flow after successful claim
        setTimeout(() => {
          window.location.href = `/claim-business/onboarding?claimId=${result.claimId}&businessId=${businessId}&status=pending`;
        }, 2000);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Frontend GMB OAuth implementation
  const startGMBOAuth = async (claimId: string) => {
    try {
      const state = `${claimId}:${user?.id}:${Date.now()}`;
      
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        redirect_uri: `${window.location.origin}/claim-business`,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.email',
        state: state,
        access_type: 'offline',
        prompt: 'consent'
      });
      
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      
      console.log('Redirecting to Google OAuth:', oauthUrl);
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('GMB OAuth error:', error);
      setSubmitError('Failed to start Google verification. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleGMBVerification = () => {
    setVerificationMethod("gmb_oauth");
    setShowForm(true);
  };

  const handleDocumentVerification = () => {
    setVerificationMethod("documents");
    setShowForm(true);
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
                to={`/sign-up?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors text-center font-semibold"
              >
                Create Account & Claim Business
              </Link>
              
              <Link 
                to={`/sign-in?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Sign In to Continue
              </Link>
              
              <div className="text-center">
                <button 
                  onClick={() => window.location.href = "/"}
                  className="text-gray-600 hover:text-gray-800 underline"
                >
                  Browse Businesses
                </button>
              </div>
            </div>
            
            {/* Plan Preview for non-authenticated users */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What you'll get after claiming:</h3>
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Starter ($9/month)</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Professional presence</li>
                    <li>• Verification badge</li>
                    <li>• SEO backlink</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-300 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Pro ($29/month)</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Popular</span>
                  </div>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Featured placement</li>
                    <li>• Editable content</li>
                    <li>• Enhanced visibility</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Power ($97/month)</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Exclusive leads</li>
                    <li>• Homepage featuring</li>
                    <li>• AI insights</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                💡 You can also start with our free tier and upgrade anytime
              </p>
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
          
          {/* Verification Method Selection */}
          {!showForm && !submitSuccess && (
            <div className="space-y-6">
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  How would you like to verify ownership?
                </h2>
                <p className="text-gray-600 mb-6">
                  Choose your preferred verification method to claim this business listing.
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {/* GMB OAuth Option */}
                  <div 
                    onClick={() => {
                      if (businessId) {
                        handleGMBVerification();
                      } else {
                        alert("Please select a business to claim first.");
                      }
                    }}
                    className="relative border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        RECOMMENDED
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                          Verify with Google My Business
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      Quick verification if you manage this business on Google My Business
                    </p>
                    
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-gray-700">Instant verification (if business found)</span>
                    </div>
                  </div>

                  {/* Document Upload Option */}
                  <div 
                    onClick={() => {
                      if (businessId) {
                        handleDocumentVerification();
                      } else {
                        alert("Please select a business to claim first.");
                      }
                    }}
                    className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                          Upload Documents
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      Upload business license or verification documents
                    </p>
                    
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                      <span className="text-gray-700">Admin review in 1-2 business days</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <button 
                  onClick={() => window.location.href = "/"}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Browse Businesses
                </button>
              </div>
            </div>
          )}
          
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
            <div className="mt-8">
              {gmbSuccess === "verified" ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-green-800">Business Verified Successfully!</h3>
                      <p className="text-green-700 mt-1">
                        Your business has been automatically verified through Google My Business. Your claim has been approved and you now have access to Pro features.
                      </p>
                      {confidence && (
                        <p className="text-green-600 text-sm mt-2">
                          Match Confidence: <span className="font-semibold">{confidence}%</span>
                        </p>
                      )}
                      <p className="text-green-600 text-sm mt-1">
                        Status: <span className="font-semibold">Approved</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : gmbSuccess === "review_required" ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertCircle className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-yellow-800">Manual Review Required</h3>
                      <p className="text-yellow-700 mt-1">
                        We found a similar business in your Google My Business account, but need to verify the details manually. Our team will review your claim within 1-2 business days.
                      </p>
                      {confidence && (
                        <p className="text-yellow-600 text-sm mt-2">
                          Match Confidence: <span className="font-semibold">{confidence}%</span>
                        </p>
                      )}
                      <p className="text-yellow-600 text-sm mt-1">
                        Status: <span className="font-semibold">Pending Manual Review</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
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