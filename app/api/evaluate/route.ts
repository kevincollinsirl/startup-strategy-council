import { NextResponse } from "next/server";
import { getDecision, getContext, updateDecision } from "@/lib/storage";
import { runCouncil } from "@/lib/council";

export async function POST(request: Request) {
  try {
    const { decisionId } = await request.json();

    if (!decisionId) {
      return NextResponse.json(
        { error: "Decision ID is required" },
        { status: 400 }
      );
    }

    // Get decision and context
    const [decision, context] = await Promise.all([
      getDecision(decisionId),
      getContext(),
    ]);

    if (!decision) {
      return NextResponse.json(
        { error: "Decision not found" },
        { status: 404 }
      );
    }

    if (!context.companyName) {
      return NextResponse.json(
        { error: "Company context not set. Please configure your company context first." },
        { status: 400 }
      );
    }

    // Run the Strategy Council
    console.log(`Running council for decision: ${decision.title}`);
    const evaluation = await runCouncil(context, decision);

    // Save evaluation to decision
    await updateDecision(decisionId, { evaluation });

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Evaluation failed" },
      { status: 500 }
    );
  }
}
