import ProductCard from "./ProductCard";

const products = [
  {
    id: 1,
    name: "Handwoven Silk Scarf",
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.8,
    reviewCount: 124,
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=500&fit=crop",
    category: "Textiles",
  },
  {
    id: 2,
    name: "Moroccan Brass Lantern",
    price: 156.00,
    rating: 4.9,
    reviewCount: 89,
    image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&h=500&fit=crop",
    category: "Lamps",
  },
  {
    id: 3,
    name: "Persian Wool Carpet",
    price: 420.00,
    originalPrice: 550.00,
    rating: 5.0,
    reviewCount: 67,
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&h=500&fit=crop",
    category: "Rugs",
  },
  {
    id: 4,
    name: "Gold Filigree Earrings",
    price: 78.50,
    rating: 4.7,
    reviewCount: 203,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=500&fit=crop",
    category: "Jewelry",
  },
  {
    id: 5,
    name: "Ceramic Hand-Painted Vase",
    price: 95.00,
    rating: 4.6,
    reviewCount: 56,
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=500&fit=crop",
    category: "Pottery",
  },
  {
    id: 6,
    name: "Embroidered Kaftan Dress",
    price: 245.00,
    originalPrice: 320.00,
    rating: 4.9,
    reviewCount: 178,
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop",
    category: "Textiles",
  },
  {
    id: 7,
    name: "Antique Copper Tea Set",
    price: 189.00,
    rating: 4.8,
    reviewCount: 92,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=500&fit=crop",
    category: "Accessories",
  },
  {
    id: 8,
    name: "Beaded Statement Necklace",
    price: 65.00,
    rating: 4.5,
    reviewCount: 145,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop",
    category: "Jewelry",
  },
];

const ProductGrid = () => {
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
            <ProductCard {...product} />
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-12 text-center">
        <button className="px-8 py-3 bg-transparent border-2 border-primary text-primary font-body font-medium rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300">
          Load More Products
        </button>
      </div>
    </div>
  );
};

export default ProductGrid;
