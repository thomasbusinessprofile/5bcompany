import Link from "next/link";
import { registerBuyer } from "./actions";
import { SubmitButton } from "../shared/SubmitButton";
import { BUSINESS_TYPES } from "../lib/constants";

const businessTypes = BUSINESS_TYPES;

export const metadata = {
  title: "Create account | 5B Trading",
  description: "Create a 5B Trading buyer account to track your sourcing requests, quotations, and orders.",
  robots: { index: false, follow: false }
};

type RegisterPageProps = {
  searchParams: Promise<{ status?: string }>;
};

function getMessage(status?: string) {
  if (status === "missing-fields") return { tone: "error", text: "Please enter name, work email, company name, and password." };
  if (status === "email-exists") return { tone: "error", text: "This email is already registered. Please sign in instead." };
  if (status === "submit-error") return { tone: "error", text: "Registration failed. Please check the details or try signing in." };
  if (status === "config-error") return { tone: "error", text: "Authentication is not configured for this environment." };
  return null;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { status } = await searchParams;
  const message = getMessage(status);

  return (
    <div className="auth-shell">
      <div className="auth-card auth-card-wide">
        <Link className="auth-brand" href="/">
          <span className="brand-mark">5B</span>
          <span>
            <strong>5B Trading</strong>
            <small>Buyer workspace</small>
          </span>
        </Link>

        <h1>Create your buyer account</h1>
        <p className="auth-lede">
          Track every sourcing request, quotation, and shipment in one place. Free to register —
          we'll reply to your first RFQ within one working day.
        </p>

        {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}

        <form action={registerBuyer} className="auth-form">
          <div className="auth-row">
            <label>
              Full name
              <input autoComplete="name" name="full_name" placeholder="Your name" required />
            </label>
            <label>
              Work email
              <input
                autoComplete="email"
                inputMode="email"
                name="email"
                placeholder="you@company.com"
                required
                type="email"
              />
            </label>
          </div>

          <div className="auth-row">
            <label>
              Company name
              <input autoComplete="organization" name="company_name" placeholder="Company name" required />
            </label>
            <label>
              Country
              <input autoComplete="country-name" name="country" placeholder="Germany" />
            </label>
          </div>

          <div className="auth-row">
            <label>
              Business type
              <select defaultValue="" name="business_type" required>
                <option value="" disabled>Select…</option>
                {businessTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
            <label>
              WhatsApp / Phone
              <input autoComplete="tel" inputMode="tel" name="phone" placeholder="+49…" />
            </label>
          </div>

          <label>
            Password
            <input
              autoComplete="new-password"
              minLength={8}
              name="password"
              placeholder="At least 8 characters"
              required
              type="password"
            />
          </label>

          <SubmitButton pendingLabel="Creating account...">Create account</SubmitButton>
        </form>

        <p className="auth-sub">
          Already have an account?{" "}
          <Link className="auth-link" href="/login">Sign in →</Link>
        </p>
      </div>

      <p className="auth-footer">
        <Link href="/">← Back to 5bcompany.com</Link>
      </p>
    </div>
  );
}
