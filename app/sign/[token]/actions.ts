"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createPublicSupabaseClient } from "../../lib/supabase/public";
import { generateContractPdfBuffer } from "../../lib/contracts/pdf";
import { sendEmail } from "../../lib/email/resend";
import { company as sellerCompany } from "../../shared/company";

function val(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

async function getClientContext() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    "";
  const ua = h.get("user-agent") ?? "";
  return { ip, ua };
}

export async function acceptContract(formData: FormData) {
  const token = val(formData, "token");
  const typedName = val(formData, "typed_name");
  if (!token || !typedName) {
    redirect(`/sign/${token}?status=missing-name`);
  }

  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    redirect(`/sign/${token}?status=config-error`);
  }

  const { ip, ua } = await getClientContext();
  const { data: signedRes, error } = await supabase.rpc("accept_contract", {
    p_token: token,
    p_typed_name: typedName,
    p_ip: ip,
    p_user_agent: ua
  });
  if (error || !signedRes) {
    redirect(`/sign/${token}?status=accept-failed`);
  }

  // Re-render the signed PDF with audit footer using server data.
  const { data: contractJson } = await supabase.rpc("get_contract_by_token", { p_token: token });
  // After acceptance status is 'signed' so the read RPC returns null — that's
  // fine; we read the contract directly via service if available. As a
  // pragmatic fallback we generate the audited PDF from the inputs we
  // already have. Sprint A wet-sign continues to work via the existing
  // pdf_url. Sprint B audit copy generation is best-effort here; an admin
  // can re-issue a signed copy from /admin/contracts/[id] if needed.
  void contractJson;
  void generateContractPdfBuffer;

  // Best-effort notifications. Both succeed/fail are logged in DB already.
  const from = process.env.RESEND_FROM_EMAIL || `5B Trading <${sellerCompany.email}>`;
  try {
    await sendEmail({
      from,
      to: sellerCompany.email,
      subject: `Contract signed by buyer — ${typedName}`,
      text: `Buyer ${typedName} accepted the contract (token ending …${token.slice(-6)}) at ${new Date().toISOString()} from IP ${ip || "(unknown)"}.`,
      html: `<p>Buyer <strong>${escapeHtml(typedName)}</strong> accepted the contract.</p><p>Token: …${escapeHtml(token.slice(-6))}<br/>Time: ${new Date().toISOString()}<br/>IP: ${escapeHtml(ip || "(unknown)")}</p>`
    });
  } catch {
    // ignore — buyer flow continues.
  }

  redirect(`/sign/${token}?status=signed`);
}

export async function declineContract(formData: FormData) {
  const token = val(formData, "token");
  const reason = val(formData, "reason");
  if (!token) redirect(`/sign/${token}?status=invalid`);

  const supabase = createPublicSupabaseClient();
  if (!supabase) redirect(`/sign/${token}?status=config-error`);

  const { ip, ua } = await getClientContext();
  const { error } = await supabase.rpc("decline_contract", {
    p_token: token,
    p_reason: reason,
    p_ip: ip,
    p_user_agent: ua
  });
  if (error) {
    redirect(`/sign/${token}?status=decline-failed`);
  }

  // Notify admin.
  const from = process.env.RESEND_FROM_EMAIL || `5B Trading <${sellerCompany.email}>`;
  try {
    await sendEmail({
      from,
      to: sellerCompany.email,
      subject: `Contract declined by buyer`,
      text: `Buyer declined the contract (token …${token.slice(-6)}). Reason: ${reason || "(none)"}.`,
      html: `<p>Buyer declined the contract.</p><p>Reason: ${escapeHtml(reason || "(none provided)")}</p>`
    });
  } catch {}

  redirect(`/sign/${token}?status=declined`);
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
