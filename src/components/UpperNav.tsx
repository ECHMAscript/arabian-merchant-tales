import { Link, useNavigate } from "react-router-dom";
import { User, LogIn, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const UpperNav = () => {
  const { isAdmin, isAuthenticated, loading, toggleAdminMode, signOut } = useAdmin();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

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

          {/* Right side - Auth Links & Admin Toggle */}
          <div className="flex items-center gap-3">
            {/* Admin Mode Toggle - Only show to actual admins */}
            {isAuthenticated && !loading && (
              <div className="flex items-center gap-2 border-r border-card/20 pr-3 mr-1">
                <Shield className={`h-3 w-3 ${isAdmin ? 'text-gold' : 'text-card/60'}`} />
                <span className="hidden sm:inline text-xs text-card/70">Admin</span>
                <Switch
                  checked={isAdmin}
                  onCheckedChange={toggleAdminMode}
                  className="scale-75 data-[state=checked]:bg-gold"
                />
              </div>
            )}

            {loading ? (
              <div className="h-7 w-16 bg-card/10 rounded animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="text-card/80 hover:text-card hover:bg-card/10 gap-2 h-7 text-xs">
                    <User className="h-3 w-3" />
                    <span className="hidden sm:inline">My Account</span>
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-card/80 hover:text-card hover:bg-card/10 gap-1.5 h-7 text-xs"
                >
                  <LogOut className="h-3 w-3" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
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
