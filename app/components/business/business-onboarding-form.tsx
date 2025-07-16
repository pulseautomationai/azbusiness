import { useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "sonner";
import { Building2, ArrowRight, ArrowLeft, Check } from "lucide-react";

interface BusinessFormData {
  name: string;
  shortDescription: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  categoryId: string;
  services: string[];
}

interface BusinessOnboardingFormProps {
  onBusinessCreated?: (businessId: string) => void;
}

const ARIZONA_CITIES = [
  "Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert", 
  "Tempe", "Peoria", "Surprise", "Yuma", "Avondale", "Flagstaff", "Goodyear", 
  "Buckeye", "Lake Havasu City", "Casa Grande", "Sierra Vista", "Maricopa", 
  "Oro Valley", "Prescott", "Bullhead City", "Prescott Valley", "Apache Junction"
];

export function BusinessOnboardingForm({ onBusinessCreated }: BusinessOnboardingFormProps = {}) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const categories = useQuery(api.categories.getCategories);
  const createBusiness = useMutation(api.businesses.createBusiness);

  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    shortDescription: "",
    description: "",
    phone: "",
    email: user?.emailAddresses[0]?.emailAddress || "",
    website: "",
    address: "",
    city: "",
    state: "Arizona",
    zip: "",
    categoryId: "",
    services: [""],
  });

  const updateFormData = (field: keyof BusinessFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, ""]
    }));
  };

  const updateService = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => i === index ? value : service)
    }));
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.shortDescription && formData.categoryId);
      case 2:
        return !!(formData.phone && formData.email && formData.address && formData.city && formData.zip);
      case 3:
        return formData.services.some(service => service.trim());
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async () => {
    if (!validateStep(3) || !user) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Filter out empty services
      const validServices = formData.services.filter(service => service.trim());
      
      const businessData = {
        ...formData,
        slug: generateSlug(formData.name),
        services: validServices,
        ownerId: user.id,
        categoryId: formData.categoryId as any, // Type assertion for Convex ID
      };

      const businessId = await createBusiness(businessData);
      
      toast.success("Business created successfully!");
      
      if (onBusinessCreated) {
        onBusinessCreated(businessId);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error creating business:", error);
      toast.error("Failed to create business. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Enter your business name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => updateFormData("shortDescription", e.target.value)}
                placeholder="Brief description of your business"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Detailed description of your services and business"
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="category">Business Category *</Label>
              <Select value={formData.categoryId} onValueChange={(value) => updateFormData("categoryId", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="business@example.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => updateFormData("website", e.target.value)}
                placeholder="https://www.yourbusiness.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                placeholder="123 Main Street, Suite 100"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Select value={formData.city} onValueChange={(value) => updateFormData("city", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARIZONA_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  disabled
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => updateFormData("zip", e.target.value)}
                  placeholder="85001"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Services Offered</Label>
              <p className="text-sm text-muted-foreground mb-4">
                List the main services your business provides
              </p>
              
              <div className="space-y-3">
                {formData.services.map((service, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={service}
                      onChange={(e) => updateService(index, e.target.value)}
                      placeholder={`Service ${index + 1}`}
                    />
                    {formData.services.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addService}
                  className="w-full"
                >
                  Add Another Service
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>Add Your Business</CardTitle>
            <CardDescription>
              Step {currentStep} of 3: Let's get your business listed
            </CardDescription>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {step < currentStep ? <Check className="h-4 w-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 ${
                  step < currentStep ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {renderStep()}
        
        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          ) : (
            <div />
          )}
          
          {currentStep < 3 ? (
            <Button onClick={nextStep} disabled={!validateStep(currentStep)}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Business"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}