import { useState } from "react";
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Reply, Flag, Filter, Download, Trash2, Eye, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Progress } from "~/components/ui/progress";
import { FeatureGate } from "~/components/FeatureGate";
import type { PlanTier } from "~/config/features";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
  verified: boolean;
  helpful: number;
  response?: {
    text: string;
    createdAt: number;
  };
  source: "google" | "facebook" | "direct" | "yelp";
  flagged?: boolean;
}

interface ReviewManagementProps {
  businessId: string;
  planTier: PlanTier;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Array<{
    stars: number;
    count: number;
    percentage: number;
  }>;
  isLoading?: boolean;
  onReplyToReview?: (reviewId: string, reply: string) => void;
  onFlagReview?: (reviewId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
  onExportReviews?: () => void;
}

export function ReviewManagement({ 
  businessId, 
  planTier, 
  reviews, 
  averageRating, 
  totalReviews, 
  ratingDistribution,
  isLoading = false,
  onReplyToReview,
  onFlagReview,
  onDeleteReview,
  onExportReviews
}: ReviewManagementProps) {
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [replyText, setReplyText] = useState<string>("");
  const [selectedReviewId, setSelectedReviewId] = useState<string>("");

  // Filter reviews based on selected criteria
  const filteredReviews = reviews
    .filter(review => {
      const matchesRating = selectedRating === "all" || review.rating.toString() === selectedRating;
      const matchesSource = selectedSource === "all" || review.source === selectedSource;
      return matchesRating && matchesSource;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "oldest":
          return a.createdAt - b.createdAt;
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        case "most_helpful":
          return b.helpful - a.helpful;
        default:
          return b.createdAt - a.createdAt;
      }
    });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-current text-yellow-500" : "text-gray-300"
        }`}
      />
    ));
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "google": return "bg-blue-100 text-blue-800";
      case "facebook": return "bg-blue-100 text-blue-800";
      case "yelp": return "bg-red-100 text-red-800";
      case "direct": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRatingStats = () => {
    const positiveReviews = reviews.filter(r => r.rating >= 4).length;
    const neutralReviews = reviews.filter(r => r.rating === 3).length;
    const negativeReviews = reviews.filter(r => r.rating <= 2).length;
    
    return {
      positive: totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0,
      neutral: totalReviews > 0 ? Math.round((neutralReviews / totalReviews) * 100) : 0,
      negative: totalReviews > 0 ? Math.round((negativeReviews / totalReviews) * 100) : 0,
      responseRate: reviews.filter(r => r.response).length / totalReviews * 100
    };
  };

  const stats = getRatingStats();

  const handleReplySubmit = () => {
    if (replyText.trim() && selectedReviewId) {
      onReplyToReview?.(selectedReviewId, replyText.trim());
      setReplyText("");
      setSelectedReviewId("");
    }
  };

  return (
    <FeatureGate featureId="review_management" planTier={planTier}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Review Management</h2>
            <p className="text-muted-foreground">
              Monitor, respond to, and analyze customer reviews
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {planTier === "power" && (
              <Button variant="outline" onClick={onExportReviews}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            <Badge variant="outline">{totalReviews} reviews</Badge>
          </div>
        </div>

        {/* Review Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex items-center mt-1">
                {renderStars(Math.round(averageRating))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReviews}</div>
              <p className="text-xs text-muted-foreground">
                {stats.positive}% positive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <Reply className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.responseRate)}%</div>
              <p className="text-xs text-muted-foreground">
                of reviews responded to
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.positive}%</div>
              <p className="text-xs text-muted-foreground">
                positive sentiment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>
              How customers are rating your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium">{stars}</span>
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <div className="w-12 text-right">
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm text-muted-foreground">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Management */}
        <Card>
          <CardHeader>
            <CardTitle>Review Management</CardTitle>
            <CardDescription>
              View, respond to, and manage all your reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="yelp">Yelp</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Rating</SelectItem>
                  <SelectItem value="lowest">Lowest Rating</SelectItem>
                  <SelectItem value="most_helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reviews List */}
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Reviews ({filteredReviews.length})</TabsTrigger>
                <TabsTrigger value="pending">Need Response ({filteredReviews.filter(r => !r.response).length})</TabsTrigger>
                <TabsTrigger value="negative">Negative ({filteredReviews.filter(r => r.rating <= 2).length})</TabsTrigger>
                <TabsTrigger value="flagged">Flagged ({filteredReviews.filter(r => r.flagged).length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <Card key={review._id} className={`${review.rating <= 2 ? 'border-l-4 border-l-red-500' : review.rating >= 4 ? 'border-l-4 border-l-green-500' : ''}`}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {/* Review Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{review.userName}</span>
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                </div>
                                <Badge className={getSourceBadgeColor(review.source)}>
                                  {review.source}
                                </Badge>
                                {review.verified && (
                                  <Badge variant="outline">Verified</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(review.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setSelectedReviewId(review._id)}
                                  >
                                    <Reply className="h-3 w-3 mr-1" />
                                    Reply
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reply to Review</DialogTitle>
                                    <DialogDescription>
                                      Respond professionally to this customer review
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <span className="font-medium">{review.userName}</span>
                                        <div className="flex items-center">
                                          {renderStars(review.rating)}
                                        </div>
                                      </div>
                                      <p className="text-sm">{review.comment}</p>
                                    </div>
                                    <Textarea
                                      placeholder="Write your response..."
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      rows={4}
                                    />
                                    <div className="flex justify-end space-x-2">
                                      <Button variant="outline" onClick={() => setReplyText("")}>
                                        Cancel
                                      </Button>
                                      <Button onClick={handleReplySubmit}>
                                        Send Reply
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => onFlagReview?.(review._id)}
                              >
                                <Flag className="h-3 w-3" />
                              </Button>
                              
                              {planTier === "power" && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => onDeleteReview?.(review._id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Review Content */}
                          <div>
                            <p className="text-sm">{review.comment}</p>
                            {review.helpful > 0 && (
                              <div className="flex items-center space-x-1 mt-2">
                                <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {review.helpful} people found this helpful
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Business Response */}
                          {review.response && (
                            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-l-blue-500">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium">Business Response</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(review.response.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm">{review.response.text}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredReviews.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No reviews found</h3>
                      <p className="text-sm text-muted-foreground">
                        No reviews match your current filters.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <Alert>
                  <Reply className="h-4 w-4" />
                  <AlertDescription>
                    Responding to reviews helps build customer trust and improves your business reputation.
                  </AlertDescription>
                </Alert>
                <div className="space-y-4">
                  {filteredReviews.filter(r => !r.response).map((review) => (
                    <Card key={review._id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{review.userName}</span>
                              <div className="flex items-center">
                                {renderStars(review.rating)}
                              </div>
                              <Badge className={getSourceBadgeColor(review.source)}>
                                {review.source}
                              </Badge>
                            </div>
                            <p className="text-sm">{review.comment}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => setSelectedReviewId(review._id)}
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="negative" className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Negative reviews require immediate attention. Respond promptly and professionally.
                  </AlertDescription>
                </Alert>
                <div className="space-y-4">
                  {filteredReviews.filter(r => r.rating <= 2).map((review) => (
                    <Card key={review._id} className="border-l-4 border-l-red-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{review.userName}</span>
                              <div className="flex items-center">
                                {renderStars(review.rating)}
                              </div>
                              <Badge className={getSourceBadgeColor(review.source)}>
                                {review.source}
                              </Badge>
                              <Badge variant="destructive">Negative</Badge>
                            </div>
                            <p className="text-sm">{review.comment}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedReviewId(review._id)}
                            >
                              <Reply className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => setSelectedReviewId(review._id)}
                            >
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="flagged" className="space-y-4">
                <Alert>
                  <Flag className="h-4 w-4" />
                  <AlertDescription>
                    Flagged reviews require review for potential policy violations or spam.
                  </AlertDescription>
                </Alert>
                <div className="space-y-4">
                  {filteredReviews.filter(r => r.flagged).map((review) => (
                    <Card key={review._id} className="border-l-4 border-l-orange-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{review.userName}</span>
                              <div className="flex items-center">
                                {renderStars(review.rating)}
                              </div>
                              <Badge variant="destructive">Flagged</Badge>
                            </div>
                            <p className="text-sm">{review.comment}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </FeatureGate>
  );
}