import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canAccessAdminArea } from "./roles";

// Defense-in-depth for server actions: middleware blocks UI navigation but
// server actions are POSTable endpoints. Every mutating admin action should
// re-verify the user's role server-side before touching the DB.
//
// `redirect()` from next/navigation throws NEXT_REDIRECT internally. That's
// fine when called inside a Server Action / Server Component — Next.js catches
// it and responds with a 303. Do NOT wrap this call in try/catch.
export async function requireAdminRole(supabase: SupabaseClient) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/login?status=expired");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !canAccessAdminArea(profile?.role)) {
    redirect("/login?status=unauthorized");
  }

  return { userId: user.id, role: profile?.role as string };
}
