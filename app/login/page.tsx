import Link from "next/link";
import { login } from "./actions";
import { SubmitButton } from "../shared/SubmitButton";

export const metadata = {
  title: "Login | 5B Trading",
  description: "Sign in to your 5B Trading buyer workspace.",
  robots: { index: false, follow: false }
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; status?: string }>;
};

function getMessage(status?: string) {
  if (status === "check-email") {
    return { tone: "success", text: "Account created. Check your email to confirm your address, then sign in." };
  }
  if (status === "missing-fields") return { tone: "error", text: "Please enter both email and password." };
  if (status === "invalid") return { tone: "error", text: "Login failed. Check your email and password." };
  if (status === "config-error") return { tone: "error", text: "Authentication is not configured for this environment." };
  if (status === "expired") return { tone: "error", text: "Your session has expired. Please sign in again." };
  if (status === "missing-profile") return { tone: "error", text: "Your profile is missing. Please contact support." };
  if (status === "unauthorized") return { tone: "error", text: "You don't have permission to access that area." };
  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, status } = await searchParams;
  const message = getMessage(status);

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link className="auth-brand" href="/">
          <span className="brand-mark">5B</span>
          <span>
            <strong>5B Trading</strong>
            <small>Buyer workspace</small>
          </span>
        </Link>

        <h1>Welcome back</h1>
        <p className="auth-lede">
          Sign in to access your sourcing requests, quotations, and order history.
        </p>

        {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}

        <form action={login} className="auth-form">
          <input name="next" type="hidden" value={next ?? ""} />
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
          <label>
            Password
            <input
              autoComplete="current-password"
              name="password"
              placeholder="Enter your password"
              required
              type="password"
            />
          </label>
          <SubmitButton pendingLabel="Signing in...">Sign in</SubmitButton>
        </form>

        <p className="auth-sub">
          New to 5B Trading?{" "}
          <Link className="auth-link" href="/register">Create a buyer account →</Link>
        </p>

        <p className="auth-help">
          Trouble signing in? Email{" "}
          <a href="mailto:hello@5bcompany.com">hello@5bcompany.com</a>
        </p>
      </div>

      <p className="auth-footer">
        <Link href="/">← Back to 5bcompany.com</Link>
      </p>
    </div>
  );
}
