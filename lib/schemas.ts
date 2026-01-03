import { z } from 'zod';

// Company Context Schema
export const companyContextSchema = z.object({
  companyName: z.string().max(200),
  monthlyRevenue: z.number().min(0).max(1e12),
  monthlyBurn: z.number().min(0).max(1e12),
  teamSize: z.number().int().min(1).max(100000),
  runwayMonths: z.number().min(0).max(1000),
  activeProjects: z.array(z.string().max(500)).max(100),
  strategicGoal: z.enum(['valuation', 'independence', 'hybrid']),
  keyAssets: z.array(z.string().max(500)).max(100),
  keyConstraints: z.array(z.string().max(500)).max(100),
});

// Business Arm Schema
export const businessArmSchema = z.object({
  id: z.string().max(100).optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000),
  monthlyRevenue: z.number().min(0).max(1e12),
  monthlyCosts: z.number().min(0).max(1e12),
  timeInvestmentHours: z.number().min(0).max(10000),
  strategicValue: z.number().int().min(1).max(10),
  status: z.enum(['active', 'paused', 'planned']),
  dependencies: z.array(z.string().max(100)).max(50),
});

// Option Schema
export const optionSchema = z.object({
  id: z.string().max(100),
  name: z.string().min(1).max(200),
  description: z.string().max(5000),
  estimatedCost: z.number().min(0).max(1e12),
  estimatedTimeWeeks: z.number().min(0).max(520),
});

// Decision Schema
export const decisionSchema = z.object({
  id: z.string().max(100).optional(),
  createdAt: z.string().optional(),
  title: z.string().min(1).max(500),
  description: z.string().max(10000),
  options: z.array(optionSchema).min(1).max(20),
  evaluation: z.any().optional(), // Complex nested type, validated separately
  outcome: z.enum(['success', 'failure', 'pending']).optional(),
  outcomeNotes: z.string().max(5000).optional(),
});

// Decision creation (subset of fields)
export const createDecisionSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000),
  options: z.array(optionSchema).min(1).max(20),
});

// Decision update
export const updateDecisionSchema = z.object({
  outcome: z.enum(['success', 'failure', 'pending']).optional(),
  outcomeNotes: z.string().max(5000).optional(),
});

// Competitor Schema (for input validation)
export const competitorInputSchema = z.object({
  id: z.string().max(100).optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000),
  strengths: z.array(z.string().max(500)).max(50),
  weaknesses: z.array(z.string().max(500)).max(50),
  marketShare: z.number().min(0).max(100),
  threat: z.enum(['low', 'medium', 'high']),
});

// Competitor Schema with required ID (for storage)
export const competitorSchema = z.object({
  id: z.string().max(100),
  name: z.string().min(1).max(200),
  description: z.string().max(2000),
  strengths: z.array(z.string().max(500)).max(50),
  weaknesses: z.array(z.string().max(500)).max(50),
  marketShare: z.number().min(0).max(100),
  threat: z.enum(['low', 'medium', 'high']),
});

// Market Data Schema
export const marketDataSchema = z.object({
  tam: z.number().min(0).max(1e15),
  sam: z.number().min(0).max(1e15),
  som: z.number().min(0).max(1e15),
  marketTrends: z.array(z.string().max(1000)).max(100),
  competitors: z.array(competitorSchema).max(100).default([]),
});

// Settings Schema
export const appSettingsSchema = z.object({
  aiProvider: z.enum(['claude-cli', 'openai']),
  openaiApiKey: z.string().max(500).optional(),
  openaiModel: z.enum(['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']),
  onboardingCompleted: z.boolean(),
});

// Evaluate request schema
export const evaluateRequestSchema = z.object({
  decisionId: z.string().min(1).max(100),
});

// Onboarding Schema
export const onboardingSchema = z.object({
  companyName: z.string().min(1).max(200),
  monthlyRevenue: z.number().min(0).max(1e12),
  monthlyBurn: z.number().min(0).max(1e12),
  teamSize: z.number().int().min(1).max(100000),
  runwayMonths: z.number().min(0).max(1000),
  strategicGoal: z.enum(['valuation', 'independence', 'hybrid']),
  activeProjects: z.array(z.string().max(500)).max(100).optional(),
  keyAssets: z.array(z.string().max(500)).max(100).optional(),
  keyConstraints: z.array(z.string().max(500)).max(100).optional(),
  businessArms: z.array(businessArmSchema).max(50).optional(),
  marketData: marketDataSchema.optional(),
});

// Helper function to validate and return typed data or throw
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }
  return result.data;
}
