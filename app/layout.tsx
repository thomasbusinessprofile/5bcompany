import type { Metadata } from "next";
import Link from "next/link";
import { NavLink } from "./shared/NavLink";
import { company } from "./shared/company";
import { getSiteUrl } from "./shared/site";
import "./globals.css";

export const metadata: Metadata = {
  alternates: {
    canonical: "/"
  },
  title: "5B Trading | B2B Export Sourcing Portal",
  description:
    "Reliable Vietnam export sourcing by 5B Trading for bamboo, packaging, charcoal, biochar, and natural furniture buyers.",
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    description:
      "Reliable Vietnam export sourcing by 5B Trading for bamboo, packaging, charcoal, biochar, and natural furniture buyers.",
    siteName: "5B Trading",
    title: "5B Trading | B2B Export Sourcing Portal",
    type: "website"
  }
};

const navItems = [
  { href: "/products", label: "Products" },
  { href: "/request-quote", label: "Sourcing" },
  { href: "/export-process", label: "Export Process" },
  { href: "/articles", label: "Insights" },
  { href: "/buyer/dashboard", label: "Buyer" },
  { href: "/admin/dashboard", label: "Admin" }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label={`${company.shortName} home`}>
            <span className="brand-mark">5B</span>
            <span>
              <strong>{company.shortName}</strong>
              <small>Export Sourcing</small>
            </span>
          </Link>
          <nav className="site-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <Link className="ghost-link" href="/login">
              Login
            </Link>
            <form action="/logout" method="post">
              <button className="ghost-link nav-button" type="submit">
                Logout
              </button>
            </form>
            <Link className="primary-link" href="/request-quote">
              Create Request
            </Link>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div>
            <Link className="brand footer-brand" href="/">
              <span className="brand-mark">5B</span>
              <span>
                <strong>{company.shortName}</strong>
                <small>Export Sourcing</small>
              </span>
            </Link>
            <p>
              B2B export sourcing portal for serious buyers seeking Vietnam
              product supply with structured requests and admin-controlled
              quotation workflow.
            </p>
            <div className="seller-block">
              <h2>The Seller / Ben ban</h2>
              <p>
                <strong>{company.legalNameVi}</strong>
                <br />
                {company.legalNameEn}
              </p>
              <p>{company.address}</p>
              <p>Tel: {company.phone}</p>
              <p>
                Represented by: {company.representativeEn}
                <br />
                Nguoi dai dien: {company.representativeVi}
              </p>
            </div>
          </div>
          <div>
            <h2>Product Groups</h2>
            <Link href="/products/bamboo-fence">Bamboo products</Link>
            <Link href="/products/stretch-film">Packaging materials</Link>
            <Link href="/products/bbq-charcoal">Charcoal and biochar</Link>
            <Link href="/products/rattan-furniture">Rattan furniture</Link>
          </div>
          <div>
            <h2>Export Support</h2>
            <Link href="/export-process">Export process</Link>
            <Link href="/articles">Insights</Link>
            <Link href="/request-quote">Create sourcing request</Link>
            <Link href="/admin/products">Product CMS</Link>
            <Link href="/admin/articles">Article CMS</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
