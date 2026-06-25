import type { AssistantChatMessage } from '../assistant-chat-message.entity';
import { estimateMessageTokens } from './token-estimate';

export interface ContextBudget {
  total: number;
  reservedForOutput: number;
  reservedForUserInput: number;
  reservedForSystem: number;
  reservedForTools: number;
  safetyBuffer: number;
}

export const DEFAULT_CONTEXT_BUDGET: ContextBudget = {
  total: 128_000,
  reservedForOutput: 4096,
  reservedForUserInput: 8000,
  reservedForSystem: 1000,
  reservedForTools: 1000,
  safetyBuffer: 2000,
};

export function historyBudget(budget: ContextBudget, summaryTokens: number): number {
  const reserved =
    budget.reservedForOutput +
    budget.reservedForUserInput +
    budget.reservedForSystem +
    budget.reservedForTools +
    budget.safetyBuffer +
    summaryTokens;
  return Math.max(0, budget.total - reserved);
}

export const FOLD_TARGET_RATIO = 0.7;
export const FOLD_BAND_MIN = 0.65;
export const FOLD_BAND_MAX = 0.75;

export interface RollUpPlan {
  foldUpTo: number;
}

export function planRollUp(
  turns: AssistantChatMessage[],
  summarizedUpTo: number,
  historyBudgetTokens: number,
): RollUpPlan | null {
  const active = turns.slice(Math.max(0, summarizedUpTo));
  if (active.length < 2) {
    return null;
  }

  const costs = active.map((t) => estimateMessageTokens(t.text));
  const total = costs.reduce((sum, cost) => sum + cost, 0);
  if (total <= historyBudgetTokens) {
    return null;
  }

  const target = total * FOLD_TARGET_RATIO;
  const bandMin = total * FOLD_BAND_MIN;
  const bandMax = total * FOLD_BAND_MAX;

  let cumulative = 0;
  let inBand: { count: number; dist: number } | null = null;
  let nearest: { count: number; dist: number } | null = null;

  for (let count = 1; count < active.length; count++) {
    cumulative += costs[count - 1];
    if (active[count - 1].role !== 'assistant') {
      continue;
    }
    const dist = Math.abs(cumulative - target);
    if (cumulative >= bandMin && cumulative <= bandMax) {
      if (inBand === null || dist < inBand.dist) {
        inBand = { count, dist };
      }
    }
    if (nearest === null || dist < nearest.dist) {
      nearest = { count, dist };
    }
  }

  const chosen = inBand ?? nearest;
  if (chosen === null) {
    return null;
  }
  return { foldUpTo: summarizedUpTo + chosen.count };
}
