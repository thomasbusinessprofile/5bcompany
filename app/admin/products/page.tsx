import { saveProduct } from "./actions";
import { getProductCmsData } from "../../shared/product-cms-data";

export const metadata = {
  title: "Admin Products | 5B Trading",
  description: "Product CMS foundation for public catalogue content."
};

type AdminProductsPageProps = {
  searchParams: Promise<{ edit?: string; status?: string }>;
};

function messageFor(status?: string) {
  if (status === "saved") {
    return { tone: "success", text: "Product saved." };
  }

  if (status === "missing-fields") {
    return { tone: "error", text: "Product name and slug are required." };
  }

  if (status === "save-error") {
    return { tone: "error", text: "Product could not be saved. Check permissions and try again." };
  }

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
      <section className="split">
        <form action={saveProduct} className="page-card request-form">
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
            <textarea defaultValue={editing?.shortDescription ?? ""} name="short_description" />
          </label>
          <label>
            Long description
            <textarea name="long_description" />
          </label>
          <label>
            Specifications
            <textarea name="specifications" placeholder="One item per line or comma separated" />
          </label>
          <label>
            Applications
            <textarea name="applications" placeholder="One item per line or comma separated" />
          </label>
          <label>
            Packing options
            <textarea name="packing_options" placeholder="One item per line or comma separated" />
          </label>
          <label>
            Documents
            <textarea name="documents" placeholder="One item per line or comma separated" />
          </label>
          <label>
            MOQ
            <input name="moq" placeholder="Contact for details..." />
          </label>
          <label>
            Lead time
            <input name="lead_time" placeholder="Subject to confirmed specification..." />
          </label>
          <label>
            SEO title
            <input name="seo_title" />
          </label>
          <label>
            SEO description
            <textarea name="seo_description" />
          </label>
          <button className="primary-link" type="submit">
            Save product
          </button>
        </form>
        <aside className="page-card">
          <h2>Products</h2>
          <div className="table-list">
            {products.map((product) => (
              <div className="table-row" key={product.id}>
                <a className="row-link" href={`/admin/products?edit=${product.id}`}>
                  {product.name}
                </a>
                <span>{product.status}</span>
                <span>{product.slug}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
