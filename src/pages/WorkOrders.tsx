import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, Clock, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface TailoringOrder {
  id: string;
  user_id: string;
  customer_name: string | null;
  customer_email: string | null;
  garment_type: string;
  garment_name: string;
  measurements: Record<string, string>;
  special_notes: string | null;
  status: string;
  created_at: string;
}

const cmToInches = (cm: number): string => {
  return (cm / 2.54).toFixed(1);
};

const getDaysAgo = (dateStr: string): number => {
  const now = new Date();
  const created = new Date(dateStr);
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
};

const getPriorityInfo = (dateStr: string) => {
  const days = getDaysAgo(dateStr);
  if (days >= 3) {
    return { color: "destructive" as const, label: `${days}d ago — URGENT`, level: "red" };
  } else if (days >= 1) {
    return { color: "secondary" as const, label: `${days}d ago`, level: "yellow" };
  }
  return { color: "default" as const, label: "New", level: "green" };
};

const WorkOrders = () => {
  const { hasAdminRole } = useAuthContext();
  const [orders, setOrders] = useState<TailoringOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("tailoring_orders")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setOrders(data as TailoringOrder[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("tailoring-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tailoring_orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("tailoring_orders").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete work order.", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Work order removed." });
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("tailoring_orders")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
      toast({ title: "Updated", description: `Status changed to ${newStatus}.` });
    }
  };

  if (!hasAdminRole) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-heading text-foreground">Access Denied</h1>
          <p className="text-muted-foreground mt-2">Admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative py-12 md:py-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <Scissors className="w-12 h-12 mx-auto mb-3 text-gold" />
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-2">
            Tailoring Work Orders
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            All custom tailoring requests, ranked by urgency. Older orders appear first.
          </p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> New
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500" /> 1-2 days
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" /> 3+ days (urgent)
            </span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading work orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-muted-foreground">No tailoring orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const priority = getPriorityInfo(order.created_at);
              const borderColor =
                priority.level === "red"
                  ? "border-l-red-500"
                  : priority.level === "yellow"
                  ? "border-l-yellow-500"
                  : "border-l-emerald-500";

              return (
                <Card
                  key={order.id}
                  className={`border-l-4 ${borderColor} transition-all`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg font-heading">
                          {order.garment_name}
                        </CardTitle>
                        <Badge
                          variant={priority.color}
                          className={
                            priority.level === "green"
                              ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
                              : priority.level === "yellow"
                              ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                              : ""
                          }
                        >
                          {priority.level === "red" && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {priority.label}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Customer Info */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">Customer</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_name || "N/A"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_email || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          Type: {order.garment_type}
                        </p>
                      </div>

                      {/* Measurements */}
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-semibold text-foreground mb-2">
                          Measurements
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(order.measurements).map(([key, value]) => {
                            const numVal = parseFloat(value);
                            const label = key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (s) => s.toUpperCase());
                            return (
                              <div
                                key={key}
                                className="bg-muted/50 rounded-lg px-3 py-2 text-sm"
                              >
                                <span className="text-muted-foreground block text-xs">
                                  {label}
                                </span>
                                <span className="text-foreground font-medium">
                                  {value} cm
                                </span>
                                {!isNaN(numVal) && (
                                  <span className="text-muted-foreground text-xs ml-1">
                                    ({cmToInches(numVal)} in)
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {order.special_notes && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Notes: </span>
                          {order.special_notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(order.id, "in_progress")}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark In Progress
                        </Button>
                      )}
                      {order.status === "in_progress" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(order.id, "completed")}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Completed
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Work Order?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove this tailoring order.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(order.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default WorkOrders;
