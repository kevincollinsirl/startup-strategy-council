import { NextResponse } from "next/server";
import { getArms, saveArm, updateArm, deleteArm } from "@/lib/storage";
import { businessArmSchema, validateOrThrow } from "@/lib/schemas";
import { z } from "zod";

export async function GET() {
  try {
    const arms = await getArms();
    return NextResponse.json(arms);
  } catch (error) {
    console.error("Error fetching arms:", error);
    return NextResponse.json({ error: "Failed to fetch arms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = validateOrThrow(businessArmSchema, body);

    // Generate ID if not provided
    const arm = {
      ...validated,
      id: validated.id || `arm-${Date.now()}`,
    };

    await saveArm(arm);
    return NextResponse.json(arm, { status: 201 });
  } catch (error) {
    console.error("Error creating arm:", error);
    if (error instanceof Error && error.message.startsWith('Validation failed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create arm" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Validate ID
    const idSchema = z.string().min(1).max(100);
    const id = validateOrThrow(idSchema, body.id);

    // Validate updates (partial business arm)
    const { id: _, ...updates } = body;
    const partialArmSchema = businessArmSchema.partial();
    const validatedUpdates = validateOrThrow(partialArmSchema, updates);

    await updateArm(id, validatedUpdates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating arm:", error);
    if (error instanceof Error && error.message.startsWith('Validation failed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update arm" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Validate ID
    const idSchema = z.string().min(1).max(100);
    const validatedId = validateOrThrow(idSchema, id);

    await deleteArm(validatedId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting arm:", error);
    if (error instanceof Error && error.message.startsWith('Validation failed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete arm" }, { status: 500 });
  }
}
