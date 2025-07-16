"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { toast } from "~/hooks/use-toast";
import { ArrowLeft, Building } from "lucide-react";
import { Link } from "react-router";
import { SlugGenerator } from "~/utils/slug-generator";

export default function CreateBusiness() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "Arizona",
    zip: "",
    categoryId: "",
    services: [""],
  });

  // Get categories for dropdown
  const categories = useQuery(api.categories.getAllCategoriesForAdmin);
  const createBusiness = useMutation(api.businesses.createBusiness);

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

      // Generate slug and URL path
      const category = categories?.find(c => c._id === formData.categoryId);
      const categorySlug = SlugGenerator.generateCategorySlug(category?.name || 'business');
      const citySlug = SlugGenerator.generateCitySlug(formData.city);
      const businessSlug = SlugGenerator.generateBusinessNameSlug(formData.name);
      const urlPath = `/${categorySlug}/${citySlug}/${businessSlug}`;

      // Filter out empty services
      const services = formData.services.filter(service => service.trim() !== "");

      await createBusiness({
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
      });

      toast({
        title: "Business Created",
        description: `${formData.name} has been successfully created`,
      });

      navigate("/admin/businesses");
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/businesses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Businesses
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create New Business</h1>
          <p className="text-muted-foreground">
            Add a new business listing to the directory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-4xl">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential business details for the listing
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

              <div className="grid gap-2">
                <Label htmlFor="shortDescription">Short Description *</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                  placeholder="Brief description of the business (1-2 sentences)"
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
                  placeholder="Detailed business description (optional - will use short description if empty)"
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
                How customers can reach the business
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
                    placeholder="contact@business.com"
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
                  placeholder="https://www.business.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>
                Business address and location details
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
                Services offered by the business
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Business"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/businesses">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}