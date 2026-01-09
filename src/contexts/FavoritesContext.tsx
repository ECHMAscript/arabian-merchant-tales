import { createContext, useContext, useState, ReactNode } from "react";
import { ProductCardProps } from "@/components/ProductCard";

interface FavoritesContextType {
  favorites: ProductCardProps[];
  addFavorite: (product: ProductCardProps) => void;
  removeFavorite: (productId: number | string) => void;
  isFavorite: (productId: number | string) => boolean;
  toggleFavorite: (product: ProductCardProps) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<ProductCardProps[]>([]);

  const addFavorite = (product: ProductCardProps) => {
    setFavorites((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFavorite = (productId: number | string) => {
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
  };

  const isFavorite = (productId: number | string) => {
    return favorites.some((p) => p.id === productId);
  };

  const toggleFavorite = (product: ProductCardProps) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
