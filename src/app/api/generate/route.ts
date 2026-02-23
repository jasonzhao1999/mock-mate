import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

// Simple in-memory rate limiter: 5 requests per minute per IP
const rateLimit = new Map<string, number[]>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimit.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);
  rateLimit.set(ip, recent);

  if (recent.length >= MAX_REQUESTS) return true;
  recent.push(now);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const { role, level, topic, count } = await request.json();

    if (!role || !level) {
      return NextResponse.json(
        { error: "Role and level are required." },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "API key is not configured." },
        { status: 500 }
      );
    }

    const questionCount = Math.min(Math.max(count || 5, 1), 10);

    const prompt = `Generate ${questionCount} interview questions for a ${level}-level ${role} position.${
      topic ? ` Focus on the topic: ${topic}.` : ""
    }

Return a JSON array with this exact format (no markdown, no code fences, just raw JSON):
[
  {
    "question": "The interview question",
    "answer": "A concise but thorough sample answer (2-4 sentences)",
    "difficulty": "Easy" | "Medium" | "Hard",
    "followUp": "A follow-up question the interviewer could ask"
  }
]

Make the questions practical and realistic. Vary the difficulty levels. Each question should be specific enough to test real knowledge, not generic. Answers should demonstrate what a strong ${level}-level candidate would say.`;

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = result.choices[0]?.message?.content || "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const questions = JSON.parse(cleaned);

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Generate error:", message);

    if (message.includes("429")) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Failed to generate questions: ${message}` },
      { status: 500 }
    );
  }
}
