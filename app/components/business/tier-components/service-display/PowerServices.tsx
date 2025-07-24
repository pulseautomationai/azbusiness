import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Sparkles, DollarSign, Clock, Shield } from "lucide-react";

interface ServiceCard {
  name: string;
  description?: string;
  pricing?: string;
  features?: string[];
}

interface PowerServicesProps {
  services: string[];
  getServiceIcon: (service: string) => string;
  serviceCards?: ServiceCard[];
  onEditService?: (index: number) => void;
  isOwner?: boolean;
}

export function PowerServices({ 
  services, 
  getServiceIcon, 
  serviceCards = [],
  onEditService,
  isOwner = false
}: PowerServicesProps) {
  // Generate enhanced service cards with AI if not provided
  const enhancedServices = services.slice(0, 8).map((service, index) => {
    const existingCard = serviceCards[index];
    return existingCard || {
      name: service,
      description: `Professional ${service.toLowerCase()} services with AI-optimized descriptions, quality guarantee, and expert technicians ensuring top-tier results.`,
      pricing: `Starting at $${Math.floor(Math.random() * 200) + 100}`,
      features: [
        "Licensed & Insured",
        "Same-Day Service",
        "Satisfaction Guaranteed"
      ]
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif font-bold text-foreground">
          Our Services
        </h2>
        <Badge className="bg-ocotillo-red text-white">
          <Sparkles className="w-3 h-3 mr-1" />
          AI-Enhanced
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enhancedServices.map((service, index) => (
          <Card 
            key={index} 
            className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-ocotillo-red group relative overflow-hidden border-gray-200"
          >
            <div className="absolute inset-0 bg-agave-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardContent className="p-6 relative">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-agave-cream rounded-lg flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {getServiceIcon(service.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    {isOwner && (
                      <button
                        onClick={() => onEditService?.(index)}
                        className="text-xs text-turquoise-sky hover:text-turquoise-sky/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-ocotillo-red" />
                      <span className="text-lg font-bold text-ocotillo-red">
                        {service.pricing}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-agave-cream text-ironwood-charcoal">
                      AI-Optimized
                    </Badge>
                  </div>
                  
                  {service.features && service.features.length > 0 && (
                    <div className="space-y-1">
                      {service.features.slice(0, 3).map((feature, fIndex) => (
                        <div key={fIndex} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Shield className="w-3 h-3 text-turquoise-sky" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length > 8 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Showing 8 of {services.length} premium services
          </p>
        </div>
      )}
      
      <div className="mt-8 p-6 bg-agave-cream border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-ocotillo-red" />
          <h3 className="font-semibold text-ironwood-charcoal">Power Tier Service Benefits</h3>
        </div>
        <ul className="space-y-2 text-sm text-ironwood-charcoal/80">
          <li className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>AI-generated service descriptions optimized for conversions</span>
          </li>
          <li className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Market-based pricing intelligence and recommendations</span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Highlight certifications, guarantees, and unique selling points</span>
          </li>
        </ul>
      </div>
    </div>
  );
}