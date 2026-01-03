import { NextResponse } from "next/server";
import { getContext, saveContext } from "@/lib/storage";
import { companyContextSchema, validateOrThrow } from "@/lib/schemas";

export async function GET() {
  try {
    const context = await getContext();
    return NextResponse.json(context);
  } catch (error) {
    console.error("Error getting context:", error);
    return NextResponse.json(
      { error: "Failed to get context" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const context = validateOrThrow(companyContextSchema, body);
    await saveContext(context);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving context:", error);
    if (error instanceof Error && error.message.startsWith('Validation failed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to save context" },
      { status: 500 }
    );
  }
}
