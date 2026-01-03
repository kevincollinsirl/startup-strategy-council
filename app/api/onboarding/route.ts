import { NextResponse } from 'next/server';
import { saveContext, saveSettings, saveMarketData } from '@/lib/storage';
import { CompanyContext, AppSettings, MarketData, BusinessArm } from '@/lib/types';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { businessArmSchema, competitorInputSchema, validateOrThrow } from '@/lib/schemas';

const DATA_DIR = path.join(process.cwd(), 'data');
const ARMS_FILE = path.join(DATA_DIR, 'arms.json');

// Onboarding data schema
const onboardingDataSchema = z.object({
  context: z.object({
    companyName: z.string().max(200).optional(),
    monthlyRevenue: z.number().min(0).max(1e12).optional(),
    monthlyBurn: z.number().min(0).max(1e12).optional(),
    teamSize: z.number().int().min(1).max(100000).optional(),
    runwayMonths: z.number().min(0).max(1000).optional(),
    activeProjects: z.array(z.string().max(500)).max(100).optional(),
    strategicGoal: z.enum(['valuation', 'independence', 'hybrid']).optional(),
    keyAssets: z.array(z.string().max(500)).max(100).optional(),
    keyConstraints: z.array(z.string().max(500)).max(100).optional(),
  }).optional(),
  arms: z.array(businessArmSchema).max(50).optional(),
  market: z.object({
    tam: z.number().min(0).max(1e15).optional(),
    sam: z.number().min(0).max(1e15).optional(),
    som: z.number().min(0).max(1e15).optional(),
    marketTrends: z.array(z.string().max(1000)).max(100).optional(),
    competitors: z.array(competitorInputSchema).max(100).optional(),
  }).optional(),
  settings: z.object({
    aiProvider: z.enum(['claude-cli', 'openai']).optional(),
    openaiApiKey: z.string().max(500).optional(),
    openaiModel: z.enum(['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']).optional(),
  }).optional(),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const body = validateOrThrow(onboardingDataSchema, rawBody);

    // Save context
    if (body.context) {
      const context: CompanyContext = {
        companyName: body.context.companyName || '',
        monthlyRevenue: body.context.monthlyRevenue || 0,
        monthlyBurn: body.context.monthlyBurn || 0,
        teamSize: body.context.teamSize || 1,
        runwayMonths: body.context.runwayMonths || 0,
        activeProjects: body.context.activeProjects || [],
        strategicGoal: body.context.strategicGoal || 'valuation',
        keyAssets: body.context.keyAssets || [],
        keyConstraints: body.context.keyConstraints || [],
      };
      await saveContext(context);
    }

    // Save business arms (ensure IDs are present)
    if (body.arms && Array.isArray(body.arms)) {
      const armsWithIds = body.arms.map((arm, idx) => ({
        ...arm,
        id: arm.id || `arm-${Date.now()}-${idx}`,
      }));
      await fs.writeFile(ARMS_FILE, JSON.stringify(armsWithIds, null, 2));
    }

    // Save market data (ensure competitor IDs are present)
    if (body.market) {
      const market: MarketData = {
        tam: body.market.tam || 0,
        sam: body.market.sam || 0,
        som: body.market.som || 0,
        marketTrends: body.market.marketTrends || [],
        competitors: (body.market.competitors || []).map((c, idx) => ({
          ...c,
          id: c.id || `comp-${Date.now()}-${idx}`,
        })),
      };
      await saveMarketData(market);
    }

    // Save settings (mark onboarding as completed)
    if (body.settings) {
      const settings: AppSettings = {
        aiProvider: body.settings.aiProvider || 'claude-cli',
        openaiApiKey: body.settings.openaiApiKey || '',
        openaiModel: body.settings.openaiModel || 'gpt-4o',
        onboardingCompleted: true,
      };
      await saveSettings(settings);
    } else {
      // Just mark onboarding as completed
      await saveSettings({
        aiProvider: 'claude-cli',
        openaiApiKey: '',
        openaiModel: 'gpt-4o',
        onboardingCompleted: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    if (error instanceof Error && error.message.startsWith('Validation failed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to save onboarding data' }, { status: 500 });
  }
}
