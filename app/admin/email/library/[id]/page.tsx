import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "../../CopyButton";
import { findLibraryTemplate } from "../../../../lib/email/library";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const t = findLibraryTemplate(id);
  return {
    title: t ? `${t.title} | Email playbook` : "Template not found",
    robots: { index: false }
  };
}

export default async function LibraryTemplatePage({ params }: Props) {
  const { id } = await params;
  const t = findLibraryTemplate(id);
  if (!t) notFound();

  const composeHref =
    "/admin/email/compose?template_subject=" +
    encodeURIComponent(t.subject) +
    "&template_body=" +
    encodeURIComponent(t.body);

  return (
    <div className="page-shell">
      <p className="eyebrow">
        <Link href="/admin/email/library">← Back to playbook</Link>
      </p>
      <section className="section-title wide-title">
        <p className="eyebrow">{t.category}</p>
        <h1>{t.title}</h1>
      </section>

      <section className="split">
        <article className="page-card">
          <h2 className="rfq-section-title">Subject line</h2>
          <div className="library-block">
            <pre>{t.subject}</pre>
            <CopyButton text={t.subject} label="Copy subject" />
          </div>

          <h2 className="rfq-section-title">Body</h2>
          <div className="library-block">
            <pre>{t.body}</pre>
            <CopyButton text={t.body} label="Copy body" />
          </div>

          <div className="cta-row" style={{ marginTop: 24 }}>
            <Link className="primary-link" href={composeHref}>
              Use in compose →
            </Link>
            <Link className="secondary-link" href="/admin/email/library">
              Browse more templates
            </Link>
          </div>
        </article>

        <aside className="page-card">
          <h2>When to use</h2>
          <p>{t.whenToUse}</p>

          <h2 style={{ marginTop: 20 }}>Tips before sending</h2>
          <ul className="library-tips">
            {t.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>

          <h2 style={{ marginTop: 20 }}>Variables in this template</h2>
          <ul className="muted" style={{ paddingLeft: 18, fontSize: 13 }}>
            {Array.from(
              new Set(
                ([t.subject, t.body].join(" ").match(/\{\{([a-z0-9_.]+)\}\}/gi) || []).map((m) =>
                  m.replace(/[{}]/g, "")
                )
              )
            ).map((v) => (
              <li key={v}><code>{`{{${v}}}`}</code></li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  );
}
