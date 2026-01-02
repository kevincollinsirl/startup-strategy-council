import { CompanyContext, Decision, CouncilEvaluation, AgentEvaluation } from './types';
import { getArms, getMarketData } from './storage';
import { evaluateFinancialAnalyst } from './agents/financial-analyst';
import { evaluateMarketAnalyst } from './agents/market-analyst';
import { evaluateResourceAllocation } from './agents/resource-allocation';
import { evaluateRisk } from './agents/risk';
import { evaluateGameTheory } from './agents/game-theory';
import { synthesizeEvaluations } from './agents/chief-of-staff';
import { runDeliberation, calculateConsensusScore } from './deliberation';

export async function runCouncil(
  context: CompanyContext,
  decision: Decision
): Promise<CouncilEvaluation> {
  console.log('Starting Strategy Council evaluation...');
  console.log(`Decision: ${decision.title}`);
  console.log(`Options: ${decision.options.map(o => o.name).join(', ')}`);

  // Fetch business arms and market data for context
  const [businessArms, marketData] = await Promise.all([
    getArms(),
    getMarketData(),
  ]);

  console.log(`Loaded ${businessArms.length} business arms and market data`);

  // Create error fallback function
  const createErrorEvaluation = (agentType: AgentEvaluation['agentType']): AgentEvaluation => ({
    agentType,
    optionScores: decision.options.map(o => ({
      optionId: o.id,
      score: 5,
      reasoning: 'Error during evaluation'
    })),
    keyFactors: ['evaluation_error']
  });

  // Run all 5 specialist agents in parallel
  console.log('Running specialist agents (Financial, Market, Risk, GameTheory, Resource)...');

  const [financialResult, marketResult, riskResult, gameTheoryResult, resourceResult] = await Promise.all([
    evaluateFinancialAnalyst(context, decision, businessArms).catch(err => {
      console.error('Financial Analyst error:', err);
      return createErrorEvaluation('financial');
    }),
    evaluateMarketAnalyst(context, decision, marketData).catch(err => {
      console.error('Market Analyst error:', err);
      return createErrorEvaluation('market');
    }),
    evaluateRisk(context, decision).catch(err => {
      console.error('Risk Agent error:', err);
      return createErrorEvaluation('risk');
    }),
    evaluateGameTheory(context, decision).catch(err => {
      console.error('GameTheory Agent error:', err);
      return createErrorEvaluation('gametheory');
    }),
    evaluateResourceAllocation(context, decision, businessArms).catch(err => {
      console.error('Resource Allocation error:', err);
      return createErrorEvaluation('resource');
    }),
  ]);

  const initialEvaluations = [financialResult, marketResult, riskResult, gameTheoryResult, resourceResult];

  console.log('Specialist agents complete. Running deliberation...');

  // Run deliberation to build consensus
  const deliberationResult = await runDeliberation(initialEvaluations);

  console.log(`Deliberation complete after ${deliberationResult.rounds} round(s). Consensus: ${deliberationResult.consensusReached}`);

  // Run Chief of Staff synthesis with final evaluations
  console.log('Running Chief of Staff synthesis...');

  const synthesis = await synthesizeEvaluations(
    context,
    decision,
    deliberationResult.finalEvaluations
  );

  console.log('Council evaluation complete!');
  console.log(`Recommendation: ${synthesis.recommendedOptionId}`);
  console.log(`Confidence: ${(synthesis.confidence * 100).toFixed(0)}%`);

  // Calculate consensus score
  const consensusScore = calculateConsensusScore(deliberationResult.finalEvaluations);

  return {
    agentEvaluations: deliberationResult.finalEvaluations,
    recommendedOptionId: synthesis.recommendedOptionId,
    confidence: Math.round(synthesis.confidence * 100),
    synthesis: synthesis.synthesis,
    dissent: synthesis.dissent,
    reviewDate: new Date().toISOString(),
    debates: deliberationResult.debates,
    consensusReached: deliberationResult.consensusReached,
    deliberationRounds: deliberationResult.rounds,
  };
}
