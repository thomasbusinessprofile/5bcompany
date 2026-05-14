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
  { href: "/admin/products", label: "Products" },
  { href: "/admin/articles", label: "Articles" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?status=config-error");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!canAccessAdminArea(profile?.role)) {
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
