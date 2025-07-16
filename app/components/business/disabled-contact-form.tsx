import { Mail, Phone, MessageSquare, Lock, Crown, X, Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";

interface DisabledContactFormProps {
  business: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    services: string[];
    planTier: string;
  };
  onClose: () => void;
}

export function DisabledContactForm({ business, onClose }: DisabledContactFormProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact {business.name}
              </CardTitle>
              <CardDescription>
                Get in touch for quotes, questions, or service requests
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{business.phone}</p>
              </div>
            </div>
            {business.email && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{business.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Disabled Form with Overlay */}
          <div className="relative">
            <div className="space-y-4 opacity-50 pointer-events-none">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    disabled
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service Needed</Label>
                  <Select disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {business.services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your project or questions..."
                  className="min-h-[120px]"
                  disabled
                />
              </div>

              <Button className="w-full" disabled>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>

            {/* Upgrade Overlay */}
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="text-center max-w-md p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Contact Form Locked</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This business needs to upgrade to Pro to receive messages through the contact form.
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      📞 Call directly: {business.phone}
                    </p>
                  </div>
                  
                  {business.email && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 font-medium">
                        ✉️ Email: {business.email}
                      </p>
                    </div>
                  )}
                  
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">
                        Business Owner?
                      </span>
                    </div>
                    <p className="text-xs text-orange-700 mb-3">
                      Upgrade to Pro to receive leads through this form
                    </p>
                    <Link to="/pricing">
                      <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                        Upgrade to Pro - $29/month
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}