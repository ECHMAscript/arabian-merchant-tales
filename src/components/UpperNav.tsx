import { Link } from "react-router-dom";
import { User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const UpperNav = () => {
  // This would be replaced with actual auth state
  const isLoggedIn = false;

  return (
    <div className="bg-foreground text-card py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Left side - Contact/Info */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-body text-card/80">
            <span>Free shipping on orders over $100</span>
            <span className="text-card/40">|</span>
            <span>✦ Authentic Arabian Craftsmanship</span>
          </div>

          {/* Mobile - Centered text */}
          <div className="sm:hidden flex-1 text-center text-xs font-body text-card/80">
            Free shipping on orders over $100
          </div>

          {/* Right side - Auth Links */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-card/80 hover:text-card hover:bg-card/10 gap-2 h-7 text-xs">
                  <User className="h-3 w-3" />
                  <span className="hidden sm:inline">My Account</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-card/80 hover:text-card hover:bg-card/10 gap-1.5 h-7 text-xs">
                    <LogIn className="h-3 w-3" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-primary/20 text-primary-foreground hover:bg-primary/30 h-7 text-xs px-3">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpperNav;