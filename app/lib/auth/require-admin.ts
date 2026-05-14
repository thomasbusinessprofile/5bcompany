import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canAccessAdminArea } from "./roles";

// Defense-in-depth for server actions: middleware blocks UI navigation but
// server actions are POSTable endpoints. Every mutating admin action should
// re-verify the user's role server-side before touching the DB.
export async function requireAdminRole(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?status=expired");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!canAccessAdminArea(profile?.role)) {
    redirect("/login?status=unauthorized");
  }

  return { userId: user.id, role: profile?.role as string };
}
