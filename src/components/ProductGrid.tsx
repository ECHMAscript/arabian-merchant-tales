import { useState } from "react";
import ProductCard, { ProductCardProps } from "./ProductCard";
import ProductModal from "./ProductModal";
import { products } from "@/data/products";

const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductCardProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (product: ProductCardProps) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Our Collection
          </h2>
          <p className="font-body text-muted-foreground mt-1">
            Showing {products.length} artisan products
          </p>
        </div>
        <select className="px-4 py-2 bg-card border border-border rounded-lg font-body text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none">
          <option>Sort by: Featured</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Rating: High to Low</option>
          <option>Newest First</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ProductCard {...product} onClick={() => handleProductClick(product)} />
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-12 text-center">
        <button className="px-8 py-3 bg-transparent border-2 border-primary text-primary font-body font-medium rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300">
          Load More Products
        </button>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductGrid;
