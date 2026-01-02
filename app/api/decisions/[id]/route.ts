import { NextResponse } from "next/server";
import { getDecision, updateDecision } from "@/lib/storage";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const decision = await getDecision(id);
    if (!decision) {
      return NextResponse.json(
        { error: "Decision not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(decision);
  } catch (error) {
    console.error("Error getting decision:", error);
    return NextResponse.json(
      { error: "Failed to get decision" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const updates = await request.json();
    await updateDecision(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating decision:", error);
    return NextResponse.json(
      { error: "Failed to update decision" },
      { status: 500 }
    );
  }
}
