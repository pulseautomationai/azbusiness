import React from 'react';
import { BusinessWithTier } from '~/types/tiers';
import { TrendingUp, Award, Target, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Badge } from '~/components/ui/badge';

interface CompetitiveAnalysisSectionProps {
  business: BusinessWithTier;
}

export const CompetitiveAnalysisSection: React.FC<CompetitiveAnalysisSectionProps> = ({
  business,
}) => {
  // Mock data for competitive analysis
  const competitiveData = {
    marketShare: 32,
    competitorAvgRating: 4.2,
    pricePosition: 'competitive',
    strengths: [
      'Fastest response time in area',
      'Highest customer satisfaction',
      '24/7 emergency availability'
    ],
    opportunities: [
      'Expand commercial services',
      'Add preventive maintenance packages',
      'Increase social media presence'
    ]
  };

  return (
    <Card className="competitive-analysis-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-ocotillo-red" />
          Competitive Intelligence
          <Badge className="ml-2 bg-agave-cream text-ironwood-charcoal border border-gray-200">Pro Feature</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Market Position */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-desert-marigold" />
              Market Position
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Local Market Share</span>
                  <span className="font-medium">{competitiveData.marketShare}%</span>
                </div>
                <Progress value={competitiveData.marketShare} className="h-2" />
              </div>
              <div className="text-sm">
                <p className="text-gray-600">Your Rating: <span className="font-semibold text-gray-900">{business.rating}</span></p>
                <p className="text-gray-600">Competitor Avg: <span className="font-medium">{competitiveData.competitorAvgRating}</span></p>
              </div>
            </div>
          </div>

          {/* Competitive Advantages */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-desert-marigold" />
              Your Advantages
            </h4>
            <ul className="space-y-2">
              {competitiveData.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-turquoise-sky mt-1.5"></div>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Growth Opportunities */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-desert-marigold" />
            Growth Opportunities
          </h4>
          <div className="grid md:grid-cols-3 gap-3">
            {competitiveData.opportunities.map((opportunity, index) => (
              <div key={index} className="bg-agave-cream rounded-lg p-3 text-sm border border-gray-200">
                <p className="text-ironwood-charcoal">{opportunity}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};