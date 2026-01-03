import { Helmet } from "react-helmet-async";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import ProductCard, { ProductCardProps } from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { newArrivals } from "@/data/products";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const NewArrivals = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductCardProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);

  const handleProductClick = (product: ProductCardProps) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const categories = ["Textiles", "Pottery", "Accessories", "Jewelry"];
  const colors = [
    { name: "Gold", class: "bg-gold" },
    { name: "Burgundy", class: "bg-burgundy" },
    { name: "Sand", class: "bg-sand-dark" },
    { name: "Bronze", class: "bg-bronze" },
  ];

  return (
    <>
      <Helmet>
        <title>New Arrivals - SoukLuxe</title>
        <meta name="description" content="Discover the latest arrivals at SoukLuxe. Fresh handcrafted treasures." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Carousel */}
        <section className="relative bg-foreground py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-2 bg-gold/20 text-gold-light rounded-full text-sm font-medium mb-4">
                ✦ Just Arrived
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-card mb-4">
                New Arrivals
              </h1>
              <p className="font-body text-card/80 text-lg max-w-2xl mx-auto">
                Be the first to explore our latest handcrafted treasures from master artisans.
              </p>
            </div>

            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {newArrivals.map((product) => (
                  <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
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
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>

          {/* Pattern overlay */}
          <div className="absolute inset-0 pattern-arabesque opacity-10 pointer-events-none" />
        </section>

        {/* Horizontal Filter Bar */}
        <section className="border-b border-border bg-card sticky top-16 md:top-20 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Categories */}
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-medium text-foreground">Category:</span>
                <div className="flex gap-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
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
                    onValueChange={setPriceRange}
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
                      className={`w-6 h-6 rounded-full ${color.class} border-2 border-transparent hover:border-primary transition-all`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <p className="font-body text-muted-foreground">
              Showing {newArrivals.length} new items
            </p>
            <select className="px-4 py-2 bg-card border border-border rounded-lg font-body text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none">
              <option>Sort by: Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating: High to Low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newArrivals.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard {...product} onClick={() => handleProductClick(product)} />
              </div>
            ))}
          </div>
        </main>

        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
        />
      </div>
    </>
  );
};

export default NewArrivals;
