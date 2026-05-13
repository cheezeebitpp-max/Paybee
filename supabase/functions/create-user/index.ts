import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {

  const { email, password, full_name } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

  if (error) {
    return new Response(
      JSON.stringify(error),
      {
        headers: { "Content-Type": "application/json" },
        status: 400
      }
    );
  }

  await supabase.from("profiles").insert({
    id: data.user.id,
    full_name,
    email,
    role: "user",
    wallet_balance: 0,
    status: "active",
    kyc_status: "pending"
  });

  return new Response(
    JSON.stringify({
      success: true
    }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
});