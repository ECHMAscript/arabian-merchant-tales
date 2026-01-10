-- Add DELETE policies for products table
CREATE POLICY "Authenticated users can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (true);

-- Add DELETE policies for books table
CREATE POLICY "Authenticated users can delete books"
ON public.books
FOR DELETE
TO authenticated
USING (true);

-- Add DELETE policies for articles table
CREATE POLICY "Authenticated users can delete articles"
ON public.articles
FOR DELETE
TO authenticated
USING (true);

-- Add DELETE policies for topics table
CREATE POLICY "Authenticated users can delete topics"
ON public.topics
FOR DELETE
TO authenticated
USING (true);