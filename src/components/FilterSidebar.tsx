import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { FilterState } from "@/hooks/useProductFilter";
import { Button } from "@/components/ui/button";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterSection = ({ title, children, defaultOpen = true }: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 font-display text-foreground font-medium hover:text-primary transition-colors"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="pt-3 animate-slide-up">{children}</div>}
    </div>
  );
};

interface SubCategoryProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
}

const SubCategory = ({ title, items, selectedItems, onToggle }: SubCategoryProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 font-body text-foreground font-medium hover:text-primary transition-colors"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="pl-4 space-y-2 animate-slide-up">
          {items.map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox 
                checked={selectedItems.includes(item)}
                onCheckedChange={() => onToggle(item)}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
              />
              <span className="font-body text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {item}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

interface FilterSidebarProps {
  filters: FilterState;
  onPriceChange: (value: [number, number]) => void;
  onToggleSubcategory: (value: string) => void;
  onToggleGender: (value: string) => void;
  onToggleColor: (value: string) => void;
  onToggleSize: (value: string) => void;
  onReset: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const FilterSidebar = ({
  filters,
  onPriceChange,
  onToggleSubcategory,
  onToggleGender,
  onToggleColor,
  onToggleSize,
  onReset,
  isMobileOpen = false,
  onMobileClose,
}: FilterSidebarProps) => {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  
  const menSubcategories = ["Clothing", "Jewelry", "Accessories"];
  const womenSubcategories = ["Clothing", "Jewelry", "Accessories"];
  const homeCategories = ["Pottery", "Lamps", "Rugs", "Textiles"];
  
  const colors = [
    { name: "Gold", class: "bg-gold" },
    { name: "Burgundy", class: "bg-burgundy" },
    { name: "Sand", class: "bg-sand-dark" },
    { name: "Bronze", class: "bg-bronze" },
    { name: "Cream", class: "bg-card" },
    { name: "Black", class: "bg-foreground" },
  ];

  const handleMenToggle = (item: string) => {
    // When toggling a men's subcategory, also toggle "men" gender if not already selected
    if (!filters.gender.includes("men")) {
      onToggleGender("men");
    }
    onToggleSubcategory(item);
  };

  const handleWomenToggle = (item: string) => {
    if (!filters.gender.includes("women")) {
      onToggleGender("women");
    }
    onToggleSubcategory(item);
  };

  const handleHomeToggle = (item: string) => {
    onToggleSubcategory(item);
  };

  const hasActiveFilters = 
    filters.gender.length > 0 ||
    filters.subcategories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1000 ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0;

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">Filters</h2>
        </div>
        {onMobileClose && (
          <Button variant="ghost" size="icon" onClick={onMobileClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onReset}
          className="w-full mb-4"
        >
          Clear All Filters
        </Button>
      )}

      {/* Categories */}
      <FilterSection title="Categories">
        <div className="space-y-1">
          <SubCategory 
            title="Men" 
            items={menSubcategories} 
            selectedItems={filters.subcategories}
            onToggle={handleMenToggle}
          />
          <SubCategory 
            title="Women" 
            items={womenSubcategories} 
            selectedItems={filters.subcategories}
            onToggle={handleWomenToggle}
          />
          <SubCategory 
            title="Home & Decor" 
            items={homeCategories} 
            selectedItems={filters.subcategories}
            onToggle={handleHomeToggle}
          />
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => onPriceChange(value as [number, number])}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between font-body text-sm">
            <span className="px-3 py-1 bg-muted rounded-md text-foreground">
              ${filters.priceRange[0]}
            </span>
            <span className="text-muted-foreground">to</span>
            <span className="px-3 py-1 bg-muted rounded-md text-foreground">
              ${filters.priceRange[1]}
            </span>
          </div>
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onToggleSize(size)}
              className={`w-10 h-10 rounded-lg border font-body text-sm transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                filters.sizes.includes(size)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Colors">
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => onToggleColor(color.name)}
              className={`w-8 h-8 rounded-full ${color.class} border-2 transition-all duration-200 shadow-soft focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                filters.colors.includes(color.name)
                  ? "border-primary scale-110"
                  : "border-transparent hover:border-primary hover:scale-110"
              }`}
              title={color.name}
            />
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen={false}>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
            <span className="font-body text-muted-foreground group-hover:text-foreground transition-colors">
              In Stock
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
            <span className="font-body text-muted-foreground group-hover:text-foreground transition-colors">
              Pre-order
            </span>
          </label>
        </div>
      </FilterSection>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          w-72 lg:w-72 bg-card rounded-none lg:rounded-xl p-6 shadow-soft lg:h-fit lg:sticky lg:top-24
          transform transition-transform duration-300 lg:transform-none overflow-y-auto
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default FilterSidebar;
