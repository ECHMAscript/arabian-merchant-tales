import { ShoppingCart, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <span className="font-display text-primary-foreground text-lg font-bold">S</span>
            </div>
            <span className="font-display text-xl md:text-2xl font-semibold text-foreground">
              Souk<span className="text-primary">Luxe</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="font-body text-foreground hover:text-primary transition-colors duration-200">
              Home
            </a>
            <a href="#" className="font-body text-foreground hover:text-primary transition-colors duration-200">
              Collections
            </a>
            <a href="#" className="font-body text-foreground hover:text-primary transition-colors duration-200">
              New Arrivals
            </a>
            <a href="#" className="font-body text-foreground hover:text-primary transition-colors duration-200">
              About
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                3
              </span>
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
              <a href="#" className="font-body text-foreground hover:text-primary transition-colors px-2 py-2">
                Home
              </a>
              <a href="#" className="font-body text-foreground hover:text-primary transition-colors px-2 py-2">
                Collections
              </a>
              <a href="#" className="font-body text-foreground hover:text-primary transition-colors px-2 py-2">
                New Arrivals
              </a>
              <a href="#" className="font-body text-foreground hover:text-primary transition-colors px-2 py-2">
                About
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
