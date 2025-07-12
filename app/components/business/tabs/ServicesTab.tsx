import { Star, Zap, DollarSign, Award, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { FeatureGate } from "~/components/FeatureGate";

interface ServicesTabProps {
  business: any;
  businessContent: any;
  isOwner: boolean;
}

export function ServicesTab({ business, businessContent, isOwner }: ServicesTabProps) {
  return (
    <div className="space-y-6">
      {/* Services Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Professional Services</CardTitle>
              <CardDescription>
                Comprehensive list of our services and specialties
              </CardDescription>
            </div>
            {isOwner && (
              <FeatureGate
                featureId="editProfile"
                planTier={business.planTier}
                showUpgrade={false}
              >
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Services
                </Button>
              </FeatureGate>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Service Cards */}
      <FeatureGate
        featureId="serviceCards"
        planTier={business.planTier}
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Our Services</CardTitle>
              <CardDescription>
                Services offered by {business.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Basic unordered bullet list for Free tier */}
              <ul className="space-y-2">
                {business.services.map((service: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-muted-foreground">{service}</span>
                  </li>
                ))}
              </ul>
              
              {/* Upgrade prompt */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium">
                  ✨ Upgrade to Pro for enhanced service cards
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Get service icons, descriptions, pricing, and detailed information
                </p>
              </div>
            </CardContent>
          </Card>
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          {(businessContent?.serviceCards || 
            business.services.map((service: string) => ({ 
              name: service,
              icon: '🔧',
              description: `Professional ${service.toLowerCase()} services with quality guarantee`,
              featured: false
            }))
          ).map((service: any, index: number) => (
            <Card key={index} className={`relative ${service.featured ? 'ring-2 ring-primary' : ''}`}>
              {service.featured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xl">{service.icon || '🔧'}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    {service.description && (
                      <p className="text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    )}
                    
                    <div className="mt-3 flex items-center gap-4">
                      {service.pricing && (
                        <div className="flex items-center gap-1 text-sm font-medium text-primary">
                          <DollarSign className="h-4 w-4" />
                          {service.pricing}
                        </div>
                      )}
                      
                      <FeatureGate
                        featureId="aiServiceDescriptions"
                        planTier={business.planTier}
                        showUpgrade={false}
                      >
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          AI Enhanced
                        </Badge>
                      </FeatureGate>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </FeatureGate>

      {/* Service Guarantees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Our Service Guarantees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div>
                <p className="font-medium">Quality Guarantee</p>
                <p className="text-sm text-muted-foreground">100% satisfaction</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">⚡</span>
              </div>
              <div>
                <p className="font-medium">Fast Response</p>
                <p className="text-sm text-muted-foreground">24/7 availability</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">🛡️</span>
              </div>
              <div>
                <p className="font-medium">Insured & Bonded</p>
                <p className="text-sm text-muted-foreground">Fully protected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Service Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Primary Service Area</h4>
              <p className="text-muted-foreground">
                {business.city}, {business.state}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Additional Areas</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Phoenix Metro</Badge>
                <Badge variant="outline">Scottsdale</Badge>
                <Badge variant="outline">Tempe</Badge>
                <Badge variant="outline">Mesa</Badge>
                <Badge variant="outline">Chandler</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Quote CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-4">
            Contact us for a free consultation and personalized quote
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg">
              Get Free Quote
            </Button>
            <Button size="lg" variant="outline">
              Call Now: {business.phone}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}