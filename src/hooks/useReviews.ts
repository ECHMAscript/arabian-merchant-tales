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
  images?: string[];
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
          images: r.images || [],
        }))
      );
    }
    setLoading(false);
  }, [itemId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async (
    rating: number,
    comment: string,
    imageFiles?: File[]
  ): Promise<{ success: boolean; error?: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "not_authenticated" };
    }
    if (!itemId || typeof itemId !== "string") {
      return { success: false, error: "Invalid item" };
    }

    // Check 10-day cooldown
    const { data: existing } = await supabase
      .from("reviews")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("item_id", itemId)
      .maybeSingle();

    if (existing) {
      const lastReviewDate = new Date(existing.created_at);
      const now = new Date();
      const daysDiff = (now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < 10) {
        const daysLeft = Math.ceil(10 - daysDiff);
        return {
          success: false,
          error: `You've already reviewed this item. You can update your review in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`,
        };
      }
    }

    // Upload images if provided
    let imageUrls: string[] = [];
    if (imageFiles && imageFiles.length > 0) {
      const uploads = imageFiles.slice(0, 4);
      for (const file of uploads) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${itemId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("review-images")
          .upload(path, file);
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("review-images")
            .getPublicUrl(path);
          imageUrls.push(urlData.publicUrl);
        }
      }
    }

    const { error } = await supabase.from("reviews").upsert(
      {
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
        rating,
        comment,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      } as any,
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
