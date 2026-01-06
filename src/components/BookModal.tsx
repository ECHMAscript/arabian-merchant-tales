import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookProduct } from "@/data/books";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { Star, BookmarkPlus, BookmarkCheck, ShoppingCart, Package, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookProduct | null;
}

const BookModal = ({ isOpen, onClose, book }: BookModalProps) => {
  const [selectedVolumes, setSelectedVolumes] = useState<number[]>([]);
  const [buyFullSet, setBuyFullSet] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [requestOrderEmail, setRequestOrderEmail] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [quantityError, setQuantityError] = useState("");
  
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Reset form state when book changes
  const handleClose = () => {
    setShowRequestForm(false);
    setRequestOrderEmail("");
    setQuantityError("");
    setQuantity(1);
    setSelectedVolumes([]);
    setBuyFullSet(false);
    onClose();
  };

  if (!book) return null;

  const isOutOfStock = book.quantityLeft === 0;
  const isLowStock = book.quantityLeft > 0 && book.quantityLeft <= 5;
  const isBook = book.category === "books";
  const inWishlist = isInWishlist(book.id);

  const handleQuantityChange = (value: number) => {
    setQuantityError("");
    if (value > book.quantityLeft) {
      setQuantityError(`Only ${book.quantityLeft} available in stock`);
      setQuantity(book.quantityLeft);
    } else if (value < 1) {
      setQuantity(1);
    } else {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      setShowRequestForm(true);
      return;
    }

    if (quantity > book.quantityLeft) {
      setQuantityError(`Only ${book.quantityLeft} available in stock`);
      return;
    }

    const cartItem = {
      id: book.id,
      name: book.name,
      price: isBook && buyFullSet && book.volumes ? book.price * book.volumes : book.price * quantity,
      rating: book.rating,
      reviewCount: book.reviewCount,
      image: book.image,
      category: book.subcategory,
    };

    addToCart(cartItem);
    toast.success(`${book.name} added to cart!`);
    onClose();
  };

  const handleRequestOrder = () => {
    if (!requestOrderEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    toast.success("Request order placed! We'll notify you when it's available.");
    setShowRequestForm(false);
    setRequestOrderEmail("");
    onClose();
  };

  const handleWishlist = () => {
    toggleWishlist(book);
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist!");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted"}`}
      />
    ));
  };

  const toggleVolume = (vol: number) => {
    setBuyFullSet(false);
    setSelectedVolumes((prev) =>
      prev.includes(vol) ? prev.filter((v) => v !== vol) : [...prev, vol]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left: Image */}
          <div className="relative aspect-[3/4] md:aspect-auto">
            <img
              src={book.image}
              alt={book.name}
              className="w-full h-full object-cover"
            />
            {/* Stock Badge */}
            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
              isOutOfStock 
                ? "bg-destructive text-destructive-foreground" 
                : isLowStock 
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
            }`}>
              {isOutOfStock ? "Out of Stock" : `${book.quantityLeft} left`}
            </div>
          </div>

          {/* Right: Details */}
          <div className="p-6 flex flex-col">
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                {book.name}
              </h2>
              {book.arabicName && (
                <p className="font-body text-lg text-muted-foreground mb-2 text-right" dir="rtl">
                  {book.arabicName}
                </p>
              )}
              
              {book.author && (
                <p className="font-body text-sm text-muted-foreground mb-2">
                  by {book.author}
                </p>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div className="flex">{renderStars(book.rating)}</div>
                <span className="font-body text-sm text-muted-foreground">
                  ({book.reviewCount} reviews)
                </span>
              </div>

              {book.description && (
                <p className="font-body text-muted-foreground mb-4">
                  {book.description}
                </p>
              )}

              {/* Book-specific options */}
              {isBook && book.volumes && book.volumes > 1 && (
                <div className="mb-4">
                  <Label className="font-display text-sm font-medium mb-3 block">
                    Select Volumes ({book.volumes} volumes available)
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Array.from({ length: book.volumes }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => toggleVolume(i + 1)}
                        disabled={isOutOfStock}
                        className={`w-10 h-10 rounded-lg border-2 font-body text-sm transition-all ${
                          selectedVolumes.includes(i + 1)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-foreground hover:border-primary"
                        } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={buyFullSet}
                      onChange={(e) => {
                        setBuyFullSet(e.target.checked);
                        if (e.target.checked) setSelectedVolumes([]);
                      }}
                      disabled={isOutOfStock}
                      className="rounded border-border"
                    />
                    <span className="font-body text-sm">
                      Buy complete set (All {book.volumes} volumes) - ${(book.price * book.volumes).toFixed(2)}
                    </span>
                  </label>
                </div>
              )}

              {/* School supplies quantity */}
              {!isBook && (
                <div className="mb-4">
                  <Label className="font-display text-sm font-medium mb-2 block">
                    Quantity
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1 || isOutOfStock}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-20 text-center"
                      min={1}
                      max={book.quantityLeft}
                      disabled={isOutOfStock}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= book.quantityLeft || isOutOfStock}
                    >
                      +
                    </Button>
                  </div>
                  {quantityError && (
                    <p className="flex items-center gap-1 text-destructive text-sm mt-2">
                      <AlertCircle className="h-4 w-4" />
                      {quantityError}
                    </p>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="mb-4">
                <p className="font-display text-2xl font-bold text-primary">
                  ${isBook 
                    ? buyFullSet && book.volumes 
                      ? (book.price * book.volumes).toFixed(2)
                      : selectedVolumes.length > 0 
                        ? (book.price * selectedVolumes.length).toFixed(2)
                        : book.price.toFixed(2)
                    : (book.price * quantity).toFixed(2)
                  }
                </p>
                {isBook && !buyFullSet && selectedVolumes.length === 0 && book.volumes && book.volumes > 1 && (
                  <p className="font-body text-sm text-muted-foreground">per volume</p>
                )}
              </div>

              {/* Request Order Form */}
              {showRequestForm && (
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <p className="font-body text-sm text-foreground mb-3">
                    <Package className="inline h-4 w-4 mr-2" />
                    This item is out of stock. Enter your email to be notified when available.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={requestOrderEmail}
                      onChange={(e) => setRequestOrderEmail(e.target.value)}
                    />
                    <Button onClick={handleRequestOrder}>
                      Request
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleAddToCart}
                className="flex-1 gap-2"
                disabled={isOutOfStock && showRequestForm}
              >
                <ShoppingCart className="h-4 w-4" />
                {isOutOfStock ? "Request Order" : "Add to Cart"}
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
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
      </DialogContent>
    </Dialog>
  );
};

export default BookModal;
