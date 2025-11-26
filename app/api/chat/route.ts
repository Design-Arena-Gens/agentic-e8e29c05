import { NextResponse } from "next/server";
import { craftSupportiveReply } from "../../../lib/responses";

type RequestPayload = {
  message?: string;
  history?: { role: "user" | "assistant"; content: string }[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestPayload;
    const incoming = body.message?.trim();

    if (!incoming) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const context = body.history ?? [];
    const recentUser = context
      .filter((item) => item.role === "user")
      .map((item) => item.content)
      .join(" ");
    const combined = recentUser ? `${recentUser}\n${incoming}` : incoming;

    const reply = craftSupportiveReply(combined);
    await new Promise((resolve) => setTimeout(resolve, 600));

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        reply:
          "I'm here, and I care about how you're feeling. Could we try sharing that again?"
      },
      { status: 200 }
    );
  }
}
