import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/react-router";
import { api } from "../../../convex/_generated/api";
import { usePlanFeatures } from "~/hooks/usePlanFeatures";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/hooks/use-toast";
import { ArrowLeft, Building, Crown, CheckCircle, CreditCard } from "lucide-react";
import { Link } from "react-router";
import { SlugGenerator } from "~/utils/slug-generator";
import { StarterCheckoutButton, ProCheckoutButton, PowerCheckoutButton } from "~/components/payments/PolarCheckoutButton";

export function meta() {
  return [
    { title: "Create Business - AZ Business Services" },
    { name: "description", content: "Create your business listing and start reaching local customers in Arizona." },
  ];
}

export default function CreateBusinessPage() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const planFeatures = usePlanFeatures();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<"business-info" | "plan-selection" | "verification">("business-info");
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    phone: "",
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    website: "",
    address: "",
    city: "",
    state: "Arizona",
    zip: "",
    categoryId: "",
    services: [""],
  });

  // Authentication check
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background pt-32">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to create a business listing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild>
                <Link to="/sign-in?redirect=/add-business/create">
                  Sign In to Continue
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/sign-up?intent=add-business" className="text-primary hover:underline">
                  Sign up here
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get categories for dropdown
  const categories = useQuery(api.categories.getAllCategoriesForAdmin);
  const createBusiness = useMutation(api.businesses.createBusiness);
  const checkDuplicateBusiness = useMutation(api.businesses.checkDuplicateBusiness);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...formData.services];
    newServices[index] = value;
    setFormData(prev => ({
      ...prev,
      services: newServices
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, ""]
    }));
  };

  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      const newServices = formData.services.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        services: newServices
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.email || !formData.address || 
          !formData.city || !formData.zip || !formData.categoryId || !formData.shortDescription) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Check for duplicate businesses first
      const existingBusiness = await checkDuplicateBusiness({
        name: formData.name,
        city: formData.city,
        address: formData.address,
        phone: formData.phone
      });

      if (existingBusiness) {
        toast({
          title: "Business Already Exists",
          description: `A business with this name already exists in ${formData.city}. You can claim it instead.`,
          variant: "destructive",
        });
        
        // Show claim option instead of creating
        setTimeout(() => {
          if (window.confirm("This business already exists. Would you like to claim it instead?")) {
            window.location.href = `/claim-business?businessId=${existingBusiness._id}`;
          }
        }, 2000);
        return;
      }

      // Generate slug and URL path
      const category = categories?.find(c => c._id === formData.categoryId);
      const categorySlug = SlugGenerator.generateCategorySlug(category?.name || 'business');
      const citySlug = SlugGenerator.generateCitySlug(formData.city);
      const businessSlug = SlugGenerator.generateBusinessNameSlug(formData.name);
      const urlPath = `/${categorySlug}/${citySlug}/${businessSlug}`;

      // Filter out empty services
      const services = formData.services.filter(service => service.trim() !== "");

      const businessId = await createBusiness({
        name: formData.name,
        slug: businessSlug,
        urlPath: urlPath,
        shortDescription: formData.shortDescription,
        description: formData.description || formData.shortDescription,
        phone: formData.phone,
        email: formData.email,
        website: formData.website || undefined,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        categoryId: formData.categoryId as any,
        services: services,
        ownerId: user.id, // Associate with current user
      });

      setCreatedBusinessId(businessId);
      toast({
        title: "Business Created Successfully!",
        description: `${formData.name} has been created and is now live.`,
      });

      // Move to plan selection step
      setCurrentStep("plan-selection");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create business",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipUpgrade = () => {
    setCurrentStep("verification");
  };

  const handleFinish = () => {
    navigate(`/dashboard`);
  };

  // Step 1: Business Information Form
  if (currentStep === "business-info") {
    return (
      <div className="min-h-screen bg-background pt-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/add-business">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create Your Business Listing</h1>
              <p className="text-muted-foreground">
                Fill out the details below to create your business listing
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Progress indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                    1
                  </div>
                  <span>Business Information</span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">
                    2
                  </div>
                  <span>Plan Selection</span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">
                    3
                  </div>
                  <span>Complete</span>
                </div>
              </div>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Essential business details for your listing
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Business Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g., Arizona HVAC Services"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your business category" />
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

                  <div className="grid gap-2">
                    <Label htmlFor="shortDescription">Short Description *</Label>
                    <Textarea
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                      placeholder="Brief description of your business (1-2 sentences)"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Detailed business description (optional)"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    How customers can reach your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="(623) 555-0123"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="contact@yourbusiness.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://www.yourbusiness.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                  <CardDescription>
                    Your business address and location details
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Phoenix"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="Arizona"
                        disabled
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="zip">ZIP Code *</Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => handleInputChange("zip", e.target.value)}
                        placeholder="85001"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>
                    Services offered by your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {formData.services.map((service, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={service}
                        onChange={(e) => handleServiceChange(index, e.target.value)}
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
                    className="w-fit"
                  >
                    Add Service
                  </Button>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} size="lg">
                  {isSubmitting ? "Creating Business..." : "Create Business"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/add-business">Cancel</Link>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: Plan Selection
  if (currentStep === "plan-selection") {
    return (
      <div className="min-h-screen bg-background pt-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
              <CheckCircle className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Business Created Successfully!</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Your business listing is now live. Choose a plan to unlock additional features.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs">
                ✓
              </div>
              <span>Business Information</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                2
              </div>
              <span>Plan Selection</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">
                3
              </div>
              <span>Complete</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {/* Starter Plan */}
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Starter</CardTitle>
                <div className="text-3xl font-bold">$9<span className="text-sm font-normal">/month</span></div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Professional presence</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>AI-generated summary</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Verification badge</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>SEO backlink</span>
                  </div>
                </div>
                <StarterCheckoutButton billingPeriod="monthly" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Choose Starter
                </StarterCheckoutButton>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-primary">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Badge variant="default" className="bg-primary">Most Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Pro</CardTitle>
                <div className="text-3xl font-bold">$29<span className="text-sm font-normal">/month</span></div>
                <CardDescription>Enhanced visibility and control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Everything in Starter</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Featured placement</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Editable content</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Enhanced service cards</span>
                  </div>
                </div>
                <ProCheckoutButton billingPeriod="monthly" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Choose Pro
                </ProCheckoutButton>
              </CardContent>
            </Card>

            {/* Power Plan */}
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-lg flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5" />
                  Power
                </CardTitle>
                <div className="text-3xl font-bold">$97<span className="text-sm font-normal">/month</span></div>
                <CardDescription>Complete growth package</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Everything in Pro</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Unlimited exclusive leads</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Homepage featuring</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>AI insights & analytics</span>
                  </div>
                </div>
                <PowerCheckoutButton billingPeriod="monthly" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Choose Power
                </PowerCheckoutButton>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={handleSkipUpgrade} className="mr-4">
              Skip for Now
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              You can always upgrade later from your dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Completion
  if (currentStep === "verification") {
    return (
      <div className="min-h-screen bg-background pt-32">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-6">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Welcome to AZ Business Services!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your business listing is now live and ready to attract customers.
            </p>

            <Card className="text-left mb-8">
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">View Your Listing</p>
                    <p className="text-sm text-muted-foreground">Your business is now searchable and visible to customers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Complete Your Profile</p>
                    <p className="text-sm text-muted-foreground">Add photos, update hours, and enhance your listing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Start Getting Leads</p>
                    <p className="text-sm text-muted-foreground">Monitor your dashboard for customer inquiries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button onClick={handleFinish} size="lg">
                Go to Dashboard
              </Button>
              {createdBusinessId && (
                <Button variant="outline" asChild>
                  <Link to={`/dashboard`}>View My Business</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}