
-- Add columns to orders for request orders and guest users
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type text NOT NULL DEFAULT 'standard';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_guest boolean NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancel_reason text;

-- Allow admins to delete orders (for cancel)
CREATE POLICY "Admins can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (is_admin());

-- Allow authenticated users to insert orders (not just via user_id match for guest-like flow)
-- Already have: Users can create their own orders

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
