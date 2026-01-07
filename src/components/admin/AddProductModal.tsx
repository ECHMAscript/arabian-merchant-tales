import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: "product" | "book" | "school-supply" | "carousel";
}

const AddProductModal = ({ isOpen, onClose, productType }: AddProductModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    description: "",
    category: "",
    subcategory: "",
    image: "",
    quantity: "",
    discount: "",
    isNew: false,
    isBestseller: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would save to database
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
      quantity: "",
      discount: "",
      isNew: false,
      isBestseller: false,
    });
    
    onClose();
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
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>

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
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isNew"
                checked={formData.isNew}
                onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked as boolean })}
              />
              <Label htmlFor="isNew" className="cursor-pointer">Mark as New</Label>
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

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add {productType === "book" ? "Book" : productType === "school-supply" ? "Supply" : "Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
