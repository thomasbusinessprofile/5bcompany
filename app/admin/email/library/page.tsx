import Link from "next/link";
import { EMAIL_LIBRARY, EMAIL_LIBRARY_CATEGORIES, type EmailLibraryCategory } from "../../../lib/email/library";

export const dynamic = "force-dynamic";
export const metadata = { title: "Email playbook | Admin", robots: { index: false } };

type Props = { searchParams: Promise<{ category?: string; q?: string }> };

export default async function EmailLibraryPage({ searchParams }: Props) {
  const { category, q } = await searchParams;
  const activeCategory = (EMAIL_LIBRARY_CATEGORIES as readonly string[]).includes(category ?? "")
    ? (category as EmailLibraryCategory)
    : null;
  const search = (q ?? "").trim().toLowerCase();

  const filtered = EMAIL_LIBRARY.filter((t) => {
    if (activeCategory && t.category !== activeCategory) return false;
    if (search) {
      const hay = [t.title, t.whenToUse, t.subject, t.body].join(" ").toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  const buildHref = (overrides: Partial<{ category: string; q: string }>) => {
    const params = new URLSearchParams();
    const c = overrides.category ?? (activeCategory ?? "");
    const query = overrides.q ?? q;
    if (c) params.set("category", c);
    if (query) params.set("q", query);
    const s = params.toString();
    return s ? `/admin/email/library?${s}` : "/admin/email/library";
  };

  return (
    <div className="page-shell">
      <p className="eyebrow">
        <Link href="/admin/email/compose">← Back to compose</Link>
      </p>
      <section className="section-title wide-title">
        <p className="eyebrow">Email playbook · Training library</p>
        <h1>Pre-written templates for every buyer conversation</h1>
        <p>
          {EMAIL_LIBRARY.length} curated templates with context, tips, and copy-paste bodies.
          Use these as a starting point — every buyer is different, so always personalise
          the first paragraph before sending.
        </p>
      </section>

      <nav className="filter-bar" aria-label="Category filter">
        <Link
          aria-current={activeCategory === null ? "page" : undefined}
          className={activeCategory === null ? "filter-chip active" : "filter-chip"}
          href={buildHref({ category: "" })}
        >
          All ({EMAIL_LIBRARY.length})
        </Link>
        {EMAIL_LIBRARY_CATEGORIES.map((c) => {
          const count = EMAIL_LIBRARY.filter((t) => t.category === c).length;
          const active = activeCategory === c;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={active ? "filter-chip active" : "filter-chip"}
              href={buildHref({ category: c })}
              key={c}
            >
              {c} ({count})
            </Link>
          );
        })}
      </nav>

      <form className="search-bar" method="get">
        {activeCategory ? <input name="category" type="hidden" value={activeCategory} /> : null}
        <input
          defaultValue={q ?? ""}
          name="q"
          placeholder="Search by title, situation, or wording…"
          type="search"
        />
        <button className="secondary-link" type="submit">Search</button>
        {q ? (
          <Link className="ghost-link" href={buildHref({ q: "" })}>Clear</Link>
        ) : null}
      </form>

      <section className="library-grid">
        {filtered.length === 0 ? (
          <p className="muted">No templates match.</p>
        ) : (
          filtered.map((t) => (
            <Link className="library-card" href={`/admin/email/library/${t.id}`} key={t.id}>
              <span className="library-card-category">{t.category}</span>
              <h2>{t.title}</h2>
              <p className="library-card-when">{t.whenToUse}</p>
              <p className="library-card-subject">
                <strong>Subject:</strong> {t.subject}
              </p>
              <span className="library-card-read">Read template →</span>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
