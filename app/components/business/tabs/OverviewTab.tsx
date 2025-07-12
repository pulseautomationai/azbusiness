import { ChevronRight, MapPin, Star, Clock, Globe, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { FeatureGate } from "~/components/FeatureGate";

interface OverviewTabProps {
  business: any;
  businessContent: any;
  isOwner: boolean;
}

export function OverviewTab({ business, businessContent, isOwner }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* AI Business Summary */}
      <FeatureGate
        featureId="aiSummary"
        planTier={business.planTier}
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>About {business.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* First line visible, rest blurred */}
                <div className="space-y-2">
                  <p className="text-foreground">
                    {business.description.split('.')[0]}.
                  </p>
                  <div className="relative">
                    <p className="text-muted-foreground blur-sm select-none">
                      {business.description.split('.').slice(1).join('.') || "This business offers professional services with experienced staff and excellent customer reviews. They are committed to quality and customer satisfaction."}
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  ✨ Upgrade to Power for AI-enhanced business summary
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Get AI-generated insights, tone customization, and detailed business analysis
                </p>
              </div>
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              About {business.name}
              <Badge variant="secondary" className="text-xs">
                AI Enhanced
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {businessContent?.customSummary || business.description}
            </p>
          </CardContent>
        </Card>
      </FeatureGate>

      {/* Services Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Our Services</CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureGate
            featureId="serviceCards"
            planTier={business.planTier}
            fallback={
              <div className="grid gap-2 sm:grid-cols-2">
                {business.services.map((service: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {(businessContent?.serviceCards || 
                business.services.map((service: string) => ({ name: service }))
              ).map((service: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    {service.icon && (
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <span className="text-sm">{service.icon}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{service.name}</h4>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.description}
                        </p>
                      )}
                      {service.pricing && (
                        <p className="text-sm font-medium text-primary mt-2">
                          {service.pricing}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FeatureGate>
        </CardContent>
      </Card>

      {/* Smart Offers */}
      <FeatureGate
        featureId="smartOffers"
        planTier={business.planTier}
        showUpgrade={false}
      >
        {businessContent?.customOffers && businessContent.customOffers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Special Offers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businessContent.customOffers.map((offer: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <h4 className="font-semibold text-blue-900">{offer.title}</h4>
                    <p className="text-sm text-blue-800 mt-1">{offer.description}</p>
                    {offer.validUntil && (
                      <p className="text-xs text-blue-600 mt-2">
                        Valid until {new Date(offer.validUntil).toLocaleDateString()}
                      </p>
                    )}
                    {offer.code && (
                      <div className="mt-3">
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                          Code: {offer.code}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </FeatureGate>

      {/* Location & Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium">{business.address}</p>
              <p className="text-muted-foreground">{business.city}, {business.state} {business.zip}</p>
            </div>
            
            {business.coordinates && (
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Interactive map integration coming soon
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const address = encodeURIComponent(`${business.address}, ${business.city}, ${business.state} ${business.zip}`);
                  window.open(`https://maps.google.com/maps?q=${address}`, '_blank');
                }}
              >
                Get Directions
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const address = encodeURIComponent(`${business.address}, ${business.city}, ${business.state} ${business.zip}`);
                  window.open(`https://maps.google.com/maps?q=${address}&mode=driving`, '_blank');
                }}
              >
                Driving Directions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hours of Operation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(business.hours).map(([day, hours]) => {
              const isToday = day === new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
              return (
                <div 
                  key={day} 
                  className={`flex items-center justify-between py-2 ${isToday ? 'font-medium text-primary bg-primary/5 px-3 rounded' : ''}`}
                >
                  <span className="capitalize">{day}</span>
                  <span>{String(hours) || "Closed"}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Website & Links */}
      {business.website && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Website
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Visit our website</p>
                <p className="text-sm text-muted-foreground">
                  {business.website.replace(/^https?:\/\//, '')}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(business.website, '_blank')}
              >
                Visit Website
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Established</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(business.createdAt).getFullYear()}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Business Type</p>
                <p className="text-sm text-muted-foreground">
                  {business.category?.name || 'Local Service'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Average Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">
                    {business.rating.toFixed(1)} ({business.reviewCount} reviews)
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Service Area</p>
                <p className="text-sm text-muted-foreground">
                  {business.city}, {business.state}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}