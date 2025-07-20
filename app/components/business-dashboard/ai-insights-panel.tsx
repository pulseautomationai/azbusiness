/**
 * AI Insights Panel - Phase 4.3
 * AI-powered business insights and recommendations
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Lightbulb, TrendingUp, Target, Users, Zap, Brain } from "lucide-react";

interface AIInsightsPanelProps {
  business: any;
  planTier: string;
}

export default function AIInsightsPanel({ business, planTier }: AIInsightsPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Business Insights
          </CardTitle>
          <CardDescription>
            Powered by advanced AI analysis of your business performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Insights Coming Soon</h3>
              <p className="text-muted-foreground">
                Phase 4.3 implementation in progress
              </p>
            </div>
            <Badge variant="outline" className="border-purple-200 text-purple-700">
              Phase 4.3 Feature
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}