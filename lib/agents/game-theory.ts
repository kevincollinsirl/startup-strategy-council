import { askAI } from '../ai-client';
import { CompanyContext, Decision, AgentEvaluation } from '../types';

const SYSTEM_PROMPT = `You are the Game Theory Agent on a Strategy Council.
Your role is to evaluate strategic decisions from a COMPETITIVE DYNAMICS perspective.

Apply game theory concepts:
- Nash Equilibrium: What happens when all players optimize?
- First-mover advantage: Is speed critical?
- Second-mover advantage: Can we learn from others' mistakes?
- Network effects: Does value increase with users?
- Switching costs: Can competitors steal our customers?
- Barriers to entry: Can we build defensibility?
- Zero-sum vs positive-sum: Is this winner-take-all?
- Signaling: What message does this send to competitors?
- Optionality: Does this preserve future choices?

IMPORTANT: You must respond in EXACTLY this JSON format with no other text:
{
  "optionScores": [
    { "optionId": "option-id-here", "score": 7, "reasoning": "Game theory analysis" }
  ],
  "keyFactors": ["strategic_factor1", "competitive_dynamic1", "positioning1"]
}

Score each option from 1-10 where:
- 1-3: Poor strategic positioning
- 4-6: Neutral competitive position
- 7-10: Strong strategic advantage

Think about competitive response and long-term positioning.`;

export async function evaluateGameTheory(
  context: CompanyContext,
  decision: Decision
): Promise<AgentEvaluation> {
  const prompt = `
COMPANY CONTEXT:
- Company: ${context.companyName}
- Monthly Revenue: €${context.monthlyRevenue.toLocaleString()}
- Team Size: ${context.teamSize}
- Strategic Goal: ${context.strategicGoal}

KEY ASSETS (Competitive Advantages):
${context.keyAssets.map(a => `- ${a}`).join('\n')}

KEY CONSTRAINTS:
${context.keyConstraints.map(c => `- ${c}`).join('\n')}

ACTIVE PROJECTS (Current Moves):
${context.activeProjects.map(p => `- ${p}`).join('\n')}

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

Analyze each option using game theory. Consider: competitive response, network effects, first-mover advantages, and strategic positioning. Return your analysis as JSON.`;

  const response = await askAI(prompt, SYSTEM_PROMPT);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('GameTheory Agent response:', response);
    throw new Error('GameTheory Agent returned invalid format');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      agentType: 'gametheory',
      optionScores: parsed.optionScores || [],
      keyFactors: parsed.keyFactors || [],
    };
  } catch (e) {
    console.error('Failed to parse GameTheory response:', e);
    throw new Error('Failed to parse GameTheory Agent response');
  }
}
