import type { Metadata } from "next";
import Link from "next/link";
import { NavLink } from "./shared/NavLink";
import { WhatsAppButton } from "./shared/WhatsAppButton";
import { company } from "./shared/company";
import { getSiteUrl } from "./shared/site";
import { createSupabaseServerClient } from "./lib/supabase/server";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

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
  { href: "/about", label: "Our Story" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/articles", label: "Insights" },
  { href: "/request-quote", label: "Sourcing" }
];

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.legalNameEn,
  alternateName: company.shortName,
  url: getSiteUrl(),
  logo: `${getSiteUrl()}/images/warehouse_loading.jpg`,
  email: company.email,
  telephone: company.phone,
  foundingDate: String(company.yearFounded),
  address: {
    "@type": "PostalAddress",
    streetAddress: company.address,
    addressCountry: "VN"
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <html lang="vi" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
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
            {user ? (
              <form action="/logout" method="post" className="auth-form-inline">
                <button className="ghost-link nav-button" type="submit">
                  Logout
                </button>
              </form>
            ) : (
              <Link className="ghost-link" href="/login">
                Login
              </Link>
            )}
            <Link className="primary-link" href="/request-quote">
              Create Request
            </Link>
          </div>
        </header>
        <main>{children}</main>
        <WhatsAppButton />
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
              <h2>Registered company</h2>
              <p>
                <strong>{company.legalNameEn}</strong>
                <br />
                <small>{company.legalNameVi}</small>
              </p>
              <p>{company.address}</p>
              <p>
                Tax ID: {company.taxId}
                <br />
                Founded: {company.yearFounded}
              </p>
              <p>
                Tel / WhatsApp: {company.phone}
                <br />
                Email: <Link href={`mailto:${company.email}`}>{company.email}</Link>
              </p>
              <p className="footer-flags" aria-label="Markets served">
                {company.marketsServed.map((m) => (
                  <span key={m.code} title={m.name}>
                    {m.flag}
                  </span>
                ))}
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
