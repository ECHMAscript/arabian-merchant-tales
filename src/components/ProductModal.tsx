import { useState } from "react";
import { BookmarkPlus, BookmarkCheck, ShoppingCart, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ReviewSection from "@/components/ReviewSection";

interface ColorVariant {
  name: string;
  value: string;
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
    colors?: ColorVariant[];
    isPreorder?: boolean;
  } | null;
}

const sizes = ["XS", "S", "M", "L", "XL"];
const DEFAULT_COLORS: ColorVariant[] = [
  { name: "Gold", value: "#C9A962" },
  { name: "Burgundy", value: "#6B1D3A" },
  { name: "Sand", value: "#D4C5A9" },
  { name: "Black", value: "#1a1a1a" },
];

const ProductModal = ({ isOpen, onClose, product }: ProductModalProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [showReviews, setShowReviews] = useState(false);
  
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const hasColors = product.colors && product.colors.length > 0;
  const productColors = hasColors ? product.colors! : DEFAULT_COLORS;
  
  // Auto-select first color if current selection isn't valid
  const activeColor = productColors.find(c => c.name === selectedColor) 
    ? selectedColor 
    : productColors[0]?.name || "";

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
        className={`h-4 w-4 ${i < Math.floor(r) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
      />
    ));

  const handleClose = () => {
    setShowReviews(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-w-[700px] w-[95vw] max-h-[90vh] p-0 overflow-hidden bg-card rounded-lg">
        {/* Mobile Back Button */}
        <div className="md:hidden flex items-center gap-2 p-3 border-b border-border absolute top-0 left-0 right-0 z-10 bg-card">
          <Button variant="ghost" size="icon" onClick={showReviews ? () => setShowReviews(false) : handleClose} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-display text-lg font-semibold text-foreground truncate">
            {showReviews ? "Reviews" : product.name}
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full h-full overflow-hidden">
          <div 
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: showReviews ? "translateX(-100%)" : "translateX(0)" }}
          >
            {/* Slide 1: Product Details */}
            <div className="w-full h-full shrink-0 flex flex-col md:flex-row pt-12 md:pt-0 overflow-y-auto md:overflow-hidden">
              {/* Image */}
              <div className="relative w-full md:w-1/2 h-[35vh] md:h-auto md:min-h-[350px] md:max-h-[70vh] shrink-0">
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

              {/* Details */}
              <div className="flex-1 p-4 md:p-6 flex flex-col justify-between overflow-y-auto md:max-h-[70vh]">
                <div className="space-y-4">
                  {/* Name & Rating */}
                  <div>
                    <h2 className="hidden md:block font-display text-xl font-bold text-foreground">{product.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
                      <span className="font-body text-sm text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="font-body text-base text-muted-foreground line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Color */}
                  <div>
                    <h4 className="font-display text-sm font-medium text-foreground mb-2">
                      Color: <span className="text-muted-foreground font-body">{activeColor}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {productColors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                            activeColor === color.name
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border hover:border-primary"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {activeColor === color.name && (
                            <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md text-sm">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <h4 className="font-display text-sm font-medium text-foreground mb-2">Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-body transition-all ${
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
                </div>

                {/* Actions */}
                <div className="space-y-3 mt-4">
                  {/* Reviews Button */}
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setShowReviews(true)}
                  >
                    View Reviews ({product.reviewCount})
                    <ArrowRight className="h-4 w-4" />
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
            </div>

            {/* Slide 2: Reviews */}
            <div className="w-full h-full shrink-0 flex flex-col pt-14 md:pt-0">
              {/* Desktop back header */}
              <div className="hidden md:flex items-center gap-2 p-4 border-b border-border">
                <Button variant="ghost" size="icon" onClick={() => setShowReviews(false)} className="shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Reviews for {product.name}
                </h2>
              </div>
              <div className="flex-1 p-5 overflow-y-auto">
                <ReviewSection
                  itemId={product.id}
                  itemType="product"
                  itemName={product.name}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
