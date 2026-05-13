"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="page-shell">
      <section className="page-card">
        <p className="eyebrow">Error</p>
        <h1>Something went wrong</h1>
        <p>
          We encountered an unexpected error while trying to load this page.
        </p>
        <div className="cta-row">
          <button className="primary-link" onClick={() => reset()}>
            Try again
          </button>
          <Link className="secondary-link" href="/">
            Back Home
          </Link>
        </div>
      </section>
    </div>
  );
}
