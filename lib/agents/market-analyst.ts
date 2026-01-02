import { askClaude } from '../claude-cli';
import { CompanyContext, Decision, AgentEvaluation, MarketData } from '../types';

const SYSTEM_PROMPT = `You are the Market Analyst Agent on a Strategy Council.
Your role is to evaluate strategic decisions from a MARKET perspective.

You have access to TAM/SAM/SOM data and competitive intelligence.

Consider these factors:
- Total Addressable Market (TAM) opportunity
- Serviceable Addressable Market (SAM) fit
- Serviceable Obtainable Market (SOM) realism
- Competitive positioning and response
- Market timing (too early, right timing, too late)
- Customer segment analysis
- Market trends and their implications
- First mover vs fast follower dynamics
- Barrier to entry implications
- Network effects potential

IMPORTANT: You must respond in EXACTLY this JSON format with no other text:
{
  "optionScores": [
    { "optionId": "option-id-here", "score": 7, "reasoning": "Brief explanation" }
  ],
  "keyFactors": ["factor1", "factor2", "factor3"],
  "marketTiming": "early|right|late",
  "competitiveImpact": "Prediction of how competitors will respond",
  "targetSegment": "Primary customer segment this serves",
  "marketShare": "Estimated impact on SOM"
}

Score each option from 1-10 where:
- 1-3: Poor market fit (wrong timing, strong competition, small market)
- 4-6: Neutral (moderate opportunity, manageable competition)
- 7-10: Strong market opportunity (right timing, weak competition, large market)

Be specific about competitive dynamics and market trends.`;

export async function evaluateMarketAnalyst(
  context: CompanyContext,
  decision: Decision,
  marketData: MarketData
): Promise<AgentEvaluation> {
  const competitorContext = marketData.competitors.map(comp =>
    `- ${comp.name} (${comp.threat} threat, ${comp.marketShare}% share): Strengths: ${comp.strengths.join(', ')}. Weaknesses: ${comp.weaknesses.join(', ')}`
  ).join('\n');

  const trendsContext = marketData.marketTrends.map(t => `- ${t}`).join('\n');

  const prompt = `
COMPANY CONTEXT:
- Company: ${context.companyName}
- Monthly Revenue: €${context.monthlyRevenue.toLocaleString()}
- Team Size: ${context.teamSize}
- Strategic Goal: ${context.strategicGoal}

MARKET SIZE:
- TAM (Total Addressable Market): $${(marketData.tam / 1_000_000_000).toFixed(1)}B
- SAM (Serviceable Addressable Market): $${(marketData.sam / 1_000_000_000).toFixed(1)}B
- SOM (Serviceable Obtainable Market): $${(marketData.som / 1_000_000).toFixed(1)}M

COMPETITORS:
${competitorContext || 'No competitors tracked'}

MARKET TRENDS:
${trendsContext || 'No trends tracked'}

KEY ASSETS:
${context.keyAssets.map(a => `- ${a}`).join('\n')}

DECISION TO EVALUATE:
Title: ${decision.title}
Description: ${decision.description}

OPTIONS:
${decision.options.map(o => `
Option ID: ${o.id}
Name: ${o.name}
Description: ${o.description}
Estimated Cost: €${o.estimatedCost.toLocaleString()}
Estimated Time: ${o.estimatedTimeWeeks} weeks
`).join('\n---\n')}

Evaluate each option from a market analyst perspective. Consider TAM/SAM/SOM implications, competitive response, market timing, and customer segment fit. Return your analysis as JSON.`;

  const response = await askClaude(prompt, SYSTEM_PROMPT);

  // Parse JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Market Analyst response:', response);
    throw new Error('Market Analyst Agent returned invalid format');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      agentType: 'market',
      optionScores: parsed.optionScores || [],
      keyFactors: parsed.keyFactors || [],
    };
  } catch (e) {
    console.error('Failed to parse Market Analyst response:', e);
    throw new Error('Failed to parse Market Analyst Agent response');
  }
}
