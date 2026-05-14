"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { requireAdminRole } from "../../lib/auth/require-admin";
import { safeInternalPath } from "../../lib/auth/safe-redirect";
import { generateContractPdfBuffer } from "../../lib/contracts/pdf";
import { getContractById, getContractTemplateById } from "../../lib/contracts/data";
import {
  sumLineItems,
  validateLineItems,
  type ContractType
} from "../../lib/contracts/types";
import { renderContractTerms } from "../../lib/contracts/render";
import { sendEmail } from "../../lib/email/resend";
import { company as sellerCompany } from "../../shared/company";

function val(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item.trim() : "";
}

function num(formData: FormData, key: string): number {
  const v = Number(val(formData, key));
  return Number.isFinite(v) ? v : 0;
}

function parseLineItemsFromForm(formData: FormData) {
  const raw = val(formData, "line_items_json");
  if (!raw) return [];
  try {
    return validateLineItems(JSON.parse(raw));
  } catch {
    return [];
  }
}

async function uploadPdf(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  bucketPath: string,
  buffer: Buffer
): Promise<string | null> {
  if (!supabase) return null;
  const { error } = await supabase.storage.from("cms-contracts").upload(bucketPath, buffer, {
    cacheControl: "0",
    contentType: "application/pdf",
    upsert: true
  });
  if (error) return null;
  // Bucket is private — we store the path; admin UI generates signed URLs on demand.
  return bucketPath;
}

export async function createContract(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const ctx = await requireAdminRole(supabase);

  const type = val(formData, "type") as ContractType;
  const buyer_legal_name = val(formData, "buyer_legal_name");
  if (!buyer_legal_name) redirect("/admin/contracts/new?status=missing-fields");

  const templateId = val(formData, "template_id") || null;
  let termsHtml: string | null = val(formData, "terms_html") || null;
  if (templateId && !termsHtml) {
    const t = await getContractTemplateById(templateId);
    termsHtml = t?.termsHtml ?? null;
  }

  const lineItems = parseLineItemsFromForm(formData);
  const totalAmount = sumLineItems(lineItems);

  const payload = {
    type,
    deal_id: val(formData, "deal_id") || null,
    contact_id: val(formData, "contact_id") || null,
    company_id: val(formData, "company_id") || null,
    template_id: templateId,
    buyer_legal_name,
    buyer_address: val(formData, "buyer_address") || null,
    buyer_tax_id: val(formData, "buyer_tax_id") || null,
    buyer_signer_name: val(formData, "buyer_signer_name") || null,
    buyer_signer_email: val(formData, "buyer_signer_email") || null,
    buyer_signer_title: val(formData, "buyer_signer_title") || null,
    currency: val(formData, "currency") || "USD",
    total_amount: totalAmount,
    tax_pct: num(formData, "tax_pct"),
    incoterm: val(formData, "incoterm") || null,
    payment_terms: val(formData, "payment_terms") || null,
    validity_until: val(formData, "validity_until") || null,
    delivery_window: val(formData, "delivery_window") || null,
    line_items: lineItems,
    terms_html: termsHtml,
    owner_id: ctx.profileId ?? null
  };

  const { data, error } = await supabase
    .from("contracts")
    .insert(payload)
    .select("id, contract_number")
    .maybeSingle();

  if (error || !data) {
    redirect("/admin/contracts/new?status=save-error");
  }

  await supabase.from("contract_events").insert({
    contract_id: data.id,
    event_type: "created",
    actor: "admin",
    metadata: { contract_number: data.contract_number }
  });

  revalidatePath("/admin/contracts");
  redirect(`/admin/contracts/${data.id}?status=created`);
}

