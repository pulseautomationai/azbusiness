import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { BarChart3, Edit, Save, X, Sparkles, Palette } from "lucide-react";

interface PowerOverviewProps {
  business: {
    name: string;
    category?: { name: string } | null;
    city: string;
    rating: number;
    reviewCount: number;
    services: string[];
  };
  customSummary?: string;
  summaryStyle?: string;
  onSave?: (summary: string, style?: string) => void;
  onGenerateAI?: (style: string) => Promise<string>;
  isOwner?: boolean;
}

export function PowerOverview({ 
  business, 
  customSummary, 
  summaryStyle = "professional",
  onSave, 
  onGenerateAI,
  isOwner = false 
}: PowerOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(customSummary || "");
  const [selectedStyle, setSelectedStyle] = useState(summaryStyle);
  const [isGenerating, setIsGenerating] = useState(false);

  const defaultSummary = `${business.name} is a premier ${business.category?.name.toLowerCase()} provider serving the ${business.city} area. With an exceptional ${business.rating.toFixed(1)}-star rating from ${business.reviewCount} satisfied customers, we deliver excellence across ${business.services.length} specialized services. Our commitment to quality, speed, and customer satisfaction sets us apart as the trusted choice for all your ${business.category?.name.toLowerCase()} needs.`;

  const displaySummary = customSummary || defaultSummary;

  const handleGenerateAI = async () => {
    if (!onGenerateAI) return;
    
    setIsGenerating(true);
    try {
      const generated = await onGenerateAI(selectedStyle);
      setEditedSummary(generated);
    } catch (error) {
      console.error("Failed to generate AI content:", error);
    }
    setIsGenerating(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedSummary, selectedStyle);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSummary(displaySummary);
    setSelectedStyle(summaryStyle);
    setIsEditing(false);
  };

  const styleDescriptions = {
    professional: "Clear, authoritative, and business-focused",
    friendly: "Warm, approachable, and conversational",
    confident: "Bold, assertive, and results-driven",
    local: "Community-oriented with local expertise",
    premium: "Sophisticated and exclusive positioning"
  };

  return (
    <div className="p-6 bg-agave-cream border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-ocotillo-red rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Professional Overview
          </h3>
          <Badge className="bg-ocotillo-red text-white text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Enhanced
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
            Customize
          </Button>
        )}
      </div>
      
      <div className="border-b border-gray-200 mb-4"></div>
      
      <div className="space-y-3">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Content Style
              </label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(styleDescriptions).map(([value, description]) => (
                    <SelectItem key={value} value={value}>
                      <div>
                        <div className="font-medium capitalize">{value}</div>
                        <div className="text-xs text-muted-foreground">{description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Business Overview</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="border-turquoise-sky text-turquoise-sky hover:bg-turquoise-sky hover:text-white"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  {isGenerating ? "Generating..." : "Generate AI Content"}
                </Button>
              </div>
              <Textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                rows={8}
                className="w-full resize-none"
                placeholder="Write your professional business overview..."
              />
            </div>
            
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
                <strong>Power Feature:</strong> AI-enhanced content with 5 professional tone styles. Your overview adapts to your brand voice while maximizing engagement and conversions.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}