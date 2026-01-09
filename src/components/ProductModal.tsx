import { useState } from "react";
import { Star, X, Send, BookmarkPlus, BookmarkCheck, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number | string;
    name: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    image: string;
    category: string;
  } | null;
}

const mockReviews: Review[] = [
  {
    id: 1,
    author: "Sarah M.",
    rating: 5,
    comment: "Absolutely stunning craftsmanship! The quality exceeded my expectations.",
    date: "2 days ago",
  },
  {
    id: 2,
    author: "Ahmed K.",
    rating: 4,
    comment: "Beautiful piece, arrived well packaged. Minor color difference from photos.",
    date: "1 week ago",
  },
  {
    id: 3,
    author: "Maria L.",
    rating: 5,
    comment: "Perfect addition to my home. The artisan details are incredible!",
    date: "2 weeks ago",
  },
];

const sizes = ["XS", "S", "M", "L", "XL"];
const colors = [
  { name: "Gold", value: "#C9A962" },
  { name: "Burgundy", value: "#6B1D3A" },
  { name: "Sand", value: "#D4C5A9" },
  { name: "Black", value: "#1a1a1a" },
];

const ProductModal = ({ isOpen, onClose, product }: ProductModalProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>("Gold");
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [newReview, setNewReview] = useState({ author: "", rating: 5, comment: "" });
  
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      rating: product.rating,
      reviewCount: product.reviewCount,
      image: product.image,
      category: product.category,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist!");
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (r: number) => void) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        onClick={() => interactive && onSelect?.(index + 1)}
        className={`h-4 w-4 ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""} ${
          index < Math.floor(rating)
            ? "fill-gold text-gold"
            : index < rating
            ? "fill-gold/50 text-gold"
            : "text-border"
        }`}
      />
    ));
  };

  const handleSubmitReview = () => {
    if (newReview.author.trim() && newReview.comment.trim()) {
      const review: Review = {
        id: reviews.length + 1,
        author: newReview.author,
        rating: newReview.rating,
        comment: newReview.comment,
        date: "Just now",
      };
      setReviews([review, ...reviews]);
      setNewReview({ author: "", rating: 5, comment: "" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Side - Image & Options */}
          <div className="bg-muted/30 p-6 space-y-6">
            {/* Product Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.originalPrice && (
                <span className="absolute top-3 left-3 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <h4 className="font-display text-sm font-medium text-foreground">Size</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border text-sm font-body transition-all ${
                      selectedSize === size
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <h4 className="font-display text-sm font-medium text-foreground">Color</h4>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color.name
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {selectedColor === color.name && (
                      <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="font-body text-lg text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="gold" size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleWishlist}
                      className={inWishlist ? "text-primary border-primary" : ""}
                    >
                      {inWishlist ? (
                        <BookmarkCheck className="h-5 w-5" />
                      ) : (
                        <BookmarkPlus className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Right Side - Reviews */}
          <div className="flex flex-col h-[600px]">
            <DialogHeader className="p-6 pb-4 border-b border-border">
              <DialogTitle className="font-display text-xl">
                {product.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
                <span className="font-body text-sm text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            </DialogHeader>

            {/* Reviews List */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-muted/30 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-medium text-foreground">
                        {review.author}
                      </span>
                      <span className="font-body text-xs text-muted-foreground">
                        {review.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {renderStars(review.rating)}
                    </div>
                    <p className="font-body text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Add Review Form */}
            <div className="p-6 border-t border-border space-y-4">
              <h4 className="font-display text-sm font-medium text-foreground">
                Write a Review
              </h4>
              <Input
                placeholder="Your name"
                value={newReview.author}
                onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                className="bg-background"
              />
              <div className="flex items-center gap-2">
                <span className="font-body text-sm text-muted-foreground">Rating:</span>
                <div className="flex items-center gap-0.5">
                  {renderStars(newReview.rating, true, (r) =>
                    setNewReview({ ...newReview, rating: r })
                  )}
                </div>
              </div>
              <Textarea
                placeholder="Share your experience..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="bg-background resize-none"
                rows={3}
              />
              <Button onClick={handleSubmitReview} variant="gold" className="w-full gap-2">
                <Send className="h-4 w-4" />
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
