type RequestInput = {
  description: string;
  destination: string;
  documentRequirement: string;
  incoterm: string;
  packing: string;
  product: string;
  qualityRequirement: string;
  quantity: string;
  timeline: string;
  title: string;
};

export type StructuredRequestOutput = {
  leadScore: number;
  missingFields: string[];
  questions: string[];
  summary: string;
};

const requiredFieldLabels: Array<[keyof RequestInput, string]> = [
  ["product", "Product of interest"],
  ["quantity", "Target quantity"],
  ["destination", "Destination country or port"],
  ["packing", "Packing requirement"],
  ["qualityRequirement", "Quality requirement"],
  ["documentRequirement", "Document requirement"],
  ["timeline", "Timeline"]
];

function isMissing(value: string) {
  return !value || value === "-";
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function createRuleBasedStructure(input: RequestInput): StructuredRequestOutput {
  const missingFields = requiredFieldLabels
    .filter(([key]) => isMissing(input[key]))
    .map(([, label]) => label);
  const knownFields = requiredFieldLabels.length - missingFields.length;
  const leadScore = clampScore(35 + knownFields * 8 + (input.description ? 8 : 0));
  const questions = missingFields.slice(0, 5).map((field) => `Please confirm ${field.toLowerCase()}.`);

  return {
    leadScore,
    missingFields,
    questions,
    summary: [
      `${input.title}: buyer is requesting ${input.product || "an export product"}.`,
      `Quantity: ${input.quantity || "not provided"}.`,
      `Destination: ${input.destination || "not provided"}.`,
      `Packing: ${input.packing || "not provided"}.`,
      `Quality/documents: ${input.qualityRequirement || "not provided"} / ${input.documentRequirement || "not provided"}.`
    ].join(" ")
  };
}

function parseJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(text.slice(start, end + 1)) as Partial<StructuredRequestOutput>;
  } catch {
    return null;
  }
}

function list(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, 8)
    : [];
}

export async function structureRequestWithAi(input: RequestInput): Promise<StructuredRequestOutput> {
  const fallback = createRuleBasedStructure(input);
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return fallback;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    body: JSON.stringify({
      max_tokens: 700,
      messages: [
        {
          content:
            "You structure B2B sourcing requests for admin review. Return only JSON with summary, missingFields, questions, leadScore. Do not quote price, stock, lead time, certifications, or commercial commitments.",
          role: "system"
        },
        {
          content: JSON.stringify(input),
          role: "user"
        }
      ],
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      temperature: 0.2
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "5B Trading Sourcing Portal"
    },
    method: "POST"
  });

  if (!response.ok) {
    return fallback;
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };
  const parsed = parseJsonObject(data.choices?.[0]?.message?.content ?? "");

  if (!parsed) {
    return fallback;
  }

  return {
    leadScore: clampScore(Number(parsed.leadScore) || fallback.leadScore),
    missingFields: list(parsed.missingFields),
    questions: list(parsed.questions),
    summary: typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary.trim() : fallback.summary
  };
}
