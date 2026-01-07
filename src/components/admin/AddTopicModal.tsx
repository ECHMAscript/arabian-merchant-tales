import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSections: { id: string; title: string }[];
  mode: "section" | "subtopic";
}

const AddTopicModal = ({ isOpen, onClose, existingSections, mode }: AddTopicModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    parentSection: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemType = mode === "section" ? "Section" : "Subtopic";
    
    // In a real app, this would save to database
    toast({
      title: `${itemType} Added`,
      description: `"${formData.name}" has been added to the navigation.`,
    });
    
    // Reset form
    setFormData({
      name: "",
      parentSection: "",
    });
    
    onClose();
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
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add {mode === "section" ? "Section" : "Subtopic"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTopicModal;
