import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, MessageSquare, ThumbsUp, User, Calendar, CheckCircle, Trash2 } from "lucide-react"
import { College, CollegeReview, saveReviewToSupabase, deleteReview, isUserReview } from "@/lib/college-service"

interface CollegeReviewModalProps {
  college: College | null;
  reviews: CollegeReview[];
  isOpen: boolean;
  onClose: () => void;
  onAddReview: (review: CollegeReview) => void;
  onDeleteReview: (reviewId: string) => void;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  interactive = false 
}: { 
  rating: number; 
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= rating 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:text-yellow-300" : ""}`}
          onClick={() => interactive && onRatingChange?.(star)}
        />
      ))}
    </div>
  );
};

const CategoryRating = ({ 
  label, 
  rating, 
  onRatingChange, 
  interactive = false 
}: { 
  label: string; 
  rating: number; 
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm font-medium text-gray-300">{label}</Label>
      <StarRating 
        rating={rating} 
        onRatingChange={onRatingChange}
        interactive={interactive}
      />
    </div>
  );
};

export const CollegeReviewModal = ({ 
  college, 
  reviews, 
  isOpen, 
  onClose, 
  onAddReview,
  onDeleteReview
}: CollegeReviewModalProps) => {
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    review_text: "",
    faculty_rating: 1,
    infrastructure_rating: 1,
    placements_rating: 1,
    comment: "",
    course: "",
    graduation_year: new Date().getFullYear(),
  });

  if (!college) return null;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const averageCategories = reviews.length > 0 ? {
    placements: (reviews.reduce((sum, review) => sum + review.placements_rating, 0) / reviews.length).toFixed(1),
    faculty: (reviews.reduce((sum, review) => sum + review.faculty_rating, 0) / reviews.length).toFixed(1),
    infrastructure: (reviews.reduce((sum, review) => sum + review.infrastructure_rating, 0) / reviews.length).toFixed(1),
  } : null;

  const handleSubmitReview = async () => {
    if (newReview.rating === 0 || !newReview.review_text) {
      alert("Please fill in all required fields and provide a rating");
      return;
    }

    try {
      console.log('Submitting review for college:', college.code);
      const savedReview = await saveReviewToSupabase({
        collegeCode: college.code,
        rating: newReview.rating,
        review_text: newReview.review_text,
        faculty_rating: newReview.faculty_rating,
        infrastructure_rating: newReview.infrastructure_rating,
        placements_rating: newReview.placements_rating,
        comment: newReview.comment || newReview.review_text,
        course: newReview.course,
        graduation_year: newReview.graduation_year,
      });

      if (savedReview) {
        console.log('Review saved successfully:', savedReview);
        onAddReview(savedReview);
        setNewReview({
          rating: 0,
          review_text: "",
          faculty_rating: 1,
          infrastructure_rating: 1,
          placements_rating: 1,
          comment: "",
          course: "",
          graduation_year: new Date().getFullYear(),
        });
        setShowAddReview(false);
      } else {
        console.error('Review save returned null');
        alert("Failed to save review. Please check the console for details and try again.");
      }
    } catch (error) {
      console.error("Error saving review:", error);
      alert(`Failed to save review: ${error.message || 'Unknown error'}. Please check the console for details.`);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    try {
      const success = await deleteReview(reviewId);
      if (success) {
        console.log('Review deleted successfully');
        onDeleteReview(reviewId);
      } else {
        alert("Failed to delete review. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(`Failed to delete review: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold break-words text-white">{college.name}</DialogTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-700 text-gray-200 border-gray-600">{college.code}</Badge>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <StarRating rating={Math.round(parseFloat(averageRating.toString()))} />
                <span>{averageRating}/5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Average Ratings */}
          {averageCategories && (
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="text-lg text-white">Average Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CategoryRating label="Placements" rating={parseFloat(averageCategories.placements)} />
                  <CategoryRating label="Faculty" rating={parseFloat(averageCategories.faculty)} />
                  <CategoryRating label="Infrastructure" rating={parseFloat(averageCategories.infrastructure)} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Reviews ({reviews.length})</h3>
              <Button onClick={() => setShowAddReview(!showAddReview)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                {showAddReview ? "Cancel" : "Add Review"}
              </Button>
            </div>

            {/* Add Review Form */}
            {showAddReview && (
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Write a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Overall Rating *</Label>
                    <StarRating 
                      rating={newReview.rating} 
                      onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                      interactive
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-white">Your Review *</Label>
                    <Textarea
                      value={newReview.review_text}
                      onChange={(e) => setNewReview(prev => ({ ...prev, review_text: e.target.value }))}
                      placeholder="Share your detailed experience..."
                      rows={4}
                      className="border-2 border-gray-600 bg-gray-800 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Course (Optional)</Label>
                      <Input
                        value={newReview.course}
                        onChange={(e) => setNewReview(prev => ({ ...prev, course: e.target.value }))}
                        placeholder="e.g., Computer Science"
                        className="border-2 border-gray-600 bg-gray-800 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Graduation Year (Optional)</Label>
                      <Input
                        type="number"
                        value={newReview.graduation_year}
                        onChange={(e) => setNewReview(prev => ({ ...prev, graduation_year: parseInt(e.target.value) || new Date().getFullYear() }))}
                        placeholder="2024"
                        min="2000"
                        max="2030"
                        className="border-2 border-gray-600 bg-gray-800 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white">Category Ratings</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CategoryRating 
                        label="Placements" 
                        rating={newReview.placements_rating} 
                        onRatingChange={(rating) => setNewReview(prev => ({ 
                          ...prev, 
                          placements_rating: rating
                        }))}
                        interactive
                      />
                      <CategoryRating 
                        label="Faculty" 
                        rating={newReview.faculty_rating} 
                        onRatingChange={(rating) => setNewReview(prev => ({ 
                          ...prev, 
                          faculty_rating: rating
                        }))}
                        interactive
                      />
                      <CategoryRating 
                        label="Infrastructure" 
                        rating={newReview.infrastructure_rating} 
                        onRatingChange={(rating) => setNewReview(prev => ({ 
                          ...prev, 
                          infrastructure_rating: rating
                        }))}
                        interactive
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSubmitReview} className="bg-blue-600 hover:bg-blue-700 text-white">Submit Review</Button>
                    <Button variant="outline" onClick={() => setShowAddReview(false)} className="border-gray-600 text-gray-300 hover:bg-gray-600">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="border-2 border-gray-600 hover:border-blue-400 transition-colors bg-gray-700">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} />
                            {review.verified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-200 font-medium leading-relaxed">{review.review_text}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-400" />
                            <span className="font-medium text-gray-300">{review.author}</span>
                            <span className="text-gray-500">•</span>
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4 text-green-400" />
                              <span className="font-medium text-gray-300">{review.helpful_votes}</span>
                            </div>
                            {isUserReview(review) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteReview(review.id)}
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                title="Delete your review"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No reviews yet</h3>
                    <p className="text-gray-400 mb-4">
                      Be the first to share your experience with this college!
                    </p>
                    <Button onClick={() => setShowAddReview(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Write First Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
