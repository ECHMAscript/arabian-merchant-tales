import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, subject, message, orderId, siteUrl } = await req.json();

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

    const storeUrl = siteUrl || "https://arabian-merchant-tales.lovable.app";

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: Georgia, 'Times New Roman', serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #C9A962, #A68B3E); display: inline-block; text-align: center; line-height: 56px;">
                      <span style="color: #FAF7F2; font-size: 24px; font-weight: bold; font-family: Georgia, serif;">ر</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <h1 style="margin: 0; font-size: 22px; color: #2D1A0E; font-family: Georgia, serif; font-weight: 600; letter-spacing: 0.5px;">Rooh Al Andalus</h1>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #C9A962; font-family: Georgia, serif;">روح الأندلس</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Decorative divider -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="width: 120px;">
                <tr>
                  <td style="border-bottom: 1px solid #C9A962; height: 1px; width: 40px;"></td>
                  <td align="center" style="padding: 0 10px; color: #C9A962; font-size: 16px;">✦</td>
                  <td style="border-bottom: 1px solid #C9A962; height: 1px; width: 40px;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #FFFFFF; border-radius: 16px; border: 1px solid #E8E0D0; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
                
                <!-- Status Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6B1D3A, #8B2A4A); border-radius: 16px 16px 0 0; padding: 20px 32px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1.5px; font-family: Arial, sans-serif;">Order Update</p>
                          <h2 style="margin: 6px 0 0; font-size: 20px; color: #FFFFFF; font-family: Georgia, serif; font-weight: 600;">${subject}</h2>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Message Body -->
                <tr>
                  <td style="padding: 32px;">
                    <p style="color: #4A3728; font-size: 15px; line-height: 1.7; margin: 0 0 24px; white-space: pre-wrap; font-family: Georgia, serif;">${message}</p>

                    ${orderId ? `
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #FAF7F2; border-radius: 10px; border: 1px solid #E8E0D0; margin-bottom: 28px;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <p style="margin: 0; font-size: 12px; color: #8B7A6B; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Order Reference</p>
                          <p style="margin: 6px 0 0; font-size: 14px; color: #2D1A0E; font-family: monospace; font-weight: 600;">${orderId}</p>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                    <!-- Action Buttons -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="padding-bottom: 12px;">
                          <a href="${storeUrl}" style="display: inline-block; background: linear-gradient(135deg, #C9A962, #A68B3E); color: #FFFFFF; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 8px; letter-spacing: 0.5px;">
                            Browse Our Store
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <a href="${storeUrl}/checkout" style="display: inline-block; background: transparent; color: #C9A962; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 36px; border-radius: 8px; border: 2px solid #C9A962; letter-spacing: 0.5px;">
                            Repurchase Items
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="width: 120px; margin-bottom: 16px;">
                <tr>
                  <td style="border-bottom: 1px solid #D4C5A9; height: 1px; width: 40px;"></td>
                  <td align="center" style="padding: 0 10px; color: #D4C5A9; font-size: 12px;">✦</td>
                  <td style="border-bottom: 1px solid #D4C5A9; height: 1px; width: 40px;"></td>
                </tr>
              </table>
              <p style="margin: 0 0 6px; font-size: 13px; color: #8B7A6B; font-family: Georgia, serif;">
                Need help? Reach out to our support team.
              </p>
              <p style="margin: 0; font-size: 12px; color: #B0A494; font-family: Arial, sans-serif;">
                © ${new Date().getFullYear()} Rooh Al Andalus. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
    console.log("Resend API response:", JSON.stringify(data));

    if (!res.ok) {
      throw new Error(`Resend error [${res.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
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
