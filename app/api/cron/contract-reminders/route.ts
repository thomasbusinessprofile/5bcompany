import { NextResponse } from "next/server";
import { createPublicSupabaseClient } from "../../../lib/supabase/public";
import { sendEmail } from "../../../lib/email/resend";
import { company as sellerCompany } from "../../../shared/company";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Vercel cron protection — only Vercel's cron service should hit this.
function isAuthorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${expected}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createPublicSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "no_supabase" }, { status: 500 });

  // Contracts sent ≥ 3 days ago, still sent/viewed, never reminded.
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, contract_number, type, buyer_legal_name, buyer_signer_name, buyer_signer_email, share_token, sent_at")
    .in("status", ["sent", "viewed"])
    .lt("sent_at", threeDaysAgo)
    .not("share_token", "is", null)
    .limit(50);

  if (!contracts || contracts.length === 0) {
    return NextResponse.json({ checked: 0, sent: 0 });
  }

  let sent = 0;
  const from = process.env.RESEND_FROM_EMAIL || `5B Trading <${sellerCompany.email}>`;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  for (const c of contracts) {
    // Skip if a reminder event already exists.
    const { count } = await supabase
      .from("contract_events")
      .select("id", { count: "exact", head: true })
      .eq("contract_id", c.id)
      .eq("event_type", "reminder_sent");
    if ((count ?? 0) > 0) continue;
    if (!c.buyer_signer_email) continue;

    const link = site ? `${site}/sign/${c.share_token}` : `/sign/${c.share_token}`;
    const subject = `Reminder: contract ${c.contract_number} awaiting your review`;
    const text = `Hi ${c.buyer_signer_name || c.buyer_legal_name},\n\nA quick reminder that contract ${c.contract_number} is awaiting your review.\n\nReview & sign: ${link}\n\nNo action needed if you're still considering. Reply to this email if you have questions.\n\nBest,\n${sellerCompany.legalNameEn}`;
    const res = await sendEmail({ from, to: c.buyer_signer_email, subject, text });

    await supabase.from("contract_events").insert({
      contract_id: c.id,
      event_type: "reminder_sent",
      actor: "system",
      actor_email: c.buyer_signer_email,
      metadata: res.ok ? { provider_id: res.id } : { error: res.error }
    });
    if (res.ok) sent++;
  }

  return NextResponse.json({ checked: contracts.length, sent });
}
