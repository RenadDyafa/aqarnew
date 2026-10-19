import Anthropic from "@anthropic-ai/sdk";
import { systemPrompt } from "@/lib/assistant/knowledge";

/*
  Website assistant. Streams plain text back to the chat widget.

  Requires ANTHROPIC_API_KEY on the server (never exposed to the browser).
  Model: Claude Opus 5.5 at low effort, which suits short support replies.
  Refusal fallback is on: if a safety classifier declines a request, the API
  re-runs it on Anthropic's recommended fallback model inside the same call.
*/

const MODEL = "claude-opus-5-5";
const MAX_TURNS = 20;
const MAX_CHARS = 2000;

// Simple per-IP limiter (per server instance). Use a shared store such as
// Redis or your host's rate limiting in production.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 30;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

let client: Anthropic | null = null;

const msg = {
  en: {
    unavailable: "The assistant isn't available right now. Please use the contact page and our team will reply.",
    busy: "You've sent a lot of messages in a short time. Please wait a few minutes, or use the contact page.",
    declined: "I can't help with that here. For anything about your property, please use the contact page and our team will reply.",
    error: "Something went wrong on our side. Please try again, or use the contact page.",
  },
  ar: {
    unavailable: "المساعد غير متاح حالياً. يرجى استخدام صفحة التواصل وسيرد عليك فريقنا.",
    busy: "أرسلت رسائل كثيرة خلال وقت قصير. يرجى الانتظار بضع دقائق، أو استخدام صفحة التواصل.",
    declined: "لا أستطيع المساعدة في ذلك هنا. لأي استفسار عن عقارك، يرجى استخدام صفحة التواصل وسيرد عليك فريقنا.",
    error: "حدث خطأ من جهتنا. يرجى المحاولة مجدداً، أو استخدام صفحة التواصل.",
  },
};

type Incoming = { role: "user" | "assistant"; content: string };

function parse(body: unknown): { messages: Anthropic.Beta.BetaMessageParam[]; locale: "en" | "ar" } | null {
  if (!body || typeof body !== "object") return null;
  const { messages, locale } = body as { messages?: unknown; locale?: unknown };
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_TURNS * 2) return null;
  const clean: Anthropic.Beta.BetaMessageParam[] = [];
  for (const [i, m] of (messages as Incoming[]).entries()) {
    const role = i % 2 === 0 ? "user" : "assistant"; // must alternate, starting with the visitor
    if (m?.role !== role || typeof m.content !== "string") return null;
    const text = m.content.trim().slice(0, MAX_CHARS);
    if (!text) return null;
    clean.push({ role, content: text });
  }
  if (clean[clean.length - 1].role !== "user") return null;
  return { messages: clean, locale: locale === "ar" ? "ar" : "en" };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const input = parse(body);
  if (!input) return Response.json({ error: "Invalid conversation" }, { status: 400 });
  const t = msg[input.locale];

  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: t.unavailable }, { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return Response.json({ error: t.busy }, { status: 429 });

  client ??= new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = client!.beta.messages.stream({
          model: MODEL,
          max_tokens: 4096,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          output_config: { effort: "low" },
          system: [{ type: "text", text: systemPrompt(), cache_control: { type: "ephemeral" } }],
          messages: input.messages,
        });

        let wrote = false;
        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            wrote = true;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await response.finalMessage();
        // The whole fallback chain declined: replace any partial text with a handoff.
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode(`${wrote ? "\n\n" : ""}\u0000${t.declined}`));
        }
        controller.close();
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) console.warn("[assistant] rate limited by API");
        else if (error instanceof Anthropic.AuthenticationError) console.error("[assistant] invalid ANTHROPIC_API_KEY");
        else if (error instanceof Anthropic.APIError) console.error(`[assistant] API error ${error.status}:`, error.message);
        else console.error("[assistant]", error);
        controller.enqueue(encoder.encode(`\u0000${t.error}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
}
