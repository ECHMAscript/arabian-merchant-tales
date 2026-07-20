import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/contexts/CartContext";

interface Props {
  items: CartItem[];
  shippingAddress?: any;
  customerEmail?: string;
  customerName?: string;
  returnUrl: string;
}

export function StripeEmbeddedCheckout({
  items,
  shippingAddress,
  customerEmail,
  customerName,
  returnUrl,
}: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          category: i.category ?? "",
          size: i.size ?? null,
          color: i.color ?? null,
        })),
        shippingAddress,
        customerEmail,
        customerName,
        returnUrl,
        environment: getStripeEnvironment(),
      },
    });
    if (error || !data?.clientSecret) {
      throw new Error(error?.message || data?.error || "Failed to start checkout");
    }
    return data.clientSecret as string;
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
