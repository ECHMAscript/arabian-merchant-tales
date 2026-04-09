import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderNotificationProvider } from "@/contexts/OrderNotificationContext";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Wishlist from "./pages/Wishlist";
import NewArrivals from "./pages/NewArrivals";
import About from "./pages/About";
import Tailoring from "./pages/Tailoring";
import Books from "./pages/Books";
import Auth from "./pages/Auth";
import VerifyEmail from "./pages/VerifyEmail";
import Orders from "./pages/Orders";
import WorkOrders from "./pages/WorkOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AdminProvider>
            <OrderNotificationProvider>
            <FavoritesProvider>
              <CartProvider>
                <WishlistProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/new-arrivals" element={<NewArrivals />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/tailoring" element={<Tailoring />} />
                      <Route path="/books" element={<Books />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/verify-email" element={<VerifyEmail />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/work-orders" element={<WorkOrders />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </WishlistProvider>
              </CartProvider>
            </FavoritesProvider>
            </OrderNotificationProvider>
          </AdminProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
