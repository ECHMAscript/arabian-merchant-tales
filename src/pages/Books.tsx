import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import BookCard from "@/components/BookCard";
import BookModal from "@/components/BookModal";
import { bookCategories, schoolSupplyCategories, BookProduct } from "@/data/books";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Book, GraduationCap, SlidersHorizontal, X, ChevronDown, ChevronRight } from "lucide-react";
import AdminAddButton from "@/components/admin/AdminAddButton";
import AddProductModal from "@/components/admin/AddProductModal";
import { useDbBooks } from "@/hooks/useDbProducts";

type MainCategory = "books" | "school-supplies";

const Books = () => {
  const [selectedProduct, setSelectedProduct] = useState<BookProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainCategory, setMainCategory] = useState<MainCategory>("books");
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    books: true,
    schoolSupplies: false
  });
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isAddSupplyModalOpen, setIsAddSupplyModalOpen] = useState(false);

  const { books: dbBooks, refetch: refetchBooks } = useDbBooks();

  // Use only database books
  const allBooks = useMemo(() => {
    return dbBooks
      .filter((b) => b.category === "books")
      .map((b): BookProduct => ({
        id: b.id,
        name: b.title,
        author: b.author || undefined,
        price: Number(b.price),
        image: b.image,
        category: "books" as const,
        subcategory: "General",
        quantityLeft: b.quantity_left ?? 0,
        rating: Number(b.rating) || 0,
        reviewCount: b.review_count || 0,
        volumes: b.volumes?.length || undefined,
      }));
  }, [dbBooks]);

  const allSchoolSupplies = useMemo(() => {
    return dbBooks
      .filter((b) => b.category === "school-supplies")
      .map((b): BookProduct => ({
        id: b.id,
        name: b.title,
        author: b.author || undefined,
        price: Number(b.price),
        image: b.image,
        category: "school-supplies" as const,
        subcategory: "General",
        quantityLeft: b.quantity_left ?? 0,
        rating: Number(b.rating) || 0,
        reviewCount: b.review_count || 0,
      }));
  }, [dbBooks]);

  const handleProductClick = (product: BookProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const toggleSubcategory = (subcat: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcat) ? prev.filter((c) => c !== subcat) : [...prev, subcat]
    );
  };

  const toggleSection = (section: "books" | "schoolSupplies") => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleMainCategoryChange = (category: MainCategory) => {
    setMainCategory(category);
    setSelectedSubcategories([]);
    setPriceRange([0, 150]);
  };

  const filteredProducts = useMemo(() => {
    const products = mainCategory === "books" ? allBooks : allSchoolSupplies;
    
    return products.filter((product) => {
      // Subcategory filter
      if (selectedSubcategories.length > 0 && !selectedSubcategories.includes(product.subcategory)) {
        return false;
      }
      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }
      // In stock filter
      if (showInStockOnly && (product.quantityLeft <= 0)) {
        return false;
      }
      return true;
    });
  }, [mainCategory, allBooks, allSchoolSupplies, selectedSubcategories, priceRange, showInStockOnly]);

  const currentCategories = mainCategory === "books" ? bookCategories : schoolSupplyCategories;

  const hasActiveFilters = 
    selectedSubcategories.length > 0 || 
    priceRange[0] > 0 || 
    priceRange[1] < 150 ||
    showInStockOnly;

  const clearFilters = () => {
    setSelectedSubcategories([]);
    setPriceRange([0, 150]);
    setShowInStockOnly(false);
  };

  const SidebarContent = () => (
    <>
      {/* Main Categories */}
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Categories</h3>
        
        {/* Books Section */}
        <div className="mb-3">
          <button
            onClick={() => toggleSection("books")}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              <span className="font-display font-medium text-foreground">Books</span>
            </div>
            {expandedSections.books ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          {expandedSections.books && (
            <div className="ml-7 mt-2 space-y-2">
              {bookCategories.map((cat) => (
                <label
                  key={cat.name}
                  className={`flex items-center gap-2 cursor-pointer py-1 px-2 rounded transition-colors ${
                    mainCategory === "books" && selectedSubcategories.includes(cat.name)
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    if (mainCategory !== "books") {
                      handleMainCategoryChange("books");
                    }
                  }}
                >
                  <Checkbox
                    checked={mainCategory === "books" && selectedSubcategories.includes(cat.name)}
                    onCheckedChange={() => {
                      if (mainCategory !== "books") {
                        handleMainCategoryChange("books");
                      }
                      toggleSubcategory(cat.name);
                    }}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex flex-col">
                    <span className="font-body text-sm text-foreground">{cat.name}</span>
                    <span className="font-body text-xs text-muted-foreground" dir="rtl">
                      {cat.arabicName}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* School Supplies Section */}
        <div>
          <button
            onClick={() => toggleSection("schoolSupplies")}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-secondary" />
              <span className="font-display font-medium text-foreground">School Resources</span>
            </div>
            {expandedSections.schoolSupplies ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          {expandedSections.schoolSupplies && (
            <div className="ml-7 mt-2 space-y-2">
              {schoolSupplyCategories.map((cat) => (
                <label
                  key={cat.name}
                  className={`flex items-center gap-2 cursor-pointer py-1 px-2 rounded transition-colors ${
                    mainCategory === "school-supplies" && selectedSubcategories.includes(cat.name)
                      ? "bg-secondary/10"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    if (mainCategory !== "school-supplies") {
                      handleMainCategoryChange("school-supplies");
                    }
                  }}
                >
                  <Checkbox
                    checked={mainCategory === "school-supplies" && selectedSubcategories.includes(cat.name)}
                    onCheckedChange={() => {
                      if (mainCategory !== "school-supplies") {
                        handleMainCategoryChange("school-supplies");
                      }
                      toggleSubcategory(cat.name);
                    }}
                    className="border-border data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                  />
                  <span className="font-body text-sm text-foreground">{cat.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-display text-sm font-medium text-foreground mb-3">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          max={150}
          min={0}
          step={5}
        />
        <div className="flex justify-between mt-2">
          <span className="font-body text-sm text-muted-foreground">${priceRange[0]}</span>
          <span className="font-body text-sm text-muted-foreground">${priceRange[1]}</span>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <h4 className="font-display text-sm font-medium text-foreground mb-3">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={showInStockOnly}
            onCheckedChange={(checked) => setShowInStockOnly(checked as boolean)}
            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <span className="font-body text-sm text-muted-foreground">In Stock Only</span>
        </label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </>
  );

  return (
    <>
      <Helmet>
        <title>Books & School Resources - Rooh Al Andalus</title>
        <meta name="description" content="Explore our collection of Islamic books including Tafseer, Fiqh, Seerah, Hadeeth and school supplies." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-foreground via-foreground to-primary/20 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <span className="inline-block px-4 py-2 bg-primary/20 text-primary-foreground rounded-full text-sm font-medium mb-4">
              ✦ Islamic Library
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-card mb-4">
              Books & School Resources
            </h1>
            <p className="font-body text-card/80 text-base sm:text-lg max-w-2xl mx-auto">
              Discover authentic Islamic literature and educational materials for all ages.
            </p>
          </div>
          <div className="absolute inset-0 pattern-arabesque opacity-5 pointer-events-none" />
        </section>

        {/* Mobile Filter Button */}
        <div className="lg:hidden container mx-auto px-4 py-4">
          <Button
            variant="outline"
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {hasActiveFilters && `(${selectedSubcategories.length + (showInStockOnly ? 1 : 0)})`}
          </Button>
        </div>

        {/* Mobile Filter Overlay */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
            <div
              className="absolute left-0 top-0 h-full w-80 bg-card p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold">Filters</h3>
                <Button variant="ghost" size="icon" onClick={() => setMobileFiltersOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-xl p-6 shadow-soft">
                <SidebarContent />
              </div>
            </aside>

            {/* Product Grid */}
            <main className="flex-1">
              {/* Category Tabs */}
              <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant={mainCategory === "books" ? "default" : "outline"}
                    onClick={() => handleMainCategoryChange("books")}
                    className="gap-2"
                  >
                    <Book className="h-4 w-4" />
                    Books
                  </Button>
                  <AdminAddButton
                    onClick={() => setIsAddBookModalOpen(true)}
                    tooltip="Add new book"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={mainCategory === "school-supplies" ? "default" : "outline"}
                    onClick={() => handleMainCategoryChange("school-supplies")}
                    className="gap-2"
                  >
                    <GraduationCap className="h-4 w-4" />
                    School Resources
                  </Button>
                  <AdminAddButton
                    onClick={() => setIsAddSupplyModalOpen(true)}
                    tooltip="Add school supply"
                  />
                </div>
              </div>

              {/* Results Info */}
              <div className="flex items-center justify-between mb-6">
                <p className="font-body text-muted-foreground">
                  Showing {filteredProducts.length} {mainCategory === "books" ? "books" : "items"}
                </p>
                <select className="px-4 py-2 bg-card border border-border rounded-lg font-body text-foreground focus:ring-2 focus:ring-primary outline-none">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating: High to Low</option>
                </select>
              </div>

              {/* Products */}
              {(mainCategory === "books" ? allBooks : allSchoolSupplies).length === 0 ? (
                <div className="text-center py-16">
                  <Book className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="font-display text-xl text-foreground mb-2">✦ This section just opened!</p>
                  <p className="font-body text-muted-foreground text-lg">
                    We're currently adding {mainCategory === "books" ? "books" : "school supplies"} to our collection. Check back soon!
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Book className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="font-body text-muted-foreground text-lg mb-4">
                    No {mainCategory === "books" ? "books" : "items"} match your filters.
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
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <BookCard 
                        book={product} 
                        onClick={() => handleProductClick(product)}
                        onDeleted={refetchBooks}
                      />
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>

        <BookModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          book={selectedProduct}
        />

        {/* Admin Add Modals */}
        <AddProductModal
          isOpen={isAddBookModalOpen}
          onClose={() => setIsAddBookModalOpen(false)}
          productType="book"
          onProductAdded={refetchBooks}
        />
        <AddProductModal
          isOpen={isAddSupplyModalOpen}
          onClose={() => setIsAddSupplyModalOpen(false)}
          productType="school-supply"
          onProductAdded={refetchBooks}
        />
      </div>
    </>
  );
};

export default Books;