export async function updateContract(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  await requireAdminRole(supabase);

  const id = val(formData, "contract_id");
  if (!id) redirect("/admin/contracts");

  const lineItems = parseLineItemsFromForm(formData);
  const totalAmount = sumLineItems(lineItems);
  const status = val(formData, "status");

  // Build patch — only allow buyer fields when current row is still draft.
  const current = await getContractById(id);
  if (!current) redirect("/admin/contracts");

  const patch: Record<string, unknown> = {
    currency: val(formData, "currency") || current.currency,
    total_amount: totalAmount,
    tax_pct: num(formData, "tax_pct"),
    incoterm: val(formData, "incoterm") || null,
    payment_terms: val(formData, "payment_terms") || null,
    validity_until: val(formData, "validity_until") || null,
    delivery_window: val(formData, "delivery_window") || null,
    line_items: lineItems,
    terms_html: val(formData, "terms_html") || current.termsHtml,
    decline_reason: val(formData, "decline_reason") || null
  };
  if (status) patch.status = status;

  if (current.status === "draft") {
    patch.buyer_legal_name = val(formData, "buyer_legal_name") || current.buyerLegalName;
    patch.buyer_address = val(formData, "buyer_address") || null;
    patch.buyer_tax_id = val(formData, "buyer_tax_id") || null;
    patch.buyer_signer_name = val(formData, "buyer_signer_name") || null;
    patch.buyer_signer_email = val(formData, "buyer_signer_email") || null;
    patch.buyer_signer_title = val(formData, "buyer_signer_title") || null;
  }

  const { error } = await supabase.from("contracts").update(patch).eq("id", id);
  if (error) {
    redirect(`/admin/contracts/${id}?status=save-error&message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/contracts");
  revalidatePath(`/admin/contracts/${id}`);
  redirect(`/admin/contracts/${id}?status=saved`);
}

export async function sendContract(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  await requireAdminRole(supabase);

  const id = val(formData, "contract_id");
  const contract = await getContractById(id);
  if (!contract) redirect("/admin/contracts");

  if (!contract.buyerSignerEmail) {
    redirect(`/admin/contracts/${id}?status=no-email`);
  }

  // Generate PDF.
  const pdfBuffer = await generateContractPdfBuffer(contract);
  const path = `contracts/${contract.id}/v${contract.version}-sent.pdf`;
  const uploadedPath = await uploadPdf(supabase, path, pdfBuffer);
  if (!uploadedPath) {
    redirect(`/admin/contracts/${id}?status=upload-error`);
  }

  // Signed URL for email link (7 days).
  const { data: signed } = await supabase.storage
    .from("cms-contracts")
    .createSignedUrl(uploadedPath, 60 * 60 * 24 * 7);
  const downloadUrl = signed?.signedUrl;

  const shareToken = randomUUID();
  const tokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: updErr } = await supabase
    .from("contracts")
    .update({
      pdf_url: uploadedPath,
      share_token: shareToken,
      share_token_expires_at: tokenExpires,
      share_token_revoked_at: null,
      status: "sent",
      sent_at: new Date().toISOString()
    })
    .eq("id", id);
  if (updErr) {
    redirect(`/admin/contracts/${id}?status=save-error&message=${encodeURIComponent(updErr.message)}`);
  }

  // Email the buyer.
  const subject = `${contract.contractNumber} — ${prettyType(contract.type)} from 5B Trading`;
  const html = `
    <p>Dear ${escapeHtml(contract.buyerSignerName || contract.buyerLegalName)},</p>
    <p>Please find attached our ${prettyType(contract.type)} ${escapeHtml(contract.contractNumber)} for your review.</p>
    ${downloadUrl ? `<p><a href="${downloadUrl}">Download PDF</a> (link valid 7 days)</p>` : ""}
    <p>Reply to this email if you would like changes, or sign and return a scanned copy to confirm.</p>
    <p>Best regards,<br/>${escapeHtml(sellerCompany.representativeEn)}<br/>${escapeHtml(sellerCompany.legalNameEn)}</p>
  `;
  const text =
    `Dear ${contract.buyerSignerName || contract.buyerLegalName},\n\n` +
    `Please find our ${prettyType(contract.type)} ${contract.contractNumber} for your review.\n` +
    (downloadUrl ? `Download: ${downloadUrl}\n\n` : "\n") +
    `Reply to this email for changes or send a signed scan to confirm.\n\n` +
    `Best regards,\n${sellerCompany.representativeEn}\n${sellerCompany.legalNameEn}`;

  const from = process.env.RESEND_FROM_EMAIL || `5B Trading <${sellerCompany.email}>`;
  const emailRes = await sendEmail({
    from,
    to: contract.buyerSignerEmail,
    subject,
    html,
    text
  });

  await supabase.from("contract_events").insert({
    contract_id: id,
    event_type: emailRes.ok ? "sent" : "send_failed",
    actor: "admin",
    actor_email: contract.buyerSignerEmail,
    metadata: emailRes.ok ? { provider_id: emailRes.id } : { error: emailRes.error }
  });

  // Mirror into crm_emails + crm_activities if the contact is known.
  if (contract.contactId) {
    const { data: emailRow } = await supabase
      .from("crm_emails")
      .insert({
        to_email: contract.buyerSignerEmail,
        from_email: from,
        subject,
        body_html: html,
        body_text: text,
        contact_id: contract.contactId,
        deal_id: contract.dealId,
        status: emailRes.ok ? "sent" : "failed",
        provider_id: emailRes.ok ? emailRes.id : null,
        error: emailRes.ok ? null : emailRes.error,
        sent_at: emailRes.ok ? new Date().toISOString() : null
      })
      .select("id")
      .maybeSingle();

    await supabase.from("crm_activities").insert({
      type: "email",
      subject,
      body: `Sent ${contract.contractNumber} (${prettyType(contract.type)})`,
      contact_id: contract.contactId,
      deal_id: contract.dealId,
      metadata: { contract_id: id, email_row_id: emailRow?.id ?? null }
    });
  }

  revalidatePath(`/admin/contracts/${id}`);
  redirect(`/admin/contracts/${id}?status=${emailRes.ok ? "sent" : "send-failed"}`);
}

export async function uploadSignedPdf(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  await requireAdminRole(supabase);

  const id = val(formData, "contract_id");
  const file = formData.get("signed_pdf");
  if (!id || !(file instanceof File) || file.size === 0) {
    redirect(`/admin/contracts/${id}?status=missing-pdf`);
  }
  if (file.type !== "application/pdf") {
    redirect(`/admin/contracts/${id}?status=not-pdf`);
  }

  const contract = await getContractById(id);
  if (!contract) redirect("/admin/contracts");

  const path = `contracts/${id}/v${contract.version}-signed-${Date.now()}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadPdf(supabase, path, buffer);
  if (!uploaded) {
    redirect(`/admin/contracts/${id}?status=upload-error`);
  }

  const signerName = val(formData, "signer_typed_name") || contract.buyerSignerName || "(wet-sign by buyer)";

  const { error } = await supabase
    .from("contracts")
    .update({
      signed_pdf_url: uploaded,
      status: "signed",
      signed_at: new Date().toISOString(),
      signer_typed_name: signerName,
      signature_method: "wet_sign_upload"
    })
    .eq("id", id);
  if (error) {
    redirect(`/admin/contracts/${id}?status=save-error&message=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("contract_events").insert({
    contract_id: id,
    event_type: "signed",
    actor: "admin",
    metadata: { method: "wet_sign_upload", signer: signerName }
  });

  if (contract.contactId) {
    await supabase.from("crm_activities").insert({
      type: "note",
      subject: `Contract ${contract.contractNumber} signed`,
      body: `Wet-signed PDF uploaded for ${prettyType(contract.type)} ${contract.contractNumber}.`,
      contact_id: contract.contactId,
      deal_id: contract.dealId,
      metadata: { contract_id: id }
    });
  }

  revalidatePath(`/admin/contracts/${id}`);
  redirect(`/admin/contracts/${id}?status=signed`);
}

export async function revokeShareToken(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  await requireAdminRole(supabase);

  const id = val(formData, "contract_id");
  if (!id) redirect("/admin/contracts");
  await supabase
    .from("contracts")
    .update({ share_token_revoked_at: new Date().toISOString() })
    .eq("id", id);
  await supabase.from("contract_events").insert({
    contract_id: id,
    event_type: "share_token_revoked",
    actor: "admin"
  });
  revalidatePath(`/admin/contracts/${id}`);
  redirect(`/admin/contracts/${id}?status=token-revoked`);
}

export async function getSignedPdfUrl(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  await requireAdminRole(supabase);
  const id = val(formData, "contract_id");
  const which = val(formData, "which") || "pdf";
  const contract = await getContractById(id);
  if (!contract) redirect("/admin/contracts");
  const path = which === "signed" ? contract.signedPdfUrl : contract.pdfUrl;
  if (!path) redirect(`/admin/contracts/${id}?status=no-pdf`);
  const { data } = await supabase.storage.from("cms-contracts").createSignedUrl(path, 60 * 5);
  const url = data?.signedUrl;
  const back = safeInternalPath(val(formData, "redirect_to")) ?? `/admin/contracts/${id}`;
  if (url) redirect(url);
  redirect(back);
}

function prettyType(t: ContractType) {
  return (
    { loi: "Letter of Intent", sample: "Sample Agreement", proforma: "Proforma Invoice", sales: "Sales Contract", distribution: "Distribution Agreement" } as const
  )[t];
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
