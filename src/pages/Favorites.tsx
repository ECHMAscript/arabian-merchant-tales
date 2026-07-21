import { Helmet } from "react-helmet-async";
import { Heart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useFavorites } from "@/contexts/FavoritesContext";
import { ProductCardProps } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const Favorites = () => {
  const { favorites, removeFavorite } = useFavorites();
  const navigate = useNavigate();

  const handleProductClick = (product: ProductCardProps) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <>
      <Helmet>
        <title>My Favorites - Rooh Al Andalus</title>
        <meta name="description" content="View your saved favorite items at Rooh Al Andalus." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-secondary fill-secondary" />
            <h1 className="font-display text-3xl font-bold text-foreground">My Favorites</h1>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl text-foreground mb-2">No favorites yet</h2>
              <p className="font-body text-muted-foreground">
                Start adding items to your favorites by clicking the heart icon on products.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300"
                >
                  <div
                    className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-full">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3
                      className="font-display text-foreground font-medium line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleProductClick(product)}
                    >
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg font-semibold text-foreground">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="font-body text-sm text-muted-foreground line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeFavorite(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

      </div>
    </>
  );
};

export default Favorites;
