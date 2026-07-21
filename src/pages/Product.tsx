import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Star, ShoppingCart, BookmarkPlus, BookmarkCheck, Minus, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import ReviewSection from "@/components/ReviewSection";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";

interface ColorVariant {
  name: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  colors: ColorVariant[];
  isPreorder: boolean;
  hasSizes: boolean;
  description?: string;
}

const SIZES = ["XS", "S", "M", "L", "XL"];

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        const colors: ColorVariant[] = Array.isArray(data.colors)
          ? (data.colors as any[]).map((c) => ({ name: c.name || "", value: c.value || "" }))
          : [];
        setProduct({
          id: data.id,
          name: data.title,
          price: Number(data.price),
          originalPrice: data.original_price ? Number(data.original_price) : undefined,
          rating: Number(data.rating) || 0,
          reviewCount: data.review_count || 0,
          image: data.image,
          category: data.category,
          colors,
          isPreorder: !!data.is_preorder,
          hasSizes: data.has_sizes !== false,
          description: (data as any).description || undefined,
        });
        if (colors[0]) setSelectedColor(colors[0].name);
      }
      setLoading(false);
    })();
  }, [id]);

  const renderStars = (r: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(r) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
      />
    ));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center font-body text-muted-foreground">
          Loading product…
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="font-display text-2xl text-foreground mb-4">Product not found</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Back to store
          </Button>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          rating: product.rating,
          reviewCount: product.reviewCount,
          image: product.image,
          category: product.category,
        },
        product.hasSizes ? selectedSize : undefined,
        product.colors.length > 0 ? selectedColor : undefined,
      );
    }
    toast.success(
      product.isPreorder
        ? `${product.name} pre-ordered!`
        : `${quantity} × ${product.name} added to cart`,
    );
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist!");
  };

  return (
    <>
      <Helmet>
        <title>{product.name} — Rooh Al Andalus</title>
        <meta name="description" content={`${product.name} — ${product.category}. Handcrafted at Rooh Al Andalus.`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-6 md:py-10">
          {/* Back link */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            {/* Image */}
            <div className="relative bg-card rounded-2xl overflow-hidden shadow-card">
              <div className="aspect-[4/5] w-full">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute top-4 left-4 px-3 py-1 bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-full">
                {product.category}
              </span>
              {product.originalPrice && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </span>
              )}
              {product.isPreorder && (
                <span className="absolute bottom-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Pre-order Only
                </span>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-1">{renderStars(product.rating)}</div>
                <span className="font-body text-sm text-foreground font-medium">
                  {product.rating.toFixed(1)}
                </span>
                <span className="font-body text-sm text-muted-foreground">
                  · {product.reviewCount} reviews
                </span>
              </div>

              <div className="flex items-baseline gap-3 mt-6">
                <span className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="font-body text-lg text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {product.isPreorder && (
                <p className="font-body text-sm text-primary font-medium mt-4">
                  ⏳ This item is currently not in stock — available for pre-order only.
                </p>
              )}

              {product.description && (
                <p className="font-body text-base text-muted-foreground mt-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Colors */}
              {product.colors.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                    Color: <span className="text-foreground font-medium normal-case tracking-normal">{selectedColor}</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color.name
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.hasSizes && (
                <div className="mt-8">
                  <h3 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                    Select your size
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[52px] px-4 py-2.5 rounded-full font-body text-sm transition-all ${
                          selectedSize === size
                            ? "bg-primary text-primary-foreground shadow-gold"
                            : "bg-card border border-border text-foreground hover:border-primary"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-8">
                <h3 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  Quantity
                </h3>
                <div className="inline-flex items-center gap-1 bg-card border border-border rounded-full p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2.5rem] text-center font-body font-medium text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex items-center gap-3">
                <Button
                  variant="gold"
                  size="lg"
                  className="flex-1 h-14 rounded-full gap-2 font-body tracking-wide"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.isPreorder ? "PRE-ORDER NOW" : "ADD TO BAG"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWishlist}
                  className={`h-14 w-14 rounded-full ${inWishlist ? "text-primary border-primary" : ""}`}
                  aria-label="Toggle wishlist"
                >
                  {inWishlist ? (
                    <BookmarkCheck className="h-5 w-5" />
                  ) : (
                    <BookmarkPlus className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <section className="mt-16 md:mt-24 max-w-4xl">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
              Read &amp; Write Reviews
            </h2>
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <ReviewSection
                itemId={product.id}
                itemType="product"
                itemName={product.name}
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default ProductPage;
