"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { applyTemplateVariables, sendEmail } from "../../lib/email/resend";
import { company } from "../../shared/company";

function val(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item.trim() : "";
}

function defaultFrom() {
  const configured = process.env.RESEND_FROM_EMAIL;
  if (configured) return configured;
  return `5B Trading <${company.email}>`;
}

export async function saveEmailTemplate(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const id = val(formData, "template_id");
  const name = val(formData, "name");
  const subject = val(formData, "subject");
  if (!name || !subject) redirect("/admin/email/templates?status=missing-fields");

  const rawVars = val(formData, "variables");
  const variables = rawVars
    ? rawVars.split(/[,\s]+/).map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [];

  const payload = {
    name,
    subject,
    body_html: val(formData, "body_html") || null,
    body_text: val(formData, "body_text") || null,
    variables
  };

  const result = id
    ? await supabase.from("crm_email_templates").update(payload).eq("id", id)
    : await supabase.from("crm_email_templates").insert(payload);

  if (result.error) redirect("/admin/email/templates?status=save-error");

  revalidatePath("/admin/email/templates");
  revalidatePath("/admin/email/compose");
  redirect("/admin/email/templates?status=saved");
}

export async function deleteEmailTemplate(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const id = val(formData, "template_id");
  if (id) await supabase.from("crm_email_templates").delete().eq("id", id);
  revalidatePath("/admin/email/templates");
  redirect("/admin/email/templates?status=deleted");
}

export async function sendComposedEmail(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const to = val(formData, "to");
  const subjectRaw = val(formData, "subject");
  const htmlRaw = val(formData, "body_html");
  const textRaw = val(formData, "body_text");

  if (!to || !subjectRaw || (!htmlRaw && !textRaw)) {
    redirect("/admin/email/compose?status=missing-fields");
  }

  const contactId = val(formData, "contact_id") || null;
  const dealId = val(formData, "deal_id") || null;
  const templateId = val(formData, "template_id") || null;
  const cc = val(formData, "cc") || null;
  const bcc = val(formData, "bcc") || null;
  const replyTo = val(formData, "reply_to") || null;
  const from = val(formData, "from") || defaultFrom();

  // Pull contact for default vars merge.
  const vars: Record<string, string | null | undefined> = {
    first_name: "",
    full_name: "",
    company: "",
    email: to,
    product_name: val(formData, "var_product_name"),
    quantity: val(formData, "var_quantity")
  };

  if (contactId) {
    const { data: contact } = await supabase
      .from("crm_contacts")
      .select("full_name, email, crm_companies(name)")
      .eq("id", contactId)
      .maybeSingle();
    if (contact) {
      const full = (contact.full_name as string) ?? "";
      vars.full_name = full;
      vars.first_name = full.split(/\s+/)[0] ?? "";
      const co = contact.crm_companies as { name?: string } | null;
      vars.company = co?.name ?? "";
      vars.email = (contact.email as string) ?? to;
    }
  }

  const subject = applyTemplateVariables(subjectRaw, vars);
  const html = htmlRaw ? applyTemplateVariables(htmlRaw, vars) : null;
  const text = textRaw ? applyTemplateVariables(textRaw, vars) : null;

  // Persist queued row first so we always have a log.
  const { data: queued } = await supabase
    .from("crm_emails")
    .insert({
      to_email: to,
      cc,
      bcc,
      from_email: from,
      reply_to: replyTo,
      subject,
      body_html: html,
      body_text: text,
      contact_id: contactId,
      deal_id: dealId,
      template_id: templateId,
      status: "queued"
    })
    .select("id")
    .maybeSingle();

  const result = await sendEmail({
    from,
    to,
    cc: cc ?? undefined,
    bcc: bcc ?? undefined,
    replyTo: replyTo ?? undefined,
    subject,
    html,
    text
  });

  if (result.ok) {
    await supabase
      .from("crm_emails")
      .update({ status: "sent", provider_id: result.id, sent_at: new Date().toISOString() })
      .eq("id", queued?.id ?? "");

    // Log activity so timeline shows the send.
    if (contactId || dealId) {
      const { data: activity } = await supabase
        .from("crm_activities")
        .insert({
          type: "email",
          subject,
          body: text ?? html ?? "",
          contact_id: contactId,
          deal_id: dealId
        })
        .select("id")
        .maybeSingle();
      if (activity?.id) {
        await supabase.from("crm_emails").update({ activity_id: activity.id }).eq("id", queued?.id ?? "");
      }
    }

    if (contactId) revalidatePath(`/admin/contacts/${contactId}`);
    if (dealId) revalidatePath(`/admin/deals/${dealId}`);

    redirect(
      contactId
        ? `/admin/contacts/${contactId}?status=email-sent`
        : dealId
        ? `/admin/deals/${dealId}?status=email-sent`
        : "/admin/email/compose?status=sent"
    );
  }

  await supabase
    .from("crm_emails")
    .update({ status: "failed", error: result.error })
    .eq("id", queued?.id ?? "");

  redirect(
    `/admin/email/compose?status=send-failed&message=${encodeURIComponent(result.error)}`
  );
}
