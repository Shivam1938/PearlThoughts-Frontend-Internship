import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, portalType, context } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY process.env me nahi mila" },
        { status: 500 }
      );
    }

    const systemPrompt =
      portalType === "doctor"
        ? `You are an AI Assistant for a Doctor Portal.\nContext: ${JSON.stringify(context)}`
        : `You are an AI Assistant for a Patient Portal.\nContext: ${JSON.stringify(context)}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq Error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Groq request failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: data.choices?.[0]?.message?.content });
  } catch (err: any) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}