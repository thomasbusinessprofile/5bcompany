import { deleteProduct, saveProduct } from "./actions";
import { getProductCmsData } from "../../shared/product-cms-data";

export const metadata = {
  title: "Admin Products | 5B Trading",
  description: "Product CMS foundation for public catalogue content."
};

type AdminProductsPageProps = {
  searchParams: Promise<{ edit?: string; status?: string }>;
};

function messageFor(status?: string) {
  if (status === "saved") return { tone: "success", text: "Product saved." };
  if (status === "deleted") return { tone: "success", text: "Product deleted." };
  if (status === "missing-fields") return { tone: "error", text: "Product name and slug are required." };
  if (status === "save-error") return { tone: "error", text: "Product could not be saved. Check permissions and try again." };
  return null;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const { edit, status } = await searchParams;
  const { categories, products } = await getProductCmsData();
  const editing = products.find((product) => product.id === edit);
  const message = messageFor(status);

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">Product CMS</p>
        <h1>Manage public catalogue</h1>
        <p>
          Create and update product pages used by the public catalogue and buyer
          sourcing forms.
        </p>
      </section>
      <section className="page-card">
        <div className="cms-list-header">
          <h2>Products ({products.length})</h2>
          <a className="primary-link" href="/admin/products">+ New product</a>
        </div>
        {products.length === 0 ? (
          <p className="muted">No products yet. Use the form below to create one.</p>
        ) : (
          <div className="cms-grid">
            {products.map((product) => {
              const isEditing = editing?.id === product.id;
              return (
                <a
                  className={`cms-card ${isEditing ? "active" : ""}`}
                  href={`/admin/products?edit=${product.id}`}
                  key={product.id}
                >
                  {product.images[0] ? (
                    <div className="cms-card-thumb">
                      <img alt="" src={product.images[0]} />
                    </div>
                  ) : null}
                  <strong>{product.name}</strong>
                  <span className="muted">{product.slug}</span>
                  <span className={`status-pill ${product.status}`}>{product.status}</span>
                </a>
              );
            })}
          </div>
        )}
      </section>

      <section className="split">
        <form action={saveProduct} className="page-card request-form">
          <h2>{editing ? `Edit: ${editing.name}` : "New product"}</h2>
          {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}
          <input name="product_id" type="hidden" value={editing?.id ?? ""} />
          <label>
            Name
            <input defaultValue={editing?.name ?? ""} name="name" placeholder="Bamboo Fence" required />
          </label>
          <label>
            Slug
            <input defaultValue={editing?.slug ?? ""} name="slug" placeholder="bamboo-fence" />
          </label>
          <label>
            Category
            <select defaultValue={editing?.categoryId ?? ""} name="category_id">
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select defaultValue={editing?.status ?? "draft"} name="status">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label>
            Short description
            <textarea defaultValue={editing?.shortDescription ?? ""} name="short_description" rows={2} />
          </label>
          <label>
            Long description
            <textarea defaultValue={editing?.longDescription ?? ""} name="long_description" rows={5} />
          </label>
          <label>
            Images (one URL per line, e.g. /images/bamboo_fence.jpg)
            <textarea
              defaultValue={editing?.images.join("\n") ?? ""}
              name="images"
              placeholder="/images/your-product.jpg"
              rows={3}
            />
          </label>
          {editing && editing.images.length > 0 ? (
            <div className="image-preview-row">
              {editing.images.map((url) => (
                <img alt="" key={url} src={url} />
              ))}
            </div>
          ) : null}
          <label>
            Specifications (one item per line or comma-separated)
            <textarea
              defaultValue={editing?.specifications.join("\n") ?? ""}
              name="specifications"
              rows={4}
            />
          </label>
          <label>
            Applications (one item per line or comma-separated)
            <textarea
              defaultValue={editing?.applications.join("\n") ?? ""}
              name="applications"
              rows={3}
            />
          </label>
          <label>
            Packing options (one item per line or comma-separated)
            <textarea
              defaultValue={editing?.packingOptions.join("\n") ?? ""}
              name="packing_options"
              rows={3}
            />
          </label>
          <label>
            Documents (CO, FSC, BSCI… one per line)
            <textarea
              defaultValue={editing?.documents.join("\n") ?? ""}
              name="documents"
              rows={3}
            />
          </label>
          <label>
            MOQ
            <input defaultValue={editing?.moq ?? ""} name="moq" placeholder="e.g. 1 × 40HQ" />
          </label>
          <label>
            Lead time
            <input
              defaultValue={editing?.leadTime ?? ""}
              name="lead_time"
              placeholder="e.g. 21–30 days from confirmed order"
            />
          </label>
          <label>
            SEO title
            <input defaultValue={editing?.seoTitle ?? ""} name="seo_title" />
          </label>
          <label>
            SEO description
            <textarea defaultValue={editing?.seoDescription ?? ""} name="seo_description" rows={2} />
          </label>
          <button className="primary-link" type="submit">Save product</button>

          {editing ? (
            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
              <a className="secondary-link" href={`/products/${editing.slug}`} rel="noopener noreferrer" target="_blank">
                View on site →
              </a>
              <a className="ghost-link" href="/admin/products">Cancel edit</a>
            </div>
          ) : null}
        </form>
        <aside className="page-card">
          <h2>Quick tips</h2>
          <ul className="muted" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
            <li>Click a card above to load a product into this form.</li>
            <li>Slug becomes the URL <code>/products/&lt;slug&gt;</code>.</li>
            <li>Status &quot;Draft&quot; hides the product from the public catalogue.</li>
            <li>List items accept one per line or comma-separated.</li>
            <li>Image URLs are relative to <code>/public</code>, e.g. <code>/images/bamboo_fence.jpg</code>, or full external URLs.</li>
          </ul>

          {editing ? (
            <>
              <h2 style={{ marginTop: 28 }}>Danger zone</h2>
              <form action={deleteProduct}>
                <input name="product_id" type="hidden" value={editing.id} />
                <button className="ghost-link danger" type="submit">Delete product</button>
              </form>
            </>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
