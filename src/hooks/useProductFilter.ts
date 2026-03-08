import { useState, useMemo } from "react";
import { ExtendedProduct } from "@/data/products";

export interface FilterState {
  gender: string[];
  subcategories: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  preOrder: boolean;
}

const initialFilterState: FilterState = {
  gender: [],
  subcategories: [],
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
      // Gender filter
      if (filters.gender.length > 0) {
        if (!product.gender || !filters.gender.includes(product.gender)) {
          // Check if unisex items should be included
          if (product.gender !== "unisex") {
            return false;
          }
        }
      }

      // Subcategory filter
      if (filters.subcategories.length > 0) {
        if (!product.subcategory || !filters.subcategories.includes(product.subcategory)) {
          return false;
        }
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

  const toggleArrayFilter = (key: "gender" | "subcategories" | "sizes" | "colors", value: string) => {
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
