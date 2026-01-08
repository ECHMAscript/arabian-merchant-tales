import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSections: { id: string; title: string }[];
  mode: "section" | "subtopic";
  onTopicAdded?: () => void;
}

const AddTopicModal = ({ isOpen, onClose, existingSections, mode, onTopicAdded }: AddTopicModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    parentSection: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const itemType = mode === "section" ? "Section" : "Subtopic";
      
      const { error } = await supabase.from("topics").insert({
        title: formData.name,
        parent_id: mode === "subtopic" ? formData.parentSection : null,
      });

      if (error) throw error;
      
      toast({
        title: `${itemType} Added`,
        description: `"${formData.name}" has been added to the navigation.`,
      });
      
      // Reset form
      setFormData({
        name: "",
        parentSection: "",
      });
      
      onTopicAdded?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add topic",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {mode === "section" ? "Add New Section" : "Add New Subtopic"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Topic Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{mode === "section" ? "Section" : "Subtopic"} Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={`Enter ${mode === "section" ? "section" : "subtopic"} name`}
              required
            />
          </div>

          {/* Parent Section (for subtopics only) */}
          {mode === "subtopic" && (
            <div className="space-y-2">
              <Label>Parent Section *</Label>
              <Select
                value={formData.parentSection}
                onValueChange={(value) => setFormData({ ...formData, parentSection: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent section" />
                </SelectTrigger>
                <SelectContent>
                  {existingSections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Adding..." : `Add ${mode === "section" ? "Section" : "Subtopic"}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTopicModal;
