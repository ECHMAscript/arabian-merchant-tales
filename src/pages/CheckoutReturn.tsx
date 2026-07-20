import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";

const CheckoutReturn = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { cartItems, clearCart } = useCart();
  const { wishlist, removeFromWishlist } = useWishlist();
  const [status, setStatus] = useState<"loading" | "paid" | "pending" | "failed" | "unknown">("loading");

  useEffect(() => {
    let cancelled = false;
    if (!sessionId) {
      setStatus("unknown");
      return;
    }

    async function poll(attempt = 0) {
      const { data } = await supabase
        .from("orders")
        .select("payment_status")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();

      if (cancelled) return;
      const s = data?.payment_status;
      if (s === "paid") {
        setStatus("paid");
        // Clear cart + remove purchased items from wishlist
        for (const it of cartItems) {
          if (wishlist.some((w) => String(w.id) === String(it.id))) {
            removeFromWishlist(it.id);
          }
        }
        clearCart();
      } else if (s === "failed") {
        setStatus("failed");
      } else if (attempt < 8) {
        setTimeout(() => poll(attempt + 1), 1500);
      } else {
        setStatus("pending");
      }
    }
    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card rounded-xl p-8 shadow-soft text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="font-display text-2xl font-semibold text-foreground mb-2">Confirming payment…</h1>
            <p className="text-muted-foreground">Hang tight while we verify your order.</p>
          </>
        )}
        {status === "paid" && (
          <>
            <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-semibold text-foreground mb-2">Payment successful!</h1>
            <p className="text-muted-foreground mb-6">Thank you for your order. A receipt has been sent to your email.</p>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="gold"><Link to="/">Continue Shopping</Link></Button>
              <Button asChild variant="outline"><Link to="/orders">View Orders</Link></Button>
            </div>
          </>
        )}
        {status === "pending" && (
          <>
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-2xl font-semibold text-foreground mb-2">Payment processing</h1>
            <p className="text-muted-foreground mb-6">Your payment is being processed. You'll get an email confirmation shortly.</p>
            <Button asChild variant="gold"><Link to="/">Return to Store</Link></Button>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="h-14 w-14 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-2xl font-semibold text-foreground mb-2">Payment failed</h1>
            <p className="text-muted-foreground mb-6">Something went wrong. Please try again.</p>
            <Button asChild variant="gold"><Link to="/checkout">Try Again</Link></Button>
          </>
        )}
        {status === "unknown" && (
          <>
            <p className="text-muted-foreground mb-6">No payment session found.</p>
            <Button asChild variant="gold"><Link to="/">Return to Store</Link></Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutReturn;
