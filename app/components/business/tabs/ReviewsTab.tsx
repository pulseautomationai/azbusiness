import { Star, TrendingUp, MessageSquare, ThumbsUp, Calendar, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { FeatureGate } from "~/components/FeatureGate";

interface ReviewsTabProps {
  business: any;
  businessContent: any;
  reviews: any[];
  isOwner: boolean;
}

export function ReviewsTab({ business, businessContent, reviews, isOwner }: ReviewsTabProps) {
  // Mock review data for demo
  const mockReviews = [
    {
      id: 1,
      author: "Sarah Johnson",
      rating: 5,
      date: "2025-01-05",
      content: "Outstanding service! The team was professional, punctual, and did excellent work. Highly recommend for anyone looking for quality service.",
      helpful: 3,
      verified: true
    },
    {
      id: 2,
      author: "Mike Chen",
      rating: 5,
      date: "2024-12-28",
      content: "Great experience from start to finish. Fair pricing and quality work. They went above and beyond to ensure everything was perfect.",
      helpful: 2,
      verified: true
    },
    {
      id: 3,
      author: "Jennifer Davis",
      rating: 4,
      date: "2024-12-15",
      content: "Very satisfied with the service. Professional team and good communication throughout the project. Would use again.",
      helpful: 1,
      verified: false
    }
  ];

  const displayReviews = reviews.length > 0 ? reviews : mockReviews;

  const ratingCounts = {
    5: Math.floor(business.reviewCount * 0.7),
    4: Math.floor(business.reviewCount * 0.2),
    3: Math.floor(business.reviewCount * 0.05),
    2: Math.floor(business.reviewCount * 0.03),
    1: Math.floor(business.reviewCount * 0.02)
  };

  return (
    <div className="space-y-6">
      {/* Reviews Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
          </CardTitle>
          <CardDescription>
            What our customers are saying about {business.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Rating Summary */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold">{business.rating.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(business.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {business.reviewCount} reviews
                </p>
              </div>
              
              <Button className="w-full" variant="outline">
                Write a Review
              </Button>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress 
                    value={(ratingCounts[rating as keyof typeof ratingCounts] / business.reviewCount) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-muted-foreground w-8">
                    {ratingCounts[rating as keyof typeof ratingCounts]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Review Analysis */}
      <FeatureGate
        featureId="reviewAnalysis"
        planTier={business.planTier}
        showUpgrade={false}
      >
        {businessContent?.reviewAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Review Insights
                <Badge variant="secondary" className="text-xs">
                  AI Analysis
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Sentiment Distribution */}
                <div>
                  <h4 className="font-medium mb-3">Sentiment Analysis</h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(businessContent.reviewAnalysis.sentiment.positive * 100)}%
                      </div>
                      <div className="text-sm text-green-700">Positive</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {Math.round(businessContent.reviewAnalysis.sentiment.neutral * 100)}%
                      </div>
                      <div className="text-sm text-gray-700">Neutral</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {Math.round(businessContent.reviewAnalysis.sentiment.negative * 100)}%
                      </div>
                      <div className="text-sm text-red-700">Negative</div>
                    </div>
                  </div>
                </div>

                {/* Key Themes */}
                <div>
                  <h4 className="font-medium mb-3">Common Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {businessContent.reviewAnalysis.keywords.slice(0, 10).map((keyword: any, index: number) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className={`${
                          keyword.sentiment === 'positive' ? 'border-green-200 text-green-700' :
                          keyword.sentiment === 'negative' ? 'border-red-200 text-red-700' :
                          'border-gray-200 text-gray-700'
                        }`}
                      >
                        {keyword.word} ({keyword.count})
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                {businessContent.reviewAnalysis.highlights.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Customer Highlights</h4>
                    <div className="space-y-2">
                      {businessContent.reviewAnalysis.highlights.map((highlight: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5" />
                          <span className="text-sm">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </FeatureGate>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {displayReviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{review.author}</span>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{review.content}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                        <ThumbsUp className="h-4 w-4" />
                        Helpful ({review.helpful})
                      </button>
                      
                      {isOwner && (
                        <button className="text-primary hover:text-primary/80">
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {business.reviewCount > displayReviews.length && (
            <div className="text-center pt-6 border-t">
              <Button variant="outline">
                View All Reviews ({business.reviewCount})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Write Review CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Share Your Experience</h3>
          <p className="text-muted-foreground mb-4">
            Help others by sharing your experience with {business.name}
          </p>
          <Button size="lg">
            Write a Review
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}