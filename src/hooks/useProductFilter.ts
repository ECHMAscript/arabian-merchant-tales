import { useState, useMemo, useCallback, useRef } from "react";
import { ExtendedProduct } from "@/data/products";

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  sizes: string[];
  inStock: boolean;
  preOrder: boolean;
}

const initialFilterState: FilterState = {
  categories: [],
  priceRange: [0, 1000],
  sizes: [],
  inStock: false,
  preOrder: false,
};

export const useProductFilter = (products: ExtendedProduct[]) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [debouncedPrice, setDebouncedPrice] = useState<[number, number]>([0, 1000]);
  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter - matches against product.category
      if (filters.categories.length > 0) {
        const matchesCategory = filters.categories.some((filterCat) => {
          // Exact match (e.g., product.category === "Men - Clothing")
          if (product.category === filterCat) return true;
          // Legacy support: match old flat categories like "Men" against any "Men - *" filter
          if (filterCat.startsWith(product.category + " - ")) return true;
          // Also match if product category starts with the filter's parent
          // e.g., product.category "Men" matches filter "Men - Clothing" loosely
          return false;
        });
        if (!matchesCategory) return false;
      }

      // Price range filter (use debounced value)
      if (product.price < debouncedPrice[0] || product.price > debouncedPrice[1]) {
        return false;
      }

      return true;
    });
  }, [products, filters.categories, debouncedPrice]);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === "priceRange") {
      if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
      priceTimerRef.current = setTimeout(() => {
        setDebouncedPrice(value as [number, number]);
      }, 200);
    }
  }, []);

  const toggleArrayFilter = (key: "categories" | "sizes", value: string) => {
    setFilters((prev) => {
      const currentArray = prev[key];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  };

  const resetFilters = () => {
    setFilters(initialFilterState);
    setDebouncedPrice([0, 1000]);
  };

  return {
    filters,
    filteredProducts,
    updateFilter,
    toggleArrayFilter,
    resetFilters,
  };
};
