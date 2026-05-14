import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createPublicSupabaseClient } from "../../lib/supabase/public";
import { company as sellerCompany } from "../../shared/company";
import {
  CONTRACT_TYPE_LABEL,
  formatMoney,
  type ContractType,
  type LineItem
} from "../../lib/contracts/types";
import { acceptContract, declineContract } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Review contract | 5B Trading",
  robots: { index: false, follow: false }
};

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ status?: string }> };

type ContractView = {
  id: string;
  contract_number: string;
  type: ContractType;
  version: number;
  buyer_legal_name: string;
  buyer_signer_name: string | null;
  buyer_signer_email: string | null;
  buyer_signer_title: string | null;
  buyer_address: string | null;
  buyer_tax_id: string | null;
  currency: string;
  total_amount: string | number;
  tax_pct: string | number;
  incoterm: string | null;
  payment_terms: string | null;
  validity_until: string | null;
  delivery_window: string | null;
  line_items: LineItem[];
  terms_html: string | null;
  language: string;
  pdf_url: string | null;
  status: "sent" | "viewed";
  sent_at: string | null;
  viewed_at: string | null;
};

function flash(status?: string) {
  if (status === "signed") return { tone: "success", text: "Thank you — your acceptance has been recorded. A signed copy has been emailed to both parties." };
  if (status === "declined") return { tone: "success", text: "We've recorded your decision. The seller will follow up." };
  if (status === "missing-name") return { tone: "error", text: "Please type your full name to confirm acceptance." };
  if (status === "accept-failed") return { tone: "error", text: "Acceptance failed. The link may have expired — please request a new one." };
  if (status === "decline-failed") return { tone: "error", text: "Could not record your response. Please email hello@5bcompany.com." };
  if (status === "config-error") return { tone: "error", text: "The signing service is temporarily unavailable." };
  if (status === "invalid") return { tone: "error", text: "Invalid link." };
  return null;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default async function SignContractPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { status } = await searchParams;
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return (
      <div className="page-shell">
        <p className="form-status error">Service unavailable.</p>
      </div>
    );
  }

  const banner = flash(status);
  const showTerminalSuccess = status === "signed" || status === "declined";

  // Fetch contract by token. If terminal status already reached, the read RPC
  // returns null — show the terminal banner only.
  const { data } = await supabase.rpc("get_contract_by_token", { p_token: token });
  const contract = (data as ContractView | null) ?? null;

  if (!contract && !showTerminalSuccess) {
    // Invalid, expired, or revoked. Don't leak existence.
    notFound();
  }

  // Mark viewed (fire-and-forget on first non-terminal load).
  if (contract && contract.status === "sent") {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      h.get("cf-connecting-ip") ||
      "";
    const ua = h.get("user-agent") ?? "";
    void supabase.rpc("mark_contract_viewed", { p_token: token, p_ip: ip, p_user_agent: ua });
  }

  if (showTerminalSuccess) {
    return (
      <div className="sign-shell">
        <div className="sign-card">
          <Link className="auth-brand" href="/">
            <span className="brand-mark">5B</span>
            <span>
              <strong>5B Trading</strong>
              <small>Contract review</small>
            </span>
          </Link>
          {banner ? <p className={`form-status ${banner.tone}`}>{banner.text}</p> : null}
          <p className="muted">You can safely close this window.</p>
        </div>
      </div>
    );
  }

  const total = Number(contract!.total_amount);
  const items = Array.isArray(contract!.line_items) ? contract!.line_items : [];
  const subtotal = items.reduce((s, i) => s + Number(i.subtotal ?? 0), 0);
  const taxPct = Number(contract!.tax_pct ?? 0);
  const tax = (subtotal * taxPct) / 100;

  return (
    <div className="sign-shell">
      <div className="sign-card sign-card-wide">
        <header className="sign-header">
          <Link className="auth-brand" href="/">
            <span className="brand-mark">5B</span>
            <span>
              <strong>5B Trading</strong>
              <small>Contract review</small>
            </span>
          </Link>
          <div className="sign-meta">
            <strong>{contract!.contract_number}</strong>
            <span className="muted">{CONTRACT_TYPE_LABEL[contract!.type]} · v{contract!.version}</span>
          </div>
        </header>

        {banner ? <p className={`form-status ${banner.tone}`}>{banner.text}</p> : null}

        <section className="sign-parties">
          <div>
            <h3>From</h3>
            <p><strong>{sellerCompany.legalNameEn}</strong></p>
            <p className="muted">{sellerCompany.address}</p>
            <p className="muted">Tax ID {sellerCompany.taxId}</p>
          </div>
          <div>
            <h3>To</h3>
            <p><strong>{contract!.buyer_legal_name}</strong></p>
            {contract!.buyer_address ? <p className="muted">{contract!.buyer_address}</p> : null}
            {contract!.buyer_signer_name ? (
              <p className="muted">
                Attn: {contract!.buyer_signer_name}
                {contract!.buyer_signer_title ? `, ${contract!.buyer_signer_title}` : ""}
              </p>
            ) : null}
          </div>
        </section>

        <section className="sign-summary">
          <div className="sign-summary-row">
            <span className="muted">Incoterm</span>
            <strong>{contract!.incoterm ?? "—"}</strong>
          </div>
          <div className="sign-summary-row">
            <span className="muted">Payment terms</span>
            <strong>{contract!.payment_terms ?? "—"}</strong>
          </div>
          <div className="sign-summary-row">
            <span className="muted">Delivery window</span>
            <strong>{contract!.delivery_window ?? "—"}</strong>
          </div>
          <div className="sign-summary-row">
            <span className="muted">Valid until</span>
            <strong>{fmtDate(contract!.validity_until)}</strong>
          </div>
          <div className="sign-summary-row">
            <span className="muted">Total value</span>
            <strong style={{ color: "var(--green)" }}>{formatMoney(total, contract!.currency)}</strong>
          </div>
        </section>

        <section className="sign-items">
          <h3>Line items</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th className="num">Qty</th>
                <th>Unit</th>
                <th className="num">Unit price</th>
                <th className="num">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="muted" colSpan={5}>(no line items)</td>
                </tr>
              ) : (
                items.map((it, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{it.name}</strong>
                      {it.description ? <div className="muted">{it.description}</div> : null}
                    </td>
                    <td className="num">{Number(it.quantity).toLocaleString()}</td>
                    <td>{it.unit}</td>
                    <td className="num">{formatMoney(Number(it.unit_price), contract!.currency)}</td>
                    <td className="num">{formatMoney(Number(it.subtotal), contract!.currency)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td className="muted" colSpan={4}>Subtotal</td>
                <td className="num">{formatMoney(subtotal, contract!.currency)}</td>
              </tr>
              {taxPct > 0 ? (
                <tr>
                  <td className="muted" colSpan={4}>Tax ({taxPct}%)</td>
                  <td className="num">{formatMoney(tax, contract!.currency)}</td>
                </tr>
              ) : null}
              <tr className="sign-grand-total">
                <td colSpan={4}>Total</td>
                <td className="num">{formatMoney(subtotal + tax, contract!.currency)}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        {contract!.terms_html ? (
          <section className="sign-terms">
            <h3>Terms</h3>
            <div className="sign-terms-body" dangerouslySetInnerHTML={{ __html: contract!.terms_html }} />
          </section>
        ) : null}

        <section className="sign-actions">
          <form action={acceptContract} className="sign-accept">
            <input name="token" type="hidden" value={token} />
            <h3>Accept and sign</h3>
            <p className="muted">
              By typing your full legal name and clicking <strong>Accept</strong>, you electronically
              accept this contract on behalf of {contract!.buyer_legal_name}. Your IP, browser, and
              timestamp will be logged as an audit trail.
            </p>
            <label>
              Full name (as it appears on the contract)
              <input
                autoComplete="name"
                defaultValue={contract!.buyer_signer_name ?? ""}
                name="typed_name"
                required
              />
            </label>
            <button className="primary-link" type="submit">
              Accept &amp; sign electronically
            </button>
          </form>

          <details className="sign-decline">
            <summary>Or decline / request changes</summary>
            <form action={declineContract}>
              <input name="token" type="hidden" value={token} />
              <label>
                Reason or proposed changes
                <textarea
                  name="reason"
                  placeholder="Tell us what to change, or why you're declining."
                  rows={4}
                />
              </label>
              <button className="ghost-link danger" type="submit">Submit response</button>
            </form>
          </details>
        </section>

        <footer className="sign-footer">
          Need help? Email{" "}
          <a href={`mailto:${sellerCompany.email}`}>{sellerCompany.email}</a> with reference{" "}
          <strong>{contract!.contract_number}</strong>.
        </footer>
      </div>
    </div>
  );
}
