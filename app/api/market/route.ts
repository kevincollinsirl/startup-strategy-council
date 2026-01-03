import { NextResponse } from "next/server";
import { getMarketData, saveMarketData, addCompetitor, updateCompetitor, deleteCompetitor } from "@/lib/storage";
import { competitorInputSchema, marketDataSchema, validateOrThrow } from "@/lib/schemas";
import { z } from "zod";
import { MarketData } from "@/lib/types";

export async function GET() {
  try {
    const marketData = await getMarketData();
    return NextResponse.json(marketData);
  } catch (error) {
    console.error("Error fetching market data:", error);
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's a competitor or full market data update
    if (body.competitor) {
      const validated = validateOrThrow(competitorInputSchema, body.competitor);

      // Generate ID if not provided
      const competitor = {
        ...validated,
        id: validated.id || `comp-${Date.now()}`,
      };

      await addCompetitor(competitor);
      return NextResponse.json(competitor, { status: 201 });
    } else {
      // Full market data update
      const validated = validateOrThrow(marketDataSchema, body);
      // Ensure competitors have IDs
      const marketData: MarketData = {
        ...validated,
        competitors: validated.competitors.map(c => ({
          ...c,
          id: c.id || `comp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        })),
      };
      await saveMarketData(marketData);
      return NextResponse.json(marketData);
    }
  } catch (error) {
    console.error("Error updating market data:", error);
    if (error instanceof Error && error.message.startsWith('Validation failed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update market data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (body.competitorId) {
      // Update competitor
      const idSchema = z.string().min(1).max(100);
      const competitorId = validateOrThrow(idSchema, body.competitorId);

      const { competitorId: _, ...updates } = body;
      const partialCompetitorSchema = competitorInputSchema.partial();
      const validatedUpdates = validateOrThrow(partialCompetitorSchema, updates);

      await updateCompetitor(competitorId, validatedUpdates);
      return NextResponse.json({ success: true });
    } else {
      // Update market metrics (TAM, SAM, SOM, trends)
      const metricsSchema = z.object({
        tam: z.number().min(0).max(1e15).optional(),
        sam: z.number().min(0).max(1e15).optional(),
        som: z.number().min(0).max(1e15).optional(),
        marketTrends: z.array(z.string().max(1000)).max(100).optional(),
      });
      const validatedMetrics = validateOrThrow(metricsSchema, body);

      const currentData = await getMarketData();
      const updatedData = {
        ...currentData,
        ...validatedMetrics,
      };
      await saveMarketData(updatedData);
      return NextResponse.json(updatedData);
    }
  } catch (error) {
    console.error("Error updating market data:", error);
    if (error instanceof Error && error.message.startsWith('Validation failed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update market data" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorId = searchParams.get("competitorId");

    const idSchema = z.string().min(1).max(100);
    const validatedId = validateOrThrow(idSchema, competitorId);

    await deleteCompetitor(validatedId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting competitor:", error);
    if (error instanceof Error && error.message.startsWith('Validation failed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete competitor" }, { status: 500 });
  }
}
