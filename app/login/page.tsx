import Link from "next/link";
import { login } from "./actions";

export const metadata = {
  title: "Login | 5B Trading",
  description: "Login entry point for buyer, admin, sales, and sourcing workspaces."
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; status?: string }>;
};

function getMessage(status?: string) {
  if (status === "check-email") {
    return { tone: "success", text: "Account created. Check your email if confirmation is required, then sign in." };
  }

  if (status === "missing-fields") {
    return { tone: "error", text: "Please enter both email and password." };
  }

  if (status === "invalid") {
    return { tone: "error", text: "Login failed. Check your email and password." };
  }

  if (status === "config-error") {
    return { tone: "error", text: "Supabase is not configured for this environment." };
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, status } = await searchParams;
  const message = getMessage(status);

  return (
    <div className="page-shell auth-shell">
      <section className="section-title">
        <p className="eyebrow">Buyer Account</p>
        <h1>Login to your sourcing workspace</h1>
        <p>
          Supabase Auth now powers buyer and admin access. Role-based redirects
          send buyers to their dashboard and staff to request operations.
        </p>
      </section>
      <section className="split">
        <form action={login} className="page-card request-form auth-form">
          {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}
          <input name="next" type="hidden" value={next ?? ""} />
          <label>
            Work email
            <input autoComplete="email" inputMode="email" name="email" placeholder="buyer@company.com" required type="email" />
          </label>
          <label>
            Password
            <input autoComplete="current-password" name="password" placeholder="Enter your password" required type="password" />
          </label>
          <button aria-describedby="login-submit-note" className="primary-link" type="submit">
            Login
          </button>
          <p className="form-note" id="login-submit-note">
            Buyer, admin, sales, sourcing, and viewer roles are enforced through
            Supabase profiles and RLS.
          </p>
        </form>
        <aside className="page-card">
          <h2>Role routing</h2>
          <div className="detail-list">
            <div>
              <strong>Buyer</strong>
              <p>Redirects to `/buyer/dashboard` for open requests and required actions.</p>
            </div>
            <div>
              <strong>Admin</strong>
              <p>Redirects to `/admin/dashboard` for request operations overview.</p>
            </div>
            <div>
              <strong>Sales / sourcing</strong>
              <p>Redirects to `/admin/requests` filtered by assigned work.</p>
            </div>
          </div>
          <div className="cta-row">
            <Link className="secondary-link" href="/register">
              Register buyer account
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
