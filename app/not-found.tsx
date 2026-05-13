import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <section className="page-card">
        <p className="eyebrow">Not Found</p>
        <h1>This page is not available</h1>
        <p>
          The route may be a draft, archived, or not part of the current Step 1
          public structure.
        </p>
        <div className="cta-row">
          <Link className="primary-link" href="/products">
            View Products
          </Link>
          <Link className="secondary-link" href="/">
            Back Home
          </Link>
        </div>
      </section>
    </div>
  );
}
