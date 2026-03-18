import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface OrderNotificationContextType {
  unseenCount: number;
  markAllSeen: () => void;
  formattedCount: string;
}

const OrderNotificationContext = createContext<OrderNotificationContextType | undefined>(undefined);

const formatCount = (count: number): string => {
  if (count >= 1000) {
    return `${Math.floor(count / 1000)}k`;
  }
  return String(count);
};

export const OrderNotificationProvider = ({ children }: { children: ReactNode }) => {
  const { hasAdminRole, user } = useAuthContext();
  const { toast } = useToast();
  const [unseenCount, setUnseenCount] = useState(0);

  // Load unseen count from localStorage on mount
  useEffect(() => {
    if (!hasAdminRole || !user) {
      setUnseenCount(0);
      return;
    }

    const lastSeenKey = `admin_orders_last_seen_${user.id}`;
    const lastSeen = localStorage.getItem(lastSeenKey);

    const fetchUnseenOrders = async () => {
      let query = supabase
        .from("orders")
        .select("id", { count: "exact", head: true });

      if (lastSeen) {
        query = query.gt("created_at", lastSeen);
      }

      const { count } = await query;
      setUnseenCount(count || 0);
    };

    fetchUnseenOrders();
  }, [hasAdminRole, user]);

  // Realtime subscription for new orders
  useEffect(() => {
    if (!hasAdminRole) return;

    const channel = supabase
      .channel("admin-order-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as any;
          setUnseenCount((prev) => prev + 1);
          toast({
            title: "🔔 New Order Received!",
            description: `Order from ${newOrder.customer_name || "a customer"} — $${Number(newOrder.total).toFixed(2)}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hasAdminRole, toast]);

  const markAllSeen = useCallback(() => {
    if (!user) return;
    const lastSeenKey = `admin_orders_last_seen_${user.id}`;
    localStorage.setItem(lastSeenKey, new Date().toISOString());
    setUnseenCount(0);
  }, [user]);

  return (
    <OrderNotificationContext.Provider
      value={{
        unseenCount,
        markAllSeen,
        formattedCount: formatCount(unseenCount),
      }}
    >
      {children}
    </OrderNotificationContext.Provider>
  );
};

export const useOrderNotifications = () => {
  const context = useContext(OrderNotificationContext);
  if (!context) {
    throw new Error("useOrderNotifications must be used within OrderNotificationProvider");
  }
  return context;
};
