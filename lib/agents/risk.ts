import { askAI } from '../ai-client';
import { CompanyContext, Decision, AgentEvaluation } from '../types';

const SYSTEM_PROMPT = `You are the Risk Agent on a Strategy Council.
Your role is to evaluate strategic decisions from a RISK perspective.

Consider these factors:
- Execution risk (can the team deliver?)
- Market risk (will customers want this?)
- Technical risk (is it feasible?)
- Financial risk (what if it fails?)
- Dependency risk (external dependencies)
- Timing risk (too early/late?)
- Reversibility (can we undo this?)
- Downside scenarios

IMPORTANT: You must respond in EXACTLY this JSON format with no other text:
{
  "optionScores": [
    { "optionId": "option-id-here", "score": 7, "reasoning": "Brief explanation of risks and mitigations" }
  ],
  "keyFactors": ["risk1", "risk2", "mitigation1"]
}

Score each option from 1-10 where:
- 1-3: High risk, proceed with extreme caution
- 4-6: Moderate risk, manageable with mitigation
- 7-10: Low risk, well-understood territory

IMPORTANT: A HIGH score means LOW risk (safe). Focus on identifying risks AND possible mitigations.`;

export async function evaluateRisk(
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

KEY CONSTRAINTS (Risk Factors):
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

Evaluate each option from a risk perspective. Identify key risks and potential mitigations. Return your analysis as JSON.`;

  const response = await askAI(prompt, SYSTEM_PROMPT);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Risk Agent response:', response);
    throw new Error('Risk Agent returned invalid format');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      agentType: 'risk',
      optionScores: parsed.optionScores || [],
      keyFactors: parsed.keyFactors || [],
    };
  } catch (e) {
    console.error('Failed to parse Risk response:', e);
    throw new Error('Failed to parse Risk Agent response');
  }
}
