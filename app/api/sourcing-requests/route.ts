import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client not configured" }, { status: 500 });
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Supabase RLS will handle the access control based on user role
  const { data: requests, error } = await supabase
    .from("sourcing_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(requests);
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
    
    // Server-side validation
    if (!body.title || !body.category_id || !body.product_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Buyer profile not found" }, { status: 404 });
    }

    const { data: newRequest, error } = await supabase
      .from("sourcing_requests")
      .insert({
        buyer_id: profile.id,
        title: body.title,
        request_type: body.request_type || 'standard',
        category_id: body.category_id,
        product_id: body.product_id,
        product_name: body.product_name,
        description: body.description,
        target_quantity: body.target_quantity,
        unit: body.unit,
        destination_country: body.destination_country,
        destination_port: body.destination_port,
        incoterm: body.incoterm,
        packing_requirement: body.packing_requirement,
        quality_requirement: body.quality_requirement,
        document_requirement: body.document_requirement,
        target_price: body.target_price,
        timeline: body.timeline,
        additional_notes: body.additional_notes,
        status: "new"
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(newRequest, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
