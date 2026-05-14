import { saveArticle } from "./actions";
import { getCmsArticles } from "../../shared/article-data";
import { ARTICLE_CATEGORIES } from "../../shared/article-seed";

export const metadata = {
  title: "Admin Articles | 5B Trading",
  description: "Article CMS foundation for SEO content."
};

type AdminArticlesPageProps = {
  searchParams: Promise<{ edit?: string; status?: string }>;
};

function messageFor(status?: string) {
  if (status === "saved") {
    return { tone: "success", text: "Article saved." };
  }

  if (status === "missing-fields") {
    return { tone: "error", text: "Article title and slug are required." };
  }

  if (status === "save-error") {
    return { tone: "error", text: "Article could not be saved. Check permissions and try again." };
  }

  return null;
}

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const { edit, status } = await searchParams;
  const articles = await getCmsArticles();
  const editing = articles.find((article) => article.id === edit);
  const message = messageFor(status);

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">Article CMS</p>
        <h1>Manage SEO articles</h1>
        <p>
          Create sourcing guides and buyer education pages that link into
          product pages and structured request flows.
        </p>
      </section>
      <section className="page-card">
        <div className="cms-list-header">
          <h2>Articles ({articles.length})</h2>
          <a className="primary-link" href="/admin/articles">+ New article</a>
        </div>
        {articles.length === 0 ? (
          <p className="muted">No articles yet. Use the form below to create one.</p>
        ) : (
          <div className="cms-grid">
            {articles.map((article) => {
              const isEditing = editing?.id === article.id;
              return (
                <a
                  className={`cms-card ${isEditing ? "active" : ""}`}
                  href={`/admin/articles?edit=${article.id}`}
                  key={article.id}
                >
                  <strong>{article.title}</strong>
                  <span className="muted">{article.slug}</span>
                  <span className={`status-pill ${article.status}`}>{article.status}</span>
                </a>
              );
            })}
          </div>
        )}
      </section>

      <section className="split">
        <form action={saveArticle} className="page-card request-form">
          {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}
          <h2>{editing ? `Edit: ${editing.title}` : "New article"}</h2>
          <input name="article_id" type="hidden" value={editing?.id ?? ""} />
          <label>
            Title
            <input defaultValue={editing?.title ?? ""} name="title" required />
          </label>
          <label>
            Slug
            <input defaultValue={editing?.slug ?? ""} name="slug" placeholder="stretch-film-sourcing-checklist" />
          </label>
          <label>
            Status
            <select defaultValue={editing?.status ?? "draft"} name="status">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label>
            Category
            <select defaultValue={editing?.category ?? ""} name="category">
              <option value="">— Uncategorised —</option>
              {ARTICLE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Published date
            <input
              defaultValue={editing?.publishedAt ? editing.publishedAt.slice(0, 10) : ""}
              name="published_at"
              type="date"
            />
          </label>
          <label>
            Hero image path
            <input
              defaultValue={editing?.image ?? ""}
              name="image_url"
              placeholder="/images/article-my-slug.jpg"
            />
          </label>
          <label>
            Excerpt
            <textarea defaultValue={editing?.excerpt ?? ""} name="excerpt" />
          </label>
          <label>
            Body (markdown — paragraphs separated by blank line, **bold**, - bullet)
            <textarea defaultValue={editing?.body ?? ""} name="body" rows={16} />
          </label>
          <label>
            Focus keyword
            <input defaultValue={editing?.keyword ?? ""} name="keyword" />
          </label>
          <label>
            SEO title
            <input defaultValue={editing?.seoTitle ?? ""} name="seo_title" />
          </label>
          <label>
            SEO description
            <textarea defaultValue={editing?.seoDescription ?? ""} name="seo_description" />
          </label>
          <button className="primary-link" type="submit">
            Save article
          </button>
        </form>
        <aside className="page-card">
          <h2>Quick tips</h2>
          <ul className="muted" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
            <li>Click a card above to load an article into this form.</li>
            <li>Slug becomes the URL <code>/articles/&lt;slug&gt;</code>.</li>
            <li>Body supports markdown: paragraphs separated by blank line, <code>**bold**</code>, <code>- bullet</code>.</li>
            <li>Set Status to &quot;Published&quot; to make it visible publicly.</li>
            <li>Hero image path is relative to <code>/public</code>, e.g. <code>/images/article-foo.jpg</code>.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
