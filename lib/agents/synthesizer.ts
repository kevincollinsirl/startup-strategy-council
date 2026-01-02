import { askClaude } from '../claude-cli';
import { CompanyContext, Decision, AgentEvaluation, CouncilEvaluation } from '../types';

const SYSTEM_PROMPT = `You are the Synthesizer Agent on a Strategy Council.
Your role is to integrate perspectives from 4 specialist agents (CFO, Growth, Risk, Game Theory) and provide a final recommendation.

Your responsibilities:
1. Weigh each agent's analysis based on the company's current context and strategic goal
2. Identify consensus and dissent among agents
3. Make a final recommendation with confidence level
4. Highlight any critical concerns or dissenting opinions

IMPORTANT: You must respond in EXACTLY this JSON format with no other text:
{
  "recommendedOptionId": "option-id-here",
  "confidence": 75,
  "synthesis": "Clear explanation of why this option is recommended, integrating all perspectives",
  "dissent": ["Any major disagreement or concern that should be noted"]
}

Confidence should be 0-100 where:
- 0-40: Low confidence, significant disagreement or risk
- 40-70: Moderate confidence, some concerns
- 70-100: High confidence, strong consensus

Be specific and actionable in your synthesis.`;

export async function synthesize(
  context: CompanyContext,
  decision: Decision,
  agentEvaluations: AgentEvaluation[]
): Promise<CouncilEvaluation> {
  // Calculate average scores per option
  const optionSummaries = decision.options.map(option => {
    const scores = agentEvaluations.flatMap(e =>
      e.optionScores.filter(s => s.optionId === option.id)
    );
    const avgScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      : 0;

    const reasonings = scores.map(s => s.reasoning).join('; ');

    return {
      optionId: option.id,
      name: option.name,
      avgScore,
      reasonings,
    };
  });

  const prompt = `
COMPANY CONTEXT:
- Company: ${context.companyName}
- Strategic Goal: ${context.strategicGoal}
- Monthly Revenue: €${context.monthlyRevenue.toLocaleString()}
- Runway: ${context.runwayMonths} months

DECISION:
Title: ${decision.title}
Description: ${decision.description}

AGENT EVALUATIONS:

${agentEvaluations.map(agent => `
=== ${agent.agentType.toUpperCase()} AGENT ===
Key Factors: ${agent.keyFactors.join(', ')}
Scores:
${agent.optionScores.map(s => {
  const opt = decision.options.find(o => o.id === s.optionId);
  return `- ${opt?.name}: ${s.score}/10 - ${s.reasoning}`;
}).join('\n')}
`).join('\n')}

OPTION SUMMARIES (Average Scores):
${optionSummaries.map(s => `- ${s.name}: ${s.avgScore.toFixed(1)}/10`).join('\n')}

Based on all agent perspectives and the company's strategic goal (${context.strategicGoal}), provide your final recommendation as JSON.`;

  const response = await askClaude(prompt, SYSTEM_PROMPT);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Synthesizer response:', response);
    throw new Error('Synthesizer returned invalid format');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Calculate review date (1 week from now)
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + 7);

    return {
      agentEvaluations,
      recommendedOptionId: parsed.recommendedOptionId || optionSummaries[0]?.optionId,
      confidence: parsed.confidence || 50,
      synthesis: parsed.synthesis || 'No synthesis provided',
      dissent: parsed.dissent || [],
      reviewDate: reviewDate.toISOString(),
      debates: [],
      consensusReached: true,
      deliberationRounds: 1,
    };
  } catch (e) {
    console.error('Failed to parse Synthesizer response:', e);
    throw new Error('Failed to parse Synthesizer response');
  }
}
