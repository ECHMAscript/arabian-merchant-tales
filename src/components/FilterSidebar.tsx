import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

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

const FilterSidebar = () => {
  const [priceRange, setPriceRange] = useState([0, 500]);
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const categories = ["Textiles", "Jewelry", "Pottery", "Lamps", "Rugs", "Accessories"];
  const colors = [
    { name: "Gold", class: "bg-gold" },
    { name: "Burgundy", class: "bg-burgundy" },
    { name: "Sand", class: "bg-sand-dark" },
    { name: "Bronze", class: "bg-bronze" },
    { name: "Cream", class: "bg-card" },
    { name: "Black", class: "bg-foreground" },
  ];

  return (
    <aside className="w-full lg:w-72 bg-card rounded-xl p-6 shadow-soft h-fit sticky top-24">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
        <SlidersHorizontal className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-semibold text-foreground">Filters</h2>
      </div>

      {/* Categories */}
      <FilterSection title="Categories">
        <div className="space-y-3">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <span className="font-body text-muted-foreground group-hover:text-foreground transition-colors">
                {category}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between font-body text-sm">
            <span className="px-3 py-1 bg-muted rounded-md text-foreground">
              ${priceRange[0]}
            </span>
            <span className="text-muted-foreground">to</span>
            <span className="px-3 py-1 bg-muted rounded-md text-foreground">
              ${priceRange[1]}
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
              className="w-10 h-10 rounded-lg border border-border bg-background text-muted-foreground font-body text-sm hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
              className={`w-8 h-8 rounded-full ${color.class} border-2 border-transparent hover:border-primary hover:scale-110 transition-all duration-200 shadow-soft focus:ring-2 focus:ring-primary focus:ring-offset-2`}
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
    </aside>
  );
};

export default FilterSidebar;
