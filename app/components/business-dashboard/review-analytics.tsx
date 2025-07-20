/**
 * Review Analytics - Phase 4.1/4.2
 * Comprehensive review analysis and management interface with sentiment analysis
 */

// import { useQuery } from "convex/react";
// import { api } from "~/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { 
  MessageSquare, 
  TrendingUp, 
  Heart, 
  AlertTriangle, 
  Star,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Calendar,
  Filter,
  Tag,
  MessageCircle,
  BarChart3
} from "lucide-react";
import { useState } from "react";

interface ReviewAnalyticsProps {
  business: any;
  planTier: string;
}

// Mock review data with sentiment analysis
const generateMockReviewData = (business: any) => {
  return {
    totalReviews: business.reviewCount || 67,
    sentiment: {
      positive: 65, // percentage
      neutral: 25,
      negative: 10
    },
    sentimentTrend: {
      thisMonth: { positive: 68, neutral: 22, negative: 10 },
      lastMonth: { positive: 62, neutral: 28, negative: 10 },
      change: +6
    },
    topKeywords: [
      { word: "professional", count: 23, sentiment: "positive" },
      { word: "quality", count: 19, sentiment: "positive" },
      { word: "fast", count: 16, sentiment: "positive" },
      { word: "friendly", count: 14, sentiment: "positive" },
      { word: "expensive", count: 8, sentiment: "negative" },
      { word: "late", count: 5, sentiment: "negative" }
    ],
    recentReviews: [
      {
        id: "rev-1",
        author: "Sarah M.",
        rating: 5,
        date: "2024-01-15",
        text: "Excellent service! Very professional and quality work.",
        sentiment: "positive",
        sentimentScore: 0.85,
        keywords: ["professional", "quality", "excellent"]
      },
      {
        id: "rev-2", 
        author: "Mike R.",
        rating: 4,
        date: "2024-01-12",
        text: "Good work but a bit expensive for what was done.",
        sentiment: "neutral",
        sentimentScore: 0.15,
        keywords: ["good", "expensive"]
      },
      {
        id: "rev-3",
        author: "Jennifer L.",
        rating: 5,
        date: "2024-01-10",
        text: "Fast and friendly service. Highly recommend!",
        sentiment: "positive",
        sentimentScore: 0.92,
        keywords: ["fast", "friendly", "recommend"]
      },
      {
        id: "rev-4",
        author: "Tom K.",
        rating: 2,
        date: "2024-01-08",
        text: "Service was late and not what was promised.",
        sentiment: "negative",
        sentimentScore: -0.72,
        keywords: ["late", "promised"]
      }
    ],
    weeklyTrends: [
      { week: "Jan 1-7", positive: 60, neutral: 30, negative: 10 },
      { week: "Jan 8-14", positive: 65, neutral: 25, negative: 10 },
      { week: "Jan 15-21", positive: 70, neutral: 20, negative: 10 },
      { week: "Jan 22-28", positive: 68, neutral: 22, negative: 10 }
    ]
  };
};

export default function ReviewAnalytics({ business, planTier }: ReviewAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("30d");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  const reviewData = generateMockReviewData(business);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-600";
      case "negative": return "text-red-600";
      case "neutral": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case "negative": return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case "neutral": return <Meh className="h-4 w-4 text-gray-500" />;
      default: return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              Positive Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{reviewData.sentiment.positive}%</div>
            <div className="text-sm text-green-700">
              {Math.round((reviewData.sentiment.positive / 100) * reviewData.totalReviews)} reviews
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Meh className="h-4 w-4 text-gray-500" />
              Neutral Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{reviewData.sentiment.neutral}%</div>
            <div className="text-sm text-gray-700">
              {Math.round((reviewData.sentiment.neutral / 100) * reviewData.totalReviews)} reviews
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              Negative Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{reviewData.sentiment.negative}%</div>
            <div className="text-sm text-red-700">
              {Math.round((reviewData.sentiment.negative / 100) * reviewData.totalReviews)} reviews
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Trends */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sentiment Trends
            </CardTitle>
            <CardDescription>
              How customer sentiment changes over time
            </CardDescription>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {planTier === "free" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sentiment Analysis</h3>
              <p className="text-muted-foreground mb-4">
                Advanced review analytics available with paid plans
              </p>
              <Button className="bg-ocotillo-red hover:bg-ocotillo-red/90">
                Upgrade to Starter
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Trend Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">This Month Trend:</span>
                  <div className={`flex items-center gap-1 ${reviewData.sentimentTrend.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className="h-4 w-4" />
                    {reviewData.sentimentTrend.change > 0 ? '+' : ''}{reviewData.sentimentTrend.change}% positive
                  </div>
                </div>
              </div>

              {/* Weekly Trend Bars */}
              <div className="space-y-3">
                {reviewData.weeklyTrends.map((week, index) => (
                  <div key={week.week} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{week.week}</span>
                      <span className="text-muted-foreground">
                        {week.positive}% positive
                      </span>
                    </div>
                    <div className="flex w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${week.positive}%` }}
                      />
                      <div 
                        className="bg-gray-400" 
                        style={{ width: `${week.neutral}%` }}
                      />
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${week.negative}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span>Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Negative</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Top Keywords in Reviews
          </CardTitle>
          <CardDescription>
            Most mentioned words and phrases from customer feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          {planTier === "free" ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Keyword analysis available with Starter plan
              </p>
              <Button variant="outline">View Sample Keywords</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {reviewData.topKeywords.map((keyword, index) => (
                <div key={keyword.word} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium capitalize">{keyword.word}</span>
                    <Badge 
                      variant={keyword.sentiment === "positive" ? "default" : keyword.sentiment === "negative" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {keyword.sentiment}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{keyword.count} mentions</span>
                    <Progress value={(keyword.count / 25) * 100} className="h-2 w-16" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews with Sentiment */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Reviews
            </CardTitle>
            <CardDescription>
              Latest customer feedback with AI sentiment analysis
            </CardDescription>
          </div>
          
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {planTier === "free" ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Review sentiment analysis available with paid plans
              </p>
              <Button variant="outline">View Basic Reviews</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewData.recentReviews
                .filter(review => sentimentFilter === "all" || review.sentiment === sentimentFilter)
                .map((review) => (
                <div key={review.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{review.author}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(review.sentiment)}
                      <Badge 
                        variant={review.sentiment === "positive" ? "default" : review.sentiment === "negative" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {review.sentiment}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm">{review.text}</p>
                  
                  {planTier === "power" && review.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {review.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {planTier === "power" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Sentiment Score:</span>
                      <span className={review.sentimentScore > 0 ? 'text-green-600' : review.sentimentScore < 0 ? 'text-red-600' : 'text-gray-600'}>
                        {review.sentimentScore > 0 ? '+' : ''}{review.sentimentScore.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Items */}
      {planTier !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Action Items
            </CardTitle>
            <CardDescription>
              Recommendations based on review analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <div className="font-medium text-red-900">Address Pricing Concerns</div>
                  <div className="text-sm text-red-700">
                    "Expensive" mentioned 8 times. Consider transparent pricing or value communication.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <ThumbsUp className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium text-green-900">Leverage Strengths</div>
                  <div className="text-sm text-green-700">
                    "Professional" and "quality" are top positive keywords. Highlight these in marketing.
                  </div>
                </div>
              </div>

              {planTier === "power" && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <MessageCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">Respond to Recent Negative Review</div>
                    <div className="text-sm text-blue-700">
                      Tom K.'s review about service being late needs a professional response.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}