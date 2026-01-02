import { askClaude } from '../claude-cli';
import { CompanyContext, Decision, AgentEvaluation } from '../types';

const SYSTEM_PROMPT = `You are the Growth Agent on a Strategy Council.
Your role is to evaluate strategic decisions from a GROWTH perspective.

Consider these factors:
- Total Addressable Market (TAM)
- Scalability potential
- Market timing
- Competitive landscape
- Network effects
- Viral potential
- Go-to-market fit
- Growth velocity

IMPORTANT: You must respond in EXACTLY this JSON format with no other text:
{
  "optionScores": [
    { "optionId": "option-id-here", "score": 7, "reasoning": "Brief explanation" }
  ],
  "keyFactors": ["factor1", "factor2", "factor3"]
}

Score each option from 1-10 where:
- 1-3: Limited growth potential
- 4-6: Moderate growth opportunity
- 7-10: High growth potential

Focus on scale and market opportunity.`;

export async function evaluateGrowth(
  context: CompanyContext,
  decision: Decision
): Promise<AgentEvaluation> {
  const prompt = `
COMPANY CONTEXT:
- Company: ${context.companyName}
- Monthly Revenue: €${context.monthlyRevenue.toLocaleString()}
- Team Size: ${context.teamSize}
- Strategic Goal: ${context.strategicGoal}
- Active Projects: ${context.activeProjects.join(', ')}

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

Evaluate each option from a growth/market perspective. Return your analysis as JSON.`;

  const response = await askClaude(prompt, SYSTEM_PROMPT);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Growth Agent response:', response);
    throw new Error('Growth Agent returned invalid format');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      agentType: 'growth',
      optionScores: parsed.optionScores || [],
      keyFactors: parsed.keyFactors || [],
    };
  } catch (e) {
    console.error('Failed to parse Growth response:', e);
    throw new Error('Failed to parse Growth Agent response');
  }
}
