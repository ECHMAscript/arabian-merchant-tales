import { useState } from "react";
import { BookmarkPlus, BookmarkCheck, ShoppingCart, ArrowLeft } from "lucide-react";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card max-h-[95vh] md:max-h-[90vh]">
        {/* Mobile Back Button */}
        <div className="md:hidden flex items-center gap-2 p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-display text-lg font-semibold text-foreground truncate">
            {product.name}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-0 overflow-y-auto max-h-[calc(95vh-60px)] md:max-h-[90vh]">
          {/* Left Side - Image & Options */}
          <div className="bg-muted/30 p-4 md:p-6 space-y-4 md:space-y-6">
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
            <div className="space-y-2">
              <h4 className="font-display text-sm font-medium text-foreground">Size</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg border text-sm font-body transition-all ${
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
            <div className="space-y-2">
              <h4 className="font-display text-sm font-medium text-foreground">Color</h4>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`relative w-9 h-9 md:w-10 md:h-10 rounded-full border-2 transition-all ${
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
            <div className="space-y-3 pt-3 border-t border-border">
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
          <div className="flex flex-col h-auto md:h-[600px] p-4 md:p-6">
            <ReviewSection
              itemId={product.id}
              itemType="product"
              itemName={product.name}
              rating={product.rating}
              reviewCount={product.reviewCount}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
