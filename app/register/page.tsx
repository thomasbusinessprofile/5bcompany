import Link from "next/link";
import { registerBuyer } from "./actions";

const businessTypes = [
  { label: "Importer", value: "importer" },
  { label: "Distributor", value: "distributor" },
  { label: "Wholesaler", value: "wholesaler" },
  { label: "Retailer", value: "retailer" },
  { label: "Manufacturer", value: "manufacturer" },
  { label: "Sourcing agent", value: "sourcing_agent" },
  { label: "Other", value: "other" }
];

export const metadata = {
  title: "Register | 5B Trading",
  description: "Register a buyer account for structured export sourcing requests."
};

type RegisterPageProps = {
  searchParams: Promise<{ status?: string }>;
};

function getMessage(status?: string) {
  if (status === "missing-fields") {
    return { tone: "error", text: "Please enter name, work email, company name, and password." };
  }

  if (status === "email-exists") {
    return { tone: "error", text: "This email is already registered. Please login instead." };
  }

  if (status === "submit-error") {
    return { tone: "error", text: "Registration failed. Please check the details or try signing in." };
  }

  if (status === "config-error") {
    return { tone: "error", text: "Supabase is not configured for this environment." };
  }

  return null;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { status } = await searchParams;
  const message = getMessage(status);

  return (
    <div className="page-shell auth-shell">
      <section className="section-title">
        <p className="eyebrow">Create Account</p>
        <h1>Create a buyer sourcing account</h1>
        <p>
          Buyer accounts move the website from one-way RFQ into ongoing request
          history, company profile, messages, attachments, and quotation review.
        </p>
      </section>
      <section className="split">
        <form action={registerBuyer} className="page-card request-form auth-form">
          {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}
          <label>
            Full name
            <input autoComplete="name" name="full_name" placeholder="Your name" required />
          </label>
          <label>
            Work email
            <input autoComplete="email" inputMode="email" name="email" placeholder="buyer@company.com" required type="email" />
          </label>
          <label>
            Company name
            <input autoComplete="organization" name="company_name" placeholder="Company legal or trade name" required />
          </label>
          <label>
            Country
            <input autoComplete="country-name" name="country" placeholder="Example: Germany" />
          </label>
          <label>
            Business type
            <select defaultValue="" name="business_type" required>
              <option value="" disabled>
                Select business type
              </option>
              {businessTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            WhatsApp / Phone
            <input autoComplete="tel" inputMode="tel" name="phone" placeholder="+49..." />
          </label>
          <label>
            Password
            <input
              aria-describedby="register-password-hint"
              autoComplete="new-password"
              minLength={8}
              name="password"
              placeholder="Create a password"
              required
              type="password"
            />
          </label>
          <p className="form-note" id="register-password-hint">
            Minimum 8 characters. Use a mix of letters, numbers, and symbols.
          </p>
          <button aria-describedby="register-submit-note" className="primary-link" type="submit">
            Create buyer account
          </button>
          <p className="form-note" id="register-submit-note">
            New public registrations always create buyer profiles. Staff roles
            are assigned separately by an admin in Supabase.
          </p>
        </form>
        <aside className="page-card">
          <h2>First login onboarding</h2>
          <ul className="check-list">
            <li>Confirm company information</li>
            <li>Select product interests</li>
            <li>Add destination country or region</li>
            <li>Choose communication channel</li>
            <li>Create first sourcing request</li>
          </ul>
          <div className="cta-row">
            <Link className="secondary-link" href="/login">
              Already have an account
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
