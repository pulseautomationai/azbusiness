import React, { useState } from 'react';
import { Zap, Phone, Mail, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

interface LeadCaptureFormProps {
  businessId: string;
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({ businessId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    message: '',
    preferredTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        service: '',
        message: '',
        preferredTime: '',
      });
    }, 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 bg-agave-cream rounded-full flex items-center justify-center mx-auto border border-gray-200">
          <Zap className="w-8 h-8 text-turquoise-sky" />
        </div>
        <h3 className="text-xl font-bold text-ironwood-charcoal">VIP Request Submitted!</h3>
        <p className="text-ironwood-charcoal">
          Expect a call within 15 minutes during business hours
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          Your Name
          <span className="text-ocotillo-red">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="John Doe"
          required
          className="border-gray-200 focus:border-turquoise-sky"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number
            <span className="text-ocotillo-red">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            required
            className="border-gray-200 focus:border-turquoise-sky"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john@example.com"
            className="border-gray-200 focus:border-turquoise-sky"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="service" className="flex items-center gap-2">
          Service Needed
          <span className="text-ocotillo-red">*</span>
        </Label>
        <Select value={formData.service} onValueChange={(value) => handleChange('service', value)}>
          <SelectTrigger className="border-gray-200 focus:border-turquoise-sky">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="installation">New Installation</SelectItem>
            <SelectItem value="repair">Repair Service</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="emergency">Emergency Service</SelectItem>
            <SelectItem value="consultation">Consultation</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredTime" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Preferred Contact Time
        </Label>
        <Select value={formData.preferredTime} onValueChange={(value) => handleChange('preferredTime', value)}>
          <SelectTrigger className="border-gray-200 focus:border-turquoise-sky">
            <SelectValue placeholder="Best time to call" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asap">ASAP</SelectItem>
            <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
            <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
            <SelectItem value="evening">Evening (5PM-8PM)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Tell us about your needs
        </Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="Describe what you need help with..."
          rows={4}
          className="border-gray-200 focus:border-turquoise-sky"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-ocotillo-red hover:bg-ocotillo-red/90 text-white transition-colors"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Submitting...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            Get VIP Priority Service
          </>
        )}
      </Button>

      <p className="text-xs text-center text-gray-600">
        Power-tier exclusive: Your request goes directly to the business owner
      </p>
    </form>
  );
};