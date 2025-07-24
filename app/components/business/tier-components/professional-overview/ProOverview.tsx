import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { BarChart3, Edit, Save, X } from "lucide-react";

interface ProOverviewProps {
  business: {
    name: string;
    category?: { name: string } | null;
    city: string;
    rating: number;
    reviewCount: number;
    services: string[];
  };
  customSummary?: string;
  onSave?: (summary: string) => void;
  isOwner?: boolean;
}

export function ProOverview({ business, customSummary, onSave, isOwner = false }: ProOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(customSummary || "");

  const defaultSummary = `${business.name} is a trusted ${business.category?.name.toLowerCase()} provider serving the ${business.city} area. With a ${business.rating.toFixed(1)}-star rating from ${business.reviewCount} customers, they offer reliable service with ${business.services.length} specialized services.`;

  const displaySummary = customSummary || defaultSummary;

  const handleSave = () => {
    if (onSave) {
      onSave(editedSummary);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSummary(displaySummary);
    setIsEditing(false);
  };

  return (
    <div className="p-6 bg-agave-cream border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-turquoise-sky rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Professional Overview
          </h3>
          <Badge className="bg-turquoise-sky text-white text-xs">
            {customSummary ? "Customized" : "AI-Generated"}
          </Badge>
        </div>
        {isOwner && !isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditedSummary(displaySummary);
              setIsEditing(true);
            }}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </div>
      
      <div className="border-b border-gray-200 mb-4"></div>
      
      <div className="space-y-3">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              rows={6}
              className="w-full resize-none"
              placeholder="Write your professional business overview..."
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-ocotillo-red hover:bg-ocotillo-red/90 text-white">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {displaySummary}
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
                <strong>Pro Feature:</strong> You can edit this overview to perfectly represent your business and highlight what makes you unique.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}