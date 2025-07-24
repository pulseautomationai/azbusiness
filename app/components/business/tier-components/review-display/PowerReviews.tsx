import { Card, CardContent } from "~/components/ui/card";
import { Star, Users, MessageSquare, Building2, TrendingUp, BarChart3, Sparkles } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";

interface Review {
  _id?: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
  reply?: {
    text: string;
    createdAt?: number;
    authorName?: string;
  };
  sentiment?: {
    score: number;
    classification: "positive" | "neutral" | "negative";
  };
}

interface PowerReviewsProps {
  business: {
    rating: number;
    reviewCount: number;
  };
  reviews: Review[];
  formatReviewDate: (timestamp: number) => string;
  reviewAnalysis?: {
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
    keywords: string[];
    trends: string[];
    highlights: string[];
  };
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function PowerReviews({ 
  business, 
  reviews, 
  formatReviewDate, 
  reviewAnalysis,
  onLoadMore,
  hasMore = false
}: PowerReviewsProps) {
  const getSentimentColor = (classification?: string) => {
    switch (classification) {
      case "positive": return "text-turquoise-sky bg-agave-cream";
      case "neutral": return "text-ironwood-charcoal bg-white border border-gray-200";
      case "negative": return "text-ocotillo-red bg-agave-cream";
      default: return "text-ironwood-charcoal bg-white border border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Review Intelligence Section */}
      {reviewAnalysis && (
        <div className="p-6 bg-agave-cream border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-ocotillo-red rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Review Intelligence
            </h3>
            <Badge className="bg-ocotillo-red text-white text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
          
          <div className="border-b border-gray-200 mb-4"></div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Based on analysis of {business.reviewCount} customer reviews:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sentiment Analysis */}
            <div>
              <h4 className="font-semibold text-ironwood-charcoal mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Customer Sentiment
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-16">Positive</span>
                  <Progress value={reviewAnalysis.sentiment.positive} className="flex-1" />
                  <span className="text-sm font-semibold text-turquoise-sky">
                    {reviewAnalysis.sentiment.positive}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-16">Neutral</span>
                  <Progress value={reviewAnalysis.sentiment.neutral} className="flex-1" />
                  <span className="text-sm font-semibold text-ironwood-charcoal">
                    {reviewAnalysis.sentiment.neutral}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-16">Negative</span>
                  <Progress value={reviewAnalysis.sentiment.negative} className="flex-1" />
                  <span className="text-sm font-semibold text-ocotillo-red">
                    {reviewAnalysis.sentiment.negative}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Key Insights */}
            <div>
              <h4 className="font-semibold text-ironwood-charcoal mb-3">Key Insights</h4>
              <div className="space-y-2">
                {reviewAnalysis.highlights.slice(0, 3).map((highlight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ocotillo-red rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-sm text-ironwood-charcoal">{highlight}</p>
                  </div>
                ))}
              </div>
              
              {/* Trending Keywords */}
              <div className="mt-4">
                <p className="text-xs font-medium text-ironwood-charcoal mb-2">Trending Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {reviewAnalysis.keywords.slice(0, 5).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-agave-cream text-ironwood-charcoal border border-gray-200">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Display */}
      <Card>
        <CardContent className="p-6">
          {/* Overall Rating Display */}
          <div className="py-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < Math.floor(business.rating)
                          ? "fill-desert-marigold text-desert-marigold"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-foreground">{business.rating.toFixed(1)}</span>
              </div>
              <Badge className="bg-ocotillo-red text-white">
                Power Reviews
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              All {business.reviewCount} customer reviews with AI analysis
            </p>
          </div>

          {/* Individual Reviews with Sentiment */}
          <div className="pt-4 pb-6 space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={review._id || index} className="border-b border-border pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-agave-cream rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-ocotillo-red" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{review.userName}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-4 h-4",
                                i < review.rating
                                  ? "fill-desert-marigold text-desert-marigold"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          • {formatReviewDate(review.createdAt)}
                        </span>
                        {review.sentiment && (
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getSentimentColor(review.sentiment.classification))}
                          >
                            {review.sentiment.classification}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        "{review.comment}"
                      </p>
                      {review.reply && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-200 bg-agave-cream rounded-r-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-4 h-4 text-ocotillo-red" />
                            <span className="text-sm font-medium text-ironwood-charcoal">Business Response</span>
                          </div>
                          <p className="text-sm text-ironwood-charcoal/80">
                            {review.reply.text}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">No reviews yet</h4>
                <p className="text-muted-foreground">Be the first to leave a review for this business!</p>
              </div>
            )}
          </div>

          {/* Load More */}
          {hasMore && onLoadMore && (
            <div className="text-center pt-4 border-t border-border">
              <button
                onClick={onLoadMore}
                className="text-sm font-medium text-ocotillo-red hover:text-ocotillo-red/90"
              >
                Load More Reviews
              </button>
            </div>
          )}
          
          {/* Power Tier Benefits */}
          <div className="pt-4 border-t border-border">
            <div className="p-4 bg-agave-cream border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-ironwood-charcoal text-center">
                ✨ Power tier exclusive: Unlimited reviews with AI sentiment analysis and competitive insights
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}