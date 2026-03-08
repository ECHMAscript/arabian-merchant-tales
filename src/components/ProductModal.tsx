import { useState } from "react";
import { BookmarkPlus, BookmarkCheck, ShoppingCart, ArrowLeft, MessageSquare, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ReviewSection from "@/components/ReviewSection";

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
  const [showReviews, setShowReviews] = useState(false);
  
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

  const renderStars = (r: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < Math.floor(r) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
      />
    ));

  const handleClose = () => {
    setShowReviews(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card">
          {/* Mobile Back Button */}
          <div className="md:hidden flex items-center gap-2 p-3 border-b border-border">
            <Button variant="ghost" size="icon" onClick={handleClose} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-display text-lg font-semibold text-foreground truncate">
              {product.name}
            </h2>
          </div>

          {/* Desktop: side-by-side | Mobile: stacked */}
          <div className="flex flex-col md:flex-row">
            {/* Image - largest element */}
            <div className="relative md:w-[55%] shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-56 md:h-full object-cover"
              />
              {product.originalPrice && (
                <span className="absolute top-3 left-3 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Details */}
            <div className="p-4 md:p-5 flex flex-col justify-between md:w-[45%]">
              {/* Name & Rating */}
              <div className="mb-3">
                <h2 className="hidden md:block font-display text-lg font-bold text-foreground">{product.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
                  <span className="font-body text-xs text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-3">
                <span className="font-display text-xl font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="font-body text-sm text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Color */}
              <div className="mb-3">
                <h4 className="font-display text-xs font-medium text-foreground mb-1.5">
                  Color: <span className="text-muted-foreground font-body">{selectedColor}</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color.name
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {selectedColor === color.name && (
                        <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md text-xs">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-3">
                <h4 className="font-display text-xs font-medium text-foreground mb-1.5">Size</h4>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-body transition-all ${
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

              {/* Reviews Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 mb-3"
                onClick={() => setShowReviews(true)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Reviews ({product.reviewCount})
              </Button>

              {/* Add to Cart & Wishlist */}
              <div className="flex gap-2">
                <Button variant="gold" className="flex-1 gap-2" onClick={handleAddToCart}>
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={handleWishlist}
                      className={inWishlist ? "text-primary border-primary" : ""}
                    >
                      {inWishlist ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4" />
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
        </DialogContent>
      </Dialog>

      {/* Reviews Side Panel */}
      <Sheet open={showReviews} onOpenChange={setShowReviews}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-border shrink-0">
            <SheetTitle className="font-display text-lg">Reviews</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <ReviewSection
              itemId={product.id}
              itemType="product"
              itemName={product.name}
              rating={product.rating}
              reviewCount={product.reviewCount}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProductModal;
