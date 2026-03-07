-- Add rating and review_count columns to products and books tables
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS rating numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.books 
  ADD COLUMN IF NOT EXISTS rating numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count integer NOT NULL DEFAULT 0;

-- Create reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('product', 'book')),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY "Users can insert own reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Function to recalculate item rating after review changes
CREATE OR REPLACE FUNCTION public.update_item_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  avg_rating numeric;
  total_reviews integer;
  target_item_id uuid;
  target_type text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_item_id := OLD.item_id;
    target_type := OLD.item_type;
  ELSE
    target_item_id := NEW.item_id;
    target_type := NEW.item_type;
  END IF;

  SELECT COALESCE(AVG(r.rating), 0), COUNT(*)
  INTO avg_rating, total_reviews
  FROM public.reviews r
  WHERE r.item_id = target_item_id;

  IF target_type = 'product' THEN
    UPDATE public.products
    SET rating = ROUND(avg_rating, 1), review_count = total_reviews
    WHERE id = target_item_id;
  ELSIF target_type = 'book' THEN
    UPDATE public.books
    SET rating = ROUND(avg_rating, 1), review_count = total_reviews
    WHERE id = target_item_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-update ratings
CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_item_rating();

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;