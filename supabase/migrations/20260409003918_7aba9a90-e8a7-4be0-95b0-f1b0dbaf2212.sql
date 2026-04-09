
CREATE TABLE public.tailoring_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  garment_type TEXT NOT NULL,
  garment_name TEXT NOT NULL,
  measurements JSONB NOT NULL DEFAULT '{}',
  special_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tailoring_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own tailoring orders"
ON public.tailoring_orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tailoring orders"
ON public.tailoring_orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tailoring orders"
ON public.tailoring_orders FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update all tailoring orders"
ON public.tailoring_orders FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete tailoring orders"
ON public.tailoring_orders FOR DELETE
TO authenticated
USING (public.is_admin());

CREATE TRIGGER update_tailoring_orders_updated_at
BEFORE UPDATE ON public.tailoring_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.tailoring_orders;
