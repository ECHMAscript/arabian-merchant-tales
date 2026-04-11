import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DbProduct {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  image: string;
  category: string;
  is_new_arrival: boolean;
  is_preorder: boolean;
  created_at: string;
  rating: number;
  review_count: number;
  colors: any;
  has_sizes: boolean;
}

interface DbBook {
  id: string;
  title: string;
  author: string | null;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  image: string;
  category: string;
  quantity_left: number | null;
  volumes: string[] | null;
  created_at: string;
  rating: number;
  review_count: number;
}

export const useDbProducts = () => {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, refetch: fetchProducts };
};

export const useDbBooks = () => {
  const [books, setBooks] = useState<DbBook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBooks(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { books, loading, refetch: fetchBooks };
};

export const useDbNewArrivals = () => {
  const [arrivals, setArrivals] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArrivals = useCallback(async () => {
    // Get products explicitly marked OR created in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`is_new_arrival.eq.true,created_at.gte.${sevenDaysAgo.toISOString()}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setArrivals(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArrivals();
  }, [fetchArrivals]);

  return { arrivals, loading, refetch: fetchArrivals };
};
