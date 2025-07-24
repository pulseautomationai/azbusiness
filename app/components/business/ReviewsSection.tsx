import React, { useState } from 'react';
import { BusinessWithTier, TierConfig } from '~/types/tiers';
import { Star, ThumbsUp, MessageSquare, TrendingUp, Award, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';

interface ReviewsSectionProps {
  business: BusinessWithTier;
  tierConfig: TierConfig;
  reviews: any[];
  maxReviews: number;
  showResponses: boolean;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  business,
  tierConfig,
  reviews,
  maxReviews,
  showResponses,
}) => {
  // Initial display count based on tier
  const getInitialDisplayCount = () => {
    switch (business.planTier) {
      case 'power':
        return 5; // Show 5 initially for Power tier, with "See more" functionality
      case 'pro':
        return Math.min(5, maxReviews); // Show up to 5 initially for Pro
      case 'starter':
        return Math.min(3, maxReviews); // Show up to 3 initially for Starter
      default:
        return maxReviews; // Show all for Free tier
    }
  };
  
  const [displayCount, setDisplayCount] = useState(getInitialDisplayCount());
  
  // Calculate what reviews to display
  const displayReviews = maxReviews === -1 
    ? reviews.slice(0, displayCount) 
    : reviews.slice(0, Math.min(displayCount, maxReviews));
  
  // Determine if "See more" button should be shown
  const canShowMore = maxReviews === -1 
    ? reviews.length > displayCount // Power tier: can always show more if there are more
    : reviews.length > displayCount && displayCount < maxReviews; // Other tiers: can show more until tier limit
  
  const remainingReviews = maxReviews === -1 
    ? reviews.length - displayCount
    : Math.min(reviews.length, maxReviews) - displayCount;

  const formatReviewDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const getSectionTitle = () => {
    switch (business.planTier) {
      case 'power':
        return 'Customer Success Stories';
      case 'pro':
        return 'Verified Customer Reviews';
      case 'starter':
        return 'Customer Feedback';
      default:
        return 'Customer Reviews';
    }
  };

  const getReviewStyle = () => {
    switch (tierConfig.ui.reviewStyle) {
      case 'advanced':
        return 'bg-agave-cream border-gray-200';
      case 'interactive':
        return 'bg-agave-cream border-gray-200';
      case 'enhanced':
        return 'bg-agave-cream border-gray-200';
      default:
        return 'bg-agave-cream border-gray-200';
    }
  };

  return (
    <Card className={`reviews-section reviews--${tierConfig.ui.reviewStyle} bg-white border-gray-200`}>
      <CardHeader className="border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-ironwood-charcoal" />
            <span className="font-medium text-ironwood-charcoal font-['Playfair_Display']">
              {getSectionTitle()}
            </span>
          </CardTitle>
          {business.planTier === 'free' ? (
            <span className="text-sm text-gray-500">
              {business.rating} average • {displayReviews.length} reviews
            </span>
          ) : (
            <Badge variant="secondary" className={`${getReviewStyle()} text-xs lg:text-sm`}>
              {business.reviewCount}+ Verified Reviews
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {displayReviews.length > 0 ? (
          <>
            {displayReviews.map((review, index) => (
              <div key={review._id || index}>
                <div className="p-3 rounded bg-gray-50 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <h4 className="font-medium text-ironwood-charcoal text-sm">{review.userName}</h4>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? 'fill-desert-marigold text-desert-marigold'
                                  : 'fill-transparent text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatReviewDate(review.createdAt)}
                      </p>
                    </div>
                    {review.verified && (
                      <Badge variant="secondary" className="bg-agave-cream text-turquoise-sky text-xs border border-gray-200">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-ironwood-charcoal leading-relaxed font-['Inter']">{review.comment}</p>
                  
                  {/* Review Response (Pro/Power only) */}
                  {showResponses && review.reply && (
                    <div className="mt-4 pl-4 border-l-4 border-turquoise-sky">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-turquoise-sky" />
                        <span className="font-medium text-ironwood-charcoal">Business Response</span>
                      </div>
                      <p className="text-gray-700">{review.reply.text}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatReviewDate(review.reply.createdAt)}
                      </p>
                    </div>
                  )}
                  
                  {/* Helpful button (Starter+ tiers) */}
                  {business.planTier !== 'free' && (
                    <div className="flex items-center gap-4 mt-4">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ThumbsUp className="w-4 h-4" />
                        Helpful ({review.helpful || 0})
                      </Button>
                    </div>
                  )}
                </div>
                {index < displayReviews.length - 1 && <Separator className="bg-gray-200" />}
              </div>
            ))}
            
            {/* See More Button */}
            {canShowMore && (
              <div className="pt-4 text-center">
                <Button
                  variant="outline"
                  className="gap-2 border-ocotillo-red text-ocotillo-red hover:bg-ocotillo-red hover:text-white transition-colors"
                  onClick={() => {
                    const increment = business.planTier === 'power' ? 10 : 5;
                    const newCount = displayCount + increment;
                    setDisplayCount(maxReviews === -1 ? newCount : Math.min(newCount, maxReviews));
                  }}
                >
                  <ChevronDown className="w-4 h-4" />
                  See more reviews ({remainingReviews} more)
                </Button>
              </div>
            )}
            
            {/* Tier Limit Reached Message */}
            {!canShowMore && displayCount >= maxReviews && maxReviews !== -1 && reviews.length > maxReviews && (
              <div className="pt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing maximum {maxReviews} reviews for {business.planTier} tier
                </p>
              </div>
            )}
            
            {/* Review Analytics (Power tier) */}
            {business.planTier === 'power' && reviews.length > 0 && (
              <div className="mt-8 p-6 bg-agave-cream rounded-xl border border-gray-200">
                <h4 className="font-semibold text-ironwood-charcoal mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Review Analytics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-ocotillo-red">{business.rating}</p>
                    <p className="text-sm text-ironwood-charcoal">Average Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-ocotillo-red">98%</p>
                    <p className="text-sm text-ironwood-charcoal">Satisfaction</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-ocotillo-red">87</p>
                    <p className="text-sm text-ironwood-charcoal">NPS Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-ocotillo-red">24hr</p>
                    <p className="text-sm text-ironwood-charcoal">Avg Response</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm mb-3">No reviews yet. Be the first to review!</p>
            <Button variant="outline" className="border-gray-200 text-ironwood-charcoal hover:bg-gray-50 transition-colors text-sm">
              Write a Review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};