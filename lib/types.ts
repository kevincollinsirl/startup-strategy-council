// Company Context
export interface CompanyContext {
  companyName: string;
  monthlyRevenue: number;
  monthlyBurn: number;
  teamSize: number;
  runwayMonths: number;
  activeProjects: string[];
  strategicGoal: 'valuation' | 'independence' | 'hybrid';
  keyAssets: string[];
  keyConstraints: string[];
}

// Decision Types
export interface Option {
  id: string;
  name: string;
  description: string;
  estimatedCost: number;
  estimatedTimeWeeks: number;
}

export interface Decision {
  id: string;
  createdAt: string;
  title: string;
  description: string;
  options: Option[];
  evaluation?: CouncilEvaluation;
  outcome?: 'success' | 'failure' | 'pending';
  outcomeNotes?: string;
}

// Business Arms
export interface BusinessArm {
  id: string;
  name: string;
  description: string;
  monthlyRevenue: number;
  monthlyCosts: number;
  timeInvestmentHours: number;
  strategicValue: number; // 1-10
  status: 'active' | 'paused' | 'planned';
  dependencies: string[];
}

// Market & Competitors
export interface Competitor {
  id: string;
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketShare: number;
  threat: 'low' | 'medium' | 'high';
}

export interface MarketData {
  tam: number; // Total Addressable Market
  sam: number; // Serviceable Addressable Market
  som: number; // Serviceable Obtainable Market
  marketTrends: string[];
  competitors: Competitor[];
}

// Agent Types (includes legacy types for backwards compatibility)
export type AgentType = 'chief-of-staff' | 'financial' | 'market' | 'risk' | 'gametheory' | 'resource' | 'cfo' | 'growth' | 'synthesizer';

export interface OptionScore {
  optionId: string;
  score: number;
  reasoning: string;
}

export interface AgentEvaluation {
  agentType: AgentType;
  optionScores: OptionScore[];
  keyFactors: string[];
}

// Agent Debate for deliberation
export interface AgentDebate {
  round: number;
  agentType: string;
  position: string;
  challengedBy?: string;
  challenge?: string;
  response?: string;
}

export interface CouncilEvaluation {
  agentEvaluations: AgentEvaluation[];
  recommendedOptionId: string;
  confidence: number;
  synthesis: string;
  dissent: string[];
  reviewDate: string;
  // New deliberation fields
  debates: AgentDebate[];
  consensusReached: boolean;
  deliberationRounds: number;
}

// Default empty market data
export const DEFAULT_MARKET_DATA: MarketData = {
  tam: 0,
  sam: 0,
  som: 0,
  marketTrends: [],
  competitors: [],
};

// Default empty context
export const DEFAULT_CONTEXT: CompanyContext = {
  companyName: '',
  monthlyRevenue: 0,
  monthlyBurn: 0,
  teamSize: 1,
  runwayMonths: 0,
  activeProjects: [],
  strategicGoal: 'valuation',
  keyAssets: [],
  keyConstraints: [],
};

// App Settings
export type AIProvider = 'claude-cli' | 'openai';
export type OpenAIModel = 'gpt-4o' | 'gpt-4-turbo' | 'gpt-4' | 'gpt-3.5-turbo';

export interface AppSettings {
  aiProvider: AIProvider;
  openaiApiKey?: string;
  openaiModel: OpenAIModel;
  onboardingCompleted: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  aiProvider: 'claude-cli',
  openaiApiKey: '',
  openaiModel: 'gpt-4o',
  onboardingCompleted: false,
};
