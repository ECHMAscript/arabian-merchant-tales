
-- Add profile detail columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name text DEFAULT '',
ADD COLUMN IF NOT EXISTS last_name text DEFAULT '',
ADD COLUMN IF NOT EXISTS phone text DEFAULT '',
ADD COLUMN IF NOT EXISTS bio text DEFAULT '',
ADD COLUMN IF NOT EXISTS address text DEFAULT '',
ADD COLUMN IF NOT EXISTS city text DEFAULT '',
ADD COLUMN IF NOT EXISTS country text DEFAULT '',
ADD COLUMN IF NOT EXISTS postal_code text DEFAULT '';

-- Add images column to reviews
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for review images
CREATE POLICY "Review images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'review-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own review images"
ON storage.objects FOR DELETE
USING (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);
