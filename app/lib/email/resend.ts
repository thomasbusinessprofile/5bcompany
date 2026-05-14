// Minimal Resend API client. No SDK dep — single fetch call.
// Docs: https://resend.com/docs/api-reference/emails/send-email

export type SendEmailInput = {
  from: string;
  to: string | string[];
  subject: string;
  html?: string | null;
  text?: string | null;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function splitList(v: string | string[] | undefined): string[] | undefined {
  if (!v) return undefined;
  if (Array.isArray(v)) return v;
  return v
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not set in env." };
  }

  const payload: Record<string, unknown> = {
    from: input.from,
    to: splitList(input.to),
    subject: input.subject
  };
  if (input.html) payload.html = input.html;
  if (input.text) payload.text = input.text;
  const cc = splitList(input.cc);
  const bcc = splitList(input.bcc);
  if (cc?.length) payload.cc = cc;
  if (bcc?.length) payload.bcc = bcc;
  if (input.replyTo) payload.reply_to = input.replyTo;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
    if (!res.ok) {
      return { ok: false, error: json.message || json.name || `HTTP ${res.status}` };
    }
    return { ok: true, id: json.id ?? "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function applyTemplateVariables(text: string, vars: Record<string, string | undefined | null>): string {
  return text.replace(/\{\{\s*([a-z_][a-z0-9_]*)\s*\}\}/gi, (_, key: string) => vars[key.toLowerCase()] ?? "");
}
