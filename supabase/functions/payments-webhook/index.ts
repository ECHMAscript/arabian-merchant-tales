import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

async function markOrderPaid(sessionId: string, env: StripeEnv) {
  await getSupabase()
    .from("orders")
    .update({
      payment_status: "paid",
      status: "paid",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_session_id", sessionId)
    .eq("environment", env);
}

async function markOrderFailed(sessionId: string, env: StripeEnv) {
  await getSupabase()
    .from("orders")
    .update({
      payment_status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_session_id", sessionId)
    .eq("environment", env);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log("Webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed":
      case "transaction.completed": {
        const obj = event.data.object;
        const sessionId = obj.id || obj.checkout_session || obj.session_id;
        if (sessionId) await markOrderPaid(sessionId, env);
        break;
      }
      case "checkout.session.async_payment_failed":
      case "transaction.payment_failed": {
        const obj = event.data.object;
        const sessionId = obj.id || obj.checkout_session || obj.session_id;
        if (sessionId) await markOrderFailed(sessionId, env);
        break;
      }
      default:
        console.log("Unhandled event:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
