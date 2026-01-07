import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSections: { id: string; title: string }[];
}

const AddArticleModal = ({ isOpen, onClose, existingSections }: AddArticleModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    section: "",
    newSectionName: "",
    content: "",
  });
  const [isCreatingNewSection, setIsCreatingNewSection] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sectionName = isCreatingNewSection ? formData.newSectionName : formData.section;
    
    // In a real app, this would save to database
    toast({
      title: "Article Published",
      description: `"${formData.title}" has been published to ${sectionName}.`,
    });
    
    // Reset form
    setFormData({
      title: "",
      section: "",
      newSectionName: "",
      content: "",
    });
    setIsCreatingNewSection(false);
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Post New Article</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Article Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Article Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter article title"
              required
            />
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <Label>Section *</Label>
            <div className="flex gap-4 items-center mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isCreatingNewSection}
                  onChange={() => setIsCreatingNewSection(false)}
                  className="text-primary"
                />
                <span className="text-sm">Existing Section</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isCreatingNewSection}
                  onChange={() => setIsCreatingNewSection(true)}
                  className="text-primary"
                />
                <span className="text-sm">Create New Section</span>
              </label>
            </div>

            {isCreatingNewSection ? (
              <Input
                value={formData.newSectionName}
                onChange={(e) => setFormData({ ...formData, newSectionName: e.target.value })}
                placeholder="Enter new section name"
                required
              />
            ) : (
              <Select
                value={formData.section}
                onValueChange={(value) => setFormData({ ...formData, section: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {existingSections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Article Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Article Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your article content here... (HTML supported)"
              rows={12}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Tip: You can use HTML tags for formatting (h2, h3, p, ul, li, strong, etc.)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Publish Article
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddArticleModal;
