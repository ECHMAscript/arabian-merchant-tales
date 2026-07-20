import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  size?: string | null;
  color?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const { items, shippingAddress, customerEmail, customerName, returnUrl, environment } =
      await req.json() as {
        items: CartItem[];
        shippingAddress?: any;
        customerEmail?: string;
        customerName?: string;
        returnUrl: string;
        environment: StripeEnv;
      };

    if (!items?.length) throw new Error("Cart is empty");
    if (environment !== "sandbox" && environment !== "live") throw new Error("Invalid environment");

    // Auth: identify user if signed in (optional)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let email = customerEmail;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
        email = email || user.email || undefined;
      }
    }

    // Compute totals (server-side truth)
    const subtotalCents = items.reduce(
      (sum, it) => sum + Math.round(Number(it.price) * 100) * Number(it.quantity),
      0,
    );
    const shippingCents = subtotalCents >= 15000 ? 0 : 1500;

    const stripe = createStripeClient(environment);

    // Build line items with inline pricing (price_data)
    const line_items = items.map((it) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: it.name,
          ...(it.image && { images: [it.image] }),
          description: [it.category, it.size && `Size: ${it.size}`, it.color && `Color: ${it.color}`]
            .filter(Boolean).join(" · ") || undefined,
        },
        unit_amount: Math.round(Number(it.price) * 100),
      },
      quantity: Number(it.quantity),
    }));

    // Shipping as a separate line item (flat $15, free over $150)
    if (shippingCents > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: shippingCents,
        },
        quantity: 1,
      });
    }

    const totalCents = subtotalCents + shippingCents;
    const totalDollars = (totalCents / 100).toFixed(2);

    // Resolve/create Stripe customer if we know the user
    let customerId: string | undefined;
    if (userId || email) {
      if (userId && !/^[a-zA-Z0-9-]+$/.test(userId)) throw new Error("Invalid userId");
      if (userId) {
        const found = await stripe.customers.search({
          query: `metadata['userId']:'${userId}'`,
          limit: 1,
        });
        if (found.data.length) customerId = found.data[0].id;
      }
      if (!customerId && email) {
        const list = await stripe.customers.list({ email, limit: 1 });
        if (list.data.length) {
          const c = list.data[0];
          if (userId && c.metadata?.userId !== userId) {
            await stripe.customers.update(c.id, { metadata: { ...c.metadata, userId } });
          }
          customerId = c.id;
        }
      }
      if (!customerId) {
        const created = await stripe.customers.create({
          ...(email && { email }),
          ...(customerName && { name: customerName }),
          ...(userId && { metadata: { userId } }),
        });
        customerId = created.id;
      }
    }

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      ...(customerId && { customer: customerId }),
      payment_intent_data: {
        description: `Order — ${items.length} item(s)`,
      },
      metadata: {
        ...(userId && { userId }),
      },
    });

    // Pre-create the order in unpaid state so the webhook can flip it to paid
    const orderItems = items.map((it) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      image: it.image,
      category: it.category ?? "",
      size: it.size ?? null,
      color: it.color ?? null,
    }));

    await supabase.from("orders").insert({
      user_id: userId,
      items: orderItems as any,
      total: Number(totalDollars),
      status: "pending",
      order_type: "standard",
      customer_name: customerName || email || "Customer",
      customer_email: email || null,
      is_guest: !userId,
      shipping_address: shippingAddress ?? null,
      stripe_session_id: session.id,
      payment_status: "unpaid",
      environment,
    });

    return new Response(
      JSON.stringify({ clientSecret: session.client_secret, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("create-checkout error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Checkout failed" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
