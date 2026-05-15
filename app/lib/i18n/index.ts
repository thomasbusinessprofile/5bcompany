import { adminVi } from "./admin-dict";

/**
 * Translate an admin-UI label to Vietnamese (the operator's language).
 *
 * Fallback: returns the English source key unchanged when no translation
 * exists, so wrapping a label in tA() is always safe.
 *
 * Usage:
 *   <h1>{tA("Contacts")}</h1>          // → "Liên hệ"
 *   <button>{tA("Save")}</button>      // → "Lưu"
 *
 * Public site, outbound emails, and contract PDFs do NOT use this — they
 * remain in English for the foreign-buyer audience.
 */
export function tA(key: string): string {
  return adminVi[key] ?? key;
}

export { adminVi };
