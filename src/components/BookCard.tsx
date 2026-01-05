import { Star, Heart } from "lucide-react";
import { BookProduct } from "@/data/books";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";

interface BookCardProps {
  book: BookProduct;
  onClick: () => void;
}

const BookCard = ({ book, onClick }: BookCardProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(book.id);

  const isOutOfStock = book.quantityLeft === 0;
  const isLowStock = book.quantityLeft > 0 && book.quantityLeft <= 5;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(book);
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist!");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted"}`}
      />
    ));
  };

  return (
    <div
      className="group cursor-pointer bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={book.image}
          alt={book.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Quantity Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${
          isOutOfStock 
            ? "bg-destructive text-destructive-foreground" 
            : isLowStock 
              ? "bg-secondary text-secondary-foreground"
              : "bg-primary/90 text-primary-foreground"
        }`}>
          {isOutOfStock ? "Out of Stock" : `${book.quantityLeft} left`}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleHeartClick}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            inWishlist 
              ? "bg-destructive text-destructive-foreground" 
              : "bg-card/80 text-foreground hover:bg-card"
          }`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
        </button>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-background/90 rounded text-xs font-medium text-foreground">
          {book.subcategory}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground line-clamp-1 mb-1">
          {book.name}
        </h3>
        {book.arabicName && (
          <p className="font-body text-sm text-muted-foreground text-right mb-2" dir="rtl">
            {book.arabicName}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {renderStars(book.rating)}
            <span className="text-xs text-muted-foreground ml-1">({book.reviewCount})</span>
          </div>
          <span className="font-display font-bold text-primary">${book.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
