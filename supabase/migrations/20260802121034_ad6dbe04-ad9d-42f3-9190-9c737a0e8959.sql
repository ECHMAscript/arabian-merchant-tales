-- 1. Explicit deny SELECT on email_verification_tokens (service role bypasses RLS)
CREATE POLICY "Deny all selects from client"
ON public.email_verification_tokens
FOR SELECT
TO authenticated, anon
USING (false);

-- 2. Storage: ownership-checked uploads, no broad listing
DROP POLICY IF EXISTS "Authenticated users can upload review images" ON storage.objects;
CREATE POLICY "Users can upload their own review images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Review images are publicly accessible" ON storage.objects;
CREATE POLICY "Users can list their own review images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'review-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Lock down SECURITY DEFINER function execution
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_item_rating() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;

-- RLS policies evaluate these as the invoking role, so signed-in users need EXECUTE
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 4. Scope policies that reference is_admin()/auth.uid() to authenticated only
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders" ON public.orders
FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders" ON public.orders
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to their own wishlist" ON public.user_wishlist;
CREATE POLICY "Users can add to their own wishlist" ON public.user_wishlist
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove from their own wishlist" ON public.user_wishlist;
CREATE POLICY "Users can remove from their own wishlist" ON public.user_wishlist
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.user_wishlist;
CREATE POLICY "Users can view their own wishlist" ON public.user_wishlist
FOR SELECT TO authenticated USING (auth.uid() = user_id);