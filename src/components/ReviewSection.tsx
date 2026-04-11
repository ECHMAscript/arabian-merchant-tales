import { useState, useRef } from "react";
import { Star, Send, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useReviews } from "@/hooks/useReviews";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ReviewSectionProps {
  itemId: string | number | undefined;
  itemType: "product" | "book";
  itemName: string;
  rating: number;
  reviewCount: number;
}

const ReviewSection = ({ itemId, itemType, itemName, rating, reviewCount }: ReviewSectionProps) => {
  const { reviews, loading, submitReview } = useReviews(itemId, itemType);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderStars = (r: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        onClick={() => interactive && setNewRating(i + 1)}
        onMouseEnter={() => interactive && setHoverRating(i + 1)}
        onMouseLeave={() => interactive && setHoverRating(0)}
        className={`h-4 w-4 ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""} ${
          i < Math.floor(interactive ? (hoverRating || newRating) : r)
            ? "fill-primary text-primary"
            : "text-muted-foreground/30"
        }`}
      />
    ));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    
    const newFiles = [...imageFiles, ...toAdd];
    setImageFiles(newFiles);

    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setSubmitting(true);
    const result = await submitReview(newRating, newComment.trim(), imageFiles);
    setSubmitting(false);

    if (result.success) {
      toast.success("Review submitted!");
      setNewComment("");
      setNewRating(5);
      setImageFiles([]);
      setImagePreviews([]);
    } else if (result.error === "not_authenticated") {
      toast.error("Please log in or create an account to leave a review", {
        action: {
          label: "Sign In",
          onClick: () => window.location.href = "/auth?mode=login",
        },
      });
    } else {
      toast.error(result.error || "Failed to submit review");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-border">
        <h3 className="font-display text-lg font-semibold text-foreground">{itemName}</h3>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-0.5">{renderStars(rating)}</div>
          <span className="font-body text-sm text-muted-foreground">
            ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground font-body text-sm py-4">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-muted-foreground font-body text-sm py-4">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-3 bg-muted/30 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-medium text-foreground text-sm truncate">
                  {review.username}
                </span>
                <span className="font-body text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {formatDate(review.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
              {review.comment && (
                <p className="font-body text-sm text-muted-foreground break-words">{review.comment}</p>
              )}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {review.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Review image ${i + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(img, "_blank")}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      <div className="pt-3 border-t border-border space-y-2">
        <h4 className="font-display text-sm font-medium text-foreground">Write a Review</h4>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm text-muted-foreground">Rating:</span>
          <div className="flex items-center gap-0.5">{renderStars(newRating, true)}</div>
        </div>
        <Textarea
          placeholder="Share your experience..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="bg-background resize-none"
          rows={2}
        />

        {/* Image upload */}
        <div className="space-y-2">
          {imagePreviews.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {imagePreviews.map((preview, i) => (
                <div key={i} className="relative group">
                  <img src={preview} alt={`Upload ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-border" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {imageFiles.length < 4 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <ImagePlus className="h-4 w-4" />
              Add Photos ({imageFiles.length}/4)
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        <Button
          onClick={handleSubmit}
          variant="gold"
          className="w-full gap-2"
          disabled={submitting}
        >
          <Send className="h-4 w-4" />
          {submitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
};

export default ReviewSection;
