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
    let missingFields: string[] = ["destination_port", "target_price"];
    let suggestedQuestions: string[] = ["What is your target delivery date?", "Do you need custom packaging?"];
    
    if (!openRouterKey) {
      fallbackUsed = true;
      summary = "Fallback: Basic keyword detection used because AI service is not configured.";
    } else {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://5bcompany.com", // Optional, for OpenRouter rankings
            "X-Title": "5B Sourcing Platform"
          },
          body: JSON.stringify({
            model: "nvidia/nemotron-3-super-120b-a12b:free",
            messages: [
              {
                role: "system",
                content: `You are a professional export sourcing assistant for 5B Trading.
                Your task is to analyze a buyer's sourcing request and:
                1. Provide a concise summary for an admin.
                2. Identify missing fields from this list: title, category, product, quantity, unit, destination, incoterm, packing, quality, documents, timeline, target price.
                3. Suggest 2-3 clarification questions for the buyer.
                
                STRICT GUARDRAILS:
                - Do NOT quote a price.
                - Do NOT promise supply or availability.
                - Do NOT commit to any lead time or shipment date.
                - Focus ONLY on structuring the buyer's inputs.
                
                Return the response as a JSON object with keys: "summary", "missing_fields", "suggested_questions".`
              },
              {
                role: "user",
                content: `Analyze this request: ${JSON.stringify(body.draft_request_fields || body.request_id)}`
              }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (response.ok) {
          const aiData = await response.json();
          const content = JSON.parse(aiData.choices[0].message.content);
          summary = content.summary;
          missingFields = content.missing_fields;
          suggestedQuestions = content.suggested_questions;
        } else {
          fallbackUsed = true;
          summary = "OpenRouter API returned an error. Using fallback detection.";
        }
      } catch (err) {
        fallbackUsed = true;
        summary = "Failed to connect to AI service. Using fallback detection.";
      }
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
