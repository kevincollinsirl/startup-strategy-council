import { NextResponse } from "next/server";
import { getArms, saveArm, updateArm, deleteArm } from "@/lib/storage";
import { BusinessArm } from "@/lib/types";

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
    const arm: BusinessArm = await request.json();

    // Generate ID if not provided
    if (!arm.id) {
      arm.id = `arm-${Date.now()}`;
    }

    await saveArm(arm);
    return NextResponse.json(arm, { status: 201 });
  } catch (error) {
    console.error("Error creating arm:", error);
    return NextResponse.json({ error: "Failed to create arm" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await updateArm(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating arm:", error);
    return NextResponse.json({ error: "Failed to update arm" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await deleteArm(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting arm:", error);
    return NextResponse.json({ error: "Failed to delete arm" }, { status: 500 });
  }
}
