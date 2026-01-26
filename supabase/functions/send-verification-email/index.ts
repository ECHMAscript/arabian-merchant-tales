import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  userId: string;
  username: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userId, username }: VerificationEmailRequest = await req.json();

    // Validate required fields
    if (!email || !userId) {
      throw new Error("Missing required fields: email and userId are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a secure verification token
    const token = crypto.randomUUID() + "-" + crypto.randomUUID();
    
    // Store the token in the database
    const { error: tokenError } = await supabase
      .from("email_verification_tokens")
      .insert({
        user_id: userId,
        token: token,
        email: email,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

    if (tokenError) {
      console.error("Error storing verification token:", tokenError);
      throw new Error("Failed to create verification token");
    }

    // Build the verification URL
    const siteUrl = Deno.env.get("SITE_URL") || "https://arabian-merchant-tales.lovable.app";
    const verificationUrl = `${siteUrl}/verify-email?token=${token}`;

    // Send the branded verification email
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header with Logo -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #c9a227 0%, #e0b942 100%); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              <span style="font-family: 'Playfair Display', Georgia, serif; color: #faf8f5; font-size: 36px; font-weight: bold; display: block; text-align: center; line-height: 80px;">ر</span>
            </div>
            <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #3d2e1f; font-size: 28px; margin: 0; font-weight: 600;">
              Rooh Al Andalus
            </h1>
          </div>

          <!-- Main Content Card -->
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(61, 46, 31, 0.08);">
            <h2 style="font-family: 'Playfair Display', Georgia, serif; color: #3d2e1f; font-size: 24px; text-align: center; margin: 0 0 16px;">
              Welcome, ${username || 'Valued Customer'}!
            </h2>
            
            <p style="color: #6b5c4c; font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 32px;">
              Thank you for joining Rooh Al Andalus. To complete your registration and explore our collection of authentic Arabian treasures, please verify your email address.
            </p>

            <!-- Decorative Divider -->
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; width: 40px; height: 1px; background: #c9a227; vertical-align: middle;"></span>
              <span style="color: #c9a227; margin: 0 12px; font-size: 14px;">✦</span>
              <span style="display: inline-block; width: 40px; height: 1px; background: #c9a227; vertical-align: middle;"></span>
            </div>

            <!-- Verification Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #c9a227 0%, #dbb93a 100%); color: #faf8f5; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(201, 162, 39, 0.3);">
                Verify My Account
              </a>
            </div>

            <p style="color: #8b7c6c; font-size: 14px; text-align: center; margin: 24px 0 0;">
              This link will expire in 24 hours for your security.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e8e2d9;">
            <p style="color: #8b7c6c; font-size: 13px; margin: 0 0 8px;">
              If you didn't create an account with us, please ignore this email.
            </p>
            <p style="color: #a39585; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Rooh Al Andalus. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Rooh Al Andalus <noreply@resend.dev>",
      to: [email],
      subject: "Verify Your Account - Rooh Al Andalus",
      html: htmlContent,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
