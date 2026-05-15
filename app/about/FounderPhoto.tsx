"use client";

import { useState } from "react";

/** Renders a founder portrait with a graceful fallback if the image 404s. */
export function FounderPhoto({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="founder-photo founder-photo-fallback" aria-hidden="true">
        <span>Portrait coming soon</span>
      </div>
    );
  }

  return (
    <div className="founder-photo">
      <img
        alt={`Portrait of ${name}`}
        onError={() => setFailed(true)}
        src={src}
      />
    </div>
  );
}
