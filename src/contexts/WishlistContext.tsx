import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { ProductCardProps } from "@/components/ProductCard";
import { BookProduct } from "@/data/books";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

type WishlistItem = ProductCardProps | BookProduct;

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (itemId: number | string) => void;
  isInWishlist: (itemId: number | string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  // Load wishlist from database when user logs in
  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_wishlist")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error loading wishlist:", error);
        return;
      }

      if (data) {
        const items = data.map((row) => row.item_data as unknown as WishlistItem);
        setWishlist(items);
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const addToWishlist = async (item: WishlistItem) => {
    // Optimistically update UI
    setWishlist((prev) => {
      if (prev.find((p) => p.id === item.id)) return prev;
      return [...prev, item];
    });

    // If user is logged in, persist to database
    if (user) {
      const itemType = "category" in item && item.category === "books" ? "book" : "product";
      
      const { error } = await supabase.from("user_wishlist").insert([{
        user_id: user.id,
        item_id: String(item.id),
        item_type: itemType,
        item_data: JSON.parse(JSON.stringify(item)) as Json,
      }]);

      if (error) {
        console.error("Error adding to wishlist:", error);
        // Revert on error
        setWishlist((prev) => prev.filter((p) => p.id !== item.id));
      }
    }
  };

  const removeFromWishlist = async (itemId: number | string) => {
    // Store item for potential revert
    const removedItem = wishlist.find((p) => p.id === itemId);
    
    // Optimistically update UI
    setWishlist((prev) => prev.filter((p) => p.id !== itemId));

    // If user is logged in, remove from database
    if (user) {
      const { error } = await supabase
        .from("user_wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", String(itemId));

      if (error) {
        console.error("Error removing from wishlist:", error);
        // Revert on error
        if (removedItem) {
          setWishlist((prev) => [...prev, removedItem]);
        }
      }
    }
  };

  const isInWishlist = (itemId: number | string) => {
    return wishlist.some((p) => p.id === itemId);
  };

  const toggleWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, loading }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
