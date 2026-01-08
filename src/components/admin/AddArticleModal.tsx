import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSections: { id: string; title: string }[];
  onArticleAdded?: () => void;
}

const AddArticleModal = ({ isOpen, onClose, existingSections, onArticleAdded }: AddArticleModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    section: "",
    newSectionName: "",
    content: "",
  });
  const [isCreatingNewSection, setIsCreatingNewSection] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let topicId = formData.section;
      
      // If creating a new section, create it first
      if (isCreatingNewSection && formData.newSectionName) {
        const { data: newTopic, error: topicError } = await supabase
          .from("topics")
          .insert({
            title: formData.newSectionName,
            parent_id: null,
          })
          .select()
          .single();
        
        if (topicError) throw topicError;
        topicId = newTopic.id;
      }
      
      // Create the article
      const { error: articleError } = await supabase.from("articles").insert({
        title: formData.title,
        content: formData.content,
        topic_id: topicId,
      });

      if (articleError) throw articleError;
      
      const sectionName = isCreatingNewSection ? formData.newSectionName : 
        existingSections.find(s => s.id === formData.section)?.title || "selected section";
      
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
      
      onArticleAdded?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to publish article",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Publishing..." : "Publish Article"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddArticleModal;
