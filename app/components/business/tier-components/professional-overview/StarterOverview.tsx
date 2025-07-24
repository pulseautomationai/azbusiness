import { Badge } from "~/components/ui/badge";
import { BarChart3 } from "lucide-react";

interface StarterOverviewProps {
  business: {
    name: string;
    category?: { name: string } | null;
    city: string;
    rating: number;
    reviewCount: number;
    services: string[];
  };
}

export function StarterOverview({ business }: StarterOverviewProps) {
  return (
    <div className="p-6 bg-agave-cream border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-turquoise-sky rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Professional Overview
        </h3>
        <Badge className="bg-turquoise-sky text-white text-xs">
          AI-Generated
        </Badge>
      </div>
      
      <div className="border-b border-gray-200 mb-4"></div>
      
      <div className="space-y-3">
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">{business.name}</strong> is a trusted {business.category?.name.toLowerCase()} provider serving the {business.city} area. 
          With a {business.rating.toFixed(1)}-star rating from {business.reviewCount} customers, they offer reliable service with {business.services.length} specialized services.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="text-2xl font-bold text-ironwood-charcoal">{business.rating.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Customer Rating</div>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="text-2xl font-bold text-ironwood-charcoal">{business.reviewCount}</div>
            <div className="text-sm text-muted-foreground">Total Reviews</div>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="text-2xl font-bold text-ironwood-charcoal">{business.services.length}+</div>
            <div className="text-sm text-muted-foreground">Services Offered</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-ironwood-charcoal">
            <strong>AI Insight:</strong> This business demonstrates strong customer satisfaction and comprehensive service offerings, making them a reliable choice for {business.category?.name.toLowerCase()} needs in {business.city}.
          </p>
        </div>
      </div>
    </div>
  );
}