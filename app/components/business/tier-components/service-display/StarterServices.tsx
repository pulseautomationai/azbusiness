import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

interface StarterServicesProps {
  services: string[];
  getServiceIcon: (service: string) => string;
}

export function StarterServices({ services, getServiceIcon }: StarterServicesProps) {
  return (
    <div>
      <h2 className="text-2xl font-serif font-bold mb-4 text-foreground">
        Our Services
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {services.slice(0, 6).map((service, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow duration-300 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-agave-cream rounded-lg flex items-center justify-center text-sm">
                    {getServiceIcon(service)}
                  </div>
                  <span className="font-medium">{service}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="p-6 bg-agave-cream border border-gray-200 rounded-lg text-center">
          <h3 className="font-semibold text-lg mb-2 text-ironwood-charcoal">Enhanced Service Cards</h3>
          <p className="text-ironwood-charcoal/80 mb-4">
            Pro customers get enhanced service cards with detailed descriptions • Power customers get AI-powered pricing intelligence
          </p>
          <Button asChild className="bg-desert-marigold hover:bg-desert-marigold/90 text-white">
            <Link to="/pricing">
              Upgrade to Pro
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}