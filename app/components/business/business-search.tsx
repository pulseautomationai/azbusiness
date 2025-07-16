import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Search, MapPin, Phone, Globe, ExternalLink } from "lucide-react";
import { Link } from "react-router";

interface BusinessSearchProps {
  onBusinessFound: (business: any) => void;
  onProceedWithNew: () => void;
}

export function BusinessSearch({ onBusinessFound, onProceedWithNew }: BusinessSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Debounced search - only search after user stops typing for 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length > 2) {
        setSearchQuery(searchTerm);
        setShowResults(true);
      } else {
        setSearchQuery("");
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchResults = useQuery(
    api.businesses.searchBusinesses,
    searchQuery ? { query: searchQuery, limit: 10 } : "skip"
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length > 2) {
      setSearchQuery(searchTerm);
      setShowResults(true);
    }
  };

  const handleClaimBusiness = (business: any) => {
    onBusinessFound(business);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Is your business already listed?</h2>
        <p className="text-muted-foreground">
          Search to see if your business already exists in our directory
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by business name, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={searchTerm.trim().length < 3}>
          Search
        </Button>
      </form>

      {showResults && (
        <div className="space-y-4">
          {searchResults && searchResults.length > 0 ? (
            <>
              <h3 className="font-semibold text-lg">Found {searchResults.length} result(s)</h3>
              <div className="space-y-3">
                {searchResults.map((business) => (
                  <Card key={business._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{business.name}</h4>
                            {business.claimed && (
                              <Badge variant="secondary">Claimed</Badge>
                            )}
                            {business.verified && (
                              <Badge className="bg-green-100 text-green-800">Verified</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {business.shortDescription || business.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {business.address && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {business.address}, {business.city}
                              </div>
                            )}
                            {business.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {business.phone}
                              </div>
                            )}
                            {business.website && (
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                <a 
                                  href={business.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:text-primary"
                                >
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" asChild>
                            <Link to={business.urlPath || `/business/${business.slug}`}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Listing
                            </Link>
                          </Button>
                          
                          {!business.claimed ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleClaimBusiness(business)}
                            >
                              Claim This Business
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" disabled>
                              Already Claimed
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : searchQuery ? (
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">No businesses found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any businesses matching "{searchQuery}"
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      <div className="border-t pt-6">
        <div className="text-center space-y-4">
          <h3 className="font-semibold">Don't see your business?</h3>
          <p className="text-muted-foreground">
            No problem! Let's add your business to our directory.
          </p>
          <Button onClick={onProceedWithNew} size="lg">
            Add New Business
          </Button>
        </div>
      </div>
    </div>
  );
}