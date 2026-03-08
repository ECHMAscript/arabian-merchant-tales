-- 1. Add explicit admin-only UPDATE policies for content tables
CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update books"
ON public.books FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update articles"
ON public.articles FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update topics"
ON public.topics FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. Fix reviews public exposure: drop public SELECT, add authenticated-only SELECT
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Authenticated users can view reviews"
ON public.reviews FOR SELECT TO authenticated
USING (true);

-- 3. Add explicit RLS policies for email_verification_tokens
CREATE POLICY "Users can view own verification tokens"
ON public.email_verification_tokens FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Deny all inserts from client"
ON public.email_verification_tokens FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "Deny all updates from client"
ON public.email_verification_tokens FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "Deny all deletes from client"
ON public.email_verification_tokens FOR DELETE TO authenticated
USING (false);