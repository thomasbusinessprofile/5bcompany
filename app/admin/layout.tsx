import type { Metadata } from "next";
import { NavLink } from "../shared/NavLink";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

const adminTabs = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/quotations", label: "Quotations" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/articles", label: "Articles" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
