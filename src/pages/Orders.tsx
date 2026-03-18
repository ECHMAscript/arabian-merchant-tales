import { Helmet } from "react-helmet-async";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrderNotifications } from "@/contexts/OrderNotificationContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Package, X, Bell, Trash2, ChevronRight, ShoppingBag, TrendingUp, User as UserIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Json } from "@/integrations/supabase/types";

interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total: number;
  status: string;
  order_type: string;
  customer_name: string | null;
  customer_email: string | null;
  is_guest: boolean;
  shipping_address: any;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  cancel_reason: string | null;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "#C9A962",
  "#6B1D3A",
  "#1B2A4A",
];

const Orders = () => {
  const { user, isAdmin, hasAdminRole } = useAuthContext();
  const { toast } = useToast();
  const { markAllSeen } = useOrderNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);
  const [cancelSubject, setCancelSubject] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data.map(o => ({
        ...o,
        items: (Array.isArray(o.items) ? o.items : []) as unknown as OrderItem[],
        order_type: (o as any).order_type || 'standard',
        customer_name: (o as any).customer_name || null,
        customer_email: (o as any).customer_email || null,
        is_guest: (o as any).is_guest || false,
        cancelled_at: (o as any).cancelled_at || null,
        cancel_reason: (o as any).cancel_reason || null,
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    markAllSeen();
  }, []);

  // Realtime subscription for live list updates (toast handled globally)
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as any;
          setOrders(prev => [{
            ...newOrder,
            items: (Array.isArray(newOrder.items) ? newOrder.items : []) as OrderItem[],
            order_type: newOrder.order_type || 'standard',
            customer_name: newOrder.customer_name || null,
            customer_email: newOrder.customer_email || null,
            is_guest: newOrder.is_guest || false,
            cancelled_at: newOrder.cancelled_at || null,
            cancel_reason: newOrder.cancel_reason || null,
          }, ...prev]);
          setNewOrderAlert(true);
          markAllSeen();
          setTimeout(() => setNewOrderAlert(false), 5000);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "orders" },
        (payload) => {
          setOrders(prev => prev.filter(o => o.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Spending data for selected order's user
  const userSpendingData = useMemo(() => {
    if (!selectedOrder) return { monthly: [], categories: [] };

    const userOrders = orders.filter(o => o.user_id === selectedOrder.user_id && o.status !== 'cancelled');

    // Monthly spending
    const monthlyMap: Record<string, number> = {};
    userOrders.forEach(o => {
      const month = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyMap[month] = (monthlyMap[month] || 0) + o.total;
    });
    const monthly = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount: Number(amount.toFixed(2)) }));

    // Category spending
    const catMap: Record<string, number> = {};
    userOrders.forEach(o => {
      o.items.forEach(item => {
        const cat = item.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + (item.price * item.quantity);
      });
    });
    const categories = Object.entries(catMap).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));

    return { monthly, categories };
  }, [selectedOrder, orders]);

  const handleCancelOrder = async () => {
    if (!cancelOrder || !cancelSubject.trim() || !cancelMessage.trim()) {
      toast({ title: "Error", description: "Please fill in both subject and message", variant: "destructive" });
      return;
    }

    setCancelling(true);
    try {
      // Send cancellation email
      const email = cancelOrder.customer_email;
      if (email) {
        await supabase.functions.invoke("cancel-order-email", {
          body: { email, subject: cancelSubject, message: cancelMessage, orderId: cancelOrder.id },
        });
      }

      // Delete the order from the database
      const { error } = await supabase.from("orders").delete().eq("id", cancelOrder.id);
      if (error) throw error;

      toast({ title: "Order Cancelled", description: "The order has been cancelled and the customer has been notified." });
      setCancelOrder(null);
      setCancelSubject("");
      setCancelMessage("");
      if (selectedOrder?.id === cancelOrder.id) setSelectedOrder(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to cancel order", variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  };

  if (!hasAdminRole) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="font-body text-muted-foreground">Only administrators can view orders.</p>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status !== 'cancelled');

  return (
    <>
      <Helmet>
        <title>Orders Management - Rooh Al Andalus</title>
        <meta name="description" content="Manage customer orders and request orders." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Orders</h1>
              <p className="font-body text-muted-foreground mt-1">{activeOrders.length} total orders</p>
            </div>
            {newOrderAlert && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full animate-pulse">
                <Bell className="h-4 w-4" />
                <span className="font-body text-sm font-medium">New order received!</span>
              </div>
            )}
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="text-center py-16">
              <p className="font-body text-muted-foreground">Loading orders...</p>
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-20 w-20 text-muted-foreground/40 mx-auto mb-6" />
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">No Orders Yet</h2>
              <p className="font-body text-muted-foreground max-w-md mx-auto">
                When customers place orders, they will appear here. You'll receive real-time notifications for new orders.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeOrders.map((order) => {
                const firstItem = order.items[0];
                return (
                  <div
                    key={order.id}
                    className="bg-card rounded-xl p-4 shadow-soft hover:shadow-elegant transition-all duration-200 cursor-pointer border border-border"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Item Image */}
                      {firstItem?.image && (
                        <img
                          src={firstItem.image}
                          alt={firstItem.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}

                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-semibold text-foreground truncate">
                            {order.customer_name || 'Anonymous'}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.order_type === 'request'
                              ? 'bg-secondary/20 text-secondary-foreground'
                              : order.status === 'pending'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {order.order_type === 'request' ? 'Request Order' : order.status}
                          </span>
                          {order.is_guest && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                              Guest
                            </span>
                          )}
                        </div>
                        <p className="font-body text-sm text-muted-foreground truncate">
                          {order.items.map(i => i.name).join(', ')}
                        </p>
                        <p className="font-body text-xs text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-display text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
                        <p className="font-body text-xs text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="p-6 border-b border-border shrink-0">
            <SheetTitle className="font-display text-lg">Order Details</SheetTitle>
          </SheetHeader>
          
          {selectedOrder && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">
                      {selectedOrder.customer_name || 'Anonymous Customer'}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground">
                      {selectedOrder.customer_email || 'No email provided'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedOrder.is_guest ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    {selectedOrder.is_guest ? 'Guest User' : 'Registered User'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedOrder.order_type === 'request' ? 'bg-secondary/20 text-secondary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    {selectedOrder.order_type === 'request' ? 'Request Order' : 'Standard Order'}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div>
                  <h4 className="font-display text-sm font-semibold text-foreground mb-2">Shipping Address</h4>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="font-body text-sm text-foreground">
                      {selectedOrder.shipping_address.address || 'N/A'}
                    </p>
                    <p className="font-body text-sm text-muted-foreground">
                      {[selectedOrder.shipping_address.city, selectedOrder.shipping_address.state, selectedOrder.shipping_address.zip].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h4 className="font-display text-sm font-semibold text-foreground mb-3">Items Ordered</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-card rounded-lg p-3 border border-border">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                        </p>
                      </div>
                      <p className="font-display font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-border">
                  <span className="font-display font-semibold text-foreground">Total</span>
                  <span className="font-display text-xl font-bold text-primary">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Spending History Chart */}
              {userSpendingData.monthly.length > 0 && (
                <div>
                  <h4 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Customer Spending History
                  </h4>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={userSpendingData.monthly}>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <RechartsTooltip 
                          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                        />
                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Category Breakdown */}
              {userSpendingData.categories.length > 0 && (
                <div>
                  <h4 className="font-display text-sm font-semibold text-foreground mb-3">Spending by Category</h4>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={userSpendingData.categories}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {userSpendingData.categories.map((_, index) => (
                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => [`$${value.toFixed(2)}`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Cancel Button */}
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setCancelOrder(selectedOrder);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Cancel Order
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Cancel Order Dialog */}
      <Dialog open={!!cancelOrder} onOpenChange={() => setCancelOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="font-body text-sm text-muted-foreground">
              This will permanently remove the order and send a cancellation email to the customer.
            </p>
            <div className="space-y-2">
              <Label htmlFor="cancelSubject">Email Subject *</Label>
              <Input
                id="cancelSubject"
                value={cancelSubject}
                onChange={(e) => setCancelSubject(e.target.value)}
                placeholder="e.g., Your order has been cancelled"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancelMessage">Email Message *</Label>
              <Textarea
                id="cancelMessage"
                value={cancelMessage}
                onChange={(e) => setCancelMessage(e.target.value)}
                placeholder="Write the reason or message for the customer..."
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setCancelOrder(null)}>
                Keep Order
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Confirm Cancel"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Orders;
