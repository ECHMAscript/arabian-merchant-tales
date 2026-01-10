import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type TableName = "products" | "books" | "articles" | "topics";

export const useDeleteItem = () => {
  const deleteItem = async (
    table: TableName,
    id: string,
    itemName: string,
    onSuccess?: () => void
  ) => {
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) throw error;

      toast.success(`${itemName} deleted successfully`);
      onSuccess?.();
    } catch (error: any) {
      console.error(`Error deleting from ${table}:`, error);
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  return { deleteItem };
};
