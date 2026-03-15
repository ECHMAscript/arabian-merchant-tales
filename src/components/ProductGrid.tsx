import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { ExtendedProduct } from "@/data/products";
import { useProductFilter } from "@/hooks/useProductFilter";
import FilterSidebar from "./FilterSidebar";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import AdminAddButton from "./admin/AdminAddButton";
import AddProductModal from "./admin/AddProductModal";
import { useDbProducts } from "@/hooks/useDbProducts";

const ITEMS_PER_PAGE = 8;

const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState("featured");

  const { products: dbProducts, refetch: refetchProducts } = useDbProducts();

  // Use only database products
  const allProducts = useMemo(() => {
    return dbProducts.map((p): ExtendedProduct => ({
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
    }));
  }, [dbProducts]);

  const {
    filters,
    filteredProducts,
    updateFilter,
    toggleArrayFilter,
    resetFilters,
  } = useProductFilter(allProducts);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortOption) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  }, [filteredProducts, sortOption]);

  const displayedProducts = sortedProducts.slice(0, displayCount);
  const hasMoreProducts = displayCount < filteredProducts.length;

  const handleProductClick = (product: ExtendedProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <Button 
          variant="outline" 
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        filters={filters}
        onPriceChange={(value) => updateFilter("priceRange", value)}
        onToggleCategory={(value) => toggleArrayFilter("categories", value)}
        onToggleSize={(value) => toggleArrayFilter("sizes", value)}
        onReset={resetFilters}
        isMobileOpen={mobileFiltersOpen}
        onMobileClose={() => setMobileFiltersOpen(false)}
      />

      {/* Products Section */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Our Collection
              </h2>
              <p className="font-body text-muted-foreground mt-1">
                Showing {displayedProducts.length} of {filteredProducts.length} artisan products
              </p>
            </div>
            <AdminAddButton 
              onClick={() => setIsAddModalOpen(true)} 
              tooltip="Add new product"
            />
          </div>
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg font-body text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating: High to Low</option>
          </select>
        </div>

        {/* Product Grid */}
        {allProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-display text-xl text-foreground mb-2">✦ This section just opened!</p>
            <p className="font-body text-muted-foreground text-lg">
              We're currently curating our collection. Check back soon for beautiful artisan products.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-muted-foreground text-lg mb-4">
              No products match your filters.
            </p>
            <Button variant="outline" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard 
                  {...product} 
                  onClick={() => handleProductClick(product)}
                  onDeleted={refetchProducts}
                />
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        <div className="mt-12 text-center">
          {hasMoreProducts ? (
            <button 
              onClick={handleLoadMore}
              className="px-8 py-3 bg-transparent border-2 border-primary text-primary font-body font-medium rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              Load More Products
            </button>
          ) : filteredProducts.length > 0 ? (
            <p className="font-body text-muted-foreground">
              You've reached the end of our collection
            </p>
          ) : null}
        </div>

        {/* Product Modal */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
        />

        {/* Admin Add Product Modal */}
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          productType="product"
          onProductAdded={refetchProducts}
        />
      </div>
    </div>
  );
};

export default ProductGrid;
