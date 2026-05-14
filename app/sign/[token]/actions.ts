"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createPublicSupabaseClient } from "../../lib/supabase/public";
import { createSupabaseServiceClient } from "../../lib/supabase/service";
import { generateContractPdfBuffer } from "../../lib/contracts/pdf";
import { CONTRACT_COLUMNS, toContract, type ContractRow } from "../../lib/contracts/data";
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

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// After accept_contract succeeds: re-render the PDF with the audit footer,
// upload as signed copy, persist signed_pdf_url, and email signed link.
// Uses service-role client because the buyer is anon and storage RLS blocks
// anon insert. Service key is server-only — never exposed.
async function regenerateAndAttachSignedPdf(contractId: string, ip: string, signerName: string) {
  const service = createSupabaseServiceClient();
  if (!service) {
    return { ok: false as const, error: "service_role_key_missing" };
  }

  const { data, error } = await service
    .from("contracts")
    .select(CONTRACT_COLUMNS)
    .eq("id", contractId)
    .maybeSingle();
  if (error || !data) {
    return { ok: false as const, error: error?.message ?? "contract_not_found" };
  }

  const contract = toContract(data as unknown as ContractRow);

  const audit = {
    signerName,
    signedAt: contract.signedAt ?? new Date().toISOString(),
    ip: ip || null,
    method: "click_to_accept"
  };

  const pdfBuffer = await generateContractPdfBuffer(contract, audit);
  const path = `contracts/${contract.id}/v${contract.version}-signed-${Date.now()}.pdf`;
  const upload = await service.storage.from("cms-contracts").upload(path, pdfBuffer, {
    cacheControl: "0",
    contentType: "application/pdf",
    upsert: false
  });
  if (upload.error) {
    return { ok: false as const, error: upload.error.message };
  }

  const { error: updErr } = await service
    .from("contracts")
    .update({ signed_pdf_url: path })
    .eq("id", contractId);
  if (updErr) {
    return { ok: false as const, error: updErr.message };
  }

  // 7-day signed download URL for both notification emails.
  const { data: signed } = await service.storage
    .from("cms-contracts")
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  return {
    ok: true as const,
    contract,
    downloadUrl: signed?.signedUrl ?? null,
    path
  };
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
  const { data: accepted, error } = await supabase.rpc("accept_contract", {
    p_token: token,
    p_typed_name: typedName,
    p_ip: ip,
    p_user_agent: ua
  });
  if (error || !accepted) {
    redirect(`/sign/${token}?status=accept-failed`);
  }

  const acceptedId = (accepted as { id: string; status: string }).id;

  // Regenerate the PDF with audit footer and attach. Failures are non-fatal
  // for the buyer flow — they've already signed in the DB; admin can re-issue
  // a signed copy manually from /admin/contracts/<id>.
  const regen = await regenerateAndAttachSignedPdf(acceptedId, ip, typedName);

  const from = process.env.RESEND_FROM_EMAIL || `5B Trading <${sellerCompany.email}>`;
  const contractNumber = regen.ok ? regen.contract.contractNumber : null;
  const buyerEmail = regen.ok ? regen.contract.buyerSignerEmail : null;
  const downloadUrl = regen.ok ? regen.downloadUrl : null;

  // Email admin (best effort).
  try {
    await sendEmail({
      from,
      to: sellerCompany.email,
      subject: `Contract signed by buyer — ${typedName}`,
      html:
        `<p>Buyer <strong>${escapeHtml(typedName)}</strong> accepted ` +
        `${contractNumber ? `contract <strong>${escapeHtml(contractNumber)}</strong>` : "a contract"}.</p>` +
        `<p>Token: …${escapeHtml(token.slice(-6))}<br/>Time: ${new Date().toISOString()}<br/>IP: ${escapeHtml(ip || "(unknown)")}</p>` +
        (downloadUrl ? `<p><a href="${downloadUrl}">Download signed PDF</a> (link valid 7 days)</p>` : "") +
        (regen.ok ? "" : `<p style="color:#b91c1c">⚠ Audited PDF could not be generated automatically: ${escapeHtml(regen.error)}. Please re-issue a signed copy from the admin contract page.</p>`),
      text:
        `Buyer ${typedName} accepted ${contractNumber ?? "a contract"} at ${new Date().toISOString()} from IP ${ip || "(unknown)"}.` +
        (downloadUrl ? `\n\nSigned PDF: ${downloadUrl}` : "") +
        (regen.ok ? "" : `\n\n⚠ Audited PDF generation failed: ${regen.error}`)
    });
  } catch {}

  // Email buyer a receipt with the signed PDF.
  if (buyerEmail) {
    try {
      await sendEmail({
        from,
        to: buyerEmail,
        subject: contractNumber
          ? `Signed copy — ${contractNumber}`
          : "Signed copy of your contract",
        html:
          `<p>Hello ${escapeHtml(typedName)},</p>` +
          `<p>Thank you for accepting ${contractNumber ? `contract <strong>${escapeHtml(contractNumber)}</strong>` : "the contract"}. The signed PDF includes a full audit trail of your acceptance.</p>` +
          (downloadUrl ? `<p><a href="${downloadUrl}">Download signed PDF</a> (link valid 7 days — save a local copy)</p>` : "") +
          `<p>If you have any questions, reply to this email.</p>` +
          `<p>Best regards,<br/>${escapeHtml(sellerCompany.legalNameEn)}</p>`,
        text:
          `Hello ${typedName},\n\n` +
          `Thank you for accepting ${contractNumber ?? "the contract"}. The signed PDF includes a full audit trail of your acceptance.\n\n` +
          (downloadUrl ? `Signed PDF: ${downloadUrl}\n\n` : "") +
          `If you have any questions, reply to this email.\n\nBest regards,\n${sellerCompany.legalNameEn}`
      });
    } catch {}
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

  const from = process.env.RESEND_FROM_EMAIL || `5B Trading <${sellerCompany.email}>`;
  try {
    await sendEmail({
      from,
      to: sellerCompany.email,
      subject: "Contract declined by buyer",
      text: `Buyer declined the contract (token …${token.slice(-6)}). Reason: ${reason || "(none)"}.`,
      html: `<p>Buyer declined the contract.</p><p>Reason: ${escapeHtml(reason || "(none provided)")}</p>`
    });
  } catch {}

  redirect(`/sign/${token}?status=declined`);
}
