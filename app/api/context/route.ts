import { NextResponse } from "next/server";
import { getContext, saveContext } from "@/lib/storage";
import { CompanyContext } from "@/lib/types";

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
    const context: CompanyContext = await request.json();
    await saveContext(context);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving context:", error);
    return NextResponse.json(
      { error: "Failed to save context" },
      { status: 500 }
    );
  }
}
