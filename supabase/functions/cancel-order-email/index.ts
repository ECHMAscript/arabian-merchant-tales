import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, subject, message, orderId } = await req.json();

    if (!email || !subject || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailHtml = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FAF7F2;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Rooh Al Andalus</h1>
          <p style="color: #C9A962; font-size: 14px; margin: 4px 0 0;">روح الأندلس</p>
        </div>
        <div style="background: white; border-radius: 12px; padding: 30px; border: 1px solid #e5e0d5;">
          <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 16px;">${subject}</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 20px; white-space: pre-wrap;">${message}</p>
          ${orderId ? `<p style="color: #999; font-size: 13px; margin-top: 20px;">Order Reference: ${orderId}</p>` : ''}
        </div>
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Rooh Al Andalus <onboarding@resend.dev>",
        to: [email],
        subject: subject,
        html: emailHtml,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending cancellation email:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
