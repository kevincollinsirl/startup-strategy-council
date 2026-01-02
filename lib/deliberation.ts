import { AgentEvaluation, AgentDebate, OptionScore } from './types';
import { facilitateDebate } from './agents/chief-of-staff';

const MAX_ROUNDS = 3;
const DISAGREEMENT_THRESHOLD = 3; // Score difference that triggers debate

interface DeliberationResult {
  finalEvaluations: AgentEvaluation[];
  debates: AgentDebate[];
  consensusReached: boolean;
  rounds: number;
}

/**
 * Identify significant disagreements between agents
 * A disagreement exists when two agents score the same option with a difference > threshold
 */
function findDisagreements(evaluations: AgentEvaluation[]): Array<{
  optionId: string;
  agent1: { type: string; score: OptionScore };
  agent2: { type: string; score: OptionScore };
  difference: number;
}> {
  const disagreements: Array<{
    optionId: string;
    agent1: { type: string; score: OptionScore };
    agent2: { type: string; score: OptionScore };
    difference: number;
  }> = [];

  // Compare each pair of agents
  for (let i = 0; i < evaluations.length; i++) {
    for (let j = i + 1; j < evaluations.length; j++) {
      const eval1 = evaluations[i];
      const eval2 = evaluations[j];

      // Compare scores for each option
      for (const score1 of eval1.optionScores) {
        const score2 = eval2.optionScores.find(s => s.optionId === score1.optionId);
        if (score2) {
          const difference = Math.abs(score1.score - score2.score);
          if (difference >= DISAGREEMENT_THRESHOLD) {
            disagreements.push({
              optionId: score1.optionId,
              agent1: { type: eval1.agentType, score: score1 },
              agent2: { type: eval2.agentType, score: score2 },
              difference,
            });
          }
        }
      }
    }
  }

  // Sort by difference (largest first)
  return disagreements.sort((a, b) => b.difference - a.difference);
}

/**
 * Check if consensus has been reached
 * Consensus = all agents agree within threshold on all options
 */
function checkConsensus(evaluations: AgentEvaluation[]): boolean {
  const disagreements = findDisagreements(evaluations);
  return disagreements.length === 0;
}

/**
 * Run deliberation process between agents
 * Identifies disagreements and facilitates debates to build consensus
 */
export async function runDeliberation(
  evaluations: AgentEvaluation[]
): Promise<DeliberationResult> {
  const debates: AgentDebate[] = [];
  let currentEvaluations = [...evaluations];
  let round = 0;

  while (round < MAX_ROUNDS) {
    round++;

    // Find disagreements
    const disagreements = findDisagreements(currentEvaluations);

    if (disagreements.length === 0) {
      // Consensus reached
      return {
        finalEvaluations: currentEvaluations,
        debates,
        consensusReached: true,
        rounds: round,
      };
    }

    // Process top disagreement(s) this round
    const topDisagreement = disagreements[0];

    // Record the initial positions
    debates.push({
      round,
      agentType: topDisagreement.agent1.type,
      position: `Score ${topDisagreement.agent1.score.score}/10: ${topDisagreement.agent1.score.reasoning}`,
    });

    debates.push({
      round,
      agentType: topDisagreement.agent2.type,
      position: `Score ${topDisagreement.agent2.score.score}/10: ${topDisagreement.agent2.score.reasoning}`,
      challengedBy: topDisagreement.agent1.type,
      challenge: `Disagrees on ${topDisagreement.optionId} by ${topDisagreement.difference} points`,
    });

    // Facilitate debate
    const debateResult = await facilitateDebate(
      topDisagreement.agent1.type,
      topDisagreement.agent2.type,
      topDisagreement.agent1.score.reasoning,
      topDisagreement.agent2.score.reasoning,
      topDisagreement.optionId
    );

    // Record resolution
    debates.push({
      round,
      agentType: 'chief-of-staff',
      position: debateResult.resolution,
      response: debateResult.challengeValid
        ? `Challenge valid. ${topDisagreement.agent2.type}'s score adjusted.`
        : `Challenge not sustained. Scores stand.`,
    });

    // Apply adjustments if challenge was valid
    if (debateResult.challengeValid && debateResult.adjustedScore > 0) {
      currentEvaluations = currentEvaluations.map(agentEval => {
        if (agentEval.agentType === topDisagreement.agent2.type) {
          return {
            ...agentEval,
            optionScores: agentEval.optionScores.map(score =>
              score.optionId === topDisagreement.optionId
                ? { ...score, score: debateResult.adjustedScore, reasoning: score.reasoning + ` [Adjusted after debate: ${debateResult.resolution}]` }
                : score
            ),
          };
        }
        return agentEval;
      });
    }
  }

  // Max rounds reached, return current state
  return {
    finalEvaluations: currentEvaluations,
    debates,
    consensusReached: checkConsensus(currentEvaluations),
    rounds: round,
  };
}

/**
 * Calculate overall consensus score (0-1)
 * 1 = perfect agreement, 0 = maximum disagreement
 */
export function calculateConsensusScore(evaluations: AgentEvaluation[]): number {
  if (evaluations.length < 2) return 1;

  let totalDifference = 0;
  let comparisons = 0;

  for (let i = 0; i < evaluations.length; i++) {
    for (let j = i + 1; j < evaluations.length; j++) {
      for (const score1 of evaluations[i].optionScores) {
        const score2 = evaluations[j].optionScores.find(s => s.optionId === score1.optionId);
        if (score2) {
          totalDifference += Math.abs(score1.score - score2.score);
          comparisons++;
        }
      }
    }
  }

  if (comparisons === 0) return 1;

  // Max possible difference per comparison is 9 (10 - 1)
  const avgDifference = totalDifference / comparisons;
  const consensusScore = 1 - (avgDifference / 9);

  return Math.max(0, Math.min(1, consensusScore));
}
