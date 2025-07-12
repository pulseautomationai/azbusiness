import { useState } from "react";
import { Upload, Camera, X, Edit } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { FeatureGate } from "~/components/FeatureGate";
import { cn } from "~/lib/utils";

interface HeroBannerProps {
  business: any;
  businessContent: any;
  isOwner: boolean;
  className?: string;
}

export function HeroBanner({ business, businessContent, isOwner, className }: HeroBannerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);

  const hasCustomImage = businessContent?.heroImageUrl;
  const hasGMBImage = business.heroImage;
  const currentImage = hasCustomImage ? businessContent.heroImageUrl : business.heroImage;

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // TODO: Implement actual image upload to Convex file storage
      console.log("Uploading image:", file);
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      // TODO: Update business content with new image URL
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
      setShowUploadOverlay(false);
    }
  };

  const generateFallbackImage = () => {
    // Generate a gradient background with business initial
    const initial = business.name.charAt(0).toUpperCase();
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600', 
      'from-purple-400 to-purple-600',
      'from-orange-400 to-orange-600',
      'from-teal-400 to-teal-600'
    ];
    const colorIndex = business.name.length % colors.length;
    
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center`}>
        <div className="text-white text-6xl font-bold opacity-20">
          {initial}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative h-80 bg-muted/30 overflow-hidden rounded-t-lg", className)}>
      {/* Background Image or Fallback */}
      {currentImage ? (
        <div className="absolute inset-0">
          <img 
            src={currentImage} 
            alt={business.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ) : (
        generateFallbackImage()
      )}

      {/* Upload Overlay for Pro+ */}
      <FeatureGate
        featureId="heroImageUpload"
        planTier={business.planTier}
        showUpgrade={false}
      >
        {isOwner && (
          <>
            {/* Edit Button */}
            <div className="absolute top-4 right-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowUploadOverlay(true)}
                className="bg-white/90 hover:bg-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Change Image
              </Button>
            </div>

            {/* Upload Overlay */}
            {showUploadOverlay && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <Card className="p-6 max-w-md mx-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Upload Hero Image</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add a professional hero image to make your listing stand out
                    </p>
                    
                    <div className="space-y-3">
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          disabled={isUploading}
                        />
                        <Button 
                          variant="default" 
                          className="w-full"
                          disabled={isUploading}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? "Uploading..." : "Choose Image"}
                        </Button>
                      </label>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowUploadOverlay(false)}
                        disabled={isUploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </FeatureGate>

      {/* Upgrade Prompt for Free Plan */}
      <FeatureGate
        featureId="heroImageUpload"
        planTier={business.planTier}
        fallback={
          !currentImage && (
            <div className="absolute bottom-4 right-4">
              <Card className="p-3 bg-white/95">
                <div className="flex items-center gap-2 text-sm">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Upgrade to add custom images
                  </span>
                </div>
              </Card>
            </div>
          )
        }
      >
        {/* Content rendered when user has access */}
        <></>
      </FeatureGate>

      {/* Image Quality Badge for AI Enhanced */}
      <FeatureGate
        featureId="aiServiceDescriptions"
        planTier={business.planTier}
        showUpgrade={false}
      >
        {hasCustomImage && (
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/90 px-2 py-1 rounded text-xs font-medium">
              🤖 AI Enhanced
            </div>
          </div>
        )}
      </FeatureGate>
    </div>
  );
}