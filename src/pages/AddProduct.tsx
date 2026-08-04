import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Plus, Minus, X, ArrowLeft, ImageIcon, Star, ShoppingBag, Heart } from "lucide-react";

interface ColorVariant {
  name: string;
  value: string;
}

type ProductType = "product" | "book" | "school-supply" | "carousel";

const PRESET_COLORS = [
  { name: "Gold", value: "#C9A962" },
  { name: "Burgundy", value: "#6B1D3A" },
  { name: "Sand", value: "#D4C5A9" },
  { name: "Black", value: "#1a1a1a" },
  { name: "White", value: "#F5F5F0" },
  { name: "Navy", value: "#1B2A4A" },
  { name: "Olive", value: "#556B2F" },
  { name: "Rust", value: "#8B4513" },
  { name: "Cream", value: "#FFFDD0" },
  { name: "Charcoal", value: "#36454F" },
];

const SIZES = ["S", "M", "L", "XL"];

const AddProduct = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [searchParams] = useSearchParams();
  const typeParam = (searchParams.get("type") || "product") as ProductType;
  const productType: ProductType = ["product", "book", "school-supply", "carousel"].includes(typeParam)
    ? typeParam
    : "product";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    description: "",
    category: "",
    subcategory: "",
    image: "",
    quantity: "10",
    discount: "",
    isNew: false,
    isBestseller: false,
    isPreorder: false,
    isInStock: true,
    author: "",
  });
  const [hasColorVariants, setHasColorVariants] = useState(true);
  const [hasSizes, setHasSizes] = useState(true);
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  const [colorCount, setColorCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
  }, [isAdmin]);

  const handleColorCountChange = (newCount: number) => {
    if (newCount < 0 || newCount > 10) return;
    setColorCount(newCount);
    if (newCount > colorVariants.length) {
      const additional = Array.from({ length: newCount - colorVariants.length }, (_, i) => {
        const presetIdx = colorVariants.length + i;
        const preset = PRESET_COLORS[presetIdx % PRESET_COLORS.length];
        return { name: preset.name, value: preset.value };
      });
      setColorVariants([...colorVariants, ...additional]);
    } else {
      setColorVariants(colorVariants.slice(0, newCount));
    }
  };

  const updateColor = (index: number, field: "name" | "value", val: string) => {
    const updated = [...colorVariants];
    updated[index] = { ...updated[index], [field]: val };
    setColorVariants(updated);
  };

  const removeColor = (index: number) => {
    const updated = colorVariants.filter((_, i) => i !== index);
    setColorVariants(updated);
    setColorCount(updated.length);
  };

  const selectPresetColor = (index: number, preset: typeof PRESET_COLORS[0]) => {
    const updated = [...colorVariants];
    updated[index] = { name: preset.name, value: preset.value };
    setColorVariants(updated);
  };

  const isBook = productType === "book" || productType === "school-supply";
  const isClothProduct = !isBook;

  const getTitle = () => {
    switch (productType) {
      case "book":
        return "Add New Book";
      case "school-supply":
        return "Add School Supply";
      case "carousel":
        return "Add to Carousel";
      default:
        return "Add New Product";
    }
  };

  const getCategories = () => {
    switch (productType) {
      case "book":
        return ["Tafseer (تفسير)", "Fiqh (الفقه)", "Seerah (السيرة)", "Hadeeth (الحديث)", "Others (أخرى)"];
      case "school-supply":
        return ["Notebooks", "Learning Aids", "Writing Tools", "Workbooks", "Accessories"];
      default:
        return [
          "Men - Clothing", "Men - Jewelry", "Men - Accessories",
          "Women - Clothing", "Women - Jewelry", "Women - Accessories",
          "Home & Decor - Pottery", "Home & Decor - Lamps", "Home & Decor - Rugs", "Home & Decor - Textiles",
          "Filters - Dates", "Filters - Bukhoor", "Filters - Oud", "Filters - Attar / Perfume",
        ];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const discountPercentage = formData.discount ? parseInt(formData.discount) : 0;
      const originalPrice = formData.originalPrice ? parseFloat(formData.originalPrice) : null;

      if (isBook) {
        const qty = formData.isInStock ? (parseInt(formData.quantity) || 10) : 0;
        const { error } = await supabase.from("books").insert({
          title: formData.name,
          author: formData.author || null,
          price: parseFloat(formData.price),
          original_price: originalPrice,
          discount_percentage: discountPercentage,
          image: formData.image,
          category: productType === "book" ? "books" : "school-supplies",
          quantity_left: qty,
        });
        if (error) throw error;
      } else {
        const colorsData = hasColorVariants && colorVariants.length > 0 ? JSON.parse(JSON.stringify(colorVariants)) : null;

        const { error } = await supabase.from("products").insert([{
          title: formData.name,
          price: parseFloat(formData.price),
          original_price: originalPrice,
          discount_percentage: discountPercentage,
          image: formData.image,
          category: formData.category || "general",
          description: formData.description || null,
          is_new_arrival: true,
          is_preorder: formData.isPreorder,
          colors: colorsData,
          has_sizes: hasSizes,
        }]);
        if (error) throw error;
      }

      toast({
        title: "Product Added",
        description: `${formData.name} has been added to the store.`,
      });

      navigate(isBook ? "/books" : "/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-display text-2xl text-foreground mb-3">Admins only</h1>
          <p className="font-body text-muted-foreground mb-6">
            You need administrator access to add items to the store.
          </p>
          <Button asChild variant="outline">
            <Link to="/">Back to store</Link>
          </Button>
        </div>
      </div>
    );
  }

  const previewPrice = parseFloat(formData.price) || 0;
  const previewOriginal = formData.originalPrice ? parseFloat(formData.originalPrice) : undefined;
  const previewName = formData.name || "Untitled Piece";
  const previewCategory = formData.category || (isBook ? "Books" : "Collection");

  const ImagePlaceholder = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center justify-center bg-muted ${className}`}>
      <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{getTitle()} | Rooh Al Andalus Admin</title>
        <meta name="description" content="Admin tool to add a new item to the Rooh Al Andalus catalog with a live preview of the product card and page." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="font-body text-xs uppercase tracking-[0.2em] text-primary">Admin</p>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">{getTitle()}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8">
            {/* ---------- FORM ---------- */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">{isBook ? "Title" : "Product Name"} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={isBook ? "Enter book title" : "e.g. Zahra Filigree Ring"}
                      required
                    />
                  </div>

                  {isBook && (
                    <div className="space-y-2">
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="Enter author name"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCategories().map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price ($)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="Leave empty if no discount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="e.g., 20 for 20% off"
                    />
                  </div>

                  {isBook && (
                    <div className="space-y-2">
                      <Label className="block">Availability</Label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.isInStock}
                          onCheckedChange={(checked) => setFormData({ ...formData, isInStock: checked as boolean })}
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="font-body text-sm text-foreground">Item is currently in stock</span>
                      </label>
                    </div>
                  )}

                  {!formData.isPreorder && formData.isInStock && (
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity in Stock *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="Available quantity"
                        required={!formData.isPreorder && formData.isInStock}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL *</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  <p className="font-body text-xs text-muted-foreground">
                    Square or portrait images look best — this is the hero shot shown in the card and on the product page.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Sizes */}
              {isClothProduct && (
                <div className="rounded-2xl border border-border bg-muted/30 p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hasSizes"
                      checked={hasSizes}
                      onCheckedChange={(checked) => setHasSizes(checked as boolean)}
                    />
                    <Label htmlFor="hasSizes" className="cursor-pointer font-display text-sm font-semibold text-foreground">
                      This item has size options
                    </Label>
                  </div>
                </div>
              )}

              {/* Colors */}
              {isClothProduct && (
                <div className="rounded-2xl border border-border bg-muted/30 p-6 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox
                      id="hasColorVariants"
                      checked={hasColorVariants}
                      onCheckedChange={(checked) => {
                        setHasColorVariants(checked as boolean);
                        if (!checked) {
                          setColorVariants([]);
                          setColorCount(0);
                        }
                      }}
                    />
                    <Label htmlFor="hasColorVariants" className="cursor-pointer font-display text-sm font-semibold text-foreground">
                      This item has color variants
                    </Label>
                  </div>

                  {hasColorVariants && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-display text-sm font-semibold text-foreground">Color Variants</h4>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">
                            Choose how many color options this item has
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleColorCountChange(colorCount - 1)}
                            disabled={colorCount <= 0}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-body text-sm font-medium text-foreground w-6 text-center">
                            {colorCount}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleColorCountChange(colorCount + 1)}
                            disabled={colorCount >= 10}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {colorVariants.length > 0 && (
                        <div className="space-y-3 mt-3">
                          {colorVariants.map((color, index) => (
                            <div key={index} className="flex items-end gap-3 rounded-md border border-border bg-card p-3">
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Color</Label>
                                <div className="relative">
                                  <div
                                    className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer overflow-hidden shadow-sm"
                                    style={{ backgroundColor: color.value }}
                                  >
                                    <input
                                      type="color"
                                      value={color.value}
                                      onChange={(e) => updateColor(index, "value", e.target.value)}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1 space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Name</Label>
                                <Input
                                  value={color.name}
                                  onChange={(e) => updateColor(index, "name", e.target.value)}
                                  placeholder="e.g., Royal Gold"
                                  className="h-10"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Presets</Label>
                                <div className="flex gap-1 flex-wrap max-w-[120px]">
                                  {PRESET_COLORS.slice(0, 5).map((preset) => (
                                    <button
                                      key={preset.name}
                                      type="button"
                                      onClick={() => selectPresetColor(index, preset)}
                                      className={`w-5 h-5 rounded-full border transition-all hover:scale-110 ${
                                        color.value === preset.value
                                          ? "border-primary ring-1 ring-primary/30"
                                          : "border-border"
                                      }`}
                                      style={{ backgroundColor: preset.value }}
                                      title={preset.name}
                                    />
                                  ))}
                                </div>
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                onClick={() => removeColor(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Badges */}
              {!isBook && (
                <div className="rounded-2xl border border-border bg-card p-6 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isNew"
                      checked={formData.isNew}
                      onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked as boolean })}
                    />
                    <Label htmlFor="isNew" className="cursor-pointer">Mark as New Arrival</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isBestseller"
                      checked={formData.isBestseller}
                      onCheckedChange={(checked) => setFormData({ ...formData, isBestseller: checked as boolean })}
                    />
                    <Label htmlFor="isBestseller" className="cursor-pointer">Mark as Bestseller</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isPreorder"
                      checked={formData.isPreorder}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPreorder: checked as boolean })}
                    />
                    <Label htmlFor="isPreorder" className="cursor-pointer text-primary font-semibold">Not in Stock — Pre-order</Label>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1" disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Adding..." : `Add ${productType === "book" ? "Book" : productType === "school-supply" ? "Supply" : "Product"}`}
                </Button>
              </div>
            </form>

            {/* ---------- PREVIEWS ---------- */}
            <div className="space-y-8 lg:sticky lg:top-24 lg:self-start">
              {/* Card preview */}
              <div className="rounded-2xl border border-border bg-muted/30 p-6">
                <div className="flex items-baseline justify-between mb-5">
                  <h2 className="font-body text-xs uppercase tracking-[0.2em] text-primary">Card Preview</h2>
                  <p className="font-body text-xs text-muted-foreground">How the piece looks in the catalog grid</p>
                </div>
                <div className="max-w-[300px] mx-auto pointer-events-none">
                  {formData.image ? (
                    <ProductCard
                      id="preview"
                      name={previewName}
                      price={previewPrice}
                      originalPrice={previewOriginal}
                      rating={0}
                      reviewCount={0}
                      image={formData.image}
                      category={previewCategory}
                      isPreorder={formData.isPreorder}
                    />
                  ) : (
                    <div className="bg-card rounded-xl overflow-hidden shadow-soft">
                      <ImagePlaceholder className="aspect-[3/4]" />
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-border" />
                          <span className="font-body text-xs text-muted-foreground">0 · 0 reviews</span>
                        </div>
                        <h3 className="font-display text-foreground font-medium">{previewName}</h3>
                        <span className="font-display text-lg font-semibold text-foreground">
                          ${previewPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product page preview */}
              <div className="rounded-2xl border border-border bg-muted/30 p-6">
                <div className="flex items-baseline justify-between mb-5">
                  <h2 className="font-body text-xs uppercase tracking-[0.2em] text-primary">Product Page Preview</h2>
                  <p className="font-body text-xs text-muted-foreground">What buyers see when they open it</p>
                </div>

                <div className="rounded-xl bg-card p-4 shadow-soft grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt={previewName}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ) : (
                    <ImagePlaceholder className="aspect-square rounded-lg" />
                  )}

                  <div className="flex flex-col gap-3">
                    <p className="font-body text-[10px] uppercase tracking-[0.2em] text-primary">
                      {previewCategory}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-foreground leading-snug">
                      {previewName}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      <span className="font-body text-xs text-muted-foreground">0 · 0 reviews</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-semibold text-foreground">
                        ${previewPrice.toFixed(2)}
                      </span>
                      {previewOriginal ? (
                        <span className="font-body text-sm text-muted-foreground line-through">
                          ${previewOriginal.toFixed(2)}
                        </span>
                      ) : null}
                    </div>
                    <p className="font-body text-sm text-muted-foreground">
                      {formData.description || "A newly-listed piece from the atelier."}
                    </p>

                    {isClothProduct && hasSizes && (
                      <div className="space-y-1.5">
                        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sizes</p>
                        <div className="flex flex-wrap gap-1.5">
                          {SIZES.map((s) => (
                            <span key={s} className="px-2.5 py-1 rounded-full border border-border font-body text-xs text-foreground">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {isClothProduct && hasColorVariants && colorVariants.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Colours</p>
                        <div className="flex flex-wrap gap-2">
                          {colorVariants.map((c, i) => (
                            <span
                              key={i}
                              title={c.name}
                              className="w-6 h-6 rounded-full border border-border shadow-sm"
                              style={{ backgroundColor: c.value }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-auto pt-2">
                      <Button variant="hero" size="sm" className="flex-1 gap-2 pointer-events-none">
                        <ShoppingBag className="h-4 w-4" />
                        {formData.isPreorder ? "Pre-order Now" : "Add to Bag"}
                      </Button>
                      <Button variant="outline" size="icon" className="pointer-events-none">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
