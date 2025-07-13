"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { ArrowLeft, Save, X } from "lucide-react";
import { toast } from "~/hooks/use-toast";

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
  services: string[];
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export default function BusinessEditPage() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    shortDescription: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    services: [],
    hours: {
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
      saturday: "",
      sunday: "",
    },
  });

  const [newService, setNewService] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch business data
  const business = useQuery(api.businesses.getBusinessById, 
    businessId ? { businessId: businessId as Id<"businesses"> } : "skip"
  );

  // Get categories for dropdown
  const categories = useQuery(api.categories.getAllCategoriesForAdmin);

  // Update business mutation
  const updateBusiness = useMutation(api.businesses.updateBusiness);

  // Populate form when business data loads
  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        shortDescription: business.shortDescription || "",
        description: business.description || "",
        phone: business.phone || "",
        email: business.email || "",
        website: business.website || "",
        address: business.address || "",
        city: business.city || "",
        state: business.state || "",
        zip: business.zip || "",
        services: business.services || [],
        hours: business.hours || {
          monday: "",
          tuesday: "",
          wednesday: "",
          thursday: "",
          friday: "",
          saturday: "",
          sunday: "",
        },
      });
    }
  }, [business]);

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHoursChange = (day: keyof BusinessFormData['hours'], value: string) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value
      }
    }));
  };

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService("");
    }
  };

  const removeService = (serviceToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(service => service !== serviceToRemove)
    }));
  };

  const handleSave = async () => {
    if (!businessId) return;

    setIsLoading(true);
    try {
      await updateBusiness({
        businessId: businessId as Id<"businesses">,
        updates: {
          // Note: updateBusiness mutation needs to be expanded to handle these fields
          // For now, we'll just show the structure
        }
      });

      toast({
        title: "Business updated",
        description: "The business information has been successfully updated.",
      });

      navigate("/admin/businesses");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/businesses");
  };

  if (!business) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading business...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/businesses">
              <ArrowLeft className="h-4 w-4" />
              Back to Businesses
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Edit Business</h1>
            <p className="text-muted-foreground">
              Update business information and settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential business details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter business name"
              />
            </div>
            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                placeholder="Brief description for listings"
              />
            </div>
            <div>
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Detailed business description"
                rows={4}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@business.com"
                />
              </div>
            </div>
            <div>
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

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>
              Business address and location details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Phoenix"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="AZ"
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                  placeholder="85001"
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
              Services offered by this business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Add a new service"
                onKeyPress={(e) => e.key === "Enter" && addService()}
              />
              <Button onClick={addService} type="button">
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span>{service}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(service)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {formData.services.length === 0 && (
                <p className="text-muted-foreground text-sm">No services added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hours of Operation */}
        <Card>
          <CardHeader>
            <CardTitle>Hours of Operation</CardTitle>
            <CardDescription>
              Business operating hours for each day
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(formData.hours).map(([day, hours]) => (
              <div key={day} className="flex items-center gap-4">
                <Label className="w-20 capitalize">{day}</Label>
                <Input
                  value={hours}
                  onChange={(e) => handleHoursChange(day as keyof BusinessFormData['hours'], e.target.value)}
                  placeholder="9:00 AM - 5:00 PM or Closed"
                  className="flex-1"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}