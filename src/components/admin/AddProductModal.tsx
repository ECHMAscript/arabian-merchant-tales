import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Minus, X } from "lucide-react";

interface ColorVariant {
  name: string;
  value: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: "product" | "book" | "school-supply" | "carousel";
  onProductAdded?: () => void;
}

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

const AddProductModal = ({ isOpen, onClose, productType, onProductAdded }: AddProductModalProps) => {
  const { toast } = useToast();
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
    author: "",
  });
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  const [colorCount, setColorCount] = useState(0);

  const handleColorCountChange = (newCount: number) => {
    if (newCount < 0 || newCount > 10) return;
    setColorCount(newCount);
    if (newCount > colorVariants.length) {
      // Add new color slots with defaults
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const discountPercentage = formData.discount ? parseInt(formData.discount) : 0;
      const originalPrice = formData.originalPrice ? parseFloat(formData.originalPrice) : null;
      
      if (productType === "book" || productType === "school-supply") {
        const { error } = await supabase.from("books").insert({
          title: formData.name,
          author: formData.author || null,
          price: parseFloat(formData.price),
          original_price: originalPrice,
          discount_percentage: discountPercentage,
          image: formData.image,
          category: productType === "book" ? "books" : "school-supplies",
          quantity_left: parseInt(formData.quantity) || 10,
        });

        if (error) throw error;
      } else {
        const colorsData = colorVariants.length > 0 ? JSON.parse(JSON.stringify(colorVariants)) : null;
        
        const { error } = await supabase.from("products").insert([{
          title: formData.name,
          price: parseFloat(formData.price),
          original_price: originalPrice,
          discount_percentage: discountPercentage,
          image: formData.image,
          category: formData.category || "general",
          is_new_arrival: productType === "carousel" || formData.isNew,
          is_preorder: formData.isPreorder,
          colors: colorsData,
        }]);

        if (error) throw error;
      }

      toast({
        title: "Product Added",
        description: `${formData.name} has been added to the store.`,
      });
      
      // Reset form
      setFormData({
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
        author: "",
      });
      setColorVariants([]);
      setColorCount(0);
      
      onProductAdded?.();
      onClose();
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
        return ["Tafseer (تفسير)", "Fiqh (الفقه)", "Seerah (السيرة)", "Hadeeth (الحديث)"];
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

  const isBook = productType === "book" || productType === "school-supply";
  const isClothProduct = !isBook;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{getTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{isBook ? "Title" : "Product Name"} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isBook ? "Enter book title" : "Enter product name"}
                required
              />
            </div>

            {/* Author (for books only) */}
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

            {/* Category */}
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
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
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

            {/* Original Price (for discounts) */}
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

            {/* Discount Percentage */}
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

            {/* Quantity - hidden when preorder */}
            {!formData.isPreorder && (
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity in Stock *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Available quantity"
                  required={!formData.isPreorder}
                />
              </div>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image">Image URL *</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          {/* Description */}
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

          {/* Color Variants - Only for cloth/product items */}
          {isClothProduct && (
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
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
                      {/* Color Preview & Picker */}
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

                      {/* Color Name */}
                      <div className="flex-1 space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <Input
                          value={color.name}
                          onChange={(e) => updateColor(index, "name", e.target.value)}
                          placeholder="e.g., Royal Gold"
                          className="h-10"
                        />
                      </div>

                      {/* Preset Swatches */}
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

                      {/* Remove */}
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
            </div>
          )}

          {/* Badges */}
          {!isBook && (
            <div className="flex flex-wrap gap-6">
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
                <Label htmlFor="isPreorder" className="cursor-pointer text-amber-600 font-semibold">Not in Stock — Pre-order</Label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Adding..." : `Add ${productType === "book" ? "Book" : productType === "school-supply" ? "Supply" : "Product"}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
