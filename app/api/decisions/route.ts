import { NextResponse } from "next/server";
import { getDecisions, saveDecision } from "@/lib/storage";
import { createDecisionSchema, validateOrThrow } from "@/lib/schemas";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const decisions = await getDecisions();
    return NextResponse.json(decisions);
  } catch (error) {
    console.error("Error getting decisions:", error);
    return NextResponse.json(
      { error: "Failed to get decisions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = validateOrThrow(createDecisionSchema, body);

    const decision = {
      ...validated,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    await saveDecision(decision);
    return NextResponse.json({ success: true, id: decision.id });
  } catch (error) {
    console.error("Error saving decision:", error);
    if (error instanceof Error && error.message.startsWith('Validation failed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to save decision" },
      { status: 500 }
    );
  }
}
