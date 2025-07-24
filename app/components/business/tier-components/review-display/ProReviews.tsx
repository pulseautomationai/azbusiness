import { Card, CardContent } from "~/components/ui/card";
import { Star, Users, MessageSquare, Building2, TrendingUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";
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
}

interface ProReviewsProps {
  business: {
    rating: number;
    reviewCount: number;
  };
  reviews: Review[];
  formatReviewDate: (timestamp: number) => string;
  reviewInsights?: {
    averageRating: number;
    ratingTrend: "up" | "down" | "stable";
    recentImprovement: boolean;
  };
}

export function ProReviews({ business, reviews, formatReviewDate, reviewInsights }: ProReviewsProps) {
  const displayedReviews = reviews.slice(0, 15);

  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        {/* Overall Rating Display with Insights */}
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
              {reviewInsights?.ratingTrend === "up" && (
                <Badge variant="secondary" className="text-xs bg-agave-cream text-turquoise-sky border border-turquoise-sky">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending Up
                </Badge>
              )}
            </div>
            <Badge className="bg-turquoise-sky text-white">
              Pro Reviews
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Displaying {displayedReviews.length} of {business.reviewCount} customer reviews
          </p>
          {reviewInsights?.recentImprovement && (
            <p className="text-xs text-turquoise-sky mt-1">
              ✨ Recent reviews show improvement in customer satisfaction
            </p>
          )}
        </div>

        {/* Individual Reviews */}
        <div className="pt-4 pb-6 space-y-6">
          {displayedReviews.length > 0 ? (
            displayedReviews.map((review, index) => (
              <div key={review._id || index} className="border-b border-border pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-agave-cream rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-turquoise-sky" />
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
                      {index < 3 && (
                        <Badge variant="secondary" className="text-xs">
                          Recent
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      "{review.comment}"
                    </p>
                    {review.reply && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200 bg-agave-cream rounded-r-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-turquoise-sky" />
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

        {reviews.length > 15 && (
          <div className="text-center py-3 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Showing 15 of {business.reviewCount} total reviews
            </p>
          </div>
        )}
          
        {/* Upgrade to Power Message */}
        <div className="pt-4 border-t border-border">
          <div className="p-4 bg-agave-cream border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ironwood-charcoal">
                  Unlock AI-Powered Review Intelligence
                </p>
                <p className="text-xs text-ironwood-charcoal/80 mt-1">
                  Power tier includes sentiment analysis, keyword extraction, and unlimited review display
                </p>
              </div>
              <Button asChild size="sm" className="bg-ocotillo-red hover:bg-ocotillo-red/90 text-white">
                <Link to="/pricing">
                  Upgrade to Power
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}