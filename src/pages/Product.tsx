import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, ChevronLeft, Star, ShoppingCart, Heart, Minus, Plus, MessageSquare } from "lucide-react";
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
  const [showReviews, setShowReviews] = useState(false);

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

        <main className="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="mb-6 font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/" className="hover:text-primary transition-colors">{product.category}</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Image */}
            <div className="relative bg-card rounded-2xl overflow-hidden shadow-card">
              <div className="aspect-square w-full">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
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

            {/* Right side: sliding carousel between Details and Reviews */}
            <div className="relative overflow-hidden lg:h-full">
              <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: showReviews ? "translateX(-50%)" : "translateX(0%)", width: "200%" }}
              >
                {/* Details panel */}
                <div className="w-1/2 pr-4 flex flex-col h-full">

                  <p className="font-body text-xs tracking-[0.2em] uppercase text-primary mb-2">
                    {product.category}
                  </p>
                  <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground leading-tight">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
                    <span className="font-body text-sm text-foreground font-medium">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="font-body text-sm text-muted-foreground">
                      · {product.reviewCount} reviews
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 mt-5">
                    <span className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="font-body text-base text-muted-foreground line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {product.isPreorder && (
                    <p className="font-body text-sm text-primary font-medium mt-3">
                      ⏳ Currently not in stock — available for pre-order only.
                    </p>
                  )}

                  {product.description && (
                    <p className="font-body text-sm text-muted-foreground mt-4 leading-relaxed">
                      {product.description}
                    </p>
                  )}


                  {/* Colors */}
                  {product.colors.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
                        Color: <span className="text-foreground font-medium normal-case tracking-normal">{selectedColor}</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(color.name)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
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
                    <div className="mt-6">
                      <h3 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
                        Select your size
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {SIZES.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-[44px] px-3 py-2 rounded-full font-body text-sm transition-all ${
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

                  {/* Bottom-anchored controls */}
                  <div className="mt-auto pt-6">
                  {/* Quantity */}
                  <div>

                    <h3 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
                      Quantity
                    </h3>
                    <div className="inline-flex items-center gap-1 bg-card border border-border rounded-full p-1">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2.5rem] text-center font-body font-medium text-foreground">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center gap-2">
                    <Button
                      variant="gold"
                      size="lg"
                      className="flex-1 h-12 rounded-full gap-2 font-body tracking-wide"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.isPreorder ? "PRE-ORDER NOW" : "ADD TO BAG"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleWishlist}
                      className={`h-12 w-12 rounded-full ${inWishlist ? "text-primary border-primary" : ""}`}
                      aria-label="Toggle wishlist"
                    >
                      <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  {/* See reviews button */}
                  <button
                    onClick={() => setShowReviews(true)}
                    className="mt-3 w-full h-12 rounded-full border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center gap-2 font-body text-sm tracking-wide text-foreground"
                  >
                    <MessageSquare className="h-4 w-4" />
                    READ &amp; WRITE REVIEWS
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  </div>
                </div>


                {/* Reviews panel */}
                <div className="w-1/2 pl-4 flex flex-col">
                  <div className="bg-card rounded-2xl border border-border p-5 max-h-[600px] overflow-y-auto">
                    <button
                      onClick={() => setShowReviews(false)}
                      className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors font-body text-xs tracking-wide text-foreground"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      BACK TO PIECE
                    </button>
                    <ReviewSection
                      itemId={product.id}
                      itemType="product"
                      itemName={product.name}
                      rating={product.rating}
                      reviewCount={product.reviewCount}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProductPage;
