import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { 
  CheckCircle, AlertCircle, Phone, Mail, ArrowRight, 
  ArrowLeft, RefreshCw, Clock, Shield
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

export default function ClaimVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const businessId = searchParams.get("businessId");
  const method = searchParams.get("method") as "phone" | "email" | null;
  const token = searchParams.get("token"); // For email verification
  
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  // Get business info
  const business = useQuery(
    api.businesses.getBusinessById,
    businessId ? { businessId: businessId as Id<"businesses"> } : "skip"
  );

  // Get verification status
  const verificationStatus = useQuery(
    api.verification.getVerificationStatus,
    businessId ? { businessId: businessId as Id<"businesses"> } : "skip"
  );

  // Mutations
  const verifyPhoneCode = useMutation(api.verification.verifyPhoneCode);
  const verifyEmailToken = useMutation(api.verification.verifyEmailToken);
  const initiatePhoneVerification = useMutation(api.verification.initiatePhoneVerification);
  const initiateEmailVerification = useMutation(api.verification.initiateEmailVerification);

  // Handle email verification from URL token
  useEffect(() => {
    if (token && method === "email") {
      handleEmailVerification(token);
    }
  }, [token, method]);

  // Redirect if no method or business
  useEffect(() => {
    if (!businessId || !method) {
      navigate("/");
    }
  }, [businessId, method, navigate]);

  const handleEmailVerification = async (verificationToken: string) => {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const result = await verifyEmailToken({ token: verificationToken });
      if (result.success) {
        setVerificationSuccess(true);
        // Redirect to claim status after a delay
        setTimeout(() => {
          navigate(`/claim-business/status?businessId=${businessId}`);
        }, 3000);
      }
    } catch (error: any) {
      setVerificationError(error.message || "Email verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhoneVerification = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setVerificationError("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      // We need the verification ID from the phone verification status
      const phoneVerifications = verificationStatus?.phone;
      if (!phoneVerifications) {
        throw new Error("No phone verification found");
      }

      // For this demo, we'll assume the verification ID is passed somehow
      // In a real implementation, you'd store this in the URL or local storage
      const result = await verifyPhoneCode({
        verificationId: "placeholder" as Id<"phoneVerifications">, // This would be the actual ID
        code: verificationCode
      });

      if (result.success) {
        setVerificationSuccess(true);
        // Redirect to claim status after a delay
        setTimeout(() => {
          navigate(`/claim-business/status?businessId=${businessId}`);
        }, 3000);
      }
    } catch (error: any) {
      setVerificationError(error.message || "Phone verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!businessId || !business) return;

    setResending(true);
    setVerificationError(null);

    try {
      if (method === "phone") {
        await initiatePhoneVerification({
          businessId: businessId as Id<"businesses">,
          phoneNumber: business.phone
        });
      } else if (method === "email" && business.email) {
        await initiateEmailVerification({
          businessId: businessId as Id<"businesses">,
          emailAddress: business.email
        });
      }
    } catch (error: any) {
      setVerificationError(error.message || "Failed to resend verification");
    } finally {
      setResending(false);
    }
  };

  if (!businessId || !method) {
    return null;
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Loading...</h2>
              <p className="text-muted-foreground">Fetching business information</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {method === "phone" && <Phone className="h-8 w-8 text-blue-600" />}
            {method === "email" && <Mail className="h-8 w-8 text-blue-600" />}
            <h1 className="text-3xl font-bold">
              {method === "phone" ? "Phone" : "Email"} Verification
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {method === "phone" 
              ? "Enter the verification code sent to your phone"
              : "Check your email for the verification link"
            }
          </p>
        </div>

        {/* Business Info */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold">{business.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {method === "phone" ? business.phone : business.email}
                </p>
              </div>
              <Badge variant="outline">Verifying</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Verification Content */}
        <Card>
          <CardContent className="p-6">
            {verificationSuccess ? (
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <h2 className="text-xl font-semibold text-green-900">Verification Successful!</h2>
                <p className="text-muted-foreground">
                  Your {method} has been verified successfully. Redirecting to claim status...
                </p>
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : method === "phone" ? (
              <div className="space-y-6">
                <div className="text-center">
                  <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Enter Verification Code</h3>
                  <p className="text-muted-foreground">
                    We sent a 6-digit code to <strong>{business.phone}</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setVerificationCode(value);
                        setVerificationError(null);
                      }}
                      className="text-center text-2xl tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  {verificationError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        {verificationError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={handlePhoneVerification}
                    disabled={isVerifying || verificationCode.length !== 6}
                    className="w-full"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Verify Code
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Didn't receive the code?
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleResendCode}
                      disabled={resending}
                    >
                      {resending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Resend Code
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
                  <p className="text-muted-foreground">
                    We sent a verification link to <strong>{business.email}</strong>
                  </p>
                </div>

                {token ? (
                  <div className="text-center">
                    {isVerifying ? (
                      <div className="space-y-4">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-muted-foreground">Verifying your email...</p>
                      </div>
                    ) : verificationError ? (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                          {verificationError}
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Next steps:</strong>
                        <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                          <li>Check your email inbox for a message from us</li>
                          <li>Click the verification link in the email</li>
                          <li>If you don't see it, check your spam folder</li>
                          <li>The link expires in 24 hours</li>
                        </ul>
                      </AlertDescription>
                    </Alert>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Didn't receive the email?
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleResendCode}
                        disabled={resending}
                      >
                        {resending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resend Email
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" asChild>
            <Link to={`/claim-business?businessId=${businessId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Claim
            </Link>
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <Link to="/support" className="text-blue-600 hover:underline">
              Need help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}