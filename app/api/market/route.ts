import { NextResponse } from "next/server";
import { getMarketData, saveMarketData, addCompetitor, updateCompetitor, deleteCompetitor } from "@/lib/storage";
import { Competitor, MarketData } from "@/lib/types";

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
      const competitor: Competitor = body.competitor;

      // Generate ID if not provided
      if (!competitor.id) {
        competitor.id = `comp-${Date.now()}`;
      }

      await addCompetitor(competitor);
      return NextResponse.json(competitor, { status: 201 });
    } else {
      // Full market data update
      const marketData: MarketData = body;
      await saveMarketData(marketData);
      return NextResponse.json(marketData);
    }
  } catch (error) {
    console.error("Error updating market data:", error);
    return NextResponse.json({ error: "Failed to update market data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (body.competitorId) {
      // Update competitor
      const { competitorId, ...updates } = body;
      await updateCompetitor(competitorId, updates);
      return NextResponse.json({ success: true });
    } else {
      // Update market metrics (TAM, SAM, SOM, trends)
      const currentData = await getMarketData();
      const updatedData: MarketData = {
        ...currentData,
        ...body,
      };
      await saveMarketData(updatedData);
      return NextResponse.json(updatedData);
    }
  } catch (error) {
    console.error("Error updating market data:", error);
    return NextResponse.json({ error: "Failed to update market data" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorId = searchParams.get("competitorId");

    if (!competitorId) {
      return NextResponse.json({ error: "Competitor ID is required" }, { status: 400 });
    }

    await deleteCompetitor(competitorId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting competitor:", error);
    return NextResponse.json({ error: "Failed to delete competitor" }, { status: 500 });
  }
}
