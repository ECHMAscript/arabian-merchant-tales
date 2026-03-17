import { ShoppingCart, Menu, Heart, BookMarked, User, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import SearchDropdown from "./SearchDropdown";
import ProductModal from "./ProductModal";
import UpperNav from "./UpperNav";
import { ProductCardProps } from "./ProductCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuthContext } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductCardProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { hasAdminRole } = useAuthContext();

  const handleSearchProductClick = (product: ProductCardProps) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Upper Navigation Bar */}
      <UpperNav />

      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                <span className="font-display text-primary-foreground text-lg font-bold">ر</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg md:text-xl font-semibold text-foreground leading-tight">
                  Rooh Al Andalus
                </span>
                <span className="font-body text-xs text-muted-foreground hidden md:block">
                  روح الأندلس
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { to: "/", label: "Home" },
                { to: "/tailoring", label: "Tailoring" },
                { to: "/books", label: "Books" },
                { to: "/new-arrivals", label: "New Arrivals" },
                { to: "/about", label: "About" },
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `font-body transition-colors duration-200 border-b-2 pb-0.5 ${
                      isActive
                        ? "text-primary border-primary font-medium"
                        : "text-foreground hover:text-primary border-transparent"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:block">
                <SearchDropdown onProductClick={handleSearchProductClick} />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hidden md:flex"
                onClick={() => navigate('/wishlist')}
                title="Wishlist"
              >
                <BookMarked className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                    {wishlist.length}
                  </span>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hidden md:flex"
                onClick={() => navigate('/favorites')}
                title="Favorites"
              >
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                    {favorites.length}
                  </span>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hidden md:flex"
                onClick={() => navigate('/profile')}
                title="My Profile"
              >
                <User className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => navigate('/checkout')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-slide-up">
              <div className="flex flex-col gap-4">
                {[
                  { to: "/", label: "Home" },
                  { to: "/tailoring", label: "Tailoring" },
                  { to: "/books", label: "Books" },
                  { to: "/new-arrivals", label: "New Arrivals" },
                  { to: "/about", label: "About" },
                  { to: "/wishlist", label: `Wishlist (${wishlist.length})` },
                  { to: "/favorites", label: `Favorites (${favorites.length})` },
                  { to: "/profile", label: "Profile" },
                ].map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      `font-body transition-colors px-2 py-2 ${
                        isActive
                          ? "text-primary font-medium"
                          : "text-foreground hover:text-primary"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </>
  );
};

export default Navbar;
