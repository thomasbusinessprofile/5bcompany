import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("request_id");

  if (!requestId) {
    return NextResponse.json({ error: "Missing request_id" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not configured" }, { status: 500 });
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: messages, error } = await supabase
    .from("request_messages")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(messages);
}

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
    const body = await request.json();
    
    if (!body.request_id || !body.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Buyers cannot create internal messages
    const isInternal = profile.role === "buyer" ? false : Boolean(body.is_internal);

    const { data: newMessage, error } = await supabase
      .from("request_messages")
      .insert({
        request_id: body.request_id,
        sender_id: profile.id,
        sender_role: profile.role,
        message: body.message,
        is_internal: isInternal
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(newMessage, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
