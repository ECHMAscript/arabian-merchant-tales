import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdmin } from "@/contexts/AdminContext";

interface AdminDeleteButtonProps {
  onDelete: () => void;
  itemName?: string;
  className?: string;
  size?: "sm" | "icon";
}

const AdminDeleteButton = ({ 
  onDelete, 
  itemName = "this item", 
  className = "",
  size = "icon"
}: AdminDeleteButtonProps) => {
  const { isAdmin } = useAdmin();

  if (!isAdmin) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size={size}
          className={`${size === "icon" ? "h-8 w-8" : ""} ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-4 w-4" />
          {size === "sm" && <span className="ml-1">Delete</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {itemName}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminDeleteButton;
