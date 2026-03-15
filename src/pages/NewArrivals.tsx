import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { ExtendedProduct } from "@/data/products";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import AdminAddButton from "@/components/admin/AdminAddButton";
import AddProductModal from "@/components/admin/AddProductModal";
import { useDbNewArrivals } from "@/hooks/useDbProducts";

const NewArrivals = () => {
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isAddCarouselModalOpen, setIsAddCarouselModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  const { arrivals: dbArrivals, refetch: refetchArrivals } = useDbNewArrivals();

  // Use only database arrivals
  const allArrivals = useMemo(() => {
    return dbArrivals.map((p): ExtendedProduct => ({
      id: p.id,
      name: p.title,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      image: p.image,
      category: p.category,
      rating: Number(p.rating) || 0,
      reviewCount: p.review_count || 0,
      colors: Array.isArray(p.colors) ? (p.colors as any[]).map(c => ({ name: c.name || '', value: c.value || '' })) : [],
      isPreorder: p.is_preorder || false,
      hasSizes: p.has_sizes !== false,
    }));
  }, [dbArrivals]);

  const handleProductClick = (product: ExtendedProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const filteredProducts = useMemo(() => {
    return allArrivals.filter((product) => {
      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }
      // Color filter
      if (selectedColors.length > 0) {
        if (!product.colors || !product.colors.some((c) => selectedColors.includes(c.name))) {
          return false;
        }
      }
      return true;
    });
  }, [allArrivals, priceRange, selectedCategories, selectedColors]);

  const categories = ["Textiles", "Pottery", "Accessories", "Jewelry"];
  const colors = [
    { name: "Gold", class: "bg-gold" },
    { name: "Burgundy", class: "bg-burgundy" },
    { name: "Sand", class: "bg-sand-dark" },
    { name: "Bronze", class: "bg-bronze" },
  ];

  const hasActiveFilters = 
    priceRange[0] > 0 || priceRange[1] < 500 || 
    selectedCategories.length > 0 || 
    selectedColors.length > 0;

  const clearFilters = () => {
    setPriceRange([0, 500]);
    setSelectedCategories([]);
    setSelectedColors([]);
  };

  return (
    <>
      <Helmet>
        <title>New Arrivals - Rooh Al Andalus</title>
        <meta name="description" content="Discover the latest arrivals at Rooh Al Andalus. Fresh handcrafted treasures." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Carousel */}
        <section className="relative bg-foreground py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="inline-block px-4 py-2 bg-gold/20 text-gold-light rounded-full text-sm font-medium">
                  ✦ Just Arrived
                </span>
                <AdminAddButton
                  onClick={() => setIsAddCarouselModalOpen(true)}
                  tooltip="Add to carousel"
                />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-card mb-4">
                New Arrivals
              </h1>
              <p className="font-body text-card/80 text-base sm:text-lg max-w-2xl mx-auto">
                Be the first to explore our latest handcrafted treasures from master artisans.
              </p>
            </div>

            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {allArrivals.map((product) => (
                  <CarouselItem key={product.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
                    <div
                      className="p-2 cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-display text-card font-semibold line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="font-body text-gold-light">${product.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 hidden sm:flex" />
              <CarouselNext className="right-0 hidden sm:flex" />
            </Carousel>
          </div>

          {/* Pattern overlay */}
          <div className="absolute inset-0 pattern-arabesque opacity-10 pointer-events-none" />
        </section>

        {/* Mobile Filter Button */}
        <div className="lg:hidden container mx-auto px-4 py-4">
          <Button 
            variant="outline" 
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {hasActiveFilters && `(${selectedCategories.length + selectedColors.length + (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0)})`}
          </Button>
        </div>

        {/* Mobile Filter Overlay */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
            <div 
              className="absolute right-0 top-0 h-full w-80 bg-card p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold">Filters</h3>
                <Button variant="ghost" size="icon" onClick={() => setMobileFiltersOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <span className="font-display text-sm font-medium text-foreground block mb-3">Category</span>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox 
                        checked={selectedCategories.includes(cat)}
                        onCheckedChange={() => toggleCategory(cat)}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                      />
                      <span className="font-body text-sm text-muted-foreground">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <span className="font-display text-sm font-medium text-foreground block mb-3">Price</span>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  max={500}
                  min={0}
                  step={10}
                />
                <span className="font-body text-sm text-muted-foreground mt-2 block">
                  ${priceRange[0]} - ${priceRange[1]}
                </span>
              </div>

              {/* Colors */}
              <div className="mb-6">
                <span className="font-display text-sm font-medium text-foreground block mb-3">Colors</span>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={`w-8 h-8 rounded-full ${color.class} border-2 transition-all ${
                        selectedColors.includes(color.name) ? "border-primary scale-110" : "border-transparent hover:border-primary"
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Horizontal Filter Bar - Desktop */}
        <section className="border-b border-border bg-card sticky top-16 md:top-20 z-40 hidden lg:block">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Categories */}
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-medium text-foreground">Category:</span>
                <div className="flex gap-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox 
                        checked={selectedCategories.includes(cat)}
                        onCheckedChange={() => toggleCategory(cat)}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                      />
                      <span className="font-body text-sm text-muted-foreground">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-medium text-foreground">Price:</span>
                <div className="w-32">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    max={500}
                    min={0}
                    step={10}
                  />
                </div>
                <span className="font-body text-sm text-muted-foreground">
                  ${priceRange[0]} - ${priceRange[1]}
                </span>
              </div>

              {/* Colors */}
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-medium text-foreground">Colors:</span>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={`w-6 h-6 rounded-full ${color.class} border-2 transition-all ${
                        selectedColors.includes(color.name) ? "border-primary scale-110" : "border-transparent hover:border-primary"
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <main className="container mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <p className="font-body text-muted-foreground">
                Showing {filteredProducts.length} new items
              </p>
              <AdminAddButton
                onClick={() => setIsAddProductModalOpen(true)}
                tooltip="Add new arrival"
              />
            </div>
            <select className="px-4 py-2 bg-card border border-border rounded-lg font-body text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none">
              <option>Sort by: Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating: High to Low</option>
            </select>
          </div>

          {allArrivals.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-xl text-foreground mb-2">✦ This section just opened!</p>
              <p className="font-body text-muted-foreground text-lg">
                We're currently adding our newest arrivals. Check back soon for fresh handcrafted treasures.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-body text-muted-foreground text-lg mb-4">
                No products match your filters.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard 
                    {...product} 
                    onClick={() => handleProductClick(product)}
                    onDeleted={refetchArrivals}
                  />
                </div>
              ))}
            </div>
          )}
        </main>

        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
        />

        {/* Admin Add Modals */}
        <AddProductModal
          isOpen={isAddCarouselModalOpen}
          onClose={() => setIsAddCarouselModalOpen(false)}
          productType="carousel"
          onProductAdded={refetchArrivals}
        />
        <AddProductModal
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          productType="product"
          onProductAdded={refetchArrivals}
        />
      </div>
    </>
  );
};

export default NewArrivals;
