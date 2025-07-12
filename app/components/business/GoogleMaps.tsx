import { useState } from "react";
import { MapPin, Navigation, ExternalLink, Phone, Car, Footprints } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface GoogleMapsProps {
  business: any;
  className?: string;
}

export function GoogleMaps({ business, className }: GoogleMapsProps) {
  const [mapLoaded, setMapLoaded] = useState(false);

  const address = `${business.address}, ${business.city}, ${business.state} ${business.zip}`;
  const encodedAddress = encodeURIComponent(address);

  const openInGoogleMaps = (mode?: string) => {
    const baseUrl = "https://maps.google.com/maps";
    const params = new URLSearchParams({
      q: address,
      ...(mode && { mode })
    });
    window.open(`${baseUrl}?${params.toString()}`, '_blank');
  };

  const getDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const directionsUrl = `https://maps.google.com/maps/dir/${latitude},${longitude}/${encodedAddress}`;
          window.open(directionsUrl, '_blank');
        },
        () => {
          // Fallback if geolocation fails
          openInGoogleMaps('driving');
        }
      );
    } else {
      openInGoogleMaps('driving');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location & Directions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="space-y-2">
          <div>
            <p className="font-medium">{business.address}</p>
            <p className="text-muted-foreground">{business.city}, {business.state} {business.zip}</p>
          </div>
          
          {business.coordinates && (
            <div className="text-xs text-muted-foreground">
              {business.coordinates.lat.toFixed(6)}, {business.coordinates.lng.toFixed(6)}
            </div>
          )}
        </div>

        {/* Interactive Map Placeholder */}
        <div className="relative">
          {!mapLoaded ? (
            <div 
              className="h-48 bg-muted rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => openInGoogleMaps()}
            >
              <MapPin className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">View on Google Maps</p>
              <p className="text-xs text-muted-foreground">Click to open interactive map</p>
            </div>
          ) : (
            // TODO: Implement actual Google Maps embed when API key is available
            <div className="h-48 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Interactive Map</p>
                <p className="text-xs text-muted-foreground">Google Maps integration</p>
              </div>
            </div>
          )}
          
          {/* Map Controls Overlay */}
          <div className="absolute top-2 right-2 space-y-1">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white h-8 w-8 p-0"
              onClick={() => openInGoogleMaps()}
              title="Open in Google Maps"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={getDirections}
            className="w-full"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Directions
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = `tel:${business.phone}`}
            className="w-full"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
        </div>

        {/* Transportation Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Get Directions</h4>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openInGoogleMaps('driving')}
              className="flex-1"
            >
              <Car className="h-4 w-4 mr-1" />
              Drive
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openInGoogleMaps('walking')}
              className="flex-1"
            >
              <Footprints className="h-4 w-4 mr-1" />
              Walk
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openInGoogleMaps('transit')}
              className="flex-1"
            >
              🚌
              Transit
            </Button>
          </div>
        </div>

        {/* Service Area Info */}
        <div className="pt-3 border-t">
          <h4 className="text-sm font-medium mb-2">Service Area</h4>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {business.city}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Phoenix Metro
            </Badge>
            <Badge variant="outline" className="text-xs">
              Scottsdale
            </Badge>
            <Badge variant="outline" className="text-xs">
              Mesa
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Primary service area within 25 miles
          </p>
        </div>

        {/* Distance Calculator */}
        <div className="pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    // TODO: Calculate actual distance
                    alert(`Your location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\nCalculating distance...`);
                  },
                  () => alert("Unable to get your location")
                );
              }
            }}
            className="w-full text-xs"
          >
            Calculate distance from my location
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}