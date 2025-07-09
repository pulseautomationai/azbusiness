import { useState } from "react";
import { Star, ThumbsUp, User, Shield } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: number;
}

interface ReviewSectionProps {
  businessId: string;
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export default function ReviewSection({ 
  businessId, 
  reviews, 
  rating, 
  reviewCount 
}: ReviewSectionProps) {
  const [sortBy, setSortBy] = useState<"recent" | "helpful">("recent");

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => Math.floor(r.rating) === stars).length;
    const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
    return { stars, count, percentage };
  });

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "helpful") {
      return b.helpful - a.helpful;
    }
    return b.createdAt - a.createdAt;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  // Sample reviews for demo (since we don't have real reviews yet)
  const demoReviews: Review[] = [
    {
      _id: "1",
      userName: "Sarah Johnson",
      rating: 5,
      comment: "Excellent service! They arrived on time and fixed our AC unit quickly. The technician was professional and explained everything clearly. Highly recommend!",
      verified: true,
      helpful: 12,
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    },
    {
      _id: "2",
      userName: "Mike Chen",
      rating: 4,
      comment: "Good work overall. The pricing was fair and the service was completed as promised. Would use again.",
      verified: false,
      helpful: 5,
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    },
    {
      _id: "3",
      userName: "Emily Rodriguez",
      rating: 5,
      comment: "Outstanding experience from start to finish. They were responsive, professional, and went above and beyond to ensure we were satisfied.",
      verified: true,
      helpful: 8,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    },
  ];

  const displayReviews = reviews.length > 0 ? sortedReviews : demoReviews;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>
            Based on {reviewCount} review{reviewCount !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold">{rating.toFixed(1)}</div>
              <div className="mt-2 flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-6 w-6",
                      i < Math.floor(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {reviewCount} total review{reviewCount !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="w-3 text-sm">{stars}</span>
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 rounded-full bg-muted h-2 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm text-muted-foreground">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Actions */}
      <div className="flex items-center justify-between">
        <Button variant="default">
          Write a Review
        </Button>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "recent" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSortBy("recent")}
          >
            Most Recent
          </Button>
          <Button
            variant={sortBy === "helpful" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSortBy("helpful")}
          >
            Most Helpful
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {displayReviews.map((review) => (
          <Card key={review._id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{review.userName}</h4>
                      {review.verified && (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < Math.floor(review.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="mt-4 text-muted-foreground">
                {review.comment}
              </p>
              
              <div className="mt-4 flex items-center gap-4">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Helpful ({review.helpful})
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {displayReviews.length < reviewCount && (
        <div className="text-center">
          <Button variant="outline">
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
}