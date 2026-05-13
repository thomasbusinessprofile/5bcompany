"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentBuyerProfileId } from "../../../shared/buyer-data";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

function value(formData: FormData, key: string) {
  const item = formData.get(key);

  return typeof item === "string" ? item.trim() : "";
}

export async function sendBuyerMessage(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const requestId = value(formData, "request_id");
  const message = value(formData, "message");

  if (!requestId || !message) {
    redirect(requestId ? `/buyer/requests/${requestId}?status=missing-message` : "/buyer/requests");
  }

  const senderId = await getCurrentBuyerProfileId();
  const { error } = await supabase.from("request_messages").insert({
    is_internal: false,
    message,
    request_id: requestId,
    sender_id: senderId,
    sender_role: "buyer"
  });

  if (error) {
    redirect(`/buyer/requests/${requestId}?status=message-error`);
  }

  revalidatePath(`/buyer/requests/${requestId}`);
  redirect(`/buyer/requests/${requestId}?status=message-sent#messages`);
}

function safeFileName(name: string) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export async function uploadBuyerAttachment(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const requestId = value(formData, "request_id");
  const file = formData.get("attachment");

  if (!requestId || !(file instanceof File) || file.size === 0) {
    redirect(requestId ? `/buyer/requests/${requestId}?status=missing-file` : "/buyer/requests");
  }

  if (file.size > 10 * 1024 * 1024) {
    redirect(`/buyer/requests/${requestId}?status=file-too-large`);
  }

  const uploadedBy = await getCurrentBuyerProfileId();
  const fileName = safeFileName(file.name);
  const objectPath = `${requestId}/${Date.now()}-${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from("request-attachments")
    .upload(objectPath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadError) {
    redirect(`/buyer/requests/${requestId}?status=upload-error`);
  }

  const { error: insertError } = await supabase.from("request_attachments").insert({
    file_name: file.name,
    file_size: file.size,
    file_type: file.type || null,
    file_url: objectPath,
    request_id: requestId,
    uploaded_by: uploadedBy
  });

  if (insertError) {
    await supabase.storage.from("request-attachments").remove([objectPath]);
    redirect(`/buyer/requests/${requestId}?status=upload-error`);
  }

  revalidatePath(`/buyer/requests/${requestId}`);
  redirect(`/buyer/requests/${requestId}?status=file-uploaded`);
}
