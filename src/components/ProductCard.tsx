import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import { useDeleteItem } from "@/hooks/useDeleteItem";

export interface ProductCardProps {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  isPreorder?: boolean;
}

interface ProductCardComponentProps extends ProductCardProps {
  onClick?: () => void;
  onDeleted?: () => void;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  rating,
  reviewCount,
  image,
  category,
  onClick,
  onDeleted,
}: ProductCardComponentProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { deleteItem } = useDeleteItem();
  const isLiked = isFavorite(id);

  const isDbProduct = typeof id === "string";

  const handleDelete = () => {
    if (isDbProduct) {
      deleteItem("products", id as string, name, onDeleted);
    } else {
      toast.error("Static items cannot be deleted from the database");
    }
  };

  const product: ProductCardProps = {
    id,
    name,
    price,
    originalPrice,
    rating,
    reviewCount,
    image,
    category,
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${name} added to cart`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-3.5 w-3.5 ${
          index < Math.floor(rating)
            ? "fill-gold text-gold"
            : index < rating
            ? "fill-gold/50 text-gold"
            : "text-border"
        }`}
      />
    ));
  };

  return (
    <div
      className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Image Container - 75% of card */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-3 py-1 bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-full">
          {category}
        </span>

        {/* Like Button */}
        <button
          onClick={handleHeartClick}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
            isLiked
              ? "bg-secondary text-secondary-foreground"
              : "bg-card/80 backdrop-blur-sm text-foreground hover:bg-card"
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        </button>

        {/* Admin Delete Button */}
        <div className="absolute top-3 right-14">
          <AdminDeleteButton onDelete={handleDelete} itemName={name} />
        </div>

        {/* Quick Add Button */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-foreground/60 to-transparent transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <Button variant="hero" size="sm" className="w-full gap-2" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>

        {/* Sale Badge */}
        {originalPrice && (
          <span className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full">
            {Math.round((1 - price / originalPrice) * 100)}% OFF
          </span>
        )}
      </div>

      {/* Product Info - 25% of card */}
      <div className="p-4 space-y-2">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">{renderStars(rating)}</div>
          <span className="font-body text-xs text-muted-foreground">
            ({reviewCount})
          </span>
        </div>

        {/* Name */}
        <h3 className="font-display text-foreground font-medium line-clamp-1 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold text-foreground">
            ${price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="font-body text-sm text-muted-foreground line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
