import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not configured" }, { status: 500 });
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const requestId = formData.get("request_id") as string;

    if (!file || !requestId) {
      return NextResponse.json({ error: "Missing file or request_id" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Sanitize filename and create storage path
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const attachmentId = crypto.randomUUID();
    const storagePath = `${requestId}/${attachmentId}-${safeFilename}`;

    const { error: uploadError } = await supabase.storage
      .from("request_attachments")
      .upload(storagePath, file);

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL or signed URL depending on bucket privacy
    const { data: publicUrlData } = supabase.storage
      .from("request_attachments")
      .getPublicUrl(storagePath);

    const { data: newAttachment, error: dbError } = await supabase
      .from("request_attachments")
      .insert({
        request_id: requestId,
        uploaded_by: profile.id,
        file_url: publicUrlData.publicUrl,
        file_name: safeFilename,
        file_type: file.type,
        file_size: file.size
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json(newAttachment, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
