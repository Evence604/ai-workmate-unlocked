const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function friendlyMessage(status: number, fallback: string) {
  if (status === 429) return "Too many requests right now. Please wait a moment and try again.";
  if (status === 402) return "AI credits are exhausted for this workspace. Add credits to continue.";
  if (status === 403) return "AI access is currently blocked for this workspace.";
  if (status === 401) return "AI is not configured correctly.";
  return fallback || "The AI request failed. Please try again.";
}

/**
 * Calls the Lovable AI Gateway and returns parsed JSON matching the requested shape.
 */
export async function generateJson<T>(system: string, user: string): Promise<T> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiError("AI is not configured (missing key).", 401);

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new AiError(friendlyMessage(res.status, body.slice(0, 300)), res.status);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new AiError("The AI returned an unreadable response. Try again.", 500);
  }
}
