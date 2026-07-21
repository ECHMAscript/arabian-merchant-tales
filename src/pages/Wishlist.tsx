import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import BookModal from "@/components/BookModal";
import { BookProduct } from "@/data/books";
import { Button } from "@/components/ui/button";
import { Star, Trash2, ShoppingCart, BookMarked } from "lucide-react";
import { toast } from "sonner";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState<BookProduct | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const handleProductClick = (item: any) => {
    if (item.category === "books" || item.category === "school-supplies") {
      setSelectedBook(item as BookProduct);
      setIsBookModalOpen(true);
    } else {
      navigate(`/product/${item.id}`);
    }
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      rating: item.rating,
      reviewCount: item.reviewCount,
      image: item.image,
      category: item.subcategory || item.category,
    });
    toast.success(`${item.name} added to cart!`);
  };

  const handleRemove = (id: number | string) => {
    removeFromWishlist(id);
    toast.success("Removed from wishlist");
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
    <>
      <Helmet>
        <title>Wishlist - Rooh Al Andalus</title>
        <meta name="description" content="View and manage your wishlist items at Rooh Al Andalus." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <BookMarked className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              My Wishlist
            </h1>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {wishlist.length} items
            </span>
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <BookMarked className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="font-body text-muted-foreground text-lg mb-4">
                Your wishlist is empty.
              </p>
              <p className="font-body text-muted-foreground mb-6">
                Browse our collection and add items to your wishlist!
              </p>
              <Button onClick={() => window.location.href = "/books"}>
                Browse Books
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300"
                >
                  <div
                    className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                    onClick={() => handleProductClick(item)}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-foreground line-clamp-1 mb-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(item.rating)}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({item.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-primary">
                        ${item.price.toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        className="gap-1"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <BookModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          book={selectedBook}
        />

        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          product={selectedProduct}
        />
      </div>
    </>
  );
};

export default Wishlist;
