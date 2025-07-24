import { Badge } from "~/components/ui/badge";
import { BarChart3, Building2, Award, TrendingUp, Target, Zap } from "lucide-react";

interface CompetitiveIntelligenceProps {
  business: {
    name: string;
    category?: { name: string } | null;
    services: string[];
  };
  competitiveData?: {
    marketPosition: string;
    strengths: string[];
    opportunities: string[];
    competitiveAdvantages: string[];
    recommendations: string[];
  };
}

export function PowerCompetitiveIntelligence({ 
  business, 
  competitiveData 
}: CompetitiveIntelligenceProps) {
  // Default competitive intelligence if not provided
  const defaultData = {
    marketPosition: "Strong regional player with growth potential",
    strengths: [
      "24/7 emergency service availability",
      "15+ years of industry experience",
      "EPA certified and fully licensed",
      "Competitive pricing with transparent quotes"
    ],
    opportunities: [
      "Expand digital marketing presence",
      "Introduce preventive maintenance packages",
      "Target commercial clients in addition to residential"
    ],
    competitiveAdvantages: [
      "Faster response times than 85% of competitors",
      "Higher customer satisfaction ratings",
      "More comprehensive service offerings",
      "Better warranty terms (5 years vs industry standard 2-3)"
    ],
    recommendations: [
      "Leverage your superior response time in marketing",
      "Highlight your extended warranty as a key differentiator",
      "Create service bundles to increase average transaction value"
    ]
  };

  const data = competitiveData || defaultData;

  return (
    <div className="p-6 bg-agave-cream border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-ocotillo-red rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Competitive Intelligence
        </h3>
        <Badge className="bg-ocotillo-red text-white text-xs">
          AI-Powered Analysis
        </Badge>
      </div>
      
      <div className="border-b border-gray-200 mb-4"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Profile & Market Position */}
        <div>
          <h4 className="font-semibold text-ironwood-charcoal mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Market Position
          </h4>
          <p className="text-sm text-ironwood-charcoal/80 mb-4">{data.marketPosition}</p>
          
          <h4 className="font-semibold text-ironwood-charcoal mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Core Strengths
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {data.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-turquoise-sky rounded-full mt-1.5 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Competitive Advantages & Opportunities */}
        <div>
          <h4 className="font-semibold text-ironwood-charcoal mb-2 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Competitive Advantages
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground mb-4">
            {data.competitiveAdvantages.slice(0, 3).map((advantage, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-turquoise-sky rounded-full mt-1.5 flex-shrink-0" />
                {advantage}
              </li>
            ))}
          </ul>
          
          <h4 className="font-semibold text-ironwood-charcoal mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Growth Opportunities
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {data.opportunities.map((opportunity, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-turquoise-sky rounded-full mt-1.5 flex-shrink-0" />
                {opportunity}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Strategic Recommendations */}
      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-ironwood-charcoal mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Strategic Recommendations
        </h4>
        <ul className="space-y-1">
          {data.recommendations.map((rec, index) => (
            <li key={index} className="text-sm text-ironwood-charcoal/80 flex items-start gap-2">
              <span className="font-medium">{index + 1}.</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}