import { ProductCardProps } from "@/components/ProductCard";

export interface ExtendedProduct extends Omit<ProductCardProps, 'id'> {
  id: number | string;
  gender?: "men" | "women" | "unisex";
  subcategory?: string;
  colors?: string[];
}

export const pages = [
  { name: "Home", path: "/" },
  { name: "Tailoring", path: "/tailoring" },
  { name: "Books", path: "/books" },
  { name: "New Arrivals", path: "/new-arrivals" },
  { name: "About", path: "/about" },
  { name: "Favorites", path: "/favorites" },
  { name: "Wishlist", path: "/wishlist" },
  { name: "Profile", path: "/profile" },
  { name: "Checkout", path: "/checkout" },
];
