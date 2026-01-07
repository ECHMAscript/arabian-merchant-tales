import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminAddButtonProps {
  onClick: () => void;
  tooltip?: string;
  className?: string;
}

const AdminAddButton = ({ onClick, tooltip = "Add new item", className = "" }: AdminAddButtonProps) => {
  const { isAdmin } = useAdmin();

  if (!isAdmin) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className={`bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary ${className}`}
          >
            <Plus className="h-5 w-5 text-primary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AdminAddButton;
