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

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: "product" | "book" | "school-supply" | "carousel";
  onProductAdded?: () => void;
}

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
    author: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const discountPercentage = formData.discount ? parseInt(formData.discount) : 0;
      const originalPrice = formData.originalPrice ? parseFloat(formData.originalPrice) : null;
      
      if (productType === "book" || productType === "school-supply") {
        // Save to books table
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
        // Save to products table
        const { error } = await supabase.from("products").insert({
          title: formData.name,
          price: parseFloat(formData.price),
          original_price: originalPrice,
          discount_percentage: discountPercentage,
          image: formData.image,
          category: formData.category || "general",
          is_new_arrival: productType === "carousel" || formData.isNew,
        });

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
        author: "",
      });
      
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
        return ["Men", "Women", "Home & Decor", "Textiles", "Pottery", "Jewelry"];
    }
  };

  const isBook = productType === "book" || productType === "school-supply";

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

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity in Stock *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Available quantity"
                required
              />
            </div>
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

          {/* Badges */}
          {!isBook && (
            <div className="flex gap-6">
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
