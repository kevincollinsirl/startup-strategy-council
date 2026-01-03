import { NextResponse } from "next/server";
import { getDecision, getContext, updateDecision } from "@/lib/storage";
import { runCouncil } from "@/lib/council";
import { evaluateRequestSchema, validateOrThrow } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { decisionId } = validateOrThrow(evaluateRequestSchema, body);

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
    if (error instanceof Error && error.message.startsWith('Validation failed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Evaluation failed" },
      { status: 500 }
    );
  }
}
