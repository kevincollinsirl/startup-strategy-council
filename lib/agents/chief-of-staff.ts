import { askClaude } from '../claude-cli';
import { CompanyContext, Decision, AgentEvaluation, CouncilEvaluation, AgentDebate } from '../types';

const SYSTEM_PROMPT = `You are the Chief of Staff Agent on a Strategy Council.
Your role is to SYNTHESIZE all agent evaluations into a final recommendation.

You facilitate debates between agents when they disagree and build consensus.

Consider:
- Weighted importance of each agent's perspective
- Areas of agreement across agents
- Resolving disagreements through synthesis
- Identifying the strongest option considering all factors
- Noting any dissenting opinions that deserve mention
- Confidence level based on agent consensus

IMPORTANT: You must respond in EXACTLY this JSON format with no other text:
{
  "recommendedOptionId": "option-id-here",
  "confidence": 0.85,
  "synthesis": "Comprehensive synthesis of all agent perspectives explaining the recommendation",
  "dissent": ["Any significant dissenting opinions that should be noted"],
  "keyTradeoffs": ["tradeoff1", "tradeoff2"]
}

Confidence should be:
- 0.9-1.0: Strong consensus across agents
- 0.7-0.9: General agreement with minor dissent
- 0.5-0.7: Mixed signals, proceed with caution
- <0.5: Significant disagreement, recommendation uncertain`;

const DEBATE_PROMPT = `You are the Chief of Staff facilitating a debate between agents.

An agent is challenging another agent's position. Analyze the challenge and determine if it's valid.

Respond with EXACTLY this JSON format:
{
  "challengeValid": true,
  "resolution": "How this disagreement should be resolved",
  "adjustedScore": 0,
  "reasoning": "Why the score should or should not change"
}

adjustedScore should be the new score (1-10) if the challenge is valid, or 0 if no change.`;

export async function synthesizeEvaluations(
  context: CompanyContext,
  decision: Decision,
  evaluations: AgentEvaluation[]
): Promise<{ recommendedOptionId: string; confidence: number; synthesis: string; dissent: string[] }> {
  // Build summary of all agent evaluations
  const evaluationSummary = evaluations.map(agentEval => {
    const scores = agentEval.optionScores.map(s => `  - ${s.optionId}: ${s.score}/10 - ${s.reasoning}`).join('\n');
    return `${agentEval.agentType.toUpperCase()} AGENT:
Scores:
${scores}
Key Factors: ${agentEval.keyFactors.join(', ')}`;
  }).join('\n\n');

  const prompt = `
COMPANY CONTEXT:
- Company: ${context.companyName}
- Strategic Goal: ${context.strategicGoal}

DECISION:
Title: ${decision.title}
Description: ${decision.description}

OPTIONS:
${decision.options.map(o => `- ${o.id}: ${o.name} - ${o.description}`).join('\n')}

AGENT EVALUATIONS:
${evaluationSummary}

Synthesize all agent perspectives into a final recommendation. Identify the best option considering all factors, note any significant dissent, and provide a confidence level. Return as JSON.`;

  const response = await askClaude(prompt, SYSTEM_PROMPT);

  // Parse JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Chief of Staff response:', response);
    throw new Error('Chief of Staff Agent returned invalid format');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      recommendedOptionId: parsed.recommendedOptionId || decision.options[0]?.id || '',
      confidence: parsed.confidence || 0.5,
      synthesis: parsed.synthesis || 'Unable to synthesize',
      dissent: parsed.dissent || [],
    };
  } catch (e) {
    console.error('Failed to parse Chief of Staff response:', e);
    throw new Error('Failed to parse Chief of Staff Agent response');
  }
}

export async function facilitateDebate(
  challengingAgent: string,
  challengedAgent: string,
  challengingPosition: string,
  challengedPosition: string,
  optionId: string
): Promise<{ challengeValid: boolean; resolution: string; adjustedScore: number }> {
  const prompt = `
DEBATE CONTEXT:
${challengingAgent} is challenging ${challengedAgent}'s position.

${challengedAgent}'s Position:
${challengedPosition}

${challengingAgent}'s Challenge:
${challengingPosition}

Option being debated: ${optionId}

Analyze this challenge and determine if it's valid. Should ${challengedAgent}'s score be adjusted? Return as JSON.`;

  const response = await askClaude(prompt, DEBATE_PROMPT);

  // Parse JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { challengeValid: false, resolution: 'Unable to resolve', adjustedScore: 0 };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      challengeValid: parsed.challengeValid || false,
      resolution: parsed.resolution || '',
      adjustedScore: parsed.adjustedScore || 0,
    };
  } catch (e) {
    return { challengeValid: false, resolution: 'Unable to resolve', adjustedScore: 0 };
  }
}
