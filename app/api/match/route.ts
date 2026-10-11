import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SYSTEM = `You help match people to therapists on a directory website.
You never give therapy, diagnosis or medical advice.
From the user's message, pick relevant specialties from this list only:
anxiety, depression, stress, grief, trauma, relationships, family, career.
Also detect a preferred language if mentioned (English, Hindi, Tamil, Bengali, Punjabi, Marathi), else null.
Reply with JSON only:
{"specialties": string[], "language": string|null, "summary": string}
"summary" is one short friendly sentence describing what you searched for.`;

export async function POST(req: Request) {
  const { message } = await req.json().catch(() => ({}));
  if (typeof message !== "string" || !message.trim() || message.length > 500) {
    return NextResponse.json({ error: "Please enter 1-500 characters." }, { status: 400 });
  }

  let filters: { specialties: string[]; language: string | null; summary: string };
  try {
    const model = process.env.AI_MODEL || "gemini-2.5-flash";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 2000,
            // thinkingConfig: { thinkingBudget: 0 },
          },
          
        }),
      }
    );
    if (!res.ok) {
      console.error("Gemini error:", res.status, await res.text());
      return NextResponse.json({ error: "AI request failed." }, { status: 502 });
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    filters = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (e) {
    console.error("AI parse error:", e);
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }

  let query = db
    .from("therapists")
    .select("id, name, specialties, languages, price_inr, bio")
    .limit(10);
  if (filters.specialties?.length) query = query.overlaps("specialties", filters.specialties);
  if (filters.language) query = query.contains("languages", [filters.language]);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ summary: filters.summary, filters, therapists: data });
}