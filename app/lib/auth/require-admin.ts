import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canAccessAdminArea } from "./roles";

// Defense-in-depth for server actions: middleware blocks UI navigation but
// server actions are POSTable endpoints. Every mutating admin action should
// re-verify the user's role server-side before touching the DB.
//
// `redirect()` from next/navigation throws NEXT_REDIRECT internally — that's
// expected and Next.js handles it. Any *other* exception (network blip,
// expired JWT, etc.) is caught and converted to a /login redirect so the
// global error boundary never trips on a routine auth failure.
export async function requireAdminRole(supabase: SupabaseClient) {
  let userId: string | undefined;
  let profileId: string | null | undefined;
  let role: string | null | undefined;
  try {
    const userRes = await supabase.auth.getUser();
    const user = userRes.data?.user;
    if (!user) redirect("/login?status=expired");
    userId = user.id;

    const profileRes = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .maybeSingle();
    profileId = profileRes.data?.id ?? null;
    role = profileRes.data?.role ?? null;
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    redirect("/login?status=expired");
  }

  if (!canAccessAdminArea(role)) {
    redirect("/login?status=unauthorized");
  }

  return {
    userId: userId as string,
    profileId: profileId as string | null,
    role: role as string
  };
}
