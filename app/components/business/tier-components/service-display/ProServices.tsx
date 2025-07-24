import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { Info } from "lucide-react";

interface ProServicesProps {
  services: string[];
  getServiceIcon: (service: string) => string;
  serviceDescriptions?: Record<string, string>;
}

export function ProServices({ services, getServiceIcon, serviceDescriptions = {} }: ProServicesProps) {
  const getServiceDescription = (service: string) => {
    return serviceDescriptions[service] || `Professional ${service.toLowerCase()} services with experienced technicians and quality guarantee.`;
  };

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold mb-4 text-foreground">
        Our Services
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.slice(0, 8).map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-turquoise-sky">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-agave-cream rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                    {getServiceIcon(service)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{service}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getServiceDescription(service)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length > 8 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Showing 8 of {services.length} services
            </p>
          </div>
        )}
        
        <div className="p-6 bg-agave-cream border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-turquoise-sky mt-0.5" />
            <div>
              <h3 className="font-semibold text-ironwood-charcoal mb-1">Pro Service Display</h3>
              <p className="text-ironwood-charcoal/80 text-sm">
                Your services are displayed with enhanced cards and professional descriptions. Power customers can add AI-generated pricing and detailed service information.
              </p>
              <Button asChild variant="link" className="text-turquoise-sky p-0 h-auto mt-2">
                <Link to="/pricing">
                  Learn about Power features →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}