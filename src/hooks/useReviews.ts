import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  user_id: string;
  item_id: string;
  item_type: "product" | "book";
  rating: number;
  comment: string;
  created_at: string;
  username?: string;
}

export const useReviews = (itemId: string | number | undefined, itemType: "product" | "book") => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!itemId || typeof itemId !== "string") return;
    setLoading(true);

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("item_id", itemId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch usernames for each review
      const userIds = [...new Set(data.map((r: any) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p.username])
      );

      setReviews(
        data.map((r: any) => ({
          ...r,
          username: profileMap.get(r.user_id) || "Anonymous",
        }))
      );
    }
    setLoading(false);
  }, [itemId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async (rating: number, comment: string): Promise<{ success: boolean; error?: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "not_authenticated" };
    }
    if (!itemId || typeof itemId !== "string") {
      return { success: false, error: "Invalid item" };
    }

    const { error } = await supabase.from("reviews").upsert(
      {
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
        rating,
        comment,
      },
      { onConflict: "user_id,item_id" }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    await fetchReviews();
    return { success: true };
  };

  return { reviews, loading, submitReview, refetch: fetchReviews };
};
