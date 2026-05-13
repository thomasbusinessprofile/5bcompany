import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

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
    
    if (!body.request_id && !body.draft_request_fields) {
      return NextResponse.json({ error: "Missing request_id or draft_request_fields" }, { status: 400 });
    }

    // MVP AI scope logic implementation.
    // The actual call to OpenRouter would go here.
    // For now, we return a mock structured summary.
    
    // Check if OpenRouter API Key is available
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    let fallbackUsed = false;
    let summary = "AI analysis not available.";
    let missingFields = ["destination_port", "target_price"];
    let suggestedQuestions = ["What is your target delivery date?", "Do you need custom packaging?"];
    
    if (!openRouterKey) {
      fallbackUsed = true;
      summary = "Fallback: Basic keyword detection. Missing critical dimensions.";
    } else {
      // TODO: Implement actual OpenRouter API call
      // model = nvidia/nemotron-3-super-120b-a12b:free
      summary = "Structured request from OpenRouter mock.";
    }

    const aiResponse = {
      summary: summary,
      missing_fields: missingFields,
      suggested_questions: suggestedQuestions,
      guardrail_notes: [
        "AI cannot commit price.",
        "AI cannot commit availability.",
        "AI cannot commit lead time."
      ],
      provider: "openrouter",
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      fallback_used: fallbackUsed
    };

    return NextResponse.json(aiResponse, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
