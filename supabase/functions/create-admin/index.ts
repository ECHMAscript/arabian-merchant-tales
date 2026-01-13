import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateAdminRequest {
  username: string;
  email: string;
  password: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { username, email, password }: CreateAdminRequest = await req.json();

    // Check if username already exists in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: "Username already exists" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create user with admin API (bypasses email confirmation)
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for admin
        user_metadata: {
          username,
        },
      });

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // The trigger will create the profile and assign 'user' role
    // We need to upgrade to 'admin' role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .update({ role: "admin" })
      .eq("user_id", authData.user.id);

    if (roleError) {
      console.error("Role update error:", roleError);
      return new Response(JSON.stringify({ error: roleError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Admin user created successfully:", authData.user.id);

    return new Response(
      JSON.stringify({
        success: true,
        userId: authData.user.id,
        message: "Admin user created successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
