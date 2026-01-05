import { useState, useEffect, useRef } from "react";
import { Search, X, Book } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { products, pages } from "@/data/products";
import { booksData, schoolSuppliesData } from "@/data/books";
import { ProductCardProps } from "./ProductCard";

interface SearchDropdownProps {
  onProductClick: (product: ProductCardProps) => void;
}

interface BookSearchResult {
  id: number;
  name: string;
  price: number;
  image: string;
  category: "books" | "school-supplies";
  subcategory: string;
}

const SearchDropdown = ({ onProductClick }: SearchDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<ProductCardProps[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookSearchResult[]>([]);
  const [filteredPages, setFilteredPages] = useState<typeof pages>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredProducts([]);
      setFilteredBooks([]);
      setFilteredPages([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    const matchedProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );
    
    const allBooks = [...booksData, ...schoolSuppliesData];
    const matchedBooks = allBooks.filter(
      (b) =>
        b.name.toLowerCase().includes(lowerQuery) ||
        b.subcategory.toLowerCase().includes(lowerQuery) ||
        (b.arabicName && b.arabicName.includes(query))
    );
    
    const matchedPages = pages.filter((p) =>
      p.name.toLowerCase().includes(lowerQuery)
    );

    setFilteredProducts(matchedProducts.slice(0, 5));
    setFilteredBooks(matchedBooks.slice(0, 5));
    setFilteredPages(matchedPages);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductSelect = (product: ProductCardProps) => {
    onProductClick(product);
    setIsOpen(false);
    setQuery("");
  };

  const handlePageSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery("");
  };

  const handleBookSelect = (book: BookSearchResult) => {
    navigate(`/books?highlight=${book.id}`);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`flex items-center gap-2 transition-all duration-300 ${
          isOpen ? "bg-card border border-border rounded-lg px-3 py-2" : ""
        }`}
      >
        {isOpen ? (
          <>
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, pages..."
              className="bg-transparent outline-none font-body text-foreground placeholder:text-muted-foreground w-48 md:w-64"
              autoFocus
            />
            <button
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (filteredProducts.length > 0 || filteredBooks.length > 0 || filteredPages.length > 0) && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden min-w-[280px] max-h-[400px] overflow-y-auto">
          {/* Pages */}
          {filteredPages.length > 0 && (
            <div className="p-2 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground px-2">Pages</span>
              <div className="mt-1">
                {filteredPages.map((page) => (
                  <button
                    key={page.path}
                    onClick={() => handlePageSelect(page.path)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors font-body text-foreground"
                  >
                    {page.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {filteredProducts.length > 0 && (
            <div className="p-2 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground px-2">Products</span>
              <div className="mt-1">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="text-left">
                      <p className="font-body text-sm text-foreground line-clamp-1">
                        {product.name}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Books */}
          {filteredBooks.length > 0 && (
            <div className="p-2">
              <span className="text-xs font-medium text-muted-foreground px-2 flex items-center gap-1">
                <Book className="h-3 w-3" /> Books & School Supplies
              </span>
              <div className="mt-1">
                {filteredBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => handleBookSelect(book)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <img
                      src={book.image}
                      alt={book.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="text-left">
                      <p className="font-body text-sm text-foreground line-clamp-1">
                        {book.name}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        ${book.price.toFixed(2)} • {book.subcategory}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim() !== "" && filteredProducts.length === 0 && filteredBooks.length === 0 && filteredPages.length === 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-50 p-4 min-w-[280px]">
          <p className="text-center text-muted-foreground font-body text-sm">
            No results found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
