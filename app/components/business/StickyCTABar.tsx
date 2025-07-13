import { useState, useEffect } from "react";
import { X, Phone, MessageSquare, Award, Crown, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { FeatureGate } from "~/components/FeatureGate";
import { Link } from "react-router";
import { cn } from "~/lib/utils";

interface StickyCTABarProps {
  business: any;
  isOwner: boolean;
  onContactClick?: () => void;
}

export function StickyCTABar({ business, isOwner, onContactClick }: StickyCTABarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [ctaType, setCTAType] = useState<'claim' | 'upgrade' | 'contact'>('contact');

  useEffect(() => {
    // Determine which CTA to show based on business status and plan
    if (!business.claimed && !isOwner) {
      setCTAType('claim');
    } else if (business.planTier !== 'power' && isOwner) {
      setCTAType('upgrade');
    } else {
      setCTAType('contact');
    }
  }, [business, isOwner]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal in localStorage to remember user preference
    localStorage.setItem(`dismissed-cta-${business._id}`, 'true');
  };

  useEffect(() => {
    // Check if user previously dismissed this CTA
    const wasDismissed = localStorage.getItem(`dismissed-cta-${business._id}`);
    if (wasDismissed) {
      setIsVisible(false);
    }
  }, [business._id]);

  if (!isVisible) return null;

  const renderClaimCTA = () => (
    <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Is this your business?</p>
              <p className="text-sm text-green-100">
                Claim your listing to edit details and get more customers
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="text-white hover:bg-white/10 hidden sm:inline-flex"
            >
              Not Now
            </Button>
            <Link to={`/claim-business?businessId=${business._id}`}>
              <Button 
                size="sm" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
              >
                Claim Business
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUpgradeCTA = () => {
    const targetPlan = business.planTier === 'free' ? 'pro' : 'power';
    const planName = targetPlan === 'pro' ? 'Pro' : 'Power';
    const planPrice = targetPlan === 'pro' ? '$29' : '$97';
    const planColor = targetPlan === 'pro' ? 'from-blue-500 to-indigo-600' : 'from-purple-500 to-pink-600';
    
    return (
      <div className={`bg-gradient-to-r ${planColor} text-white`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Upgrade to {planName}</p>
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    {planPrice}/month
                  </Badge>
                </div>
                <p className="text-sm opacity-90">
                  {targetPlan === 'pro' 
                    ? 'Get analytics, lead management, and custom content'
                    : 'Unlock AI features, advanced analytics, and priority placement'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismiss}
                className="text-white hover:bg-white/10 hidden sm:inline-flex"
              >
                Maybe Later
              </Button>
              <Link to="/pricing">
                <Button 
                  size="sm" 
                  className="bg-white text-primary hover:bg-gray-100 font-semibold"
                >
                  Upgrade Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContactCTA = () => (
    <FeatureGate
      featureId="contactForm"
      planTier={business.planTier}
      fallback={
        <div className="bg-gray-600 text-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Contact {business.name}</p>
                  <p className="text-sm text-gray-200">
                    Upgrade to Pro to enable contact forms
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDismiss}
                  className="text-white hover:bg-white/10 hidden sm:inline-flex"
                >
                  Dismiss
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => window.location.href = `tel:${business.phone}`}
                  className="bg-white text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Get a Free Quote</p>
                <p className="text-sm opacity-90">
                  Contact {business.name} for professional service
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismiss}
                className="text-white hover:bg-white/10 hidden sm:inline-flex"
              >
                Not Now
              </Button>
              <Button 
                size="sm" 
                onClick={onContactClick}
                className="bg-white text-primary hover:bg-gray-100 font-semibold"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Get Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 shadow-lg border-t">
      {/* Dismiss Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute top-2 right-2 z-10 w-6 h-6 p-0 bg-black/20 hover:bg-black/30 text-white rounded-full"
      >
        <X className="w-3 h-3" />
      </Button>

      {/* CTA Content */}
      {ctaType === 'claim' && renderClaimCTA()}
      {ctaType === 'upgrade' && renderUpgradeCTA()}
      {ctaType === 'contact' && renderContactCTA()}
    </div>
  );
}