import { askAI } from '../ai-client';
import { CompanyContext, Decision, AgentEvaluation, BusinessArm } from '../types';

const SYSTEM_PROMPT = `You are the Resource Allocation Agent on a Strategy Council.
Your role is to evaluate strategic decisions from a RESOURCE and CAPACITY perspective.

You have access to detailed time investment data across business arms.

Consider these factors:
- Founder time as the scarcest resource
- Current time allocation across business arms
- Opportunity cost of founder hours
- What can be delegated vs requires founder
- Team scaling implications
- Bottleneck identification
- Capacity constraints
- Automation opportunities
- Resource reallocation possibilities
- Sustainable pace vs burnout risk

IMPORTANT: You must respond in EXACTLY this JSON format with no other text:
{
  "optionScores": [
    { "optionId": "option-id-here", "score": 7, "reasoning": "Brief explanation" }
  ],
  "keyFactors": ["factor1", "factor2", "factor3"],
  "timeRequired": {
    "founderHours": 0,
    "canDelegate": "percentage or description of delegatable work"
  },
  "bottlenecks": ["bottleneck1", "bottleneck2"],
  "delegationOpportunities": ["opportunity1", "opportunity2"],
  "scalingRecommendation": "Recommendation for team/capacity scaling"
}

Score each option from 1-10 where:
- 1-3: Resource intensive (high founder time, no delegation possible)
- 4-6: Manageable (moderate resources, some delegation possible)
- 7-10: Resource efficient (low founder time, highly delegatable)

Be specific about time constraints and bottlenecks.`;

export async function evaluateResourceAllocation(
  context: CompanyContext,
  decision: Decision,
  businessArms: BusinessArm[]
): Promise<AgentEvaluation> {
  // Calculate time allocation
  const totalHours = businessArms.reduce((sum, a) => sum + a.timeInvestmentHours, 0);
  const activeArms = businessArms.filter(a => a.status === 'active');
  const pausedArms = businessArms.filter(a => a.status === 'paused');

  const armsContext = businessArms
    .filter(a => a.timeInvestmentHours > 0)
    .sort((a, b) => b.timeInvestmentHours - a.timeInvestmentHours)
    .map(arm => {
      const percentage = totalHours > 0 ? ((arm.timeInvestmentHours / totalHours) * 100).toFixed(0) : 0;
      return `- ${arm.name}: ${arm.timeInvestmentHours}h/month (${percentage}%), Strategic Value: ${arm.strategicValue}/10, Status: ${arm.status}`;
    }).join('\n');

  // Identify highest time consumer vs lowest strategic value (inefficiencies)
  const inefficiencies = businessArms
    .filter(a => a.status === 'active' && a.timeInvestmentHours > 20)
    .filter(a => a.strategicValue < 6)
    .map(a => `${a.name} uses ${a.timeInvestmentHours}h but has only ${a.strategicValue}/10 strategic value`);

  const prompt = `
COMPANY CONTEXT:
- Company: ${context.companyName}
- Team Size: ${context.teamSize}
- Strategic Goal: ${context.strategicGoal}

TIME ALLOCATION (Monthly):
${armsContext}

SUMMARY:
- Total Hours Committed: ${totalHours}h/month
- Active Arms: ${activeArms.length}
- Paused Arms: ${pausedArms.length}
- Assumed Founder Capacity: ~160h/month

${inefficiencies.length > 0 ? `POTENTIAL INEFFICIENCIES:
${inefficiencies.map(i => `- ${i}`).join('\n')}` : ''}

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

Evaluate each option from a resource allocation perspective. Consider founder time availability, delegation opportunities, bottlenecks, and sustainable capacity. Return your analysis as JSON.`;

  const response = await askAI(prompt, SYSTEM_PROMPT);

  // Parse JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Resource Allocation response:', response);
    throw new Error('Resource Allocation Agent returned invalid format');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      agentType: 'resource',
      optionScores: parsed.optionScores || [],
      keyFactors: parsed.keyFactors || [],
    };
  } catch (e) {
    console.error('Failed to parse Resource Allocation response:', e);
    throw new Error('Failed to parse Resource Allocation Agent response');
  }
}
