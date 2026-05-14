import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NavLink } from "../shared/NavLink";
import { canAccessAdminArea } from "../lib/auth/roles";
import { createSupabaseServerClient } from "../lib/supabase/server";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

const adminTabs = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/pipeline", label: "Pipeline" },
  { href: "/admin/activities", label: "Activities" },
  { href: "/admin/tasks", label: "Tasks" },
  { href: "/admin/email/compose", label: "Email" },
  { href: "/admin/quotations", label: "Quotations" },
  { href: "/admin/contracts", label: "Contracts" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/articles", label: "Articles" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let role: string | null | undefined;
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) redirect("/login?status=config-error");

    const userRes = await supabase.auth.getUser();
    const user = userRes.data?.user;
    if (!user) redirect("/login?next=/admin/dashboard");

    const profileRes = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    role = profileRes.data?.role ?? null;
  } catch (err) {
    // Re-throw NEXT_REDIRECT so Next.js handles it. Any other error → bounce
    // to /login rather than blow up into the global error boundary.
    if (err && typeof err === "object" && "digest" in err) throw err;
    redirect("/login?status=expired");
  }

  if (!canAccessAdminArea(role)) {
    redirect("/login?status=unauthorized");
  }

  return (
    <>
      <nav className="admin-subnav" aria-label="Admin sections">
        {adminTabs.map((tab) => (
          <NavLink className="admin-subnav-link" href={tab.href} key={tab.href}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
      {children}
    </>
  );
}
