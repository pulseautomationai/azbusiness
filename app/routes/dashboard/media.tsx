import { useState } from "react";
import { useUser } from "@clerk/react-router";
import { usePlanFeatures } from "~/hooks/usePlanFeatures";
import { FeatureGate } from "~/components/FeatureGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Link } from "react-router";
import { 
  IconPhoto,
  IconUpload,
  IconTrash,
  IconEdit,
  IconCrown,
  IconImageInPicture
} from "@tabler/icons-react";

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export default function MediaPage() {
  const { user } = useUser();
  const planFeatures = usePlanFeatures();
  
  // Mock data - in production this would come from Convex
  const [logoImage, setLogoImage] = useState<UploadedImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB for logo

    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPG or PNG image.');
      return;
    }

    if (file.size > maxSize) {
      alert('Logo file is too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    
    try {
      // Simulate upload - in production, upload to Convex storage
      const mockUpload: UploadedImage = {
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
      };
      
      setLogoImage(mockUpload);
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB for gallery images
    const maxImages = 10;

    // Validate files
    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a supported file type.`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (galleryImages.length + validFiles.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images.`);
      return;
    }

    setUploading(true);
    
    try {
      const newImages: UploadedImage[] = validFiles.map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
      }));
      
      setGalleryImages(prev => [...prev, ...newImages]);
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteLogo = () => {
    if (logoImage) {
      URL.revokeObjectURL(logoImage.url);
      setLogoImage(null);
    }
  };

  const deleteGalleryImage = (id: string) => {
    setGalleryImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) URL.revokeObjectURL(image.url);
      return prev.filter(img => img.id !== id);
    });
  };

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to manage your media.
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

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Media Manager</h1>
            <p className="text-muted-foreground">
              Upload and manage your business logo and images
            </p>
          </div>
          <Badge variant={planFeatures.planTier === 'power' ? 'default' : planFeatures.planTier === 'pro' ? 'secondary' : 'outline'} className="flex items-center gap-1">
            {planFeatures.planTier === 'power' && <IconCrown className="w-3 h-3" />}
            {planFeatures.planTier.toUpperCase()} Plan
          </Badge>
        </div>

        <Tabs defaultValue="logo" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logo" className="flex items-center gap-2">
              <IconImageInPicture className="h-4 w-4" />
              Business Logo
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <IconPhoto className="h-4 w-4" />
              Image Gallery
              {!planFeatures.imageGallery && <Badge variant="outline" className="text-xs ml-1">Pro+</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* Logo Tab */}
          <TabsContent value="logo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconImageInPicture className="h-5 w-5" />
                  Business Logo
                </CardTitle>
                <CardDescription>
                  Upload your business logo to appear on your listing. Available for all plan tiers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {logoImage ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img 
                        src={logoImage.url} 
                        alt="Business Logo" 
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{logoImage.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(logoImage.size / 1024 / 1024).toFixed(2)} MB • Uploaded {logoImage.uploadedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={deleteLogo}>
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <IconUpload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">Upload your business logo</p>
                    <p className="text-sm text-muted-foreground mb-4">JPG, PNG (max 5MB)</p>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <label className="cursor-pointer">
                    <Button disabled={uploading} className="flex items-center gap-2">
                      <IconUpload className="h-4 w-4" />
                      {logoImage ? 'Replace Logo' : 'Upload Logo'}
                    </Button>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <FeatureGate 
              featureId="imageGallery"
              fallback={
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-yellow-900 flex items-center gap-2">
                      <IconCrown className="h-5 w-5" />
                      Image Gallery - Pro Feature
                    </CardTitle>
                    <CardDescription className="text-yellow-800">
                      Upload multiple business images to showcase your services and location. Available with Pro and Power plans.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/pricing">
                      <Button className="flex items-center gap-2">
                        <IconCrown className="h-4 w-4" />
                        Upgrade to Pro
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              }
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconPhoto className="h-5 w-5" />
                    Image Gallery
                  </CardTitle>
                  <CardDescription>
                    Upload up to 10 images to showcase your business, services, and location.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {galleryImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img 
                            src={image.url} 
                            alt={image.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => deleteGalleryImage(image.id)}
                              className="flex items-center gap-1"
                            >
                              <IconTrash className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{image.name}</p>
                        </div>
                      ))}
                      
                      {/* Add more button */}
                      {galleryImages.length < 10 && (
                        <label className="cursor-pointer">
                          <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                            <div className="text-center">
                              <IconUpload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Add More</p>
                            </div>
                          </div>
                          <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleGalleryUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <IconPhoto className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">No images uploaded yet</p>
                      <p className="text-sm text-muted-foreground mb-4">Upload images to showcase your business</p>
                      <label className="cursor-pointer">
                        <Button disabled={uploading} className="flex items-center gap-2">
                          <IconUpload className="h-4 w-4" />
                          Upload Images
                        </Button>
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleGalleryUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <p>• Upload up to 10 images</p>
                    <p>• Supported formats: JPG, PNG</p>
                    <p>• Maximum file size: 10MB per image</p>
                    <p>• Images: {galleryImages.length}/10</p>
                  </div>
                </CardContent>
              </Card>
            </FeatureGate>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}