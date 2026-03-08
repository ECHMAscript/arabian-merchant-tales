import { useState, useMemo } from "react";
import { ExtendedProduct } from "@/data/products";

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  preOrder: boolean;
}

const initialFilterState: FilterState = {
  categories: [],
  priceRange: [0, 1000],
  sizes: [],
  colors: [],
  inStock: false,
  preOrder: false,
};

export const useProductFilter = (products: ExtendedProduct[]) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

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

      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Colors filter
      if (filters.colors.length > 0) {
        if (!product.colors || !product.colors.some((c) => filters.colors.includes(c.name))) {
          return false;
        }
      }

      return true;
    });
  }, [products, filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: "categories" | "sizes" | "colors", value: string) => {
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
  };

  return {
    filters,
    filteredProducts,
    updateFilter,
    toggleArrayFilter,
    resetFilters,
  };
};
