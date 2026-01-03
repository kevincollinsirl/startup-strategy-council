import { NextResponse } from "next/server";
import { getDecision, updateDecision } from "@/lib/storage";
import { z } from "zod";
import { updateDecisionSchema, validateOrThrow } from "@/lib/schemas";

interface Props {
  params: Promise<{ id: string }>;
}

// ID validation schema
const idSchema = z.string().min(1).max(100);

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const validatedId = validateOrThrow(idSchema, id);

    const decision = await getDecision(validatedId);
    if (!decision) {
      return NextResponse.json(
        { error: "Decision not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(decision);
  } catch (error) {
    console.error("Error getting decision:", error);
    if (error instanceof Error && error.message.startsWith('Validation failed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to get decision" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const validatedId = validateOrThrow(idSchema, id);

    const body = await request.json();
    const updates = validateOrThrow(updateDecisionSchema, body);

    await updateDecision(validatedId, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating decision:", error);
    if (error instanceof Error && error.message.startsWith('Validation failed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update decision" },
      { status: 500 }
    );
  }
}
