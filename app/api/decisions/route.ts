import { NextResponse } from "next/server";
import { getDecisions, saveDecision } from "@/lib/storage";
import { Decision } from "@/lib/types";

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
    const decision: Decision = await request.json();
    await saveDecision(decision);
    return NextResponse.json({ success: true, id: decision.id });
  } catch (error) {
    console.error("Error saving decision:", error);
    return NextResponse.json(
      { error: "Failed to save decision" },
      { status: 500 }
    );
  }
}
