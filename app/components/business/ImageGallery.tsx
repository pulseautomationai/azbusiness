import React, { useState } from 'react';
import { BusinessWithTier } from '~/types/tiers';
import { Image, ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';

interface ImageGalleryProps {
  business: BusinessWithTier & {
    images?: string[];
  };
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ business }) => {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mock images if none provided
  const images = business.images || [
    'https://placehold.co/600x400/e5e7eb/6b7280?text=Project+1',
    'https://placehold.co/600x400/e5e7eb/6b7280?text=Project+2',
    'https://placehold.co/600x400/e5e7eb/6b7280?text=Project+3',
    'https://placehold.co/600x400/e5e7eb/6b7280?text=Project+4',
    'https://placehold.co/600x400/e5e7eb/6b7280?text=Project+5',
    'https://placehold.co/600x400/e5e7eb/6b7280?text=Project+6',
  ];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Card className="image-gallery border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Image className="w-6 h-6 text-ocotillo-red" />
              Professional Work Gallery
            </span>
            <Badge className="bg-ocotillo-red text-white">
              Power Feature
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Image Display */}
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={images[selectedImage]}
                alt={`${business.name} project ${selectedImage + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={prevImage}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={nextImage}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setIsFullscreen(true)}
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm"
              >
                <Expand className="w-5 h-5" />
              </Button>
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-6 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-ocotillo-red ring-2 ring-ocotillo-red/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Gallery Info */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {selectedImage + 1} of {images.length} professional project photos
              </p>
              <p className="text-sm font-medium text-turquoise-sky">
                Verified work samples
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
          <img
            src={images[selectedImage]}
            alt={`${business.name} project ${selectedImage + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={prevImage}
            className="absolute left-4 text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextImage}
            className="absolute right-4 text-white hover:bg-white/20"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>
      )}
    </>
  );
};