import { askClaude } from '../claude-cli';
import { CompanyContext, Decision, AgentEvaluation, BusinessArm } from '../types';

const SYSTEM_PROMPT = `You are the Financial Analyst Agent on a Strategy Council.
Your role is to evaluate strategic decisions from a comprehensive FINANCIAL perspective.

You have access to detailed business arm data showing revenue, costs, and profitability.

Consider these factors:
- ROI (Return on Investment) with expected value calculations
- Cash flow impact across all business arms
- Burn rate implications
- Unit economics and margins
- Payback period analysis
- Financial risk assessment
- Opportunity cost analysis
- Payoff matrix calculations
- Break-even analysis
- Revenue projections and forecasts

IMPORTANT: You must respond in EXACTLY this JSON format with no other text:
{
  "optionScores": [
    { "optionId": "option-id-here", "score": 7, "reasoning": "Brief explanation" }
  ],
  "keyFactors": ["factor1", "factor2", "factor3"],
  "payoffMatrix": {
    "bestCase": { "revenue": 0, "probability": 0.2 },
    "baseCase": { "revenue": 0, "probability": 0.6 },
    "worstCase": { "revenue": 0, "probability": 0.2 }
  },
  "expectedValue": 0,
  "breakEvenMonths": 0,
  "financialProjection": "3-6 month projection narrative"
}

Score each option from 1-10 where:
- 1-3: Poor financial decision (negative expected value, long payback)
- 4-6: Neutral/acceptable (break-even or modest positive)
- 7-10: Strong financial case (high expected value, quick payback)

Be specific and quantitative. Use the business arm data to ground your analysis.`;

export async function evaluateFinancialAnalyst(
  context: CompanyContext,
  decision: Decision,
  businessArms: BusinessArm[]
): Promise<AgentEvaluation> {
  // Calculate financial summary from business arms
  const totalRevenue = businessArms.reduce((sum, a) => sum + a.monthlyRevenue, 0);
  const totalCosts = businessArms.reduce((sum, a) => sum + a.monthlyCosts, 0);
  const netProfit = totalRevenue - totalCosts;
  const activeArms = businessArms.filter(a => a.status === 'active');

  const armsContext = businessArms.map(arm =>
    `- ${arm.name}: Revenue €${arm.monthlyRevenue}/mo, Costs €${arm.monthlyCosts}/mo, Profit €${arm.monthlyRevenue - arm.monthlyCosts}/mo, Strategic Value: ${arm.strategicValue}/10, Status: ${arm.status}`
  ).join('\n');

  const prompt = `
COMPANY CONTEXT:
- Company: ${context.companyName}
- Monthly Revenue: €${context.monthlyRevenue.toLocaleString()}
- Monthly Burn: €${context.monthlyBurn.toLocaleString()}
- Team Size: ${context.teamSize}
- Runway: ${context.runwayMonths} months
- Strategic Goal: ${context.strategicGoal}

BUSINESS ARMS FINANCIALS:
${armsContext}

SUMMARY:
- Total Revenue: €${totalRevenue.toLocaleString()}/month
- Total Costs: €${totalCosts.toLocaleString()}/month
- Net Profit: €${netProfit.toLocaleString()}/month
- Active Arms: ${activeArms.length}

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

Evaluate each option from a financial analyst perspective. Consider payoff matrices, expected values, break-even analysis, and how each option affects the overall business arm portfolio. Return your analysis as JSON.`;

  const response = await askClaude(prompt, SYSTEM_PROMPT);

  // Parse JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Financial Analyst response:', response);
    throw new Error('Financial Analyst Agent returned invalid format');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      agentType: 'financial',
      optionScores: parsed.optionScores || [],
      keyFactors: parsed.keyFactors || [],
    };
  } catch (e) {
    console.error('Failed to parse Financial Analyst response:', e);
    throw new Error('Failed to parse Financial Analyst Agent response');
  }
}
