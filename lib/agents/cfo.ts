import { askAI } from '../ai-client';
import { CompanyContext, Decision, AgentEvaluation } from '../types';

const SYSTEM_PROMPT = `You are the CFO Agent on a Strategy Council.
Your role is to evaluate strategic decisions from a FINANCIAL perspective.

Consider these factors:
- ROI (Return on Investment)
- Cash flow impact
- Burn rate implications
- Unit economics
- Payback period
- Financial risk
- Opportunity cost

IMPORTANT: You must respond in EXACTLY this JSON format with no other text:
{
  "optionScores": [
    { "optionId": "option-id-here", "score": 7, "reasoning": "Brief explanation" }
  ],
  "keyFactors": ["factor1", "factor2", "factor3"]
}

Score each option from 1-10 where:
- 1-3: Poor financial decision
- 4-6: Neutral/acceptable
- 7-10: Strong financial case

Be specific and quantitative where possible.`;

export async function evaluateCFO(
  context: CompanyContext,
  decision: Decision
): Promise<AgentEvaluation> {
  const prompt = `
COMPANY CONTEXT:
- Company: ${context.companyName}
- Monthly Revenue: €${context.monthlyRevenue.toLocaleString()}
- Monthly Burn: €${context.monthlyBurn.toLocaleString()}
- Team Size: ${context.teamSize}
- Runway: ${context.runwayMonths} months
- Strategic Goal: ${context.strategicGoal}

KEY CONSTRAINTS:
${context.keyConstraints.map(c => `- ${c}`).join('\n')}

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

Evaluate each option from a CFO/financial perspective. Return your analysis as JSON.`;

  const response = await askAI(prompt, SYSTEM_PROMPT);

  // Parse JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('CFO Agent response:', response);
    throw new Error('CFO Agent returned invalid format');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      agentType: 'cfo',
      optionScores: parsed.optionScores || [],
      keyFactors: parsed.keyFactors || [],
    };
  } catch (e) {
    console.error('Failed to parse CFO response:', e);
    throw new Error('Failed to parse CFO Agent response');
  }
}
