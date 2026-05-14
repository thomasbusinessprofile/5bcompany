// Whitelist user-provided redirect targets to internal paths only.
// Blocks open-redirect via `next` / `redirect_to` form params:
//   "//evil.example/"  → not safe (protocol-relative)
//   "/admin/products"  → safe
//   "https://x.com"    → not safe
//   ""                 → not safe (caller picks default)
export function safeInternalPath(input: string | undefined | null): string | null {
  if (!input) return null;
  const v = input.trim();
  if (!v.startsWith("/")) return null;
  if (v.startsWith("//")) return null;
  if (v.startsWith("/\\")) return null;
  // Disallow CR/LF or any control char that could split headers.
  if (/[\r\n\t\0]/.test(v)) return null;
  return v;
}
