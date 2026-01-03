import { promises as fs } from 'fs';
import path from 'path';
import { CompanyContext, Decision, BusinessArm, MarketData, Competitor, AppSettings, DEFAULT_CONTEXT, DEFAULT_MARKET_DATA, DEFAULT_SETTINGS } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTEXT_FILE = path.join(DATA_DIR, 'context.json');
const DECISIONS_FILE = path.join(DATA_DIR, 'decisions.json');
const ARMS_FILE = path.join(DATA_DIR, 'arms.json');
const MARKET_FILE = path.join(DATA_DIR, 'market.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Context operations
export async function getContext(): Promise<CompanyContext> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(CONTEXT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Return default context if file doesn't exist
    return DEFAULT_CONTEXT;
  }
}

export async function saveContext(context: CompanyContext): Promise<void> {
  await ensureDataDir();
  // Calculate runway if revenue and burn are set
  if (context.monthlyRevenue > 0 && context.monthlyBurn > context.monthlyRevenue) {
    const netBurn = context.monthlyBurn - context.monthlyRevenue;
    context.runwayMonths = Math.round(context.monthlyRevenue / netBurn * 12); // Simplified
  }
  await fs.writeFile(CONTEXT_FILE, JSON.stringify(context, null, 2));
}

// Decision operations
export async function getDecisions(): Promise<Decision[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(DECISIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getDecision(id: string): Promise<Decision | null> {
  const decisions = await getDecisions();
  return decisions.find(d => d.id === id) || null;
}

export async function saveDecision(decision: Decision): Promise<void> {
  await ensureDataDir();
  const decisions = await getDecisions();
  decisions.push(decision);
  await fs.writeFile(DECISIONS_FILE, JSON.stringify(decisions, null, 2));
}

export async function updateDecision(id: string, updates: Partial<Decision>): Promise<void> {
  await ensureDataDir();
  const decisions = await getDecisions();
  const index = decisions.findIndex(d => d.id === id);
  if (index !== -1) {
    decisions[index] = { ...decisions[index], ...updates };
    await fs.writeFile(DECISIONS_FILE, JSON.stringify(decisions, null, 2));
  }
}

export async function deleteDecision(id: string): Promise<void> {
  await ensureDataDir();
  const decisions = await getDecisions();
  const filtered = decisions.filter(d => d.id !== id);
  await fs.writeFile(DECISIONS_FILE, JSON.stringify(filtered, null, 2));
}

// Business Arms operations
export async function getArms(): Promise<BusinessArm[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(ARMS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getArm(id: string): Promise<BusinessArm | null> {
  const arms = await getArms();
  return arms.find(a => a.id === id) || null;
}

export async function saveArm(arm: BusinessArm): Promise<void> {
  await ensureDataDir();
  const arms = await getArms();
  arms.push(arm);
  await fs.writeFile(ARMS_FILE, JSON.stringify(arms, null, 2));
}

export async function updateArm(id: string, updates: Partial<BusinessArm>): Promise<void> {
  await ensureDataDir();
  const arms = await getArms();
  const index = arms.findIndex(a => a.id === id);
  if (index !== -1) {
    arms[index] = { ...arms[index], ...updates };
    await fs.writeFile(ARMS_FILE, JSON.stringify(arms, null, 2));
  }
}

export async function deleteArm(id: string): Promise<void> {
  await ensureDataDir();
  const arms = await getArms();
  const filtered = arms.filter(a => a.id !== id);
  await fs.writeFile(ARMS_FILE, JSON.stringify(filtered, null, 2));
}

// Market Data operations
export async function getMarketData(): Promise<MarketData> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(MARKET_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return DEFAULT_MARKET_DATA;
  }
}

export async function saveMarketData(marketData: MarketData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(MARKET_FILE, JSON.stringify(marketData, null, 2));
}

export async function addCompetitor(competitor: Competitor): Promise<void> {
  const marketData = await getMarketData();
  marketData.competitors.push(competitor);
  await saveMarketData(marketData);
}

export async function updateCompetitor(id: string, updates: Partial<Competitor>): Promise<void> {
  const marketData = await getMarketData();
  const index = marketData.competitors.findIndex(c => c.id === id);
  if (index !== -1) {
    marketData.competitors[index] = { ...marketData.competitors[index], ...updates };
    await saveMarketData(marketData);
  }
}

export async function deleteCompetitor(id: string): Promise<void> {
  const marketData = await getMarketData();
  marketData.competitors = marketData.competitors.filter(c => c.id !== id);
  await saveMarketData(marketData);
}

// Settings operations
export async function getSettings(): Promise<AppSettings> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const fileSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };

    // SECURITY: Prefer environment variable for API key over file storage
    const envApiKey = process.env.OPENAI_API_KEY;
    if (envApiKey) {
      fileSettings.openaiApiKey = envApiKey;
    }

    return fileSettings;
  } catch {
    // Check environment variable even if file doesn't exist
    const envApiKey = process.env.OPENAI_API_KEY;
    if (envApiKey) {
      return { ...DEFAULT_SETTINGS, openaiApiKey: envApiKey };
    }
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  const settings = await getSettings();
  await saveSettings({ ...settings, ...updates });
}
