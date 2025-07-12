import { X, Send, Loader2, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useFormValidation } from "~/hooks/useFormValidation";
import { contactFormSchema, type ContactFormData } from "~/utils/validation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface ContactFormProps {
  business: {
    _id: string;
    name: string;
    services: string[];
  };
  onClose: () => void;
}

export default function ContactForm({ business, onClose }: ContactFormProps) {
  const createLead = useMutation(api.leads.createLead);
  
  const {
    data,
    updateField,
    touchField,
    getFieldValue,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    handleSubmit,
    isSubmitting,
    errors
  } = useFormValidation<ContactFormData>({
    schema: contactFormSchema,
    initialData: {
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    },
    onSubmit: async (formData) => {
      try {
        await createLead({
          businessId: business._id as Id<"businesses">,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          service: formData.service,
        });
        
        onClose();
        // TODO: Show success message/toast
      } catch (error) {
        console.error("Failed to submit lead:", error);
        // TODO: Show error message
        throw error;
      }
    }
  });

  const handleFieldChange = (field: keyof ContactFormData, value: string) => {
    updateField(field, value);
  };

  const handleFieldBlur = (field: keyof ContactFormData) => {
    touchField(field);
  };

  const showFieldError = (field: keyof ContactFormData) => {
    return isFieldTouched(field) && hasFieldError(field);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle>Contact {business.name}</CardTitle>
          <CardDescription>
            Fill out the form below and we'll get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errors.general && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{errors.general[0]}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={getFieldValue("name") || ""}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  onBlur={() => handleFieldBlur("name")}
                  placeholder="John Doe"
                  className={showFieldError("name") ? "border-destructive" : ""}
                />
                {showFieldError("name") && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("name")}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={getFieldValue("phone") || ""}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  onBlur={() => handleFieldBlur("phone")}
                  placeholder="(555) 123-4567"
                  className={showFieldError("phone") ? "border-destructive" : ""}
                />
                {showFieldError("phone") && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("phone")}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={getFieldValue("email") || ""}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={() => handleFieldBlur("email")}
                placeholder="john@example.com"
                className={showFieldError("email") ? "border-destructive" : ""}
              />
              {showFieldError("email") && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("email")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service Interested In</Label>
              <Select 
                value={getFieldValue("service") || ""} 
                onValueChange={(value) => handleFieldChange("service", value)}
              >
                <SelectTrigger id="service" className={showFieldError("service") ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {business.services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {showFieldError("service") && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("service")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                rows={4}
                value={getFieldValue("message") || ""}
                onChange={(e) => handleFieldChange("message", e.target.value)}
                onBlur={() => handleFieldBlur("message")}
                placeholder="Please describe what you need help with..."
                className={showFieldError("message") ? "border-destructive" : ""}
              />
              {showFieldError("message") && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("message")}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}