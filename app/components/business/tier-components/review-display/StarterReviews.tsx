import { Card, CardContent } from "~/components/ui/card";
import { Star, Users, MessageSquare, Building2 } from "lucide-react";
import { Button } from "~/components/ui/button";
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

interface StarterReviewsProps {
  business: {
    rating: number;
    reviewCount: number;
    planTier: string;
  };
  reviews: Review[];
  formatReviewDate: (timestamp: number) => string;
}

export function StarterReviews({ business, reviews, formatReviewDate }: StarterReviewsProps) {
  const displayLimit = business.planTier === "starter" ? 8 : 3;
  const displayedReviews = reviews.slice(0, displayLimit);

  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        {/* Overall Rating Display */}
        <div className="py-4 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
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
          <p className="text-sm text-muted-foreground">
            {reviews.length > 0 ? (
              `${business.reviewCount} reviews`
            ) : (
              `No reviews yet`
            )}
          </p>
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
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      "{review.comment}"
                    </p>
                    {review.reply && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-turquoise-sky" />
                          <span className="text-sm font-medium text-ironwood-charcoal">Business Response</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}